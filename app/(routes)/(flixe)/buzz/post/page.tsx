import { Users2 } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { db } from '@/lib/db';
import SideAd from '../_components/sideAd';
import Twitter from '../../twitter/page';
import minifyText from '@/lib/minify';

export default async function Home() {
  const users = await db.user.findMany();
  const userProfiles = users.map((user) => ({
    name: user.name,
    email: user.email,
    image: user.image,
  }));

  return (
    <div className='grid grid-cols-1 md:grid-cols-9 gap-4 h-screen w-screen fixed top-25 left-1 m-auto'>
      <div className='col-span-1 md:col-span-2 w-[23rem] sticky top-0 mx-auto mt-5'>
        <SideAd />
      </div>

      <Twitter />

      <div className='col-span-1 md:col-span-2 w-[23rem] sticky top-0 mt-5 right-1 mx-auto'>
        {/* user info */}
        <div className='overflow-hidden h-fit rounded-lg border mb-10'>
          <div className='bg-lime-200 dark:text-card px-6 py-4'>
            <p className='font-semibold py-3 flex items-center gap-1.5'>
              <Users2 className='h-4 w-4' />
              People
            </p>
          </div>
          <dl className='-my-3 divide-y divide-border px-6 py-4 text-sm leading-6'>
            <div className='flex justify-between gap-x-4 py-3'>
              <p className='text-primary/80'>
                Check Out These Amazing Individuals
              </p>
            </div>
          </dl>
          <dl className='-my-3 divide-y divide-border px-6 pb-4 text-sm leading-6'>
            <div className='flex flex-col gap-4 py-3'>
              {userProfiles.map((userProfile, index) => (
                <Link href={`/profile/${userProfile.email}`} key={index} className='flex items-center gap-4'>
                  <img
                    src={userProfile.image || 'https://picsum.photos/seed/picsum/200/300'}
                    alt={userProfile.name}
                    className='w-12 h-12 rounded-full object-cover'
                  />
                  <div>
                    <h1 className='text-xl text-primary/80 hover:text-lime-200'>{userProfile.name}</h1>
                    <p className='text-sm text-primary/60'>{minifyText(userProfile.email)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}