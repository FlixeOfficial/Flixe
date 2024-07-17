import { redirect } from 'next/navigation'

import { UserNameForm } from '@/components/UserNameForm'

import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export const metadata = {
  title: 'Settings',
  description: 'Manage account and website settings.',
}

interface Session {
  user?: {
    email: string;
  };
}

export default async function Profile() {
  const session: Session | null = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(authOptions?.pages?.signIn || '/login')
  }

  return (
    <div className='max-w-4xl mx-auto py-12'>
      <div className='grid items-start gap-8'>
        <h1 className='font-bold text-3xl md:text-4xl'>Settings</h1>

        <div className='grid gap-10'>
          <UserNameForm
            user={{
              id: session?.user?.email,
              username: session?.user?.email,
            }}
          />
        </div>
      </div>
    </div>
  )
}
