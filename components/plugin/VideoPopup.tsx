'use client';

import React, { useEffect, useState } from 'react';
import { usePluginStore } from '@/hooks/use-plugin-store';
import { PluginEntry } from '@/types/plugin';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';

interface VideoPopupProps {
  entries: PluginEntry[];
}

export const VideoPopup: React.FC<VideoPopupProps> = ({ entries }) => {
  const { currentPopupIndex, setPopup, nextPopup, prevPopup } = usePluginStore();

  if (currentPopupIndex === null) return null;

  const entry = entries[currentPopupIndex];
  const prevEntry = entries[(currentPopupIndex - 1 + entries.length) % entries.length];
  const nextEntry = entries[(currentPopupIndex + 1) % entries.length];

  const firstName = entry.name ? entry.name.split(' ')[0] : '';
  const prevFirstName = prevEntry.name ? prevEntry.name.split(' ')[0] : '';
  const nextFirstName = nextEntry.name ? nextEntry.name.split(' ')[0] : '';

  return (
    <div className="s22_popup_overlay" onClick={() => setPopup(null)}>
      <section 
        className="s22_popup show"
        id="popup"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="colose" onClick={() => setPopup(null)}>
          <X className="w-6 h-6" aria-hidden="true" />
        </button>

        <div className="s22_popup_row s22_popup_content">
          <div className="s22_popup_col s22_popup_col_img">
            {entry.video_url ? (
              <video
                className="video"
                src={entry.video_url}
                autoPlay
                muted
                controls
                playsInline
              />
            ) : (
              <img src={entry.image_url} alt={entry.name} />
            )}
          </div>

          <div className="s22_popup_col all_cont">
            <h4>{entry.name}</h4>
            <p className="prof">{entry.profession}</p>
            <div className="cont">{entry.content}</div>
            <div className="styles">
              {entry.style.split('|').map((tag, i) => (
                tag.trim() && <div key={i}>{tag.trim()}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="s22_popup_row button_row s22_popup_nav">
          <button className="prev" onClick={() => prevPopup(entries.length)}>
            <ArrowLeft className="w-5 h-5 mr-1" aria-hidden="true" />
            <span>Meet </span>
            <span className="p_name">{prevFirstName}</span>
          </button>
          <button className="next" onClick={() => nextPopup(entries.length)}>
            <span>Meet </span>
            <span className="n_name">{nextFirstName}</span>
            <ArrowRight className="w-5 h-5 ml-1" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
};
