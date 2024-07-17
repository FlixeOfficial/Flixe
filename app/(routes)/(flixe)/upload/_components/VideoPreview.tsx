import React, { useEffect, useState } from "react";
import VideoThumbnailGrid from "./VideoThumbnailGrid";
import { useFormStore } from "@/store/formStore";

type VideoPreviewProps = {
    episodeThumbnail: string | null;
};

export default function VideoPreview({ episodeThumbnail }: VideoPreviewProps) {
    const { setFormData, formData } = useFormStore();

    const [videoSrc, setVideoSrc] = useState("");
    const setCurrentThumbnailUrl: React.Dispatch<
        React.SetStateAction<string>
    > = (urlOrFunc) => {
        if (typeof urlOrFunc === "function") {
            setFormData.setThumbnailUrl(urlOrFunc(formData.thumbnailUrl));
        } else {
            setFormData.setThumbnailUrl(urlOrFunc);
        }
    };

    const SetCurrentThumbnailFile: React.Dispatch<
        React.SetStateAction<File | null>
    > = (thumbnailFile) => {
        setFormData.setThumbnail(thumbnailFile as File | null);
    };

    useEffect(() => {
        if (formData.video) {
            setVideoSrc(URL.createObjectURL(formData.video));
        }

        return () => {
            if (videoSrc) {
                URL.revokeObjectURL(videoSrc);
            }
        };
    }, [formData.video]);

    return (
        <div className="grid grid-column-4 mt-2 -p-12 gap-12 rounded-3xl">
            <div className="col-span-2">
                <div className="relative max-w-lg mx-auto">
                    <video
                        src={videoSrc}
                        className={`${
                            formData.shorts ? "aspect-[9/16]" : "aspect-[16/9]"
                        } w-full rounded-2xl`}
                        disablePictureInPicture
                        disableRemotePlayback
                        controlsList="nodownload noplaybackrate"
                        poster={formData.thumbnailUrl}
                        controls
                    >
                        <source src={videoSrc} />
                    </video>
                    <div className="absolute left-2 top-2 rounded-full bg-orange-200 px-2 py-0.5 text-xs uppercase text-black">
                        {formData.videoInfo?.size && (
                            <span className="whitespace-nowrap font-semibold">
                                {formData.videoInfo?.size}mb
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {/* Thumbnail grid */}
            {formData.video && (
                <div className="col-span-2">
                    <div className="mb-5">Thumbnail Suggestion</div>
                    <VideoThumbnailGrid
                        video={formData.video}
                        shorts={formData.shorts}
                        episodeThumbnail={episodeThumbnail}
                        currentThumbnail={formData.thumbnailUrl}
                        setCurrentThumbnailUrl={setCurrentThumbnailUrl}
                        currentThumbnailFile={formData.thumbnail}
                        setCurrentThumbnailFile={SetCurrentThumbnailFile}
                    />
                </div>
            )}
        </div>
    );
}
