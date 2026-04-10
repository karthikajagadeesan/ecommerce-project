'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PluginEntry } from '@/types/plugin';
import { cn } from '@/lib/utils';
import { usePluginStore } from '@/hooks/use-plugin-store';

interface VideoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  entry: PluginEntry;
  className?: string;
  index: number;
  fadeEffect?: 'none' | 'top' | 'bottom';
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  entry, 
  className, 
  index, 
  fadeEffect = 'none',
  onMouseEnter,
  onMouseLeave,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const setPopup = usePluginStore((state) => state.setPopup);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(false);
    onMouseLeave?.(e);
  };

  useEffect(() => {
    if (isHovered && entry.video_url && videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Automatic playback failed
        });
      }
    } else if (!isHovered && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isHovered, entry.video_url]);

  return (
    <div
      className={cn('s22_col cursor-pointer', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => setPopup(index)}
      {...props}
    >
      <img
        src={entry.image_url}
        alt={entry.name}
        className={cn(
          'transition-all duration-500 ease-in-out',
          isHovered && entry.video_url ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
        )}
      />
      {entry.video_url && (
        <video
          ref={videoRef}
          src={entry.video_url}
          // muted
          loop
          playsInline
          preload="auto"
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
      {fadeEffect !== 'none' && (
        <div className={cn(
          'absolute inset-0 z-10 pointer-events-none transition-opacity duration-500',
          fadeEffect === 'top' 
            ? 'bg-gradient-to-b from-[#fcfcfc] via-[#fcfcfc]/80 to-transparent h-[40%]' 
            : 'bg-gradient-to-t from-[#fcfcfc] via-[#fcfcfc]/80 to-transparent top-auto h-[40%]'
        )} />
      )}
    </div>
  );
};
