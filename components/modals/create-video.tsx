"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DropZone from "../DropZone";
import { useState } from "react";

export function UploadVideo() {
  // const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-primary hover:bg-transparent font-bold"
        >
          <Plus className="mr-2 h-4 w-4" /> Create
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Upload Video
          </DialogTitle>
          <DialogDescription className="text-center">
            Drag and drop video files to upload.
          </DialogDescription>
        </DialogHeader>
        {/* <DropZone button={false} setOpen={setOpen} /> */}
        <DropZone button={false} />
        <DialogFooter>
          {/* <Button
                        type="submit"
                        onClick={onSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? "Loading..." : "Hop In 🎉"}
                    </Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
