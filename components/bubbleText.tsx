"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";

const HoverText = styled.span`
  transition: font-weight 0.2s, color 0.2s;

  &:hover {
    font-weight: 900;
    color: rgb(238, 242, 255);
  }

  &:hover + & {
    font-weight: 500;
    color: rgb(199, 210, 254);
  }

  &:hover + & + & {
    font-weight: 300;
  }

  &:has(+ &:hover) {
    font-weight: 500;
    color: rgb(199, 210, 254);
  }

  &:has(+ & + &:hover) {
    font-weight: 300;
  }
`;

interface FlixeTextProps {
  text: string;
}

const BubbleText: React.FC<FlixeTextProps> = ({ text }) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }
  return (
    <h1 className="text-center text-5xl font-thin text-indigo-300">
      {text.split("").map((char, idx) => (
        <HoverText key={idx}>{char}</HoverText>
      ))}
    </h1>
  );
};

export default BubbleText;
