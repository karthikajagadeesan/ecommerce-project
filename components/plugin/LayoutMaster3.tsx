'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  const pattern = total > 8 ? [1, 2, 1, 1, 1, 2, 1] : [1, 2, 1, 2];
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
  const processedEntries = useMemo(() => entries.map(entry => ({
    ...entry,
    video_url: entry.video_url || undefined
  })), [entries]);

  const baseGroups = useMemo(() => groupEntries(processedEntries), [processedEntries]);
  const totalBaseGroups = baseGroups.length;

  const [currentSlide, setCurrentSlide] = useState(totalBaseGroups);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  if (!entries.length) return null;

  const title = entries[0]?.s_title || 'Visual Experiences';
  const description = entries[0]?.s_cont || 'Immerse yourself in our continuous flow of premium layouts.';
  
  // To create a seamless loop, we triplicate the groups
  const groups = [...baseGroups, ...baseGroups, ...baseGroups];
  
  const offsetPattern = [-30, 30, 0, -30, 30, 0, 30];
  const VISIBLE_COLS = 7;
  const GAP_PX = 8;

  // Seamless Loop Handler
  const handleLoop = (nextSlide: number) => {
    setIsTransitioning(true);
    setCurrentSlide(nextSlide);

    // If we go past the boundaries, we jump back to the middle segment instantly after the transition
    if (nextSlide >= totalBaseGroups * 2) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(totalBaseGroups);
      }, 600); 
    } else if (nextSlide < totalBaseGroups) {
        setTimeout(() => {
          setIsTransitioning(false);
          setCurrentSlide(totalBaseGroups + (nextSlide % totalBaseGroups));
        }, 600);
    }
  };

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      handleLoop(currentSlide + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, [currentSlide, totalBaseGroups]);

  const onNext = () => handleLoop(currentSlide + 1);
  const onPrev = () => handleLoop(currentSlide - 1);

  return (
    <section className="s22_master3 py-10 overflow-hidden relative">
      <div className="sec_title px-6">
        <h1 className="plugin-title">
          {title}
        </h1>
        <p className="plugin-subtitle text-lg mx-auto italic">
          {description}
        </p>
      </div>

      {/* Desktop Mosaic Slider */}
      <div className="s22_master3_slider maingridlists relative hidden md:block overflow-hidden px-30">
        <div
          ref={sliderRef}
          className={cn(
            "swiper-wrapper flex",
            isTransitioning ? "transition-transform duration-500 ease-in-out" : "transition-none"
          )}
          style={{ 
            transform: `translateX(calc(-${currentSlide} * (100% + ${GAP_PX}px) / ${VISIBLE_COLS}))`,
            gap: `${GAP_PX}px`,
            alignItems: 'center'
          }}
        >
          {groups.map((group, slideIdx) => {
            const posInView = slideIdx - currentSlide;
            let offsetPx = 0;
            // Apply wave pattern based on position in current viewport
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
                  transition: isTransitioning ? 'transform 0.4s cubic-bezier(.22,.9,.35,1)' : 'none',
                }}
              >
                {group.map((entry, entryInCol) => {
                  const globalIdx = processedEntries.findIndex(e => e.id === entry.id);
                  
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
                      key={`${slideIdx}-${entryInCol}`}
                      entry={entry}
                      index={globalIdx >= 0 ? globalIdx : 0}
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

      {/* Navigation Controls */}
      <div className="hidden md:flex justify-end gap-2 mt-12 px-12">
        <button
          className="plugin-nav-btn w-12 h-12 rounded-sm border border-transparent shadow-sm hover:scale-105 active:scale-95 transition-all"
          onClick={onPrev}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          className="plugin-nav-btn w-12 h-12 rounded-sm border border-transparent shadow-sm hover:scale-105 active:scale-95 transition-all"
          onClick={onNext}
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile grid */}
      <div className="md:hidden px-6 grid grid-cols-2 gap-4">
        {processedEntries.slice(0, 8).map((entry, idx) => (
          <VideoCard
            key={idx}
            entry={entry}
            index={idx}
            className="popvideo rounded-lg"
          />
        ))}
      </div>
    </section>
  );
};
