"use client";

import { useState, useEffect, useRef } from "react";
import EpisodeVideoFormLivepeer from "@/app/(routes)/studio/cines/[flixId]/episodes/[episodeId]/_components/episode-video-form-livepeer";
import { Episode, VideoData } from "@prisma/client";
import AdwareInteraction from "@/contracts/interaction/AdwareInteraction";
import useIsNFTOwned from "@/hooks/useIsNFTOwned";
import EpisodeOffScreen from "./episode-offscreen";
import { fetchIPFSJson } from "@/service/pinataService";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

interface VideoPlayerProps {
  episode: Episode & { videoData?: VideoData | null };
  playbackId: string;
  flixId: string;
  episodeId: string;
  nextEpisodeId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
  flixNftId: number;
  flixs: any;
}

interface AdData {
  title: string;
  slots: string;
  button: string;
  url: string;
  imageUrl: string;
}

export const VideoPlayer = ({
  episode,
  playbackId,
  flixId,
  episodeId,
  nextEpisodeId,
  isLocked,
  completeOnEnd,
  title,
  flixNftId,
  flixs,
}: VideoPlayerProps) => {
  let adwareInteraction = AdwareInteraction();

  const [isAdPlaying, setIsAdPlaying] = useState(true);

  const [adStatus, setAdStatus] = useState<"loading" | "loaded" | "error">(
    "loaded"
  );
  const [hasFetchedAdData, setHasFetchedAdData] = useState(false);

  const [adData, setAdData] = useState<AdData>({
    title: "",
    slots: "",
    button: "",
    url: "",
    imageUrl: "",
  });

  // const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isNFTOwned = useIsNFTOwned(flixNftId);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const playVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    }
  };

  const unMuteVideo = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
    }
  };

  const onEndAd = () => {
    setIsAdPlaying(false);
  };

  const skipAd = () => {
    setIsAdPlaying(false);
  };

  // const onEndEpisode = async () => {
  //   try {
  //     if (completeOnEnd) {
  //       await axios.put(`/api/flixs/${flixId}/episodes/${episodeId}/progress`, {
  //         isCompleted: true,
  //       });

  //       if (!nextEpisodeId) {
  //         confetti.onOpen();
  //       }

  //       toast({
  //         title: "Yaa! Progress updated.",
  //         description: "Progress updated successfully.",
  //       });

  //       router.reload();

  //       if (nextEpisodeId) {
  //         router.push(`/cines/${flixId}/episodes/${nextEpisodeId}`);
  //       }
  //     }
  //   } catch {
  //     toast({
  //       variant: "destructive",
  //       title: "Uh-Oh! Something went wrong.",
  //       description: "Something went wrong",
  //     });
  //   }
  // };

  // useEffect(() => {
  //   const getAdData = async () => {
  //     if (
  //       !hasFetchedAdData &&
  //       (isNFTOwned || !isLocked) &&
  //       episode.completeEpisodeData
  //     ) {
  //       setAdStatus(true);
  //       try {
  //         const response = await fetch("/api/display-next-videoad", {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({ walletAddress: flixs.userId }),
  //         });
  //         const data = await response.json();
  //         if (data.success && data.adDetails) {
  //           setAdData(data.adDetails);
  //         } else {
  //           throw new Error(data.error || "Failed to fetch ad data");
  //         }
  //       } catch (error) {
  //         console.error(
  //           "Error fetching ad data:",
  //           error instanceof Error ? error.message : "An unknown error occurred"
  //         );
  //       } finally {
  //         setAdStatus(false);
  //         setHasFetchedAdData(true);
  //       }
  //     }
  //   };
  //   getAdData();
  // }, [
  //   episode.completeEpisodeData,
  //   isLocked,
  //   isNFTOwned,
  //   hasFetchedAdData,
  //   flixs.userId,
  // ]);

  useEffect(() => {
    const getAdData = async () => {
      if (
        !hasFetchedAdData &&
        (isNFTOwned || !isLocked) && // !isNFTOwned &&
        episode.completeEpisodeData
      ) {
        try {
          setAdStatus("loading");

          let newAdData;
          try {
            newAdData = await adwareInteraction.displayNextVideoAd(
              flixs.userId
            );
          } catch (error) { }
          if (
            newAdData &&
            typeof newAdData === "object" &&
            newAdData.type !== "none"
          ) {
            if (
              newAdData.message === "Ad displayed" &&
              newAdData.details &&
              newAdData.details.adDetailsURL
            ) {
              const ad: AdData | null = await fetchIPFSJson(
                newAdData.details.adDetailsURL
              );
              if (ad && typeof ad === "object" && ad.imageUrl) {
                setAdData({ ...ad });
                setAdStatus("loaded");
              } else {
                setAdStatus("error");
              }
            } else if (
              newAdData.message === "No ads available" ||
              newAdData.message === "Valuable user"
            ) {
              setAdStatus("loaded");
            }
          } else {
            setAdStatus("error");
          }
        } catch (error) {
          setAdStatus("error");
        }

        setHasFetchedAdData(true);
      }
    };
    !isNFTOwned && getAdData();
  }, [
    episode.completeEpisodeData,
    flixs.userId,
    hasFetchedAdData,
    isLocked,
    isNFTOwned,
    refreshCounter,
  ]);

  // console.log("episode", episode);
  // console.log("isNFTOwned", isNFTOwned);
  // console.log("isLocked", isLocked);
  const handleRefresh = () => {
    setHasFetchedAdData(false);
    setRefreshCounter((prev) => prev + 1); // Increment counter to trigger re-fetch
  };
  
  if (adStatus === "loading") {
    return (
      <EpisodeOffScreen
        episode={episode}
        type="loading"
        handleRefresh={handleRefresh}
      />
    );
  } else if (adStatus === "error") {
    return (
      <EpisodeOffScreen
        episode={episode}
        type="error"
        handleRefresh={handleRefresh}
      />
    );
  } else if (!isNFTOwned && isLocked) {
    return (
      <EpisodeOffScreen
        episode={episode}
        type="loaded"
        handleRefresh={handleRefresh}
      />
    );
  }

  return (
    <div className="p-4">
      {isAdPlaying && adData.imageUrl ? (
        <div className="relative">
          <div className="font-medium flex flex-col gap-8 relative">
            <div
              onClick={skipAd}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 translate-x-1/2 -rotate-90 z-10 rounded-t-sm tracking-widest backdrop-blur-md bg-opacity-20 bg-blue-100 border-blue-100 text-primary px-3"
            >
              Skip Ad
            </div>

            <div className="group hover:shadow-sm w-full rounded-3xl bg-card/60 cursor-pointer">
              <video
                ref={videoRef}
                onPlay={unMuteVideo}
                src={adData.imageUrl}
                onEnded={onEndAd}
                className="rounded-sm overflow-hidden m-auto z-10 h-[90vh] w-auto flex items-center justify-center"
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload noplaybackrate"
                onClick={togglePlayPause}
                autoPlay
                muted
              // poster={formData.thumbnailUrl}
              // controls
              />
              <div className="hidden group-hover:flex flex-row justify-between absolute bottom-0 inset-x-0">
                <div className="bg-background/20 backdrop-blur-xl px-4 py-2 m-8 h-12 rounded-2xl flex items-center justify-center">
                  <h4 className="text-lg font-semibold text-primary ">
                    {adData.title}
                  </h4>
                </div>

                <div className="flex justify-between flex-wrap space-y-2 px-4 py-2 m-8 h-12 rounded-2xl">
                  <div className="flex flex-col items-start">
                    <Button
                      type="submit"
                      className="max-w-sm m-auto bg-muted/40 text-primary border hover:bg-black/20 border-black/20 backdrop-blur-xl"
                      onClick={(e) => {
                        e.preventDefault();
                        const url = adData.url;
                        window.open(url, "_blank");
                      }}
                    >
                      <Link2 className="h-5 w-5" />
                      {adData.button}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="">
          {/* Main Video Player Logic */}
          {(isNFTOwned || !isLocked) && (
            <EpisodeVideoFormLivepeer
              initialData={episode}
              episodeId={episodeId}
              flixId={flixId}
              edit={false}
            // onEnd={onEndEpisode}
            />
          )}
        </div>
      )}
    </div>
  );
};
