'use client';

import React, { useMemo } from 'react';
import { LayoutProps } from '@/types/plugin';
import { VideoCard } from './VideoCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export const LayoutMaster1: React.FC<LayoutProps> = ({ entries }) => {
  if (!entries.length) return null;

  const processedEntries = useMemo(() => entries, [entries]);

  const title = entries[0]?.s_title || 'What Our Customers Say';
  const description = entries[0]?.s_cont || 'Real stories from real users. Experience the difference today.';

  return (
    <section className="s22_master py-10 px-10">
      <div className="sec_title px-6">
        <h1 className="plugin-title">
          {title}
        </h1>
        <p className="plugin-subtitle">
          {description}
        </p>
      </div>

      {/* Desktop Card Set (Rotated via CSS nth-child) */}
      <div className="s22_master_desktop hidden md:block">
        <div className="s22_row flex justify-center items-center py-12">
          {processedEntries.map((entry, index) => (
            <VideoCard 
              key={entry.id ?? index} 
              entry={entry} 
              index={index} 
              className="popvideo s22_col cursor-pointer" 
            />
          ))}
        </div>
      </div>

      {/* Mobile Slider Wrapper */}
      <div className="s22_slider_wrapper md:hidden pb-12">
        <Swiper
          modules={[Pagination, Navigation]}
          slidesPerView={1}
          spaceBetween={20}
          pagination={{ clickable: true }}
          className="s22_mobile_slider swiper"
        >
          {processedEntries.map((entry, index) => (
            <SwiperSlide key={entry.id ?? index} className="s22_slide p-4">
              <VideoCard 
                entry={entry} 
                index={index} 
                className="w-full h-[450px] object-cover rounded-xl"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
