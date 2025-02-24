"use client";

import TweetBox from "@/components/TweetBox";
import TweetForm from "@/components/TweetForm";
import { Tweet, User } from "@prisma/client";
import { ArrowLeftIcon } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TweetDetails() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tid = searchParams.get('tid');
    const { data: session, status } = useSession({ required: true });
    const [post, setPost] = useState<Tweet>();
    const [userData, setUserData] = useState<User>();
    const [image, setImage] = useState<string>("/blank_pp.webp");
    const [mediaUrl, setMediaUrl] = useState<string>(""); // media URL that gets uploaded in new tweet
    const [mediaType, setMediaType] = useState<string>(""); // type of the media (image, video, audio)
    const [txt, setTxt] = useState<string>(""); // body of the new tweet
    const [key, setKey] = useState<number>(0); // key of the tweet form component
    const [replies, setReplies] = useState<Array<Tweet>>([]);
    const [replyUserData, setReplyUserData] = useState<Array<User>>([]);
    const [loading, setLoading] = useState<boolean>(true);

    async function reply() {
        const response = await fetch("/api/post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                body: txt,
                userEmail: session?.user?.email,
                mediaUrl: mediaUrl,
                mediaType: mediaType,
                parentId: tid
            })
        });
        if (response.status == 200) {
            // fetch the tweets
            await getReplies();
            await getTweetDetails();
            setMediaUrl("");
            setMediaType("");
            setKey(key + 1);
        }
    }

    async function getReplies() {
        const params = new URLSearchParams({
            tid: tid as string
        });
        const response = await fetch("/api/comment?" + params);
        if (response.status == 200) {
            const data = await response.json();
            setReplies(data.posts);
            setReplyUserData(data.userData);
        }
        setLoading(false);
    }

    async function getCurrentUser() {
        const params = new URLSearchParams({
            email: session?.user?.email as string
        });
        const response = await fetch("/api/user?" + params);
        if (response.status == 200) {
            const data = await response.json();
            if (data.msg == "user found") {
                setImage(data.user.image);
            }
        }
    }

    // tid -> get data from database using an api 
    async function getTweetDetails() {
        const response = await fetch(`/api/tweet/${tid}`);
        if (response.status == 200) {
            const data = await response.json();
            if (data.msg == "done") {
                setPost(data.post);
                setUserData(data.user);
            }
        }
    }

    useEffect(() => {
        // fetch the tweet details and replies
        async function f() {
            if (session && status == "authenticated" && tid) {
                setLoading(true);
                await getTweetDetails();
                await getCurrentUser();
                await getReplies();
            }
        }
        f();
    }, [status, session, tid]);

    if (status == "loading") return <div>loading...</div>;

    return (
        <div className="h-screen overflow-y-scroll flex-grow bg-black text-white">
            <header className='sticky top-0 flex w-full z-10'>
                <div className="backdrop-blur-sm w-full lg:w-3/5 h-16 flex gap-4 items-center border-b border-neutral-600 px-4">
                    <button onClick={() => router.back()} className="rounded-full p-1 hover:bg-white hover:bg-opacity-10"><ArrowLeftIcon className="h-5 w-5" /></button>
                    <h1 className='text-lg font-bold'>Tweet</h1>
                </div>
                <div className='hidden lg:inline-flex lg:flex-grow self-stretch border-l border-neutral-600'></div>
            </header>
            <div className='relative -top-16 w-full flex'>
                <div className='w-full lg:w-3/5 grow-0 shrink-0'>
                    <div className='flex flex-col pt-16 min-h-screen'>
                        {/* tweet */}
                        {/* {post && userData ? <TweetBox
                            post={post}
                            userData={userData}
                            // onClick={() => { }}
                            userEmail={session.user?.email as string}
                        /> : null} */}
                        {/* tweet form for replies */}
                        {/* <TweetForm
                            onSubmit={reply}
                            key={key}
                            txt={txt}
                            setTxt={setTxt}
                            mediaUrl={mediaUrl}
                            setMediaUrl={setMediaUrl}
                            mediaType={mediaType}
                            setMediaType={setMediaType}
                            image={image}
                            label="Reply"
                        /> */}
                        {/* replies */}
                        {/* {replies.map((post: Tweet, index: number) => (
                            <TweetBox
                                key={post.id}
                                post={post}
                                userData={replyUserData[index]}
                                onClick={() => { }}
                                userEmail={session.user?.email as string}
                            />
                        ))} */}
                    </div>
                </div>
                <div className='border-l border-neutral-600 flex-grow self-stretch relative top-16'></div>
            </div>
        </div>
    );
}