"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { generateObject } from "ai";
import { revalidatePath } from "next/cache";
import { createCard } from "@/lib/db/queries/cards";

// Input schema for AI generation
const generateFlashcardsSchema = z.object({
  deckId: z.string().uuid(),
  deckName: z.string().min(1).max(500),
  deckDescription: z.string().max(1000).optional(),
  numberOfCards: z.number().int().min(1).max(50).default(20),
});

type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;

export async function generateFlashcardsAction(input: GenerateFlashcardsInput) {
  // 1. Validate input
  const validatedInput = generateFlashcardsSchema.parse(input);

  // 2. Authenticate and check feature access
  const { userId, has } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 3. Check AI feature access (PREMIUM FEATURE - requires Pro subscription)
  const hasAIGeneration = has({ feature: "ai_flashcard_generation" });
  if (!hasAIGeneration) {
    throw new Error(
      "AI flashcard generation is a premium feature and requires a Pro subscription."
    );
  }

  // 4. Generate flashcards using Vercel AI SDK
  const prompt = validatedInput.deckDescription
    ? `Generate exactly ${validatedInput.numberOfCards} flashcards about "${validatedInput.deckName}". Description: "${validatedInput.deckDescription}". Each card should have a clear question or prompt on the front and a concise, accurate answer on the back.`
    : `Generate exactly ${validatedInput.numberOfCards} flashcards about "${validatedInput.deckName}". Each card should have a clear question or prompt on the front and a concise, accurate answer on the back.`;

  const { object } = await generateObject({
    model: "openai/gpt-4o",
    schema: z.object({
      cards: z.array(
        z.object({
          front: z.string().min(1).max(1000),
          back: z.string().min(1).max(1000),
        })
      ).length(validatedInput.numberOfCards),
    }),
    prompt,
  });

  // 5. Save generated cards to database
  const createdCards = [];
  for (let i = 0; i < object.cards.length; i++) {
    const card = object.cards[i];
    const newCard = await createCard(validatedInput.deckId, userId, {
      front: card.front,
      back: card.back,
      position: i, // Maintain order
    });
    createdCards.push(newCard);
  }

  // 6. Revalidate paths
  revalidatePath(`/decks/${validatedInput.deckId}`);
  revalidatePath("/dashboard/courses");

  return { cards: createdCards };
}

