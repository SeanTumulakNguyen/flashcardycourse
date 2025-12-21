"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { updateDeck, createDeck, deleteDeck, getUserDecks } from "@/lib/db/queries/decks";

// Schema for updating a deck
const updateDeckSchema = z.object({
  deckId: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z
    .string()
    .max(500)
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional(),
});

type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

export async function updateDeckAction(input: UpdateDeckInput) {
  const validatedInput = updateDeckSchema.parse(input);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Build update data, only including fields that are provided
  const updateData: { name?: string; description?: string | null } = {};
  if (validatedInput.name !== undefined) {
    updateData.name = validatedInput.name;
  }
  if (validatedInput.description !== undefined) {
    updateData.description = validatedInput.description;
  }

  const updatedDeck = await updateDeck(validatedInput.deckId, userId, updateData);

  revalidatePath(`/decks/${validatedInput.deckId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/courses");
  return updatedDeck;
}

// Schema for creating a deck
const createDeckSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

type CreateDeckInput = z.infer<typeof createDeckSchema>;

export async function createDeckAction(input: CreateDeckInput) {
  const validatedInput = createDeckSchema.parse(input);

  const { userId, has } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user has unlimited_decks feature
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });

  // If user doesn't have unlimited decks, check deck limit
  if (!hasUnlimitedDecks) {
    const userDecks = await getUserDecks(userId);
    if (userDecks.length >= 3) {
      throw new Error(
        "Deck limit reached. Upgrade to Pro for unlimited decks."
      );
    }
  }

  const newDeck = await createDeck(userId, {
    name: validatedInput.name,
    description: validatedInput.description,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/courses");
  return newDeck;
}

// Schema for deleting a deck
const deleteDeckSchema = z.object({
  deckId: z.string().uuid(),
});

type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export async function deleteDeckAction(input: DeleteDeckInput) {
  const validatedInput = deleteDeckSchema.parse(input);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await deleteDeck(validatedInput.deckId, userId);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/courses");
}

