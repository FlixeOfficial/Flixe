"use client";

import TweetBox from "@/components/TweetBox"
import { Tweet, User } from "@prisma/client"
import { CameraIcon } from 'lucide-react'
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { uploadFiles } from '@/lib/uploadthing'

export default function Profile() {
  const router = useRouter()
  const { data: session, status } = useSession({ required: true })
  const [userTweets, setUserTweets] = useState<Array<Tweet>>([])
  const [userTweetsUserData, setUserTweetsUserData] = useState<Array<User>>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const [updating, setUpdating] = useState<boolean>(false)
  const [imageChanged, setImageChanged] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [base64Preview, setBase64Preview] = useState<string>("")

  async function updateProfile() {
    setUpdating(true)
    let newImageUrl = imageUrl;

    if (selectedFile) {
      const [res] = await uploadFiles({
        files: [selectedFile],
        endpoint: 'imageUploader',
      });
      newImageUrl = res.url;
    }

    const response = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: session?.user?.email as string,
        image: newImageUrl,
      })
    })
    await getUserTweets()
    setUpdating(false)
    setImageChanged(false)
    setSelectedFile(null)
  }

  async function getUserTweets() {
    const params = new URLSearchParams({
      email: session?.user?.email as string
    })
    const response = await fetch("/api/tweet/user?" + params)
    if (response.status == 200) {
      const data = await response.json()
      setUserTweets(data.posts)
      setUserTweetsUserData(data.userData)
    }
    setLoading(false)
  }

  async function getUserDetails() {
    const params = new URLSearchParams({
      email: session?.user?.email as string
    })
    const response = await fetch("/api/user?" + params)
    if (response.status == 200) {
      const data = await response.json()
      setImageUrl(data?.user?.image || 'https://picsum.photos/seed/picsum/200/300')
      setBase64Preview(data?.user?.image || 'https://picsum.photos/seed/picsum/200/300')
      setName(data.user.name)
      setUsername(data.user.username)
    }
  }

  function handleDrop(files: File[]) {
    const file = files[0]
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (event: any) => {
      setBase64Preview(event.target.result) // base64 string preview
      setImageChanged(true)
    }
    reader.readAsDataURL(file)
  }

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    onDrop: handleDrop,
    accept: {
      'image/jpeg': [],
      'image/png': []
    }
  })

  useEffect(() => {
    async function fetchData() {
      if (session && status == "authenticated") {
        setLoading(true)
        await getUserDetails()
        await getUserTweets()
      }
    }
    fetchData()
  }, [status, session])

  if (status == "loading") return <div>loading...</div>

  if (loading) return <div className="h-screen overflow-y-scroll flex-grow bg-background text-white">
    <div className="w-full flex relative -top-16 m-auto">
      <div className="w-full lg:w-3/5 grow-0 shrink-0 p-8 min-h-screen flex items-center justify-center m-auto">Loading...</div>
    </div>
  </div>

  return <div className="sticky top-0 bg-background z-10 overflow-y-scroll flex-grow m-auto w-full text-white">
    <div className='flex flex-col pt-16 min-h-screen max-w-6xl m-auto w-full'>
      {/* profile details */}
      <div className="border-b p-4">
        <div className="relative mb-8 flex justify-between items-start">
          <div {...getRootProps({ className: "absolute top-9 left-9 hover:bg-neutral-900 hover:bg-opacity-30 rounded-full p-2 cursor-pointer w-fit" })}>
            <input {...getInputProps()} />
            <CameraIcon className="h-6 w-6 text-white" />
          </div>
          <Image
            src={base64Preview || 'https://picsum.photos/seed/picsum/200/300'}
            alt="profile picture"
            width={1000}
            height={1000}
            className="w-28 h-28 rounded-full"
          />
          {imageChanged && (
            <button onClick={updateProfile} className="w-24 h-10 flex items-center justify-center bg-blue-500 rounded-full">
              {updating ? <div className='border-2 w-5 h-5 border-white border-t-transparent animate-spin rounded-full'></div> : "Save"}
            </button>
          )}
        </div>
        <div>
          <p className="text-xl font-bold mb-1">{name}</p>
          <p className="text-neutral-400">@{username}</p>
        </div>
      </div>
      {/* user tweets */}
      {userTweets.length == 0 && <div className="p-4 mt-40 text-center">No post found</div>}
      {userTweets.map((post: Tweet, index: number) => (
        <TweetBox
          key={post.id}
          post={post}
          userData={userTweetsUserData[index]}
          userEmail={session?.user?.email as string}
        />
      ))}
    </div>
  </div>
}