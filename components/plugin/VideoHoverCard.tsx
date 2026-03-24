'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { PluginEntry } from '@/types/plugin';

interface VideoHoverCardProps {
  entry: PluginEntry;
  onClick: () => void;
  className?: string;
}

export const VideoHoverCard: React.FC<VideoHoverCardProps> = ({ entry, onClick, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={entry.image_url}
        alt={entry.name}
        className={`transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
      />
      {entry.video_url && (
        <video
          ref={videoRef}
          src={entry.video_url}
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ zIndex: 1 }}
        />
      )}
    </div>
  );
};
