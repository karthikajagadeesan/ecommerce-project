'use client';

import React, { useState, useCallback } from 'react';
import { LayoutProps } from '@/types/plugin';
import { VideoCard } from './VideoCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LayoutMaster2: React.FC<LayoutProps> = ({ entries }) => {
  const [cardOrder, setCardOrder] = useState(() => entries.map((_, i) => i));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isRightClickNav, setIsRightClickNav] = useState(false);

  if (!entries.length) return null;

  // Next: moves images right to left
  const handleNext = useCallback(() => {
    setCardOrder(prev => {
      const next = [...prev];
      const first = next.shift()!;
      next.push(first);
      return next;
    });
  }, []);

  // Prev: moves images left to right
  const handlePrev = useCallback(() => {
    setCardOrder(prev => {
      const next = [...prev];
      const last = next.pop()!;
      next.unshift(last);
      return next;
    });
  }, []);

  // Use keys tied to entry identity for DOM node persistence during reordering transitions
  const activePos = hoveredIndex ?? 0;
  const visibleOrder = cardOrder.slice(0, 4);

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePrev();
    setIsRightClickNav(true);
    setTimeout(() => setIsRightClickNav(false), 450);
  };

  return (
    <section 
      className={cn(
        "s22_master2 py-15 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 transition-all duration-700",
        isRightClickNav && "opacity-90"
      )}
      onContextMenu={onContextMenu}
    >
      <div className="sec_title flex-shrink-0 w-[450px]">
        <h1 className="plugin-title">
          {entries[0].s_title.includes('.') 
            ? entries[0].s_title.split('.').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part.trim()}{part.trim().endsWith('.') ? '' : i < arr.length - 1 ? '.' : ''}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))
            : entries[0].s_title
          }
        </h1>
        <p className="plugin-subtitle mt-4 text-lg max-w-[350px]">
          {entries[0].s_cont}
        </p>
      </div>

      <div className="s22_master2_slider relative flex-grow overflow-visible group">
        <div className="s22_row flex">
          {visibleOrder.map((entryIdx, pos) => {
            const entry = entries[entryIdx];
            const isActive = pos === activePos;
            return (
              <VideoCard
                key={`${entry.id || entryIdx}`} // Identity-based key for reordering animations
                entry={entry}
                index={entryIdx}
                className={cn(
                  "popvideo transition-all shadow-lg active:scale-95",
                  isActive ? "brightness-110" : "brightness-90 hover:brightness-100"
                )}
                data-active={isActive ? "true" : "false"}
                onMouseEnter={() => setHoveredIndex(pos)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="carousel__nav flex gap-3 z-10">
          <button className="prev plugin-nav-btn h-[70px] w-20 group-hover:translate-x-1" onClick={handlePrev} aria-label="Previous">
            <ArrowLeft className="w-8 h-8" strokeWidth={2} />
          </button>
          <button className="next plugin-nav-btn h-[70px] w-20 group-hover:-translate-x-1" onClick={handleNext} aria-label="Next">
            <ArrowRight className="w-8 h-8" strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
};
