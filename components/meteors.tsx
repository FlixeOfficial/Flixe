'use client'

import React, { useState, useEffect } from "react";

export const Meteors = ({ number }: { number?: number }) => {
  const defaultNumber = 20;
  const [meteors, setMeteors] = useState(() =>
    Array.from({ length: number || defaultNumber }, () => getRandomPosition())
  );

  function getRandomPosition() {
    return {
      top: `${Math.random() * 80}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.6 + 0.2}s`,
      duration: `${Math.random() * 8 + 2}s`,
    };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setMeteors(meteors.map(() => getRandomPosition()));
    }, 5000); // Update positions every 5000 milliseconds or 5 seconds

    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="fixed top-0 left-0 w-screen h-screen overflow-hidden pointer-events-none">
      {meteors.map((pos, idx) => (
        <span
          key={"meteor" + idx}
          className="animate-meteor-effect absolute h-0.5 w-0.5 rounded-full bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg] before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent"
          style={{
            top: pos.top,
            left: pos.left,
            animationDelay: pos.delay,
            animationDuration: pos.duration,
          }}
        ></span>
      ))}
    </div>
  );
};
