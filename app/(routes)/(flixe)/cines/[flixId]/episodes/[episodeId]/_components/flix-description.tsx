"use client";

import { Preview } from '@/components/preview';
import { Episode, VideoData } from '@prisma/client';
import React, { useState } from 'react';

interface FlixDescriptionProps {
  episode: Episode & { videoData?: VideoData | null };
}

const FlixDescription: React.FC<FlixDescriptionProps> = ({ episode }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
      setExpanded(!expanded);
    }

  return (
    <div className="bg-gradient-to-b from-opacity-90 to-opacity-0 overflow-hidden relative group hover:from-opacity-0 hover:to-opacity-90 transition-opacity duration-300">
        <div
        className={`p-4 transition-max-h duration-500 ease-in-out overflow-hidden rounded-xl dark:bg-card border hover:text-lightPrimary text-sm`}
        >
        {expanded ? (
            <Preview value={episode.description!} />
        ) : (
            <>
            <Preview value={episode.shortdescription!}/>
            <p className="ql-editor">Show full description ...</p> 
            </>
        )}
        </div>
        <div
        className="absolute inset-0 cursor-pointer"
        onClick={toggleExpand}
        />
    </div>
  );
};

export default FlixDescription;
