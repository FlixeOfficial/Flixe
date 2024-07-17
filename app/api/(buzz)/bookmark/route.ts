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
      return NextResponse.json({ msg: 'no email' }, { status: 400 });
    }

    const posts = await prisma.tweet.findMany({
      where: {
        bookmarkedUserEmails: {
          has: email,
        },
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
        bookmarkedUserEmails: data.bookmarkedUserEmails,
      },
    });

    return NextResponse.json({ msg: 'done', post }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ msg: 'error' }, { status: 500 });
  }
}
