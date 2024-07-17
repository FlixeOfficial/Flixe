"use client";

import React, { useEffect, useRef } from "react";
import { Player } from "@livepeer/react";

type AmbientLivepeerPlayerProps = {
  title: string;
  poster: JSX.Element;
  videoUrl: string;
};

const AmbientLivepeerPlayer: React.FC<AmbientLivepeerPlayerProps> = ({
  title,
  poster,
  videoUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const attemptAmbientEffect = () => {
      const video = document.querySelector(
        "video.c-lioqzt"
      ) as HTMLVideoElement | null; // <-- Type assertion
      if (video && playerContainerRef.current && canvasRef.current) {
        video.addEventListener("play", applyAmbientEffect);
        if (!video.paused) {
          applyAmbientEffect();
        }
      }
    };

    const applyAmbientEffect = () => {
      const video = document.querySelector(
        "video.c-lioqzt"
      ) as HTMLVideoElement | null; // <-- Type assertion
      if (!video || !canvasRef.current || !playerContainerRef.current) return;

      const playerContainer =
        playerContainerRef.current.getBoundingClientRect();
      const canvas = canvasRef.current;

      const adjustedWidth = Math.min(
        window.innerWidth,
        playerContainer.width * 1.05
      );
      const adjustedHeight =
        (adjustedWidth / playerContainer.width) * playerContainer.height;

      canvas.style.width = `${adjustedWidth}px`;
      canvas.style.height = `${adjustedHeight}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return; // <-- Check if ctx is not null

      const getCurrentImage = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height); // video is already asserted to be of type HTMLVideoElement
      };
      setInterval(getCurrentImage, 100);
    };

    attemptAmbientEffect();
  }, [videoUrl, playerContainerRef, canvasRef]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="rounded-2xl absolute top-20 left-0 filter blur-[80px] opacity-40 z-0 h-[90vh] w-full"
      ></canvas>
      {/* <div
        ref={playerContainerRef}
        className="rounded-xl overflow-hidden m-auto z-10 w-[100%] max-h-[90vh] flex items-center justify-center aspect-[16/9]"
      > */}
      <div className="relative aspect-[16/9] mt-2 rounded-xl overflow-hidden">
        <iframe src={`${videoUrl}?autoplay=1`}
          width="100%"
          height="100%"
          allowFullScreen />
        {/* <Player
          title={title}
          poster={poster}
          playbackId={new URL(videoUrl).searchParams.get("v")}
          autoPlay
          objectFit="contain"
          priority
        /> */}
      </div>
    </>
  );
};

export default AmbientLivepeerPlayer;
