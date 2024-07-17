// need video table handling

import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

import authOptions from '@/app/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';

import { utapi } from 'uploadthing/server';

interface Session {
  user?: {
    email: string;
  };
}

export async function DELETE(
  req: Request,
  { params }: { params: { flixId: string; episodeId: string } }
) {
  try {
    const session: Session | null = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const ownFlix = await db.flix.findUnique({
      where: {
        id: params.flixId,
        userId: session.user.email.toLowerCase(),
      },
    });

    if (!ownFlix) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const episode = await db.episode.findUnique({
      where: {
        id: params.episodeId,
        flixId: params.flixId,
      },
    });

    if (!episode) {
      return new NextResponse('Not Found', { status: 404 });
    }

    if (episode.videoUrl) {
      const existingVideoData = await db.videoData.findFirst({
        where: {
          episodeId: params.episodeId,
        },
      });

      if (existingVideoData) {
        // await Video.Assets.del(existingVideoData.assetId);
        await db.videoData.delete({
          where: {
            id: existingVideoData.id,
          },
        });
      }
    }

    const deletedEpisode = await db.episode.delete({
      where: {
        id: params.episodeId,
      },
    });

    const publishedEpisodesInFlix = await db.episode.findMany({
      where: {
        flixId: params.flixId,
        isPublished: true,
      },
    });

    if (!publishedEpisodesInFlix.length) {
      await db.flix.update({
        where: {
          id: params.flixId,
        },
        data: {
          isPublished: false,
        },
      });
    }

    return NextResponse.json(deletedEpisode);
  } catch (error) {
    console.log('[EPISODE_ID_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { flixId: string; episodeId: string } }
) {
  try {
    const session: Session | null = await getServerSession(authOptions);
    const { isPublished, ...values } = await req.json();

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const ownFlix = await db.flix.findUnique({
      where: {
        id: params.flixId,
        userId: session.user.email.toLowerCase(),
      },
    });

    if (!ownFlix) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const existingEpisode = await db.episode.findUnique({
      where: {
        id: params.episodeId,
        flixId: params.flixId,
      },
    });

    if (!existingEpisode) {
      return new NextResponse('Episode not found', { status: 404 });
    }

    if (ownFlix.isNFT) {
      const allowedFields: (keyof typeof values)[] = [
        'isPublished',
        'isFree',
        'completeEpisodeData',
        'updatedAt',
      ];
      for (const field in values) {
        if (!allowedFields.includes(field as keyof typeof values)) {
          return new NextResponse(
            `Modification of field '${field}' is not allowed when isNFT is true.`,
            { status: 400 }
          );
        }
      }
    }

    if (values.thumbnail) {
      const response = await utapi.uploadFiles(values.thumbnail);
      // values.thumbnail = response[0].url;
    }

    const updatedEpisode = await db.episode.update({
      where: {
        id: params.episodeId,
        flixId: params.flixId,
      },
      data: {
        ...values,
      },
    });

    if (values.videoUrl) {
      const existingVideoData = await db.videoData.findFirst({
        where: {
          episodeId: params.episodeId,
        },
      });

      if (existingVideoData) {
        // await Video.Assets.del(existingVideoData.assetId);
        await db.videoData.delete({
          where: {
            id: existingVideoData.id,
          },
        });
      }

      // const asset = await Video.Assets.create({
      //     input: values.videoUrl,
      //     playback_policy: "public",
      //     test: false,
      // });

      // await db.videoData.create({
      //     data: {
      //         episodeId: params.episodeId,
      //         assetId: asset.id,
      //         playbackId: asset.playback_ids?.[0]?.id,
      //     },
      // });
    }

    return NextResponse.json(updatedEpisode);
  } catch (error) {
    console.log('[FLIX_EPISODE_ID]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
