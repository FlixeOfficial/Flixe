import { db } from "@/lib/db";
import { Episode } from "@prisma/client";

interface GetEpisodeProps {
  userId: string;
  flixId: string;
  episodeId: string;
}

export const getEpisode = async ({
  userId,
  flixId,
  episodeId,
}: GetEpisodeProps) => {
  try {
    // const purchase = await db.purchase.findUnique({
    //   where: {
    //     userId_flixId: {
    //       userId,
    //       flixId,
    //     }
    //   }
    // });

    const flix = await db.flix.findUnique({
      where: {
        isPublished: true,
        id: flixId,
      },
      select: {
        price: true,
      },
    });

    const episode = await db.episode.findUnique({
      where: {
        id: episodeId,
        isPublished: true,
      },
    });

    if (!episode || !flix) {
      throw new Error("Episode or flix not found");
    }

    let videoData = null;
    let nextEpisode: Episode | null = null;

    if (episode.isFree) {
      videoData = await db.videoData.findUnique({
        where: {
          episodeId: episodeId,
        },
      });

      nextEpisode = await db.episode.findFirst({
        where: {
          flixId: flixId,
          isPublished: true,
          position: {
            gt: episode?.position,
          },
        },
        orderBy: {
          position: "asc",
        },
      });
    }

    const userProgress = await db.userProgress.findUnique({
      where: {
        userId_episodeId: {
          userId,
          episodeId,
        },
      },
    });

    return {
      episode,
      flix,
      videoData,
      nextEpisode,
      userProgress,
      // purchase,
    };
  } catch (error) {
    console.log("[GET_EPISODE]", error);
    return {
      episode: null,
      flix: null,
      videoData: null,
      attachments: [],
      nextEpisode: null,
      userProgress: null,
      // purchase: null,
    };
  }
};
