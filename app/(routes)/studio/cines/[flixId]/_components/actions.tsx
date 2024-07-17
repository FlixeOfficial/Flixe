"use client";

import axios from "axios";
import { Trash } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { useConfettiStore } from "@/hooks/use-confetti-store";

interface ActionsProps {
  disabled: boolean;
  flixId: string;
  isPublished: boolean;
  completionText: string;
}

export const Actions = ({
  disabled,
  flixId,
  isPublished,
  completionText,
}: ActionsProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        await axios.patch(`/api/flixs/${flixId}/unpublish`);
        toast({
          title: "Flix unpublished",
          description: "The flix has been successfully unpublished.",
        });
        confetti.onOpen();
      } else {
        await axios.patch(`/api/flixs/${flixId}/publish`);
        toast({
          title: "Flix published",
          description: "The flix has been successfully published.",
        });
        confetti.onOpen();
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

      await axios.delete(`/api/flixs/${flixId}`);
      toast({
        title: "Flix deleted",
        description: "The flix has been successfully deleted.",
      });
      router.refresh();
      router.push(`/studio/cines`);
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
