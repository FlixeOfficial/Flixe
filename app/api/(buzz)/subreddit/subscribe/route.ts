import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { db } from '@/lib/db'
import { SubredditSubscriptionValidator } from '@/lib/validators/subreddit'
import { z } from 'zod'

interface Session {
  user?: {
    email: string;
  };
}


export async function POST(req: Request) {
  try {
  const session: Session | null = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { subredditId } = SubredditSubscriptionValidator.parse(body)

    // check if user has already subscribed to subreddit
    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session?.user?.email,
      },
    })

    if (subscriptionExists) {
      return new Response("You've already subscribed to this subreddit", {
        status: 400,
      })
    }

    // create subreddit and associate it with the user
    await db.subscription.create({
      data: {
        subredditId,
        userId: session?.user?.email,
      },
    })

    return new Response(subredditId)
  } catch (error) {
    (error)
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 })
    }

    return new Response(
      'Could not subscribe to subreddit at this time. Please try later',
      { status: 500 }
    )
  }
}
