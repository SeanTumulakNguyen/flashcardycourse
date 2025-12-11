"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
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

type SortOrder = "none" | "asc" | "desc";

export function CardsList({ cards, deckId }: CardsListProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  const sortedCards = useMemo(() => {
    if (sortOrder === "none") {
      // Return cards in their original order (by position)
      return [...cards].sort((a, b) => a.position - b.position);
    }
    
    const sorted = [...cards].sort((a, b) => {
      // Handle both Date objects and date strings
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      if (sortOrder === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
    return sorted;
  }, [cards, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) => {
      if (prev === "none") return "asc";
      if (prev === "asc") return "desc";
      return "none";
    });
  };

  const getSortIcon = () => {
    if (sortOrder === "asc") return <ArrowUp className="h-4 w-4" />;
    if (sortOrder === "desc") return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const getNextSortTooltip = () => {
    if (sortOrder === "none") return "Sort ascending (oldest first)";
    if (sortOrder === "asc") return "Sort descending (newest first)";
    return "Remove sort (by position)";
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
                sortOrder === "asc"
                  ? "Sort ascending"
                  : sortOrder === "desc"
                  ? "Sort descending"
                  : "Unsorted"
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

