import { db } from "@/lib/db";

export const getProgress = async (
  userId: string,
  flixId: string,
): Promise<number> => {
  try {
    const publishedEpisodes = await db.episode.findMany({
      where: {
        flixId: flixId,
        isPublished: true,
      },
      select: {
        id: true,
      }
    });

    const publishedEpisodeIds = publishedEpisodes.map((episode) => episode.id);

    const validCompletedEpisodes = await db.userProgress.count({
      where: {
        userId: userId,
        episodeId: {
          in: publishedEpisodeIds,
        },
        isCompleted: true,
      }
    });

    const progressPercentage = (validCompletedEpisodes / publishedEpisodeIds.length) * 100;

    return progressPercentage;
  } catch (error) {
    console.log("[GET_PROGRESS]", error);
    return 0;
  }
}
