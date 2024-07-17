'use client'

import { ImagePlus, Video, Music, XCircle } from 'lucide-react';
import Image from "next/image";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function TweetForm({ onSubmit, txt, setTxt, mediaFile, setMediaFile, mediaType, setMediaType, image, label }: {
    onSubmit: () => void,
    txt: string,
    setTxt: (value: string) => void,
    mediaFile: File | null,
    setMediaFile: (file: File | null) => void,
    mediaType: string,
    setMediaType: (value: string) => void,
    image: string,
    label: string
}) {
    const [sending, setSending] = useState<boolean>(false);

    async function submit() {
        setSending(true);
        await onSubmit();
        setMediaFile(null);
        setMediaType('');
        setSending(false);
    }

    function handleDrop(files: File[], acceptedMediaType: string) {
        const file = files[0];
        setMediaFile(file);
        setMediaType(acceptedMediaType);
    }

    const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } = useDropzone({
        maxFiles: 1,
        onDrop: (files) => handleDrop(files, 'image'),
        accept: {
            'image/jpeg': [],
            'image/png': []
        }
    });

    const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } = useDropzone({
        maxFiles: 1,
        onDrop: (files) => handleDrop(files, 'video'),
        accept: {
            'video/mp4': []
        }
    });

    const { getRootProps: getAudioRootProps, getInputProps: getAudioInputProps } = useDropzone({
        maxFiles: 1,
        onDrop: (files) => handleDrop(files, 'audio'),
        accept: {
            'audio/mpeg': [],
            'audio/mp3': []
        }
    });

    return (
        <div className="w-full border-b bg-card rounded-lg pl-4 pr-6 py-6 flex">
            <div className="w-16 shrink-0 grow-0 mr-2 flex flex-col items-center">
                <Image
                    className="rounded-full h-12 w-12"
                    src={image || 'https://picsum.photos/seed/picsum/200/300'}
                    height={1000}
                    width={1000}
                    alt="profile pic"
                />
            </div>
            <div className="flex flex-col gap-4 flex-grow items-stretch">
                <div
                    onBlur={e => setTxt(e.target.innerHTML)}
                    contentEditable
                    suppressContentEditableWarning
                    className="w-full text-lg outline-none mb-4"
                />
                {mediaFile && (
                    <div className="relative mb-4">
                        <div
                            onClick={() => {
                                setMediaFile(null);
                                setMediaType('');
                            }}
                            className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-black bg-opacity-50 hover:bg-opacity-40 cursor-pointer"
                        >
                            <XCircle className="h-4 w-4" />
                        </div>
                        {mediaType === 'image' && (
                            <Image
                                src={URL.createObjectURL(mediaFile)}
                                className="rounded-xl w-full"
                                height={1000}
                                width={1000}
                                alt="uploaded"
                            />
                        )}
                        {mediaType === 'video' && (
                            <video controls className="rounded-xl w-full">
                                <source src={URL.createObjectURL(mediaFile)} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                        {mediaType === 'audio' && (
                            <audio controls className="w-full">
                                <source src={URL.createObjectURL(mediaFile)} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                        )}
                    </div>
                )}
                <div className="w-full flex items-center justify-between">
                    <div className="flex space-x-2">
                        <div {...getImageRootProps({ className: "hover:bg-blue-900 hover:bg-opacity-30 rounded-full p-2 cursor-pointer w-fit" })}>
                            <input {...getImageInputProps()} />
                            <ImagePlus className="text-blue-500 h-6 w-6" />
                        </div>
                        <div {...getVideoRootProps({ className: "hover:bg-blue-900 hover:bg-opacity-30 rounded-full p-2 cursor-pointer w-fit" })}>
                            <input {...getVideoInputProps()} />
                            <Video className="text-blue-500 h-6 w-6" />
                        </div>
                        <div {...getAudioRootProps({ className: "hover:bg-blue-900 hover:bg-opacity-30 rounded-full p-2 cursor-pointer w-fit" })}>
                            <input {...getAudioInputProps()} />
                            <Music className="text-blue-500 h-6 w-6" />
                        </div>
                    </div>
                    <button disabled={sending} onClick={submit} className="bg-blue-500 hover:bg-blue-600 font-bold w-24 h-10 flex items-center justify-center rounded-full">
                        {sending ? <div className='border-2 w-5 h-5 border-white border-t-transparent animate-spin rounded-full'></div> : label}
                    </button>
                </div>
            </div>
        </div>
    );
}