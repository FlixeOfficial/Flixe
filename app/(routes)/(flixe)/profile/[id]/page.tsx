"use client";

import TweetBox from "@/components/TweetBox"
import { Tweet, User } from "@prisma/client"
import { ArrowLeftIcon } from 'lucide-react'
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function Profile() {
    const router = useRouter()
    const pathname = usePathname()
    const { data: session, status } = useSession({ required: true })
    const [userTweets, setUserTweets] = useState<Array<Tweet>>([])
    const [userTweetsUserData, setUserTweetsUserData] = useState<Array<User>>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [base64, setBase64] = useState<string>("")
    const [name, setName] = useState<string>("")
    const [username, setUsername] = useState<string>("")

    const email = pathname.split('/profile/')[1]

    useEffect(() => {
        if (!email) {
            router.push(`/profile/${session?.user?.email}`)
        } else if (email === session?.user?.email) {
            router.push(`/studio/profile`)
        }
    }, [email, session, router])

    async function getUserTweets() {
        const params = new URLSearchParams({
            email
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
            email
        })
        const response = await fetch("/api/user?" + params)
        if (response.status == 200) {
            const data = await response.json()
            setBase64(data?.use?.image || 'https://picsum.photos/seed/picsum/200/300')
            setName(data.user.name)
            setUsername(data.user.username)
        }
    }

    useEffect(() => {
        async function fetchData() {
            if (session && status == "authenticated") {
                setLoading(true)
                await getUserDetails()
                await getUserTweets()
            }
        }
        fetchData()
    }, [status, session, email])

    if (status == "loading") return <div>loading...</div>

    if (loading) return <div className="h-screen overflow-y-scroll flex-grow bg-background text-white">
        <header className='sticky top-0 flex w-full z-10'>
            <div className="backdrop-blur-sm w-full lg:w-3/5 h-16 flex gap-4 items-center border-b  px-4">
                <button onClick={() => router.back()} className="rounded-full p-1 hover:bg-white hover:bg-opacity-10"><ArrowLeftIcon className="h-5 w-5" /></button>
                <h1 className='text-lg font-bold'>Profile</h1>
            </div>
        </header>
        <div className="w-full flex relative -top-16">
            <div className="w-full lg:w-3/5 grow-0 shrink-0 p-8 min-h-screen flex items-center justify-center">Loading...</div>
        </div>
    </div>

    return <div className="sticky top-0 bg-background z-10 overflow-y-scroll flex-grow m-auto w-full text-white">
        <header className='fixed top-10 w-full z-10'>
            <div className="w-full lg:w-3/5 h-16 flex gap-4 items-center  px-4">
                <button onClick={() => router.back()} className="rounded-full p-1 hover:bg-white hover:bg-opacity-10"><ArrowLeftIcon className="h-5 w-5" /></button>
                <h1 className='text-lg font-bold'>Profile</h1>
            </div>
            <div className='hidden lg:inline-flex lg:flex-grow self-stretch border-l '></div>
        </header>
        <div className='flex flex-col pt-16 min-h-screen max-w-6xl m-auto w-full'>
            {/* profile details */}
            <div className="border-b p-4">
                <div className="relative mb-8 flex justify-between items-start">
                    <Image
                        src={base64 || 'https://picsum.photos/seed/picsum/200/300'}
                        alt="profile picture"
                        width={1000}
                        height={1000}
                        className="w-28 h-28 rounded-full"
                    />
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
                    userEmail={email}
                />
            ))}
        </div>
    </div>
}