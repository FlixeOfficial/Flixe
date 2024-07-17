'use client';

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import TweetForm from '@/components/TweetForm'
import { Tweet, User } from '@prisma/client'
import TweetBox from '@/components/TweetBox'
import { useRouter } from "next/navigation";
import { Sparkles } from 'lucide-react'
import { uploadFiles } from '@/lib/uploadthing'
import { Button } from '@/components/ui/button';

export default function Twitter() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true
  })
  const [username, setUsername] = useState<string>("")
  const [image, setImage] = useState<string>("/blank_pp.webp")
  const [mediaFile, setMediaFile] = useState<File | null>(null) // File to be uploaded
  const [mediaType, setMediaType] = useState<string>("") // Type of the uploaded media
  const [txt, setTxt] = useState<string>("") // body of the new tweet
  const [key, setKey] = useState<number>(0) // key of the tweet form component
  const [tweets, setTweets] = useState<Array<Tweet>>([])
  const [tweetUserData, setTweetUserData] = useState<Array<User>>([])
  const [loading, setLoading] = useState<boolean>(true)

  async function tweet() {
    let mediaUrl = "";
    if (mediaFile) {
      const [res] = await uploadFiles({
        files: [mediaFile],
        endpoint: 'artFlixe',
      });
      mediaUrl = res.url;
    }

    const response = await fetch("/api/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        body: txt,
        userEmail: session?.user?.email,
        mediaUrl: mediaUrl, // Store the media URL in the database
        mediaType: mediaType // Store the media type in the database
      })
    })
    if (response.status == 200) {
      // fetch the tweets
      await getTweets()
      setMediaFile(null) // reset the media file
      setMediaType("") // reset the media type
      setKey(key + 1) // reset the contenteditable div
    }
  }

  async function getTweets() {
    const response = await fetch("/api/post")
    if (response.status == 200) {
      const data = await response.json()
      setTweets(data.posts)
      setTweetUserData(data.userData)
      setLoading(false)
    }
  }

  function makeid(length: number) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  async function getUser(email: string) {
    const params = new URLSearchParams({
      email: email
    })
    const response = await fetch("/api/user?" + params)
    if (response.status == 200) {
      const data = await response.json()
      return data
    }
  }

  useEffect(() => {
    async function f() {
      if (status != "loading" && session) {
        const data = await getUser(session.user?.email as string)
        if (data.msg != "new user") {
          setUsername(data.user.username)
          setImage(data.user.image)
        }
        await getTweets()
      }
    }
    f()
  }, [status, session])

  if (status == "loading") {
    return <div>Loading...</div>
  }

  return (
    <div
      className="col-span-1 md:col-span-5 w-full overflow-y-scroll"
      style={{
        scrollbarWidth: "none", /* Firefox */
        msOverflowStyle: "none",  /* IE and Edge */
        WebkitOverflowScrolling: "touch" /* Mobile smooth scrolling */
      }}
    >
      <div className="sticky top-0 bg-background z-10">
        <div className="sticky top-0 bg-background z-10 flex justify-between items-center">
          <h1 className="font-semibold text-3xl md:text-4xl flex items-center mb-6 mt-2">
            <Sparkles className="h-8 w-8 ml-2 mr-2" strokeWidth={2} />
            Your Post
          </h1>
          <Button
            onClick={() => router.push("/buzz")}
          >
            Switch to Community
          </Button>
        </div>
        <TweetForm
          key={key}
          onSubmit={tweet}
          txt={txt}
          setTxt={setTxt}
          image={image}
          mediaFile={mediaFile}
          setMediaFile={setMediaFile}
          mediaType={mediaType}
          setMediaType={setMediaType}
          label="Post"
        />
      </div>
      <div className='relative -top-16 w-full flex m-auto'>
        <div className='w-full grow-0 shrink-0'>
          <div className='flex flex-col pt-16 min-h-screen'>
            {loading ? <div className='flex justify-center p-8'>
              loading...
            </div> : tweets.map((post: Tweet, i: number) => (
              <TweetBox
                // onClick={() => router.push(`/twitter/tweet/${post.id}`)}
                key={post.id}
                post={post}
                userData={tweetUserData[i]}
                userEmail={session.user?.email as string}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}