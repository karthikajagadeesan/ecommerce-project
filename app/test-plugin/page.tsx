'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LayoutManager } from '@/components/plugin/LayoutManager';
import { PluginEntry } from '@/types/plugin';

import { DUMMY_ENTRIES } from '@/components/plugin/mockData';

function TestPluginContent() {
  const searchParams = useSearchParams();
  const layoutParam = searchParams.get('layout');
  const layout = layoutParam ? parseInt(layoutParam) : 1;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-center gap-4 mb-10 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map((l) => (
          <a
            key={l}
            href={`/test-plugin?layout=${l}`}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              layout === l 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Layout {l}
          </a>
        ))}
      </div>

      <LayoutManager entries={DUMMY_ENTRIES} layout={layout} />
    </div>
  );
}

export default function TestPluginPage() {
  return (
    <Suspense fallback={<div>Loading test page...</div>}>
      <TestPluginContent />
    </Suspense>
  );
}
