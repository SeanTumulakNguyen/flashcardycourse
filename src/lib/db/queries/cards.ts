import { db } from "@/lib/db";
import { cards, decks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Get all cards for a deck, verifying deck ownership
 */
export async function getDeckCards(deckId: string, userId: string) {
  // Verify deck ownership first
  const deck = await db.query.decks.findFirst({
    where: and(
      eq(decks.id, deckId),
      eq(decks.userId, userId)
    ),
  });
  
  if (!deck) {
    throw new Error("Deck not found or access denied");
  }
  
  return await db.select().from(cards).where(eq(cards.deckId, deckId));
}

/**
 * Get a single card by ID, verifying deck ownership
 */
export async function getCard(cardId: string, userId: string) {
  const card = await db.query.cards.findFirst({
    where: eq(cards.id, cardId),
    with: { deck: true }
  });
  
  if (!card || card.deck.userId !== userId) {
    throw new Error("Card not found or access denied");
  }
  
  return card;
}

/**
 * Create a new card in a deck, verifying deck ownership
 */
export async function createCard(deckId: string, userId: string, data: { front: string; back: string; position?: number }) {
  // Verify deck ownership first
  const deck = await db.query.decks.findFirst({
    where: and(
      eq(decks.id, deckId),
      eq(decks.userId, userId)
    ),
  });
  
  if (!deck) {
    throw new Error("Deck not found or access denied");
  }
  
  // Calculate position if not provided - set to the current card count
  let position = data.position;
  if (position === undefined) {
    const existingCards = await db.select().from(cards).where(eq(cards.deckId, deckId));
    position = existingCards.length;
  }
  
  const [newCard] = await db.insert(cards).values({
    deckId,
    front: data.front,
    back: data.back,
    position,
    updatedAt: new Date(),
  }).returning();
  
  return newCard;
}

/**
 * Update a card, verifying deck ownership
 */
export async function updateCard(cardId: string, userId: string, data: { front?: string; back?: string; position?: number }) {
  // Verify card ownership through deck
  const card = await db.query.cards.findFirst({
    where: eq(cards.id, cardId),
    with: { deck: true }
  });
  
  if (!card || card.deck.userId !== userId) {
    throw new Error("Card not found or access denied");
  }
  
  const [updatedCard] = await db.update(cards)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(cards.id, cardId))
    .returning();
  
  return updatedCard;
}

/**
 * Delete a card, verifying deck ownership
 */
export async function deleteCard(cardId: string, userId: string) {
  // Verify card ownership through deck
  const card = await db.query.cards.findFirst({
    where: eq(cards.id, cardId),
    with: { deck: true }
  });
  
  if (!card || card.deck.userId !== userId) {
    throw new Error("Card not found or access denied");
  }
  
  await db.delete(cards).where(eq(cards.id, cardId));
}

