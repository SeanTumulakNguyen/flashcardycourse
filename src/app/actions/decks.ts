"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { updateDeck } from "@/lib/db/queries/decks";

// Schema for updating a deck
const updateDeckSchema = z.object({
  deckId: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

export async function updateDeckAction(input: UpdateDeckInput) {
  const validatedInput = updateDeckSchema.parse(input);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const updatedDeck = await updateDeck(validatedInput.deckId, userId, {
    name: validatedInput.name,
    description: validatedInput.description,
  });

  revalidatePath(`/decks/${validatedInput.deckId}`);
  revalidatePath("/dashboard");
  return updatedDeck;
}

