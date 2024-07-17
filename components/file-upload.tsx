"use client";

import { useToast } from "@/components/ui/use-toast";

import { UploadDropzone } from "@/lib/uploadthing";
import { ourFileRouter } from "@/app/api/uploadthing/core";

interface FileUploadProps {
  onChange: (url?: string) => void;
  endpoint: keyof typeof ourFileRouter;
}

export const FileUpload = ({ onChange, endpoint }: FileUploadProps) => {
  const { toast } = useToast();

  return (
    <UploadDropzone
      className="p-4"
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        toast({
          variant: "destructive",
          title: "Upload Error",
          description: error?.message,
        });
      }}
    />
  );
};
