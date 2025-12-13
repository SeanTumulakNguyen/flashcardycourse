import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getUserDeck } from "@/lib/db/queries/decks";
import { FlashcardStudy } from "@/components/flashcard-study";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface StudyPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
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

  if (deck.cards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/decks/${deckId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deck
          </Link>
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            This deck doesn't have any cards yet. Add some cards to start studying!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/decks/${deckId}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Deck
        </Link>
      </Button>
      <FlashcardStudy deck={deck} cards={deck.cards} />
    </div>
  );
}

