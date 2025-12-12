import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getUserDeck } from "@/lib/db/queries/decks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { CardsList } from "@/components/cards-list";
import { EditDeckDialog } from "@/components/edit-deck-dialog";

interface DeckPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { deckId } = await params;

  let deck;
  try {
    deck = await getUserDeck(deckId, userId);
  } catch (error) {
    notFound();
  }

  // Cards will be sorted by updatedAt in the client component (newest first by default)
  const sortedCards = [...deck.cards];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{deck.name}</h1>
            {deck.description && (
              <p className="text-muted-foreground">{deck.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {deck.cards.length} {deck.cards.length === 1 ? "card" : "cards"}
            </p>
          </div>
          <EditDeckDialog
            deckId={deckId}
            currentName={deck.name}
            currentDescription={deck.description}
          />
        </div>
      </div>

      <CardsList cards={sortedCards} deckId={deckId} />
      
      {sortedCards.length === 0 && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                This deck doesn't have any cards yet. Use the "+ Add Card" button above to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

