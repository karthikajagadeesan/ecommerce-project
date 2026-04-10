'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LayoutProps, PluginEntry } from '@/types/plugin';
import { VideoCard } from './VideoCard';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const ITEM_HEIGHTS = ['40vh', '55vh', '30vh', '38vh', '50vh', '35vh', '60vh', '52vh'];
const PAGE_SIZE = 8;

export const LayoutMaster4: React.FC<LayoutProps> = ({ entries }) => {
  const [offset, setOffset] = useState(0);
  const [numCols, setNumCols] = useState(4);
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);
  const [animKey, setAnimKey] = useState(0);

  if (!entries.length) return null;

  const processedEntries = useMemo(() => entries.map(entry => ({
    ...entry,
    video_url: entry.video_url || undefined
  })), [entries]);

  const title = entries[0]?.s_title || 'Testimonial';
  const description = entries[0]?.s_cont || 'Hear what our customers have to say about their experience with us.';
  
  const totalItems = processedEntries.length;
  const maxOffset = Math.max(0, totalItems - PAGE_SIZE);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setNumCols(1);
      else if (window.innerWidth < 1024) setNumCols(2);
      else if (window.innerWidth < 1250) setNumCols(3);
      else setNumCols(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pageEntries = useMemo(() => {
    return processedEntries.slice(offset, offset + PAGE_SIZE);
  }, [processedEntries, offset]);

  const columns = useMemo(() => {
    const cols: { entry: any; globalIdx: number; height: string }[][] =
      Array.from({ length: numCols }, () => []);
    pageEntries.forEach((entry, idx) => {
      const globalIdx = offset + idx;
      const height = ITEM_HEIGHTS[idx % ITEM_HEIGHTS.length];
      cols[idx % numCols].push({ entry, globalIdx, height });
    });
    return cols;
  }, [pageEntries, offset, numCols]);

  const handleNext = () => {
    if (offset + 2 > maxOffset && offset !== maxOffset) {
      setOffset(maxOffset);
    } else if (offset < maxOffset) {
      setSlideDir('left');
      setAnimKey(k => k + 1);
      setOffset(o => Math.min(maxOffset, o + 2));
    }
  };

  const handlePrev = () => {
    if (offset === 0) return;
    setSlideDir('right');
    setAnimKey(k => k + 1);
    setOffset(o => Math.max(0, o - 2));
  };

  const canNext = offset < maxOffset;
  const canPrev = offset > 0;

  return (
    <section className="s22_master4 py-10 px-10">
      <div className="sec_title">
        <h1 className="plugin-title">
          {title}
        </h1>
        <p className="plugin-subtitle">
          {description}
        </p>
      </div>

      <div className="overflow-hidden w-full mb-10">
        <div
          className={cn("flex gap-x-8 items-start w-full", numCols === 1 && 'flex-col')}
        >
          {columns.map((column, colIdx) => {
            const panelClass = slideDir && animKey > 0
              ? `${slideDir === 'left' ? 'panel-in-right' : 'panel-in-left'} panel-col-${colIdx}`
              : '';

            return (
              <div
                key={`${animKey}-${numCols}-${colIdx}`}  
                className={cn("flex-1 flex flex-col gap-y-1 w-full", panelClass)}
              >
                {column.map(({ entry, globalIdx, height }) => (
                  <div
                    key={`${entry.id ?? globalIdx}`}
                    className="s22_col group w-full mb-6"
                  >
                    <div className="s22_image overflow-hidden" style={{ height }}>
                      <VideoCard
                        entry={entry}
                        index={globalIdx}
                        className="w-full h-full transform-none rounded-none m-0 shadow-none object-cover"
                      />
                    </div>
                    <div className="s22_info pb-2">
                       <span className="name">{entry.name || 'Name Here'}</span>
                       <span className="profession">{entry.profession || 'Company, Designation'}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-end gap-2 px-4">
        <button
          className={cn(
            "w-14 h-14 border border-[var(--plugin-brown)] flex items-center justify-center transition-all bg-transparent hover:bg-[var(--plugin-brown)] hover:text-white",
            !canPrev && 'opacity-30 cursor-not-allowed'
          )}
          onClick={handlePrev}
          disabled={!canPrev}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          className={cn(
            "w-14 h-14 border border-[var(--plugin-brown)] flex items-center justify-center transition-all bg-transparent hover:bg-[var(--plugin-brown)] hover:text-white",
            !canNext && 'opacity-30 cursor-not-allowed'
          )}
          onClick={handleNext}
          disabled={!canNext}
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
};
