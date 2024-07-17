'use client'

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';

interface StarProps {
  position: { x: number, y: number };
  size: number;
}

const Star = ({ position, size }: StarProps) => {
  const [opacity, setOpacity] = useState(Math.random() * 0.5 + 0.5);

  useEffect(() => {
    const randomDuration = 1000 + Math.random() * 2000;
    const interval = setInterval(() => {
      setOpacity(Math.random() * 0.5 + 0.5);
    }, randomDuration);

    return () => clearInterval(interval);
  }, []);

  const starPath = `M${size},0 L${size * 0.6},${size * 1.7} L0,${size * 0.65} L${size * 1.2},${size * 0.65} L${size * 0.6},${size * 1.7} Z`;

  return (
    <motion.path
      d={starPath}
      fill="white"
      fillOpacity={opacity}
      animate={{ opacity }}
      transition={{ duration: Math.random() + 0.5, loop: Infinity, ease: "linear" }}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    />
  );
};

const Stars = ({ starCount = 70 }) => { // default star count is 70
  const [dimensions, setDimensions] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 0, 
    height: typeof window !== 'undefined' ? window.innerHeight : 0 
  });

  useLayoutEffect(() => {
    function updateSize() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const randomPosition = () => ({
    x: Math.random() * dimensions.width,
    y: Math.random() * dimensions.height,
  });

  const randomSize = () => 1 + Math.random() * 2; // Random size between 1 and 3

  return (
    <svg className="fixed w-screen h-screen top-0 left-0 overflow-hidden pointer-events-none opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} fill="none">
      {Array.from({ length: starCount }, (_, index) => (
        <Star key={`star-${index}`} position={randomPosition()} size={randomSize()} />
      ))}
    </svg>
  );
};

export default Stars;
