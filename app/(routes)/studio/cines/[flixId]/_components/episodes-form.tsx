"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Episode, Flix } from "@prisma/client";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

import { EpisodesList } from "./episodes-list";
import { useToast } from "@/components/ui/use-toast";

interface EpisodesFormProps {
    initialData: Flix & { episodes: Episode[] };
    flixId: string;
}

const formSchema = z.object({
    title: z.string().min(1),
});

export const EpisodesForm = ({ initialData, flixId }: EpisodesFormProps) => {
    const { toast } = useToast();

    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const toggleCreating = () => {
        setIsCreating((current) => !current);
    };

    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post(`/api/flixs/${flixId}/episodes`, values);
            toast({
                title: "Episode created",
                description: "A new episode has been successfully created.",
            });
            toggleCreating();
            router.refresh();
        } catch {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
            });
        }
    };

    const onReorder = async (
        updateData: { id: string; position: number }[]
    ) => {
        try {
            setIsUpdating(true);

            await axios.put(`/api/flixs/${flixId}/episodes/reorder`, {
                list: updateData,
            });
            toast({
                title: "Episodes reordered",
                description: "The episodes have been successfully reordered.",
            });
            router.refresh();
        } catch {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const onEdit = (id: string) => {
        router.push(`/studio/cines/${flixId}/episodes/${id}`);
    };

    return (
        <div className="relative mt-6 border bg-background rounded-md p-4">
            {isUpdating && (
                <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-m flex items-center justify-center">
                    <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
                </div>
            )}
            <div className="flex items-center justify-between font-semibold text-lg">
                Flix episodes
                <Button onClick={toggleCreating} variant="ghost">
                    {isCreating ? (
                        <>Cancel</>
                    ) : (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add an episode
                        </>
                    )}
                </Button>
            </div>
            {isCreating && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 mt-4"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            disabled={isSubmitting}
                                            placeholder="e.g. 'Introduction to the flix'"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            disabled={!isValid || isSubmitting}
                            type="submit"
                        >
                            Create
                        </Button>
                    </form>
                </Form>
            )}
            {!isCreating && (
                <div
                    className={cn(
                        "text-sm mt-2",
                        !initialData.episodes.length && "text-slate-500 italic"
                    )}
                >
                    {!initialData.episodes.length && "No episodes"}
                    <EpisodesList
                        onEdit={onEdit}
                        onReorder={onReorder}
                        items={initialData.episodes || []}
                    />
                </div>
            )}
            {!isCreating && (
                <p className="text-xs text-muted-foreground mt-4">
                    Drag and drop to reorder the episodes
                </p>
            )}
        </div>
    );
};
