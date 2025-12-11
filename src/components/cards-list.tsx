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

interface Card {
  id: string;
  front: string;
  back: string;
  position: number;
  createdAt: Date | string;
}

interface CardsListProps {
  cards: Card[];
  deckId: string;
}

type SortOrder = "asc" | "desc";

export function CardsList({ cards, deckId }: CardsListProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.position - b.position;
      } else {
        return b.position - a.position;
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
      ? "Sort descending (position)"
      : "Sort ascending (position)";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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

