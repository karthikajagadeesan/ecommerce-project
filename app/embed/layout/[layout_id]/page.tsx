import { Suspense } from 'react';
import { LayoutManager } from '@/components/plugin/LayoutManager';
import { DUMMY_ENTRIES } from '@/components/plugin/mockData';
import { createAdminClient } from '@/lib/supabase/admin';

interface PageProps {
  params: Promise<{
    layout_id: string;
  }>;
  searchParams: Promise<{
    submission_id?: string;
  }>;
}

export default async function LayoutEmbedPage({ params, searchParams }: PageProps) {
  const { layout_id } = await params;
  const { submission_id } = await searchParams;
  const layout = parseInt(layout_id.split('_').pop() || '1');

  let entries = DUMMY_ENTRIES;

  if (submission_id) {
    const admin = createAdminClient();
    const { data: submission } = await admin
      .from('layout_submissions')
      .select('image_metadata, appearance, videos')
      .eq('id', parseInt(submission_id))
      .single();

    if (submission) {
      const typedSubmission = submission as any;
      if (Array.isArray(typedSubmission.image_metadata)) {
        // Map the submission data and ensure the first item has the 'Real' titles
        // Map the submission data and ensure the first item has the 'Real' titles
        const videosArray: Array<{ image_id: string; video_url: string }> =
          Array.isArray(typedSubmission.videos) ? typedSubmission.videos : [];

        entries = typedSubmission.image_metadata.map((item: any, idx: number) => {
          const appearance = typedSubmission.appearance || {};
          const details = appearance.image_details?.[idx] || {};
          // Match video by image id
          const matchedVideo = videosArray.find(
            (v) => v.image_id === item.id
          );
          return {
            ...item,
            image_url: item.image_url || item.url,
            url: item.url || item.image_url,
            video_url: matchedVideo?.video_url ?? item.video_url ?? undefined,
            // Per-image titles from appearance (new schema) with fallback to image_metadata fields
            name: details.title || item.title || 'Asset ' + (idx + 1),
            profession: details.subtitle || item.subtitle || 'User Uploaded',
            content: details.description || 'Synchronized from WordPress Dashboard',
            // Main layout-level titles
            s_title: appearance.layout_title || 'REAL UPLOADED ASSETS',
            s_cont: appearance.layout_description || 'Displaying your freshly synced content from WordPress.',
          };
        });
      }
    }
  }

  return (
    <div className="w-full h-full bg-transparent overflow-hidden">
      <Suspense fallback={<div>Loading layout...</div>}>
         <LayoutManager entries={entries} layout={layout} />
      </Suspense>
    </div>
  );
}
