"use client";

import { Banner } from "@/components/banner";
import Image from "next/image";

interface EpisodeOffScreenProps {
  episode: any;
  type: "loading" | "loaded" | "error";
  handleRefresh: () => void;
}

const EpisodeOffScreen: React.FC<EpisodeOffScreenProps> = ({
  episode,
  type,
  handleRefresh,
}) => {
  const determineLabel = (type: "loading" | "loaded" | "error"): string => {
    switch (type) {
      case "loaded":
        return "You need to buy Flix Pass in order to watch this episode.";
      case "loading":
        return "Please wait while your ad is being fetched.";
      default:
        return "Ad fetch failed or rejected. Reload to retry.";
    }
  };

  return (
    <div className="rounded-xl overflow-hidden m-auto z-10 w-full max-h-[90vh] flex items-center justify-center">
      <div className="flex w-full flex-col mx-auto">
        {episode?.imageUrl && (
          <div className="relative w-full h-[90vh] overflow-hidden shadow-sm">
            <div className="rounded-xl overflow-hidden relative h-full">
              <Image
                src={episode.imageUrl}
                alt="thumbnail"
                layout="fill"
                objectFit="cover"
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,...yourBase64Here..."
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-100">
              <div className="flex flex-col justify-end h-full p-5 space-y-3">
                <Banner
                  variant="warning-dark"
                  label={determineLabel(type)}
                  button={type === 'error' ? handleRefresh : undefined}
                />
                <div className="flex flex-col justify-end h-full p-5 space-y-3">
                  <div className="text-2xl font-bold text-secondary dark:text-card-foreground line-clamp-2 mb-1 pl-28">
                    {episode.title}
                  </div>
                  <p className="text-lg text-muted-foreground mb-2 font-medium max-w-[40%] leading-loose pl-28 pb-16">
                    {episode.shortdescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EpisodeOffScreen;
