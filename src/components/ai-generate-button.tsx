"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";
import { generateFlashcardsAction } from "@/app/actions/ai";
import { toast } from "sonner";

interface AIGenerateButtonProps {
  deckId: string;
  deckName: string;
  deckDescription?: string | null;
  hasAIGeneration: boolean;
}

export function AIGenerateButton({
  deckId,
  deckName,
  deckDescription,
  hasAIGeneration,
}: AIGenerateButtonProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if deck has both title and description
  const hasTitle = deckName && deckName.trim().length > 0;
  const hasDescription = deckDescription && deckDescription.trim().length > 0;
  const canGenerate = hasTitle && hasDescription;

  const handleClick = async () => {
    // If user doesn't have AI generation feature, redirect to pricing immediately
    if (!hasAIGeneration) {
      router.push("/pricing");
      return;
    }

    // Validate that both title and description exist
    if (!canGenerate) {
      toast.error("Deck title and description are required for AI card generation.");
      return;
    }

    // User has access - proceed with AI generation
    setIsGenerating(true);
    try {
      const result = await generateFlashcardsAction({
        deckId,
        deckName,
        deckDescription: deckDescription!,
        numberOfCards: 20,
      });
      toast.success(`Generated ${result.cards.length} flashcards!`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate flashcards"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Determine tooltip message based on state
  const tooltipMessage = !hasAIGeneration
    ? "AI card generation is a premium feature. Upgrade to Pro to unlock this feature."
    : !canGenerate
    ? "Deck title and description are required for AI card generation."
    : null;

  // Show tooltip if user doesn't have feature or if requirements aren't met
  if (tooltipMessage) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            disabled={isGenerating}
            variant="outline"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate cards with AI"}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p>{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isGenerating}
      variant="default"
    >
      <Sparkles className="h-4 w-4 mr-2" />
      {isGenerating ? "Generating..." : "Generate cards with AI"}
    </Button>
  );
}

