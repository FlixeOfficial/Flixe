import MiniCreatePost from "@/components/MiniCreatePost";
import PostFeed from "@/components/PostFeed";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    slug: string;
  };
}

interface Session {
  user?: {
    email: string;
  };
  expires: string;
}

const page = async ({ params }: PageProps) => {
  const { slug } = params;

  const session: Session | null = await getServerSession(authOptions);

  const subreddit = await db.subreddit.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subreddit: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
      },
    },
  });

  if (!subreddit) return notFound();

  const subscription = !session?.user
    ? undefined
    : await db.subscription.findFirst({
        where: {
          subreddit: {
            name: slug,
          },
          user: {
            id: session?.user?.email,
          },
        },
      });

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl h-14">
        f/{subreddit.name}
      </h1>
      {session && (
        <MiniCreatePost session={session} isSubscribed={!!subscription} />
      )}
      <PostFeed initialPosts={subreddit.posts} subredditName={subreddit.name} />
    </>
  );
};

export default page;
