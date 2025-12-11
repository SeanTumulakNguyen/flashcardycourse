"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createCard, updateCard, deleteCard, getCard } from "@/lib/db/queries/cards";

// Schema for creating a card
const createCardSchema = z.object({
  deckId: z.string().uuid(),
  front: z.string().min(1).max(1000),
  back: z.string().min(1).max(1000),
  position: z.number().int().min(0).optional(),
});

type CreateCardInput = z.infer<typeof createCardSchema>;

export async function createCardAction(input: CreateCardInput) {
  const validatedInput = createCardSchema.parse(input);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Position will be calculated automatically if not provided
  const newCard = await createCard(validatedInput.deckId, userId, {
    front: validatedInput.front,
    back: validatedInput.back,
    position: validatedInput.position,
  });

  revalidatePath(`/decks/${validatedInput.deckId}`);
  return newCard;
}

// Schema for updating a card
const updateCardSchema = z.object({
  cardId: z.string().uuid(),
  front: z.string().min(1).max(1000).optional(),
  back: z.string().min(1).max(1000).optional(),
  position: z.number().int().min(0).optional(),
});

type UpdateCardInput = z.infer<typeof updateCardSchema>;

export async function updateCardAction(input: UpdateCardInput) {
  const validatedInput = updateCardSchema.parse(input);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get the card to find the deckId for revalidation
  const card = await getCard(validatedInput.cardId, userId);

  const updatedCard = await updateCard(validatedInput.cardId, userId, {
    front: validatedInput.front,
    back: validatedInput.back,
    position: validatedInput.position,
  });

  revalidatePath(`/decks/${card.deckId}`);
  return updatedCard;
}

// Schema for deleting a card
const deleteCardSchema = z.object({
  cardId: z.string().uuid(),
});

type DeleteCardInput = z.infer<typeof deleteCardSchema>;

export async function deleteCardAction(input: DeleteCardInput) {
  const validatedInput = deleteCardSchema.parse(input);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get the card to find the deckId for revalidation
  const card = await getCard(validatedInput.cardId, userId);

  await deleteCard(validatedInput.cardId, userId);

  revalidatePath(`/decks/${card.deckId}`);
}

