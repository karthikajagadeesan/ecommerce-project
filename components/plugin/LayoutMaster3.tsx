'use client';

import React, { useState, useEffect } from 'react';
import { LayoutProps, PluginEntry } from '@/types/plugin';
import { VideoCard } from './VideoCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Ported from applyOffsetPattern() in assets/script.js
function getOffsetPattern(total: number): number[] {
  return total <= 8 ? [-30, 30, 0, -30, 30] : [0, 30, 0, -30, 0];
}

// Ported from s22_layout_master3() grouping logic in view.php
function groupEntries(entries: PluginEntry[]): PluginEntry[][] {
  const total = entries.length;
  const pattern = total > 8 ? [1, 2, 1, 1, 1, 2, 1] : [1, 1];
  const groups: PluginEntry[][] = [];
  let i = 0, patIdx = 0;
  while (i < total) {
    const count = pattern[patIdx % pattern.length];
    groups.push(entries.slice(i, i + count));
    i += count;
    patIdx++;
  }
  return groups;
}

export const LayoutMaster3: React.FC<LayoutProps> = ({ entries }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!entries.length) return null;

  // Add sample video to entries that don't have one
  const processedEntries = entries.map(entry => ({
    ...entry,
    video_url: entry.video_url || 'https://cdn.pixabay.com/video/2024/02/09/200078-912140411_large.mp4'
  }));

  const title = entries[0]?.s_title || 'Testimonial Space';
  const description = entries[0]?.s_cont || 'Hear what our users have to say about their experience.';
  
  const groups = groupEntries(processedEntries);
  const offsetPattern = [-30, 30, 0, -30, 30, 0, 30];
  
  const VISIBLE_COLS = 7;
  const GAP_PX = 8;
  const maxSlide = Math.max(0, groups.length - VISIBLE_COLS);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(s => (s >= maxSlide ? 0 : s + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [maxSlide]);

  return (
    <section className="s22_master3 py-10 overflow-hidden relative">
      <div className="sec_title  px-6">
        <h1 className="plugin-title">
          {title}
        </h1>
        <p className="plugin-subtitle text-lg mx-auto italic">
          {description}
        </p>
      </div>

      {/* Desktop Mosaic Slider */}
      <div className="s22_master3_slider maingridlists relative hidden md:block overflow-hidden px-12">
        <div
          className="swiper-wrapper flex transition-transform duration-700 ease-in-out"
          style={{ 
            transform: `translateX(calc(-${currentSlide} * (100% + ${GAP_PX}px) / ${VISIBLE_COLS}))`,
            gap: `${GAP_PX}px`,
            alignItems: 'center'
          }}
        >
          {groups.map((group, slideIdx) => {
            const posInView = slideIdx - currentSlide;
            let offsetPx = 0;
            // Apply offset only when in view
            if (group.length === 1 && posInView >= 0 && posInView < VISIBLE_COLS) {
               offsetPx = offsetPattern[posInView % offsetPattern.length] ?? 0;
            }

            const isSide = (posInView === 0 || posInView === 1 || posInView === 5 || posInView === 6);

            return (
              <div
                key={slideIdx}
                className={cn(
                  "swiper-slide flex-shrink-0 flex flex-col",
                  group.length > 1 && "gridgap"
                )}
                style={{
                  width: `calc((100% - ${(VISIBLE_COLS - 1) * GAP_PX}px) / ${VISIBLE_COLS})`,
                  transform: `translateY(${offsetPx}px)`,
                  transition: 'transform 0.45s cubic-bezier(.22,.9,.35,1)',
                }}
              >
                {group.map((entry, entryInCol) => {
                  const globalIdx = processedEntries.indexOf(entry as any);
                  
                  let fadeEffect: 'none' | 'top' | 'bottom' = 'none';
                  if (isSide) {
                    if (offsetPx < 0) fadeEffect = 'top';
                    if (offsetPx > 0) fadeEffect = 'bottom';
                    
                    if (group.length === 2) {
                       if (entryInCol === 0) fadeEffect = 'top';
                       if (entryInCol === 1) fadeEffect = 'bottom';
                    }
                  }

                  return (
                    <VideoCard
                      key={`${entry.id}-${slideIdx}-${entryInCol}`}
                      entry={entry}
                      index={globalIdx}
                      fadeEffect={fadeEffect}
                      className="s22_col gridlist popvideo"
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Synchronized Navigation (Bottom Right style as per sample) */}
      <div className="hidden md:flex justify-end gap-2 mt-12 px-12">
        <button
          className={cn("plugin-nav-btn w-12 h-12 rounded-sm border border-transparent", currentSlide === 0 && 'opacity-30 cursor-not-allowed')}
          onClick={() => setCurrentSlide(s => Math.max(0, s - 1))}
          disabled={currentSlide === 0}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          className={cn("plugin-nav-btn w-12 h-12 rounded-sm border border-transparent", currentSlide >= maxSlide && 'opacity-30 cursor-not-allowed')}
          onClick={() => setCurrentSlide(s => Math.min(maxSlide, s + 1))}
          disabled={currentSlide >= maxSlide}
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile grid (Stack simplified) */}
      <div className="md:hidden px-6 grid grid-cols-2 gap-4">
        {processedEntries.slice(0, 8).map((entry, idx) => (
          <VideoCard
            key={entry.id || idx}
            entry={entry}
            index={idx}
            className="popvideo rounded-lg"
          />
        ))}
      </div>
    </section>
  );
};
