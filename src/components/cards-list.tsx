"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUp, ArrowDown } from "lucide-react";
import { CardItem } from "./card-item";
import { CardForm } from "./card-form";

interface Card {
  id: string;
  front: string;
  back: string;
  position: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CardsListProps {
  cards: Card[];
  deckId: string;
}

type SortOrder = "asc" | "desc";

export function CardsList({ cards, deckId }: CardsListProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      
      if (sortOrder === "asc") {
        return dateA - dateB; // Oldest first
      } else {
        return dateB - dateA; // Newest first
      }
    });
  }, [cards, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const getSortIcon = () => {
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const getNextSortTooltip = () => {
    return sortOrder === "asc"
      ? "Sort descending (newest first)"
      : "Sort ascending (oldest first)";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Cards</h2>
          <CardForm deckId={deckId} mode="add" />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSort}
              className="p-2"
              aria-label={
                sortOrder === "asc" ? "Sort ascending" : "Sort descending"
              }
            >
              {getSortIcon()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getNextSortTooltip()}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedCards.map((card, index) => (
          <CardItem
            key={card.id}
            card={card}
            index={index}
            deckId={deckId}
          />
        ))}
      </div>
    </div>
  );
}

