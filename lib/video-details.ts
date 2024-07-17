type VideoDetails = {
    size?: number;
    duration?: number;
    format?: string;
};

type VideoDetailsOptions = Array<"size" | "duration" | "format">;

export const videoDetails = async (
    file: File | null,
    options: VideoDetailsOptions
): Promise<VideoDetails> => {
    return new Promise((resolve) => {
        if (!file) {
            resolve({});
            return;
        }

        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src);

            const details: VideoDetails = {};

            if (options.includes("size")) {
                details.size = Number((file.size / (1024 * 1024)).toFixed(2));
            }

            if (options.includes("duration")) {
                details.duration = Number(video.duration.toFixed(2));
            }

            if (options.includes("format")) {
                const format = file.type.split("/")[1];
                details.format = format;
            }

            resolve(details);
        };
    });
};
