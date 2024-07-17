import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, LayoutDashboard, Video } from "lucide-react";

import { db } from "@/lib/db";

import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

import { Banner } from "@/components/banner";

import { EpisodeTitleForm } from "./_components/episode-title-form";
import { EpisodeDescriptionForm } from "./_components/episode-description-form";
import { EpisodeShortDescriptionForm } from "./_components/episode-shortdescription-form";
import { EpisodeAccessForm } from "./_components/episode-access-form";
import { EpisodeActions } from "./_components/episode-actions";
import { EpisodeImageForm } from "./_components/episode-image-form";
import EpisodeVideoFormLivepeer from "./_components/episode-video-form-livepeer";

interface Session {
  user?: {
    email: string;
  };
}

const EpisodeIdPage = async ({
  params,
}: {
  params: { flixId: string; episodeId: string };
}) => {
  const session: Session | null = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return redirect("/");
  }

  const episode = await db.episode.findUnique({
    where: {
      id: params.episodeId,
      flixId: params.flixId,
    },
    include: {
      videoData: true,
    },
  });

  if (!episode) {
    return redirect("/");
  }

  const requiredFields = [
    episode.title,
    episode.shortdescription,
    episode.description,
    episode.videoUrl,
    episode.imageUrl,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <div className="p-4 flex flex-col gap-6">
      {!episode.isPublished && (
        <Banner
          variant="warning-bottom"
          label="This episode is unpublished. It will not be visible in the flix"
        />
      )}

      <div className="flex items-center justify-between bg-card border rounded-md px-4 py-2">
        <div className="flex items-center flex-row justify-center align-middle">
          <Link
            href={`/studio/cines/${params.flixId}`}
            className="text-sm hover:opacity-75 transition -ml-4 -my-2 mr-4 rounded-l-md bg-background/30 hover:bg-background/70"
          >
            <ArrowLeft className="h-4 w-4 mx-4 my-4" />
          </Link>
          <div className="font-medium flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-wider">
              <span className="font-bold text-[#8b7ad0]">Episode </span>{" "}
              Creation
            </h1>
          </div>
        </div>
        <EpisodeActions
          disabled={!isComplete}
          flixId={params.flixId}
          episodeId={params.episodeId}
          isPublished={episode.isPublished}
          completionText={completionText}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-border/90 rounded-md">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-x-2 font-bold">
              <h2 className="text-xl">Customize your episode</h2>
            </div>
            <EpisodeTitleForm
              initialData={episode}
              flixId={params.flixId}
              episodeId={params.episodeId}
            />
            <EpisodeDescriptionForm
              initialData={episode}
              flixId={params.flixId}
              episodeId={params.episodeId}
            />
            <EpisodeShortDescriptionForm
              initialData={episode}
              flixId={params.flixId}
              episodeId={params.episodeId}
            />
          </div>
          <div>
            <div className="flex items-center gap-x-2 font-bold">
              <h2 className="text-xl">Access Settings</h2>
            </div>
            <EpisodeAccessForm
              initialData={episode}
              flixId={params.flixId}
              episodeId={params.episodeId}
            />
            <EpisodeImageForm
              initialData={episode}
              flixId={params.flixId}
              episodeId={params.episodeId}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-x-2 font-bold">
            <h2 className="text-xl">Add a video</h2>
          </div>
          <EpisodeVideoFormLivepeer
            initialData={episode}
            episodeId={params.episodeId}
            flixId={params.flixId}
            edit={true}
          />
        </div>
      </div>
    </div>
  );
};

export default EpisodeIdPage;
