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
    const { body, userEmail, mediaUrl, mediaType, parentId } = data;

    const post = await prisma.tweet.create({
      data: {
        body,
        userEmail,
        mediaUrl,
        mediaType,
      },
    });

    if (parentId) {
      // This is a reply
      const parent = await prisma.tweet.findUnique({
        where: {
          id: parentId,
        },
      });
      if (parent && !parent.commentIds.includes(post.id)) {
        await prisma.tweet.update({
          where: {
            id: parent.id,
          },
          data: {
            commentIds: [...parent.commentIds, post.id],
          },
        });
      }
    }

    return NextResponse.json({ msg: 'done', post }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ msg: 'error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { msg: 'You must be logged in.' },
      { status: 401 }
    );
  }

  try {
    const posts = await prisma.tweet.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    let userData = [];
    for (const post of posts) {
      const user = await prisma.user.findUnique({
        where: {
          email: post.userEmail,
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
