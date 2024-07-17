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

    const unpublishedEpisode = await db.episode.update({
      where: {
        id: params.episodeId,
        flixId: params.flixId,
      },
      data: {
        isPublished: false,
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

    return NextResponse.json(unpublishedEpisode);
  } catch (error) {
    console.log('[EPISODE_UNPUBLISH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
