import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";

interface VideoThumbnailProps {
  video: File;
  shorts: boolean;
  episodeThumbnail: string | null;
  currentThumbnail: string;
  setCurrentThumbnailUrl: React.Dispatch<React.SetStateAction<string>>;
  currentThumbnailFile: File | null;
  setCurrentThumbnailFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const VideoThumbnailGrid: React.FC<VideoThumbnailProps> = ({
  video,
  shorts,
  episodeThumbnail,
  currentThumbnail,
  setCurrentThumbnailUrl,
  currentThumbnailFile,
  setCurrentThumbnailFile,
}) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const urlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  const extractThumbnails = async (videoFile: File, shorts: boolean) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const videoElement = document.createElement("video");
    const videoSrc = URL.createObjectURL(videoFile);

    videoElement.src = videoSrc;

    const captureThumbnail = (time: number): Promise<[string, Blob]> => {
      return new Promise((resolve) => {
        videoElement.currentTime = time;
        videoElement.onseeked = () => {
          if (!context) return;
          const videoWidth = videoElement.videoWidth;
          const videoHeight = videoElement.videoHeight;
          const targetAspectRatio = shorts ? 9 / 16 : 16 / 9;
          const videoAspectRatio = videoWidth / videoHeight;

          let sourceWidth = videoWidth;
          let sourceHeight = videoHeight;
          let sourceX = 0;
          let sourceY = 0;

          if (videoAspectRatio < targetAspectRatio) {
            sourceHeight = videoWidth / targetAspectRatio;
            sourceY = (videoHeight - sourceHeight) / 2;
          } else if (videoAspectRatio > targetAspectRatio) {
            sourceWidth = videoHeight * targetAspectRatio;
            sourceX = (videoWidth - sourceWidth) / 2;
          }

          // Set canvas dimensions based on target aspect ratio
          const targetWidth = 640; // Increase the width for better quality
          const targetHeight = Math.round(targetWidth / targetAspectRatio);
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          context.drawImage(
            videoElement,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            canvas.width,
            canvas.height
          );
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          fetch(dataUrl)
            .then((res) => res.blob())
            .then((blob) => {
              resolve([dataUrl, blob]);
            });
        };
      });
    };

    videoElement.onloadedmetadata = async () => {
      const duration = videoElement.duration;
      const thumbnailCount = episodeThumbnail ? 6 : 7;
      const interval = duration / (thumbnailCount + 1);
      let newThumbnails = [];

      if (episodeThumbnail) {
        newThumbnails.push(episodeThumbnail);
      }

      for (let i = 1; i <= thumbnailCount; i++) {
        const [thumbnail, thumbnailBlob] = await captureThumbnail(interval * i);
        newThumbnails.push(thumbnail);
        // Convert blob to file
        const currentThumbnailFile = new File(
          [thumbnailBlob],
          "thumbnail.jpeg",
          { type: "image/jpeg" }
        );
        setCurrentThumbnailFile(currentThumbnailFile);
      }

      setThumbnails(newThumbnails);
      URL.revokeObjectURL(videoSrc);
      setCurrentThumbnailUrl(newThumbnails[0]);
    };
  };

  useEffect(() => {
    extractThumbnails(video, shorts);
  }, [video, shorts]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      setSelectedImages((prevState) => [
        ...prevState,
        e.target?.result as string,
      ]);
      setSelectedImageFiles((prevState) => [...prevState, file]);
    };
    fileReader.readAsDataURL(file);
  };

  const handleThumbnailClick = (thumbnail: string) => {
    setCurrentThumbnailUrl(thumbnail);

    const selectedIndex = selectedImages.indexOf(thumbnail);
    if (selectedIndex > -1) {
      setCurrentThumbnailFile(selectedImageFiles[selectedIndex]);
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width="160"
        height="90"
        style={{ display: "none" }}
      ></canvas>
      <div className="grid grid-cols-4 gap-2">
        {/* Move the Upload Image button to the first position */}
        <label
          className={`border-2 border-dashed w-full h-auto flex items-center justify-center ${
            shorts ? "aspect-[9/16]" : "aspect-[16/9]"
          } rounded-2xl overflow-hidden`}
        >
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImageUpload}
            />
          </div>
          <span className="text-primary-80">Upload Image</span>
        </label>
        {selectedImages.map((selectedImage, index) => (
          <div
            key={`selected-${index}`}
            className={`w-full h-auto border-2 rounded-2xl ${
              currentThumbnail === selectedImage
                ? "border-foreground border-500"
                : "border-transparent"
            } ${
              shorts ? "aspect-[9/16]" : "aspect-[16/9]"
            } overflow-hidden flex items-center`}
          >
            <Image
              src={selectedImage}
              alt={`Selected thumbnail ${index + 1}`}
              className={`w-full ${shorts ? "h-full" : "h-auto"} object-cover`}
              width={500}
              height={500}
              layout="responsive"
              onClick={() => setCurrentThumbnailUrl(selectedImage)}
            />
          </div>
        ))}

        {thumbnails.map((thumbnail, index) => (
          <div
            key={index}
            className={`relative w-full h-auto border-2 rounded-2xl ${
              currentThumbnail === thumbnail
                ? "border-foreground border-500"
                : "border-transparent"
            } ${
              shorts ? "aspect-[9/16]" : "aspect-[16/9] "
            } overflow-hidden flex items-center`}
          >
            <Image
              src={thumbnail}
              alt={`Thumbnail ${index + 1}`}
              className={`object-cover ${shorts ? "h-auto" : "h-auto"}`}
              width={500}
              height={500}
              layout="responsive"
              onClick={() => handleThumbnailClick(thumbnail)}
            />
            {index == 0 && (
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                <Badge className="bg-black bg-opacity-40 backdrop-blur-sm text-primary px-2 py-1 pointer-events-none">
                  {episodeThumbnail ? "Current Thumbnail" : "Default Thumbnail"}
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoThumbnailGrid;
