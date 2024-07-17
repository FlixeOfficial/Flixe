import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

import authOptions from '@/app/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';

interface Session {
  user?: {
    email: string;
  };
}

export async function POST(
  req: Request,
  { params }: { params: { flixId: string } }
) {
  try {
    const session: Session | null = await getServerSession(authOptions);
    const { title } = await req.json();

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const flixOwner = await db.flix.findUnique({
      where: {
        id: params.flixId,
        userId: session.user.email.toLowerCase(),
      },
    });

    if (!flixOwner) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const lastEpisode = await db.episode.findFirst({
      where: {
        flixId: params.flixId,
      },
      orderBy: {
        position: 'desc',
      },
    });

    const newPosition = lastEpisode ? lastEpisode.position + 1 : 1;

    const episode = await db.episode.create({
      data: {
        title,
        flixId: params.flixId,
        position: newPosition,
      },
    });

    return NextResponse.json(episode);
  } catch (error) {
    console.log('[EPISODES]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
