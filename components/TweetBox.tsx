import { Repeat2, BookmarkIcon, MessageCircle, HeartIcon } from 'lucide-react';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from 'lucide-react';
import { Tweet, User } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";

export default function TweetBox({ key, userData, post, userEmail }: {
    key: string,
    userData: User,
    post: Tweet,
    userEmail: string
}) {
    const [likedEmails, setLikedEmails] = useState<Array<string>>(post.likedUserEmails)
    const [bookmarkedEmails, setBookmarkedEmails] = useState<Array<string>>(post.bookmarkedUserEmails)

    function isLiked() {
        return likedEmails.includes(userEmail)
    }

    function isBookmarked() {
        return bookmarkedEmails.includes(userEmail)
    }

    async function like() {
        let newLikedUserEmails = []
        if (post.likedUserEmails.includes(userEmail)) {
            newLikedUserEmails = post.likedUserEmails.filter(email => email != userEmail)
        } else {
            newLikedUserEmails = [...post.likedUserEmails, userEmail]
        }
        setLikedEmails(newLikedUserEmails)
        const response = await fetch("/api/like", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: post.id,
                likedUserEmails: newLikedUserEmails
            })
        })
        if (response.status == 200) {
            const data = await response.json()
            setLikedEmails(data.post.likedUserEmails)
        }
    }

    async function bookmark() {
        let newBookmarkedUserEmails = []
        if (post.bookmarkedUserEmails.includes(userEmail)) {
            newBookmarkedUserEmails = post.bookmarkedUserEmails.filter(email => email != userEmail)
        } else {
            newBookmarkedUserEmails = [...post.bookmarkedUserEmails, userEmail]
        }
        setBookmarkedEmails(newBookmarkedUserEmails)
        const response = await fetch("/api/bookmark", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: post.id,
                bookmarkedUserEmails: newBookmarkedUserEmails
            })
        })
        if (response.status == 200) {
            const data = await response.json()
            setBookmarkedEmails(data.post.bookmarkedUserEmails)
        }
    }

    return (
        <div className="p-4 border-b border flex bg-card rounded-lg mt-3" key={key}>  {/* onClick={onClick} */}
            <div className="w-16 shrink-0 grow-0 mr-2 flex flex-col items-center">
                <Image
                    className="rounded-full h-12 w-12"
                    src={userData?.image as string || 'https://picsum.photos/seed/picsum/200/300'}
                    height={1000}
                    width={1000}
                    alt="profile pic"
                />
            </div>
            <div className="flex-grow">
                <p className="font-bold">{userData?.name} <span className="font-normal text-neutral-400 ml-2">@{userData?.username}</span></p>
                <div className="mb-2" dangerouslySetInnerHTML={{ __html: post?.body }}></div>
                {post?.mediaUrl && (
                    <div className="mt-4">
                        {post.mediaType === 'image' && (
                            <Image
                                className="w-full rounded-xl"
                                src={post.mediaUrl as string}
                                width={1000}
                                height={1000}
                                alt="tweet media"
                            />
                        )}
                        {post.mediaType === 'video' && (
                            <video controls className="w-full rounded-xl">
                                <source src={post.mediaUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                        {post.mediaType === 'audio' && (
                            <audio controls className="w-full rounded-xl">
                                <source src={post.mediaUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                        )}
                    </div>
                )}
                <div className="flex gap-12 pt-4">
                    <button onClick={(e) => { e.stopPropagation(); like() }} className="flex items-center gap-2 hover:text-blue-500">
                        {isLiked() ? <HeartIconSolid className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}{likedEmails.length}
                    </button>
                    {/* <button onClick={(e) => { e.stopPropagation(); bookmark() }} className="flex items-center gap-2 hover:text-blue-500">{isBookmarked() ? <BookmarkIconSolid className="h-5 w-5" /> : <BookmarkIcon className="h-5 w-5" />}{bookmarkedEmails.length}</button> */}
                </div>
            </div>
        </div>
    )
}