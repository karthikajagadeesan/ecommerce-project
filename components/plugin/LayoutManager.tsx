'use client';

import React from 'react';
import { LayoutProps, PluginEntry } from '@/types/plugin';
import { LayoutMaster1 } from './LayoutMaster1';
import { LayoutMaster2 } from './LayoutMaster2';
import { LayoutMaster3 } from './LayoutMaster3';
import { LayoutMaster4 } from './LayoutMaster4';
import { VideoPopup } from './VideoPopup';

interface LayoutManagerProps {
  entries: PluginEntry[];
  layout: number;
}

export const LayoutManager: React.FC<LayoutManagerProps> = ({ entries, layout }) => {
  if (!entries.length) return null;

  const renderLayout = () => {
    switch (layout) {
      case 1:
        return <LayoutMaster1 entries={entries} />;
      case 2:
        return <LayoutMaster2 entries={entries} />;
      case 3:
        return <LayoutMaster3 entries={entries} />;
      case 4:
        return <LayoutMaster4 entries={entries} />;
      default:
        return <LayoutMaster1 entries={entries} />;
    }
  };

  return (
    <>
      <div className="plugin-layout-wrapper w-full bg-background">
        {renderLayout()}
      </div>
      <VideoPopup entries={entries} />
    </>
  );
};
