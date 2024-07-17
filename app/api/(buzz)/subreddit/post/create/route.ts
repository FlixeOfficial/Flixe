import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { db } from '@/lib/db'
import { PostValidator } from '@/lib/validators/post'
import { z } from 'zod'

interface Session {
  user?: {
    email: string;
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { title, content, subredditId } = PostValidator.parse(body)

  const session: Session | null = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // verify user is subscribed to passed subreddit id
    const subscription = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session?.user?.email,
      },
    })

    if (!subscription) {
      return new Response('Subscribe to post', { status: 403 })
    }

    await db.post.create({
      data: {
        title,
        content,
        authorId: session?.user?.email,
        subredditId,
      },
    })

    return new Response('OK')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 })
    }

    return new Response(
      'Could not post to subreddit at this time. Please try later',
      { status: 500 }
    )
  }
}
