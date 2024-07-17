import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { db } from '@/lib/db'
import PostFeed from '../PostFeed'
import { notFound } from 'next/navigation'

interface Session {
  user?: {
    email: string;
  };
}

const CustomFeed = async () => {
  const session: Session | null = await getServerSession(authOptions);

  // only rendered if session exists, so this will not happen
  if (!session) return notFound()

  const followedCommunities = await db.subscription.findMany({
    where: {
      userId: session?.user?.email,
    },
    include: {
      subreddit: true,
    },
  })

  const posts = await db.post.findMany({
    where: {
      subreddit: {
        name: {
          in: followedCommunities.map((sub) => sub.subreddit.name),
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    take: INFINITE_SCROLL_PAGINATION_RESULTS,
  })

  return <PostFeed initialPosts={posts} />
}

export default CustomFeed
