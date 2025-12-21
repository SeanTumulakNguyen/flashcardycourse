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

  const handleClick = async () => {
    // If user doesn't have AI generation feature, redirect to pricing immediately
    if (!hasAIGeneration) {
      router.push("/pricing");
      return;
    }

    // User has access - proceed with AI generation
    setIsGenerating(true);
    try {
      const result = await generateFlashcardsAction({
        deckId,
        deckName,
        deckDescription: deckDescription || undefined,
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

  const buttonContent = (
    <>
      <Sparkles className="h-4 w-4 mr-2" />
      {isGenerating ? "Generating..." : "Generate cards with AI"}
    </>
  );

  if (!hasAIGeneration) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            disabled={isGenerating}
            variant="outline"
          >
            {buttonContent}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p>AI card generation is a premium feature. Upgrade to Pro to unlock this feature.</p>
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
      {buttonContent}
    </Button>
  );
}

