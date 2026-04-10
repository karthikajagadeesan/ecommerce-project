export interface PluginEntry {
  id: string;
  name: string;
  profession: string;
  content: string;
  style: string | null | undefined;
  image_id: string;
  video_id: string;
  c_order: number;
  layout: number;
  s_title: string;
  s_cont: string;
  image_url: string;
  video_url?: string;
}

export interface LayoutProps {
  entries: PluginEntry[];
}
