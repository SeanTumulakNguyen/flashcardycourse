"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { createCardAction, updateCardAction } from "@/app/actions/cards";

interface CardFormProps {
  deckId: string;
  card?: {
    id: string;
    front: string;
    back: string;
    position: number;
  };
  mode?: "add" | "edit";
}

export function CardForm({ deckId, card, mode = "add" }: CardFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [front, setFront] = useState(card?.front || "");
  const [back, setBack] = useState(card?.back || "");

  // Sync form state when card prop changes (for edit mode)
  useEffect(() => {
    if (card) {
      setFront(card.front);
      setBack(card.back);
    }
  }, [card]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "add") {
        await createCardAction({
          deckId,
          front,
          back,
          // Position will be calculated automatically on the server
        });
        toast.success("Card created successfully");
      } else if (card) {
        await updateCardAction({
          cardId: card.id,
          front,
          back,
        });
        toast.success("Card updated successfully");
      }
      setOpen(false);
      setFront("");
      setBack("");
    } catch (error) {
      console.error("Error saving card:", error);
      toast.error("Failed to save card. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset form when closing
      if (mode === "add") {
        setFront("");
        setBack("");
      } else if (card) {
        setFront(card.front);
        setBack(card.back);
      }
    } else if (mode === "edit" && card) {
      // Populate form when opening edit dialog
      setFront(card.front);
      setBack(card.back);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {mode === "add" ? (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
        ) : (
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Card" : "Edit Card"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new flashcard for this deck"
              : "Update the flashcard content"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="front" className="text-sm font-medium">
              Front
            </label>
            <Textarea
              id="front"
              placeholder="Enter the question or front side..."
              value={front}
              onChange={(e) => setFront(e.target.value)}
              required
              rows={3}
              maxLength={1000}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="back" className="text-sm font-medium">
              Back
            </label>
            <Textarea
              id="back"
              placeholder="Enter the answer or back side..."
              value={back}
              onChange={(e) => setBack(e.target.value)}
              required
              rows={3}
              maxLength={1000}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : mode === "add" ? "Add Card" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

