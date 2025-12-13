"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, ChevronLeft, ChevronRight, Shuffle, CheckCircle2, XCircle, Trophy, BookOpen, RotateCw } from "lucide-react";
import Link from "next/link";
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
  const [answers, setAnswers] = useState<Map<string, "correct" | "incorrect">>(new Map());
  const [isComplete, setIsComplete] = useState(false);

  const currentCard = shuffledCards[currentIndex];
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;
  
  // Calculate grade statistics
  const totalAnswered = answers.size;
  const correctCount = Array.from(answers.values()).filter((a) => a === "correct").length;
  const incorrectCount = totalAnswered - correctCount;
  const gradePercentage = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  const handleNext = useCallback(() => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else if (currentIndex === shuffledCards.length - 1) {
      // Reached the end
      setIsComplete(true);
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

  const handleReset = useCallback(() => {
    setShuffledCards(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(false);
    setAnswers(new Map());
    setIsComplete(false);
  }, [cards]);

  const handleMarkAnswer = useCallback(
    (answer: "correct" | "incorrect") => {
      if (!currentCard) return;
      setAnswers((prev) => {
        const newAnswers = new Map(prev);
        newAnswers.set(currentCard.id, answer);
        return newAnswers;
      });
      
      // Check if this is the last card and mark as complete
      if (currentIndex === shuffledCards.length - 1) {
        setIsComplete(true);
      }
    },
    [currentCard, currentIndex, shuffledCards.length]
  );

  const handleShuffle = useCallback(() => {
    const newShuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(newShuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(true);
    setAnswers(new Map());
    setIsComplete(false);
  }, [cards]);

  const handleStudyAgain = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setAnswers(new Map());
    setIsComplete(false);
  }, []);

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
        case "c":
        case "C":
        case "d":
        case "D":
          if (isFlipped) {
            e.preventDefault();
            handleMarkAnswer("correct");
          }
          break;
        case "i":
        case "I":
        case "x":
        case "X":
        case "f":
        case "F":
          if (isFlipped) {
            e.preventDefault();
            handleMarkAnswer("incorrect");
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFlipped, handlePrevious, handleNext, handleReset, handleShuffle, handleMarkAnswer]);

  // Calculate final statistics
  const totalCards = shuffledCards.length;
  const finalCorrectCount = Array.from(answers.values()).filter((a) => a === "correct").length;
  const finalIncorrectCount = Array.from(answers.values()).filter((a) => a === "incorrect").length;
  const accuracyPercentage = totalCards > 0 ? Math.round((finalCorrectCount / totalCards) * 100) : 0;

  // Show completion screen if study is complete
  if (isComplete) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <CardContent className="text-center">
            <div className="mb-6">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-3xl font-bold mb-2">Study Session Complete!</h2>
              <p className="text-muted-foreground">
                You've finished studying {deck.name}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-lg border bg-muted/50">
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-2">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-2xl font-bold">{finalCorrectCount}</span>
                </div>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>

              <div className="p-6 rounded-lg border bg-muted/50">
                <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 mb-2">
                  <XCircle className="h-6 w-6" />
                  <span className="text-2xl font-bold">{finalIncorrectCount}</span>
                </div>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>

              <div className="p-6 rounded-lg border bg-muted/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl font-bold">{accuracyPercentage}%</span>
                </div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="outline" className="gap-2">
                <Link href={`/decks/${deck.id}`}>
                  <BookOpen className="h-4 w-4" />
                  Back to Deck
                </Link>
              </Button>
              <Button onClick={handleStudyAgain} className="gap-2">
                <RotateCw className="h-4 w-4" />
                Study Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{deck.name}</h1>
        {deck.description && (
          <p className="text-muted-foreground mb-4">{deck.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {shuffledCards.length}
            </p>
            {totalAnswered > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{correctCount}</span>
                </div>
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  <span>{incorrectCount}</span>
                </div>
                <div className="text-muted-foreground">
                  Grade: <span className="font-semibold">{gradePercentage}%</span>
                </div>
              </div>
            )}
          </div>
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
              {isFlipped && (
                <div className="mt-6 flex items-center justify-center gap-3">
                  <Button
                    onClick={() => handleMarkAnswer("correct")}
                    className={cn(
                      "gap-2 bg-green-600 text-white hover:bg-green-700 border-green-600",
                      answers.get(currentCard.id) === "correct" &&
                        "ring-2 ring-green-400 ring-offset-2"
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Correct
                  </Button>
                  <Button
                    onClick={() => handleMarkAnswer("incorrect")}
                    className={cn(
                      "gap-2 bg-red-600 text-white hover:bg-red-700 border-red-600",
                      answers.get(currentCard.id) === "incorrect" &&
                        "ring-2 ring-red-400 ring-offset-2"
                    )}
                  >
                    <XCircle className="h-4 w-4" />
                    Incorrect
                  </Button>
                </div>
              )}
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
          Keyboard shortcuts: Space/Enter to flip • ← → to navigate • C/D to mark correct • I/X/F to mark incorrect • S to shuffle • R to reset
        </p>
      </div>
    </div>
  );
}

