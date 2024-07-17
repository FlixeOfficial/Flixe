"use client";

import axios from "axios";
import { Trash } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { useToast } from "@/components/ui/use-toast";

interface EpisodeActionsProps {
  disabled: boolean;
  flixId: string;
  episodeId: string;
  isPublished: boolean;
  completionText: string;
}

export const EpisodeActions = ({
  disabled,
  flixId,
  episodeId,
  isPublished,
  completionText,
}: EpisodeActionsProps) => {
  const { toast } = useToast();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        await axios.patch(
          `/api/flixs/${flixId}/episodes/${episodeId}/unpublish`
        );
        toast({
          title: "Episode unpublished",
          description: "The episode has been successfully unpublished.",
        });
      } else {
        await axios.patch(`/api/flixs/${flixId}/episodes/${episodeId}/publish`);
        toast({
          title: "Episode published",
          description: "The episode has been successfully published.",
        });
      }

      router.refresh();
    } catch {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);

      await axios.delete(`/api/flixs/${flixId}/episodes/${episodeId}`);
      toast({
        title: "Episode deleted",
        description: "The episode has been successfully deleted.",
      });

      router.refresh();
      router.push(`/studio/cines/${flixId}`);
    } catch {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-4">
      <div className="text-md text-primary/30">{completionText}</div>
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        variant="outline"
        size="sm"
      >
        {isPublished ? "Unpublish" : "Publish"}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button
          size="sm"
          disabled={isLoading}
          className="text-red-400 hover:text-red-500"
          variant="ghost"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
