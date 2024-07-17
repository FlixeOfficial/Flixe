import { User } from '@prisma/client'
import { AvatarProps } from '@radix-ui/react-avatar'

import { Icons } from '@/components/Icons'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Image from 'next/image'

// interface UserAvatarProps extends AvatarProps {
//   user: Pick<User, 'image' | 'name'>
// }

interface UserAvatarProps extends AvatarProps {
  user: {
    name: string | null;
    image: string | null;
  };
}


export function UserAvatar({ user, ...props }: UserAvatarProps) {
  const userName = user.name || '';
  return (
    <Avatar {...props}>
      {user.image ? (
        <div className='relative aspect-square h-full w-full'>
          <Image
            fill
            src={user.image}
            alt='profile picture'
            referrerPolicy='no-referrer'
          />
        </div>
      ) : (
        <AvatarFallback>
          <span className='sr-only'>{userName}</span>
          <Icons.user className='h-4 w-4' />
        </AvatarFallback>
      )}
    </Avatar>
  )
}
