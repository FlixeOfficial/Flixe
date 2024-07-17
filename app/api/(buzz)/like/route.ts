import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/app/api/auth/[...nextauth]';
import prisma from '@/lib/prisma/prismadb';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { msg: 'You must be logged in.' },
      { status: 401 }
    );
  }

  try {
    const data = await req.json();
    const post = await prisma.tweet.update({
      where: {
        id: data.id,
      },
      data: {
        likedUserEmails: data.likedUserEmails,
      },
    });

    return NextResponse.json({ msg: 'done', post }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ msg: 'error' }, { status: 500 });
  }
}
