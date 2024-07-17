import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { db } from '@/lib/db'
import { CommentVoteValidator } from '@/lib/validators/vote'
import { z } from 'zod'

interface Session {
  user?: {
    email: string;
  };
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()

    const { commentId, voteType } = CommentVoteValidator.parse(body)

  const session: Session | null = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // check if user has already voted on this post
    const existingVote = await db.commentVote.findFirst({
      where: {
        userId: session?.user?.email,
        commentId,
      },
    })

    if (existingVote) {
      // if vote type is the same as existing vote, delete the vote
      if (existingVote.type === voteType) {
        await db.commentVote.delete({
          where: {
            userId_commentId: {
              commentId,
              userId: session?.user?.email,
            },
          },
        })
        return new Response('OK')
      } else {
        // if vote type is different, update the vote
        await db.commentVote.update({
          where: {
            userId_commentId: {
              commentId,
              userId: session?.user?.email,
            },
          },
          data: {
            type: voteType,
          },
        })
        return new Response('OK')
      }
    }

    // if no existing vote, create a new vote
    await db.commentVote.create({
      data: {
        type: voteType,
        userId: session?.user?.email,
        commentId,
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
