"use client";

import * as z from "zod";
import axios from "axios";
import { AlertTriangle, Video } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Episode, VideoData } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import DropZone from "@/components/DropZone";
import { useFormStore } from "@/store/formStore";
import VideoUploadComponent from "@/app/(routes)/(flixe)/upload/_components/VideoUploadComponent";
import { Player } from "@livepeer/react";

import Image from "next/image";
import AmbientLivepeerPlayer from "./ambient-video";

interface EpisodeVideoFormProps {
  initialData: Episode & { videoData?: VideoData | null };
  flixId: string;
  episodeId: string;
  edit: boolean;
}

const formSchema = z.object({
  videoUrl: z.string().min(1),
});

const apikey = process.env.NEXT_PUBLIC_THETA_APIKEY || '';
const apisecret = process.env.NEXT_PUBLIC_THETA_APISECRET || '';

export const EpisodeVideoForm = ({
  initialData,
  flixId,
  episodeId,
  edit,
}: EpisodeVideoFormProps) => {

  const { toast } = useToast();

  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);

  const { resetFormData, formData } = useFormStore();

  const [isUploading, setIsUploading] = useState(false);

  const toggleEdit = () => {
    resetFormData();
    setIsEditing((current) => !current);
  };


  const [errorMessage, setErrorMessage] = useState('')
  const selectedResolutions = [2160, 1080, 720, 360];
  const [progress, setProgress] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcodingId, setTranscodingId] = useState('');

  // const {
  //   mutate: createAsset,
  //   data: asset,
  //   status,
  //   progress,
  //   error,
  // } = useCreateAsset(
  //   formData.video
  //     ? {
  //       sources: [
  //         { name: formData.video.name, file: formData.video },
  //       ] as const,
  //     }
  //     : null
  // );

  // const { data: metrics } = useAssetMetrics({
  //   assetId: asset?.[0].id,
  //   refetchInterval: 30000,
  // });

  // const isLoading = useMemo(
  //   () =>
  //     status === "loading" ||
  //     (asset?.[0] && asset[0].status?.phase !== "ready"),
  //   [status, asset]
  // );

  // const progressFormatted = useMemo(
  //   () => {
  //     const value = progress?.[0].phase === "failed"
  //       ? "Failed to process video."
  //       : progress?.[0].phase === "waiting"
  //         ? "Waiting..."
  //         : progress?.[0].phase === "uploading"
  //           ? `Uploading: ${Math.round(progress?.[0]?.progress * 100)}%`
  //           : progress?.[0].phase === "processing"
  //             ? `Processing: ${Math.round(progress?.[0].progress * 100)}%`
  //             : "waiting";

  //     progressFormattedRef.current = value;
  //     return value;
  //   },
  //   [progress]
  // );


  // useEffect(() => {
  //   if (asset?.[0]?.id) {
  //     console.log("asset---->");
  //     console.log(asset);
  //     if (asset?.[0]?.playbackId) {
  //       assetCreationCompleteRef.current = asset?.[0]?.playbackId;
  //     }
  //   }
  // }, [asset]);

  // -------------------------------------------

  const createTranscodeData = (id: string | null): any => {
    const baseData = {
      playback_policy: "public",
      resolutions: selectedResolutions
    };

    if (id) {
      console.log("Transcode via upload id");
      return { ...baseData, source_upload_id: id };
    } else {
      console.log("Transcode via external URL");
      return { ...baseData, source_uri: formData.video };
    }
  };

  const fetchVideoProgress = async (id: string) => {
    const options = {
      method: 'GET',
      url: 'https://api.thetavideoapi.com/video/' + id,
      headers: {
        'x-tva-sa-id': apikey,
        'x-tva-sa-secret': apisecret,
      },
    };

    try {
      const response = await axios(options);
      const videoData = response.data.body.videos[0];
      if (videoData) {
        setProgress(videoData.progress);

        if (videoData.progress === 100 && videoData.playback_uri) {
          setIsProcessing(false);
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching video progress:', error);
      setIsProcessing(false);
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (isProcessing) {
      const fetchProgressInterval = setInterval(async () => {
        await fetchVideoProgress(transcodingId);
      }, 2000);

      return () => clearInterval(fetchProgressInterval);
    }
  }, [isProcessing, transcodingId]);

  const getMetadata = () => {
    const metadata: any = {};

    if (formData.video?.name) metadata.name = formData.video?.name;
    if (initialData.shortdescription) metadata.description = initialData.shortdescription;

    return Object.keys(metadata).length ? metadata : null;
  };

  const delay = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));

  const transcodeVideo = async (id: string | null) => {
    let data = createTranscodeData(id);

    // const drmRules = getDrmRules();
    // data.use_drm = drmRules.length > 0;
    // if (data.use_drm) data.drm_rules = drmRules;

    const metadata = getMetadata();
    if (metadata) data.metadata = metadata;

    console.log(data);

    try {
      const response = await axios.post('https://api.thetavideoapi.com/video', JSON.stringify(data), {
        headers: {
          'x-tva-sa-id': apikey,
          'x-tva-sa-secret': apisecret,
          'Content-Type': 'application/json'
        }
      });

      setTranscodingId(response.data.body.videos[0].id);

      const videoUrl = `https://player.thetavideoapi.com/video/${response.data.body.videos[0].id}`;
      console.log("videoUrl:", videoUrl);

      // Ensure videoUrl was set
      if (!videoUrl) {
        throw new Error("Failed to get video URL after all retries.");
      }

      const videoData = {
        videoUrl: videoUrl,
      };

      await axios.patch(`/api/flixs/${flixId}/episodes/${episodeId}`, videoData);

      toast({
        title: "Episode updated",
        description: "The episode has been successfully updated.",
      });

      router.refresh();

      toggleEdit();

      setIsProcessing(true);
      while (isProcessing) {
        await delay(2000);
        await fetchVideoProgress(response.data.body.videos[0].id);
      };
    } catch (error) {
      const errorMessage = 'Error starting Video transcoding';
      setErrorMessage(errorMessage);
      console.error('Error fetching transcoding Video:', error);
    }
  };

  const getSignedURL = async () => {
    try {
      const response = await axios.post('https://api.thetavideoapi.com/upload', {}, {
        headers: {
          'x-tva-sa-id': apikey,
          'x-tva-sa-secret': apisecret
        }
      });
      return response.data.body.uploads[0];
    } catch (error) {
      console.error('Error fetching signed URL:', error);
    }
  }

  const uploadVideo = async () => {
    if (formData.video) {
      try {
        setIsUploading(true)
        const uploads = await getSignedURL()
        const signedURL = uploads.presigned_url;

        if (!signedURL) {
          console.error('Failed to get signed URL.');
          setErrorMessage('Failed to get signed URL.')
          return;
        }

        await axios.put(signedURL, formData.video, {
          headers: {
            'Content-Type': 'application/octet-stream',
          }
        });
        transcodeVideo(uploads.id);
      } catch (error) {
        setIsUploading(false)
        console.error('Error uploading the file:', error);
      }
    }
  }

  const onSubmit = async () => {
    try {
      setErrorMessage('');

      if (formData.video != null) {
        await uploadVideo()
      } else {
        setErrorMessage('No video provided!')
      }

      // setIsUploading(true);
      // assetCreationCompleteRef.current = "";
      // console.log("Asset ID attemplt --- ");
      // //make it wait till isLoading become false
      // await createAsset?.();
      // while (!assetCreationCompleteRef.current) {
      //   await delay(500);
      //   // if (progressFormattedRef.current?.includes("Processing") && isEditing) {
      //   //   setIsEditing(false);
      //   //   setIsUploading(false);
      //   // }
      // }
      // console.log('2 :- ' + transcodingId);
      // const videoUrl = `https://player.thetavideoapi.com/video/${transcodingId}`;
      // console.log("videoUrl:", videoUrl);

      // // Ensure videoUrl was set
      // if (!videoUrl) {
      //   throw new Error("Failed to get video URL after all retries.");
      // }

      // const data = {
      //   videoUrl: videoUrl,
      // };

      // await axios.patch(`/api/flixs/${flixId}/episodes/${episodeId}`, data);

      // toast({
      //   title: "Episode updated",
      //   description: "The episode has been successfully updated.",
      // });

      // router.refresh();

      // toggleEdit();
    } catch (error) {
      console.error("Error encountered:", error);
      setIsUploading(false);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    }
  };

  // -------------------------------------------

  const PosterImage = () => {
    return (
      initialData?.imageUrl && (
        <Image
          src={initialData.imageUrl}
          alt="thumbnail"
          layout="fill"
          objectFit="cover"
          priority
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,...yourBase64Here..."

        />
      )
    );
  };

  return (
    edit ? (
      <div className="mt-6 border bg-background rounded-md p-4">
        <div className="font-medium flex items-center justify-between">
          Episode video
          <div>
            {!isUploading && formData.video && (
              <Button onClick={onSubmit} variant="ghost">
                Upload
              </Button>
            )}
            {isUploading && (
              <Button variant="ghost" disabled>
                Encoding video: {progress ? `${progress.toFixed(2)}%` : 'Starting...'}
              </Button>
            )}
            {!isUploading && (
              <Button
                onClick={toggleEdit}
                variant="ghost"
                disabled={isUploading}
              >
                {isEditing
                  ? "Cancel"
                  : initialData.videoUrl
                    ? "Edit video"
                    : "Add a video"}
              </Button>
            )}
          </div>
        </div>
        {!isEditing &&
          (!initialData.videoUrl ? (
            <div className="flex items-center justify-center h-60 bg-card rounded-md">
              <Video className="h-10 w-10 text-slate-500" />
            </div>
          ) : (
            <div className="relative aspect-[16/9] mt-2 rounded-xl overflow-hidden">
              <iframe src={initialData.videoUrl}
                width="100%"
                height="100%"
                allowFullScreen />
              {/* <Player
                title={initialData.title}
                poster={<PosterImage />}
                playbackId={new URL(initialData.videoUrl).searchParams.get(
                  "v"
                )}
                objectFit="cover"
                priority
              /> */}
            </div>
          ))}
        {isEditing && (
          <div>
            {!formData.video ? (
              <DropZone button={false} />
            ) : (
              <VideoUploadComponent episodeThumbnail={initialData.imageUrl} />
            )}
            <div className="text-xs text-muted-foreground mt-4">
              Upload the video for this episode. Keep it open until the upload process is fully complete.
            </div>
          </div>
        )}
        {initialData.videoUrl && !isEditing && (
          <div className="text-xs text-muted-foreground mt-2">
            Videos can take a few minutes to process. Refresh the page if
            video does not appear.
          </div>
        )}
      </div>
    ) : !initialData.videoUrl ? (
      <div className="flex items-center justify-center h-60 bg-card rounded-md">
        <AlertTriangle className="h-4 w-4 mr-2" />
        Video Not found
      </div>
    ) : (
      <AmbientLivepeerPlayer
        title={initialData.title}
        poster={<PosterImage />}
        videoUrl={initialData.videoUrl}
      />
    )
  );
};