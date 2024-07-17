'use client'

import { ChevronLeft } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { buttonVariants } from './ui/button'
import Link from 'next/link'

const ToFeedButton = () => {
  const pathname = usePathname()

  // if path is /f/mycom, turn into /
  // if path is /f/mycom/post/cligad6jf0003uhest4qqkeco, turn into /f/mycom

  const subredditPath = getSubredditPath(pathname)

  return (
    <Link href={subredditPath} className={buttonVariants({ variant: 'ghost' })}>
      <ChevronLeft className='h-4 w-4 mr-1' />
      {subredditPath === '/buzz' ? 'Back home' : 'Back to community'}
    </Link>
  )
}

const getSubredditPath = (pathname: string) => {
  const splitPath = pathname.split('/')

  if (splitPath.length === 4) return '/buzz'
  else if (splitPath.length > 4) return `/buzz/${splitPath[2]}/${splitPath[3]}`
  // default path, in case pathname does not match expected format
  else return '/'
}

export default ToFeedButton
