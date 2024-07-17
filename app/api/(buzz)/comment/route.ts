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
      return NextResponse.json({ msg: 'incorrect request' }, { status: 400 });
    }

    const posts = await prisma.tweet.findMany({
      where: {
        parentId: tid,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let userData = [];
    for (let i = 0; i < posts.length; i++) {
      const user = await prisma.user.findUnique({
        where: {
          email: posts[i].userEmail,
        },
      });
      userData.push(user);
    }

    return NextResponse.json({ posts, userData }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ msg: 'error' }, { status: 500 });
  }
}
