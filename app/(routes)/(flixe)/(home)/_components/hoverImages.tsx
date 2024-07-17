"use client";

import { useAnimate } from "framer-motion";
import React, { MouseEventHandler, ReactNode, useRef } from "react";

export const HoverImages = () => {
  return (
    <MouseImageTrail
      renderImageBuffer={50}
      rotationRange={25}
      images={[
        "/nft/1.jpeg",
        "/nft/2.jpeg",
        "/nft/3.jpeg",
        "/nft/4.jpeg",
        "/nft/5.jpeg",
        "/nft/6.jpeg",
        "/nft/7.jpeg",
        "/nft/8.jpeg",
        "/nft/9.jpeg",
        "/nft/10.jpeg",
        "/nft/11.jpeg",
        "/nft/12.jpeg",
        "/nft/13.jpeg",
        "/nft/14.jpeg",
        "/nft/15.jpeg",
        "/nft/16.jpeg",
        "/nft/17.jpeg",
        "/nft/18.jpeg",
      ]}
    >
      <section className="grid h-screen w-full place-content-center p-8 min-h-[1000px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 max-w-screen-2xl mx-auto">
          {/* Main heading */}
          <div className="col-span-full text-center">
            <h2 className="text-9xl font-black text-primary mb-6 font-trap">
              About Flixe
            </h2>
          </div>

          {/* Paragraphs in a newspaper-style layout */}
          <div className="text-xl text-primary leading-relaxed tracking-wide">
            <p className="mb-12">
              At Flixe, we're not just building a platform; we're creating a
              revolutionary digital film ecosystem that transcends the
              traditional boundaries of filmmaking. Flixe stands at the
              forefront of cinematic innovation, where filmmakers—from aspiring
              directors to seasoned producers—find not just a platform, but a
              vibrant community.
            </p>
            <p className="mb-4">
              Our ecosystem is designed to streamline and elevate the filmmaking
              process. Filmmakers can create, manage, and monetize their
              projects seamlessly, leveraging cutting-edge blockchain technology
              to ensure authenticity and reward creativity.
            </p>
          </div>

          <div className="text-xl text-primary leading-relaxed tracking-wide">
            <p className="mb-12">
              Flixe is a space where every interaction adds value, enabling
              filmmakers to thrive both financially and creatively. With tools
              like our Project Management Suite, integrated advertising systems,
              and a comprehensive crowdfunding platform, we offer a suite of
              opportunities that redefine the filmmaking landscape.
            </p>
            <p>
              Dive into Flixe, where your creativity knows no bounds, your
              projects come to life, and your contributions to the cinematic
              world are celebrated. Join us in redefining the film industry,
              making every frame count.
            </p>
          </div>
        </div>
      </section>
    </MouseImageTrail>
  );
};

const MouseImageTrail = ({
  children,
  images,
  renderImageBuffer,
  rotationRange,
}: {
  children: ReactNode;
  images: string[];
  renderImageBuffer: number;
  rotationRange: number;
}) => {
  const [scope, animate] = useAnimate();

  const lastRenderPosition = useRef({ x: 0, y: 0 });
  const imageRenderCount = useRef(0);

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    const { clientX, clientY } = e;

    const distance = calculateDistance(
      clientX,
      clientY,
      lastRenderPosition.current.x,
      lastRenderPosition.current.y
    );

    if (distance >= renderImageBuffer) {
      lastRenderPosition.current.x = clientX;
      lastRenderPosition.current.y = clientY;

      renderNextImage();
    }
  };

  const calculateDistance = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;

    // Using the Pythagorean theorem to calculate the distance
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    return distance;
  };

  const renderNextImage = () => {
    const imageIndex = imageRenderCount.current % images.length;
    const selector = `[data-mouse-move-index="${imageIndex}"]`;

    const el = document.querySelector(selector) as HTMLElement;

    el.style.top = `${lastRenderPosition.current.y}px`;
    el.style.left = `${lastRenderPosition.current.x}px`;
    el.style.zIndex = imageRenderCount.current.toString();

    const rotation = Math.random() * rotationRange;

    animate(
      selector,
      {
        opacity: [0, 1],
        transform: [
          `translate(-50%, -25%) scale(0.5) ${imageIndex % 2
            ? `rotate(${rotation}deg)`
            : `rotate(-${rotation}deg)`
          }`,
          `translate(-50%, -50%) scale(1) ${imageIndex % 2
            ? `rotate(-${rotation}deg)`
            : `rotate(${rotation}deg)`
          }`,
        ],
      },
      { type: "spring", damping: 15, stiffness: 200 }
    );

    animate(
      selector,
      {
        opacity: [1, 0],
      },
      { ease: "linear", duration: 0.5, delay: 1 }
    );

    imageRenderCount.current = imageRenderCount.current + 1;
  };

  return (
    <div
      ref={scope}
      className="relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {children}

      {images.map((img, index) => (
        <img
          className="pointer-events-none absolute left-0 top-0 h-48 w-auto rounded-xl border-2 border-black bg-neutral-900 object-cover opacity-0"
          src={img}
          alt={`Mouse move image ${index}`}
          key={index}
          data-mouse-move-index={index}
        />
      ))}
    </div>
  );
};