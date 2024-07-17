import CustomFeed from '@/components/homepage/CustomFeed';
import GeneralFeed from '@/components/homepage/GeneralFeed';
import { Button, buttonVariants } from '@/components/ui/button';
import authOptions from '@/app/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { Sparkles, Home as HomeIcon } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { db } from '@/lib/db';
import SideAd from './_components/sideAd';

interface Session {
  user?: {
    email: string,
  };
}

export default async function Home() {
  const session: Session | null = await getServerSession(authOptions);

  const subreddits = await db.subreddit.findMany();
  const subredditNames = subreddits.map((subreddit) => subreddit.name);

  return (
    <div className='grid grid-cols-1 md:grid-cols-9 gap-4 h-screen w-screen fixed top-25 left-1 m-auto'>
      <div className='col-span-1 md:col-span-2 w-[23rem] sticky top-0 mx-auto'>
        <SideAd />
      </div>

      <div
        className="col-span-1 md:col-span-5 w-full overflow-y-scroll"
        style={{
          scrollbarWidth: "none", /* Firefox */
          msOverflowStyle: "none",  /* IE and Edge */
          WebkitOverflowScrolling: "touch" /* Mobile smooth scrolling */
        }}
      >
        {/* <div className="sticky top-0 bg-background/70 backdrop-blur-lg z-10 mt-5"> */}
        <div className="sticky top-0 bg-background z-10">
          <div className="sticky top-0 bg-background z-10 flex justify-between items-center">
            <h1 className="font-semibold text-3xl md:text-4xl flex items-center mb-6 mt-2">
              <Sparkles className="h-8 w-8 ml-2 mr-2" strokeWidth={2} />
              Your Feed
            </h1>
            <Link href="/buzz/post" passHref>
              <Button>
                Switch to Posts
              </Button>
            </Link>
          </div>
        </div>
        {!session?.user?.email ? <CustomFeed /> : <GeneralFeed />}
      </div>

      <div className='col-span-1 md:col-span-2 w-[23rem] sticky top-0 mt-5 right-1  mx-auto'>
        {/* subreddit info */}
        <div className='overflow-hidden h-fit rounded-lg border mb-10'>
          <div className='bg-lime-200 dark:text-card px-6 py-4'>
            <p className='font-semibold py-3 flex items-center gap-1.5'>
              <HomeIcon className='h-4 w-4' />
              Home
            </p>
          </div>
          <dl className='-my-3 divide-y divide-border px-6 py-4 text-sm leading-6'>
            <div className='flex justify-between gap-x-4 py-3'>
              <p className='text-primary/80'>
                Your personal Buzz frontpage. Come here to check in with your
                favorite communities.
              </p>
            </div>

            <Link
              className={buttonVariants({
                className: 'w-full mt-4 mb-6',
              })}
              href={`/buzz/f/create`}
            >
              Create Community
            </Link>
          </dl>
        </div>

        {/* All Communities */}
        {subredditNames.length > 0 && (
          <div className='overflow-hidden h-fit rounded-lg border'>
            <div className='bg-card/50 text-primary px-6 py-2'>
              <p className='font-semibold py-3 flex items-center gap-1.5'>
                All Communities
              </p>
            </div>
            <dl className='-my-3 divide-y divide-border px-6 py-4 text-sm leading-6'>
              <div className='flex justify-between flex-col gap-4 py-3'>
                {subredditNames.map((subredditName, index) => (
                  <Link href={`/buzz/f/${subredditName}`} key={index}>
                    <h1 className='text-xl text-primary/80 hover:text-lime-200'>
                      f/{subredditName}
                    </h1>
                  </Link>
                ))}
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
