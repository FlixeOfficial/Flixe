"use client";

import { UploadCloud, Video, FileVideo2, FileUp } from "lucide-react";
import clsx from "clsx";
import React, { useRef } from "react";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import { toast } from "./ui/use-toast";
import { useFormStore } from "@/store/formStore";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/x-matroska",
  "video/mpeg",
  "video/webm",
  "video/quicktime",
  "video/mov",
];

interface DropZoneProps {
  button: boolean;
  toggleEdit?: () => void;
}

const DropZone: React.FC<DropZoneProps> = ({ button, toggleEdit }) => {
  const router = useRouter();

  const {
    dragOver,
    setDragOver,
    onDragOver,
    onDragLeave,
    fileDropError,
    setFileDropError,
  } = useDragAndDrop();
  const { setFormData } = useFormStore();

  const videoUploadInputRef = useRef<HTMLInputElement>(null);

  const uploadVideo = (file: File) => {
    try {
      if (file) {
        setFormData.setVideo(file);
        setFormData.setVideoUrl(URL.createObjectURL(file));
        !button && toggleEdit && toggleEdit();
        // setOpen && setOpen(false);
        // !button && router.push("/upload");
      }
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Uploading Failed!",
        description: "Error uploading file.",
      });
    }
  };

  const validateFile = (file: File) => {
    console.log(file?.type);
    if (!ALLOWED_VIDEO_TYPES.includes(file?.type)) {
      const errorMessage = `Video format not supported`;
      toast({
        variant: "destructive",
        title: "Uploading Failed!",
        description: errorMessage,
      });
      return setFileDropError(errorMessage);
    }
    uploadVideo(file);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    validateFile(e?.dataTransfer?.files[0]);
  };

  const onChooseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      validateFile(e?.target?.files[0]);
    }
  };

  if (!button) {
    return (
      <div>
        <div className="relative mt-5 w-[18rem] h-[18rem] m-auto flex flex-1 flex-col items-center justify-center">
          <label
            className={clsx(
              "grid w-full place-items-center rounded-3xl border border-dashed border-primary-80 p-10 text-center focus:outline-none",
              { "!border-green-500": dragOver }
            )}
            htmlFor="dropVideo"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <input
              type="file"
              className="hidden"
              onChange={onChooseFile}
              id="dropVideo"
              accept={ALLOWED_VIDEO_TYPES.join(",")}
            />
            <span className="mb-6 flex justify-center opacity-80">
              <UploadCloud />
            </span>
            <span className="space-y-1 md:space-y-2">
              <div className="text-xl font-semibold">
                <span>
                  <h6>Drag and drop</h6>
                  <h6>video to upload</h6>
                </span>
              </div>
              <div>
                <label
                  htmlFor="chooseVideo"
                  className="btn-primary cursor-pointer px-8 py-4 text-lg"
                >
                  <h3>or choose video</h3>
                  <input
                    id="chooseVideo"
                    onChange={onChooseFile}
                    type="file"
                    className="hidden"
                    accept={ALLOWED_VIDEO_TYPES.join(",")}
                  />
                </label>
              </div>
              {fileDropError && (
                <div className="font-medium text-red-500">{fileDropError}</div>
              )}
            </span>
          </label>
        </div>
      </div>
    );
  } else {
    return (
      <div className="relative">
        <input
          ref={videoUploadInputRef}
          id="chooseVideo"
          onChange={onChooseFile}
          type="file"
          className="hidden"
          accept={ALLOWED_VIDEO_TYPES.join(",")}
        />
        <Button
          className="mt-1 flex justify-center w-full rounded-2xl bg-muted hover:bg-muted border text-secondary-foreground"
          onClick={() => videoUploadInputRef.current?.click()}
        >
          <Video className="h-6 w-6 mr-4" />
          <b className="self-center">
            <pre>Select another video</pre>
          </b>
        </Button>
      </div>
    );
  }
};

export default DropZone;
