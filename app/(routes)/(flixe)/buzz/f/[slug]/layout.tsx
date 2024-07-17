import SubscribeLeaveToggle from "@/components/SubscribeLeaveToggle";
import ToFeedButton from "@/components/ToFeedButton";
import { buttonVariants } from "@/components/ui/button";
import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

interface Session {
  user?: {
    email: string;
  };
}

const Layout = async ({
  children,
  params: { slug },
}: {
  children: ReactNode;
  params: { slug: string };
}) => {
  const session: Session | null = await getServerSession(authOptions);

  const subreddit = await db.subreddit.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

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

  const isSubscribed = !!subscription;

  if (!subreddit) return notFound();

  const memberCount = await db.subscription.count({
    where: {
      subreddit: {
        name: slug,
      },
    },
  });

  return (
    <div className="sm:container max-w-7xl mx-auto h-full pt-12">
      <div>
        <ToFeedButton />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
          <ul className="flex flex-col col-span-2 space-y-6">{children}</ul>

          {/* info sidebar */}
          <div className="overflow-hidden h-fit rounded-lg border order-first md:order-last">
            <div className="px-6 py-4">
              <p className="font-semibold py-3">About f/{subreddit.name}</p>
            </div>
            <dl className="divide-y divide-border px-6 py-4 text-sm leading-6 bg-card">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-primary">Created</dt>
                <dd className="text-primary/80">
                  <time dateTime={subreddit.createdAt.toDateString()}>
                    {format(subreddit.createdAt, "MMMM d, yyyy")}
                  </time>
                </dd>
              </div>
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-primary-80">Members</dt>
                <dd className="flex items-start gap-x-2">
                  <div className="text-primary">{memberCount}</div>
                </dd>
              </div>
              {subreddit.creatorId === session?.user?.email ? (
                <div className="flex justify-between gap-x-4 py-3">
                  <dt className="text-primary-80">
                    You created this community
                  </dt>
                </div>
              ) : null}

              {subreddit.creatorId !== session?.user?.email ? (
                <SubscribeLeaveToggle
                  isSubscribed={isSubscribed}
                  subredditId={subreddit.id}
                  subredditName={subreddit.name}
                />
              ) : null}
              <Link
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full mb-6 bg-muted/50",
                })}
                href={`/buzz/f/${slug}/submit`}
              >
                Create Post
              </Link>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
