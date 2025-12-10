import { db } from "@/lib/db";
import { decks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Get all decks for a user
 */
export async function getUserDecks(userId: string) {
  return await db.select().from(decks).where(eq(decks.userId, userId));
}

/**
 * Get a single deck by ID, verifying ownership
 */
export async function getUserDeck(deckId: string, userId: string) {
  const deck = await db.query.decks.findFirst({
    where: and(
      eq(decks.id, deckId),
      eq(decks.userId, userId)
    ),
    with: { cards: true }
  });
  
  if (!deck) {
    throw new Error("Deck not found or access denied");
  }
  
  return deck;
}

/**
 * Create a new deck
 */
export async function createDeck(userId: string, data: { name: string; description?: string }) {
  const [newDeck] = await db.insert(decks).values({
    userId,
    name: data.name,
    description: data.description,
  }).returning();
  
  return newDeck;
}

/**
 * Update a deck, verifying ownership
 */
export async function updateDeck(deckId: string, userId: string, data: { name?: string; description?: string }) {
  // Verify ownership first
  const deck = await db.query.decks.findFirst({
    where: and(
      eq(decks.id, deckId),
      eq(decks.userId, userId)
    ),
  });
  
  if (!deck) {
    throw new Error("Deck not found or access denied");
  }
  
  const [updatedDeck] = await db.update(decks)
    .set(data)
    .where(eq(decks.id, deckId))
    .returning();
  
  return updatedDeck;
}

/**
 * Delete a deck, verifying ownership
 */
export async function deleteDeck(deckId: string, userId: string) {
  // Verify ownership first
  const deck = await db.query.decks.findFirst({
    where: and(
      eq(decks.id, deckId),
      eq(decks.userId, userId)
    ),
  });
  
  if (!deck) {
    throw new Error("Deck not found or access denied");
  }
  
  await db.delete(decks).where(eq(decks.id, deckId));
}

