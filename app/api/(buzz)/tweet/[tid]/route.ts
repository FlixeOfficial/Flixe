import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/app/api/auth/[...nextauth]';
import prisma from '@/lib/prisma/prismadb';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { msg: 'You must be logged in.' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(req.url);
    const tid = url.searchParams.get('tid');
    if (!tid) {
      return NextResponse.json(
        { msg: 'Tweet ID is required' },
        { status: 400 }
      );
    }

    const post = await prisma.tweet.findUnique({
      where: {
        id: tid,
      },
    });

    if (post) {
      const user = await prisma.user.findUnique({
        where: {
          email: post.userEmail,
        },
      });

      if (user) {
        return NextResponse.json({ msg: 'done', post, user }, { status: 200 });
      } else {
        return NextResponse.json(
          { msg: 'post found. user not found' },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json({ msg: 'post not found' }, { status: 404 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ msg: 'error' }, { status: 500 });
  }
}
