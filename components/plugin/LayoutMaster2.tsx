'use client';

import React, { useState } from 'react';
import { LayoutProps } from '@/types/plugin';
import { VideoCard } from './VideoCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const LayoutMaster2: React.FC<LayoutProps> = ({ entries }) => {
  const [cardOrder, setCardOrder] = useState(() => entries.map((_, i) => i));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!entries.length) return null;

  // Next: moves images right to left
  const handleNext = () => {
    setCardOrder(prev => {
      const next = [...prev];
      const first = next.shift()!;
      next.push(first);
      return next;
    });
  };

  // Prev: moves images left to right
  const handlePrev = () => {
    setCardOrder(prev => {
      const next = [...prev];
      const last = next.pop()!;
      next.unshift(last);
      return next;
    });
  };

  // The first card in the visible list (pos 0) is active by default.
  // When another card is hovered, that hovered card becomes active.
  const activePos = hoveredIndex ?? 0;
  const visibleOrder = cardOrder.slice(0, 4);

  return (
    <section className="s22_master2 py-15 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
      <div className="sec_title flex-shrink-0 w-[450px]">
        <h1 className="plugin-title">
          {entries[0].s_title.includes('.') 
            ? entries[0].s_title.split('.').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part.trim()}{i < arr.length - 1 ? '.' : ''}
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

      <div className="s22_master2_slider relative flex-grow overflow-visible">
        <div className="s22_row flex ">
          {visibleOrder.map((entryIdx, pos) => {
            const entry = entries[entryIdx];
            const isActive = pos === activePos;
            return (
              <VideoCard
                key={`${entry.id || entryIdx}-${pos}`}
                entry={entry}
                index={entryIdx}
                className="popvideo"
                data-active={isActive ? "true" : "false"}
                onMouseEnter={() => setHoveredIndex(pos)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="carousel__nav flex gap-3 z-10">
          <button className="prev plugin-nav-btn h-[70px] w-20" onClick={handlePrev} aria-label="Previous">
            <ArrowLeft className="w-8 h-8" strokeWidth={2} />
          </button>
          <button className="next plugin-nav-btn h-[70px] w-20" onClick={handleNext} aria-label="Next">
            <ArrowRight className="w-8 h-8" strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
};
