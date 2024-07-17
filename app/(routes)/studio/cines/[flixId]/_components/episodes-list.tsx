"use client";

import { Episode } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface EpisodesListProps {
  items: Episode[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
};

export const EpisodesList = ({
  items,
  onReorder,
  onEdit
}: EpisodesListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [episodes, setEpisodes] = useState(items);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setEpisodes(items);
  }, [items]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(episodes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedEpisodes = items.slice(startIndex, endIndex + 1);

    setEpisodes(items);

    const bulkUpdateData = updatedEpisodes.map((episode) => ({
      id: episode.id,
      position: items.findIndex((item) => item.id === episode.id)
    }));

    onReorder(bulkUpdateData);
  }

  if (!isMounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="episodes">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {episodes.map((episode, index) => (
              <Draggable
                key={episode.id}
                draggableId={episode.id}
                index={index}
              >
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-card border text-foreground rounded-md mb-4 text-sm"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={cn(
                        "px-2 py-3 bg-muted/20 text-primary/50 hover:bg-muted hover:text-primary rounded-l-md transition"
                      )}
                      {...provided.dragHandleProps}
                    >
                      <GripVertical className="h-5 w-5" />
                    </div>
                    {episode.title}
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      {episode.isFree && <Badge>Free</Badge>}
                      <Badge
                        className={cn(
                          "bg-orange-300",
                          episode.isPublished && "bg-[#47b7f8]"
                        )}
                      >
                        {episode.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Pencil
                        onClick={() => onEdit(episode.id)}
                        className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}