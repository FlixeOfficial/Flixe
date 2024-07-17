import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

import authOptions from '@/app/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';

interface Session {
  user?: {
    email: string;
  };
}

export async function PUT(
  req: Request,
  { params }: { params: { flixId: string } }
) {
  try {
    const session: Session | null = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { list } = await req.json();

    const ownFlix = await db.flix.findUnique({
      where: {
        id: params.flixId,
        userId: session.user.email.toLowerCase(),
      },
    });

    if (!ownFlix) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    for (let item of list) {
      await db.episode.update({
        where: { id: item.id },
        data: { position: item.position },
      });
    }

    return new NextResponse('Success', { status: 200 });
  } catch (error) {
    console.log('[REORDER]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
