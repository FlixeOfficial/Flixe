"use client";

import React, { useState, useEffect, useLayoutEffect } from "react";
import { Meteors } from "./meteors";

const BACKGROUNDS = [
  "rgba(39, 20, 80, 0.5)",
  "rgba(42, 25, 85, 0.66)",
  "rgba(44, 30, 90, 0.66)",
  "rgba(46, 35, 95, 0.66)",
  "rgba(48, 40, 100, 0.64)",
  // "rgba(63, 50, 110, 0.64)",
  // "rgba(78, 60, 120, 0.62)",
  // "rgba(101, 80, 140, 0.62)",
  // "rgba(120, 95, 155, 0.6)",
  // "rgba(139, 110, 170, 0.6)",
  // "rgba(120, 95, 155, 0.62)",
  // "rgba(101, 80, 140, 0.62)",
  // "rgba(78, 60, 120, 0.64)",
  // "rgba(63, 50, 110, 0.64)",
  "rgba(48, 40, 100, 0.66)",
  "rgba(46, 35, 95, 0.66)",
  "rgba(44, 30, 90, 0.66)",
  "rgba(42, 25, 85, 0.66)",
  "rgba(39, 20, 80, 0.5)",
];

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  transitionDuration: number;
  scale: number;
}

interface StarsProps {
  active: boolean;
}

const Stars: React.FC<StarsProps> = ({ active }) => {
  const [stars, setStars] = useState<Star[]>([]);

  useLayoutEffect(() => {
    const newStars: Star[] = [];
    for (let i = 0; i < 50; i++) {
      const scale = Math.round(Math.random()) + 1; // Scale will be either 1 or 2
      newStars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() + 1, // Size between 1px and 2px
        opacity: Math.random() * 0.5 + 0.1, // Opacity between 0.1 and 0.6
        transitionDuration: Math.random() * 1000 + 500, // Transition duration between 500ms and 1500ms
        scale: scale, // Apply random scaling factor
      });
    }
    setStars(newStars);
  }, []);

  return (
    <div className="fixed w-screen h-screen top-0 left-0 overflow-hidden pointer-events-none">
      {stars.map((star, index) => (
        <div
          key={index}
          className={`absolute rounded-full bg-white ${
            active ? "opacity-70" : "opacity-0"
          }`}
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            transition: `opacity ${star.transitionDuration}ms ease-in-out, transform ${star.transitionDuration}ms ease-in-out`,
            transform: `scale(${star.scale})`,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
};

const NightSky: React.FC = () => {
  const [bg, setBg] = useState<number>(0);
  const [activeSet, setActiveSet] = useState<number>(0);
  const [background, setBackground] = useState<string>(BACKGROUNDS[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBg((prevBg) => {
        const nextBg = prevBg < BACKGROUNDS.length - 1 ? prevBg + 1 : 0;
        setBackground(BACKGROUNDS[nextBg]);
        return nextBg;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const toggle = setInterval(() => {
      setActiveSet((prevSet) => (prevSet === 0 ? 1 : 0));
    }, 5000); // Switch active set every 5 seconds
    return () => clearInterval(toggle);
  }, []);

  return (
    <div
      className="fixed top-0 w-screen h-screen flex flex-col items-center justify-center transition-all ease-in-out duration-1000"
      style={{
        background: `radial-gradient(ellipse 80% 30% at top center, ${background} 0%, #000000 60%)`,
      }}
    >
      <Meteors number={1} />
      <Stars active={activeSet === 0} />
      <Stars active={activeSet === 1} />
    </div>
  );
};

export default NightSky;
