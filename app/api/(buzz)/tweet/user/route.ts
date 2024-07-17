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
    const email = url.searchParams.get('email');
    if (!email) {
      return NextResponse.json({ msg: 'Email is required' }, { status: 400 });
    }

    const posts = await prisma.tweet.findMany({
      where: {
        userEmail: email,
      },
    });

    const userData = await Promise.all(
      posts.map((post) =>
        prisma.user.findUnique({
          where: { email: post.userEmail },
        })
      )
    );

    return NextResponse.json({ posts, userData }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ msg: 'error' }, { status: 500 });
  }
}
