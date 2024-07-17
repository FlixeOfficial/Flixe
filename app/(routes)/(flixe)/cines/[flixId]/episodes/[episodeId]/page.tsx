import { redirect } from "next/navigation";

import { getEpisode } from "@/actions/get-episode";
import { Banner } from "@/components/banner";

import { VideoPlayer } from "./_components/video-player";
import { FlixEnrollButton } from "./_components/flix-enroll-button";

import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { FlixSidebar } from "../../_components/flix-sidebar";
import { getProgress } from "@/actions/get-progress";
import { db } from "@/lib/db";
import FlixDescription from "./_components/flix-description";

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

  const { episode, flix, videoData, nextEpisode, userProgress } =
    await getEpisode({
      userId: session.user.email.toLowerCase(),
      episodeId: params.episodeId,
      flixId: params.flixId,
    });

  if (!episode || !flix) {
    return redirect("/");
  }

  const flixs = await db.flix.findUnique({
    where: {
      id: params.flixId,
    },
    include: {
      episodes: {
        where: {
          isPublished: true,
        },
        include: {
          userProgress: {
            where: {
              userId: session.user.email.toLowerCase(),
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!flixs) {
    return redirect("/");
  }

  const isLocked = !episode.isFree;
  // const completeOnEnd = !!purchase && !userProgress?.isCompleted;

  const progressCount = await getProgress(session.user.email, flixs.id);

  // const Loading = () => {
  //   return (
  //     <div className="mx-auto pb-20">
  //       <div className="flex justify-center">
  //         <Skeleton className="h-[90vh] w-full rounded-lg" />
  //       </div>
  //       <div className="w-[80%] mx-auto mt-8">
  //         <div className="p-4 flex flex-col md:flex-row items-center justify-between">
  //           <Skeleton className="h-8 w-[30%] rounded" />
  //           <Skeleton className="h-12 w-[15%] rounded-lg" />
  //         </div>
  //         <div className="space-y-4 mt-4">
  //           <Skeleton className="h-6 w-full rounded-md" />
  //           <Skeleton className="h-[200px] w-full rounded-lg" />
  //           <div className="flex flex-row justify-between">
  //             <Skeleton className="h-6 w-[20%] rounded-md" />
  //             <Skeleton className="h-6 w-[20%] rounded-md" />
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };

  return (
    <div>
      {userProgress?.isCompleted && (
        <Banner variant="success" label="You already completed this episode." />
      )}
      <div className="flex flex-col mx-auto pb-20">
        <VideoPlayer
          episode={episode}
          episodeId={params.episodeId}
          title={episode.title}
          flixId={params.flixId}
          nextEpisodeId={nextEpisode?.id}
          // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
          playbackId={videoData?.playbackId!}
          isLocked={isLocked}
          completeOnEnd={false}
          flixNftId={flixs.flixNftId || 0}
          flixs={flixs}
        />
        <div className="w-[80%] mx-auto">
          <div className="p-4 flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-3xl font-semibold mb-2">{episode.title}</h2>
            {/* {purchase ? (
              <FlixProgressButton
                episodeId={params.episodeId}
                flixId={params.flixId}
                nextEpisodeId={nextEpisode?.id}
                isCompleted={!!userProgress?.isCompleted}
              />
            ) : ( */}
            {flixs.flixNftId &&
            flix.price &&
            flixs.flixSaleStatus != "STREAM" ? (
              <FlixEnrollButton
                flixId={params.flixId}
                price={flix.price!}
                flixNftId={flixs.flixNftId}
                nftType={flixs.flixSaleStatus}
              />
            ) : (
              <p className="px-4 py-2 text-red-200 rounded-2xl bg-opacity-80 tracking-wider uppercase">
                Not for sale
              </p>
            )}
            {/* )} */}
          </div>
          <FlixDescription episode={episode} />
          <FlixSidebar flix={flixs} progressCount={progressCount} />
        </div>
      </div>
    </div>
  );
};

export default EpisodeIdPage;
