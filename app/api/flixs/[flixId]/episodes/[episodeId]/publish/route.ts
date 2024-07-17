import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

import authOptions from '@/app/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';

interface Session {
  user?: {
    email: string;
  };
}

export async function PATCH(
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

    // const videoData = await db.videoData.findUnique({
    //     where: {
    //         episodeId: params.episodeId,
    //     },
    // });

    if (
      !episode ||
      // !videoData ||
      !episode.title ||
      !episode.description ||
      !episode.videoUrl
    ) {
      return new NextResponse('Missing required fields 1', { status: 400 });
    }

    const publishedEpisode = await db.episode.update({
      where: {
        id: params.episodeId,
        flixId: params.flixId,
      },
      data: {
        isPublished: true,
      },
    });

    return NextResponse.json(publishedEpisode);
  } catch (error) {
    console.log('[EPISODE_PUBLISH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
