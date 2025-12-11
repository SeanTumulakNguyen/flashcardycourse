"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCardAction } from "@/app/actions/cards";
import { CardForm } from "./card-form";

interface CardItemProps {
  card: {
    id: string;
    front: string;
    back: string;
    position: number;
  };
  index: number;
  deckId: string;
}

export function CardItem({ card, index, deckId }: CardItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCardAction({ cardId: card.id });
      toast.success("Card deleted successfully");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error("Failed to delete card. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="px-6 pt-4 pb-0">
          <div className="grid grid-cols-2 mb-4">
            <div className="flex flex-col items-center justify-center pr-6 border-r">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Front
              </p>
              <p className="text-base text-center">{card.front}</p>
            </div>
            <div className="flex flex-col items-center justify-center pl-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Back
              </p>
              <p className="text-base text-center">{card.back}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 pb-0 border-t">
            <CardForm deckId={deckId} card={card} mode="edit" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-400" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Card</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this card? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <div className="grid grid-cols-2">
              <div className="flex flex-col items-center justify-center pr-6 border-r">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Front
                </p>
                <p className="text-base text-center">{card.front}</p>
              </div>
              <div className="flex flex-col items-center justify-center pl-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Back
                </p>
                <p className="text-base text-center">{card.back}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

