"use client";

import axios from "axios";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { useToast } from "@/components/ui/use-toast";

interface FlixProgressButtonProps {
    episodeId: string;
    flixId: string;
    isCompleted?: boolean;
    nextEpisodeId?: string;
}

export const FlixProgressButton = ({
    episodeId,
    flixId,
    isCompleted,
    nextEpisodeId,
}: FlixProgressButtonProps) => {
    const router = useRouter();
    const confetti = useConfettiStore();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    const onClick = async () => {
        try {
            setIsLoading(true);

            await axios.put(
                `/api/flixs/${flixId}/episodes/${episodeId}/progress`,
                {
                    isCompleted: !isCompleted,
                }
            );

            if (!isCompleted && !nextEpisodeId) {
                confetti.onOpen();
            }

            if (!isCompleted && nextEpisodeId) {
                router.push(`/cines/${flixId}/episodes/${nextEpisodeId}`);
            }

            toast({
                title: "Yaa! Progress updated",
            });
            router.refresh();
        } catch {
            toast({
                variant: "destructive",
                title: "Oops!  Something went wrong.",
                description: "Something had went wrong.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const Icon = isCompleted ? XCircle : CheckCircle;

    return (
        <Button
            onClick={onClick}
            disabled={isLoading}
            type="button"
            variant={isCompleted ? "outline" : "ghost"}
            className="w-full md:w-auto"
        >
            {isCompleted ? "Not completed" : "Mark as complete"}
            <Icon className="h-4 w-4 ml-2" />
        </Button>
    );
};
