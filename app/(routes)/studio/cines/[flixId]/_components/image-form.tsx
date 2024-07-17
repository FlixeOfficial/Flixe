"use client";

import * as z from "zod";
import axios from "axios";
import { Pencil, PlusCircle, ImageIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flix } from "@prisma/client";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { useToast } from "@/components/ui/use-toast";

interface ImageFormProps {
    initialData: Flix;
    flixId: string;
}

const formSchema = z.object({
    imageUrl: z.string().min(1, {
        message: "Image is required",
    }),
});

export const ImageForm = ({ initialData, flixId }: ImageFormProps) => {
    const { toast } = useToast();

    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/flixs/${flixId}`, values);
            toast({
                title: "Flix updated",
                description: "The Flix has been successfully updated.",
            });
            toggleEdit();
            router.refresh();
        } catch {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
            });
        }
    };

    return (
        <div className="mt-6 border bg-background rounded-md p-4">
            <div className="flex items-center justify-between font-semibold text-lg">
                Flix thumbnail
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && <>Cancel</>}
                    {!isEditing && !initialData.imageUrl && (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add an image
                        </>
                    )}
                    {!isEditing && initialData.imageUrl && (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit image
                        </>
                    )}
                </Button>
            </div>
            {!isEditing &&
                (!initialData.imageUrl ? (
                    <div className="flex items-center justify-center h-60 bg-card rounded-md mt-2">
                        <ImageIcon className="h-10 w-10 text-slate-500" />
                    </div>
                ) : (
                    <div className="relative aspect-[16/9] mt-2">
                        <Image
                            alt="Upload"
                            fill
                            className="object-cover rounded-md"
                            src={initialData.imageUrl}
                        />
                    </div>
                ))}
            {isEditing && (
                <div>
                    <FileUpload
                        endpoint="flixImage"
                        onChange={(url) => {
                            if (url) {
                                onSubmit({ imageUrl: url });
                            }
                        }}
                    />
                    <div className="text-xs text-muted-foreground mt-4">
                        16:9 aspect ratio recommended
                    </div>
                </div>
            )}
        </div>
    );
};
