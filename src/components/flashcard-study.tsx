"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Card {
  id: string;
  front: string;
  back: string;
  position: number;
}

interface Deck {
  id: string;
  name: string;
  description?: string | null;
}

interface FlashcardStudyProps {
  deck: Deck;
  cards: Card[];
}

export function FlashcardStudy({ deck, cards }: FlashcardStudyProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<Card[]>(cards);
  const [isShuffled, setIsShuffled] = useState(false);

  const currentCard = shuffledCards[currentIndex];
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          setIsFlipped((prev) => !prev);
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case "r":
        case "R":
          e.preventDefault();
          handleReset();
          break;
        case "s":
        case "S":
          e.preventDefault();
          handleShuffle();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, isShuffled]);

  const handleNext = useCallback(() => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, shuffledCards.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleShuffle = useCallback(() => {
    const newShuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(newShuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(true);
  }, [cards]);

  const handleReset = useCallback(() => {
    setShuffledCards(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(false);
  }, [cards]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{deck.name}</h1>
        {deck.description && (
          <p className="text-muted-foreground mb-4">{deck.description}</p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {shuffledCards.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShuffle}
              className="gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Shuffle
            </Button>
            {isShuffled && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Order
              </Button>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-8">
        <Card
          className={cn(
            "cursor-pointer transition-all duration-300 hover:shadow-lg",
            "min-h-[400px] flex items-center justify-center",
            isFlipped && "bg-muted"
          )}
          onClick={handleFlip}
        >
          <CardContent className="p-8 w-full">
            <div className="text-center">
              <div className="mb-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {isFlipped ? "Back" : "Front"}
                </span>
              </div>
              <div className="min-h-[200px] flex items-center justify-center">
                <p className="text-2xl md:text-3xl font-medium wrap-break-word max-w-2xl">
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Click card or press Space/Enter to flip
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleFlip} className="gap-2">
            {isFlipped ? "Show Front" : "Show Back"}
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === shuffledCards.length - 1}
          className="gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-8 pt-6 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Keyboard shortcuts: Space/Enter to flip • ← → to navigate • S to shuffle • R to reset
        </p>
      </div>
    </div>
  );
}

