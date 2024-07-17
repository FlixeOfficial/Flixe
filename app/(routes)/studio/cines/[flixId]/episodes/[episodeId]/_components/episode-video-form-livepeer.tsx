"use client";

import {
  LivepeerConfig,
  ThemeConfig,
  createReactClient,
  studioProvider,
} from "@livepeer/react";
import { EpisodeVideoForm } from "./episode-video-form";
import { Episode, VideoData } from "@prisma/client";

const livepeerClient = createReactClient({
  provider: studioProvider({
    apiKey: process.env.NEXT_PUBLIC_STUDIO_API_KEY!,
  }),
});

interface EpisodeVideoFormLivepeerProps {
  initialData: Episode & { videoData?: VideoData | null };
  flixId: string;
  episodeId: string;
  edit: boolean;
}

const theme: ThemeConfig = {
  colors: {
    accent: "#fff",
  },
  fonts: {
    display: "Inter",
  },
};

export default function EpisodeVideoFormLivepeer({
  initialData,
  flixId,
  episodeId,
  edit,
}: EpisodeVideoFormLivepeerProps) {
  return (
    <LivepeerConfig client={livepeerClient} theme={theme}>
      <EpisodeVideoForm
        initialData={initialData}
        episodeId={episodeId}
        flixId={flixId}
        edit={edit}
      />
    </LivepeerConfig>
  );
}
