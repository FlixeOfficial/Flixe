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
  { params }: { params: { flixId: string } }
) {
  try {
    const session: Session | null = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const flix = await db.flix.findUnique({
      where: {
        id: params.flixId,
        userId: session.user.email.toLowerCase(),
      },
    });

    if (!flix) {
      return new NextResponse('Not found', { status: 404 });
    }

    const unpublishedFlix = await db.flix.update({
      where: {
        id: params.flixId,
        userId: session.user.email.toLowerCase(),
      },
      data: {
        isPublished: false,
      },
    });

    return NextResponse.json(unpublishedFlix);
  } catch (error) {
    console.log('[FLIX_ID_UNPUBLISH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
