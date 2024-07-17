import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
// import { isTeacher } from "@/lib/teacher";

import authOptions from '@/app/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';

interface Session {
  user?: {
    email: string;
  };
}

export async function POST(req: Request) {
  try {
    const session: Session | null = await getServerSession(authOptions);
    const { title } = await req.json();

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const flix = await db.flix.create({
      data: {
        userId: session.user.email.toLowerCase(),
        title,
      },
    });

    return NextResponse.json(flix);
  } catch (error) {
    console.log('[FLIXS]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
