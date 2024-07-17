"use client";

import { useEffect } from "react";
import { videoDetails } from "@/lib/video-details";
import VideoPreview from "./VideoPreview";
import { useFormStore } from "@/store/formStore";

type VideoUploadComponentProps = {
    episodeThumbnail: string | null;
};

export default function VideoUploadComponent({ episodeThumbnail }: VideoUploadComponentProps) {
    const { setFormData, formData } = useFormStore();
    useEffect(() => {
        async function getVideoDetails() {
            if (formData.video) {
                const fetchedVideoInfo = await videoDetails(formData.video, [
                    "size",
                    "duration",
                    "format",
                ]);
                setFormData.setVideoInfo(fetchedVideoInfo);
            }
        }

        getVideoDetails();
    }, [formData.video, setFormData]);
    return (
        <>
            <VideoPreview episodeThumbnail={episodeThumbnail} />
        </>
    );
}
