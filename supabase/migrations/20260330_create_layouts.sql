-- Migration: Add layouts table
-- Date: 2026-03-30
-- Description: Create layouts table to manage layout-to-plan mapping dynamically.

CREATE TABLE IF NOT EXISTS public.layouts (
    id SERIAL PRIMARY KEY,
    layout_name TEXT UNIQUE NOT NULL,
    layout_type TEXT NOT NULL, -- Matches membership.plan_name (e.g. Basic, Premium)
    layout_data JSONB NOT NULL, -- Full layout configuration (components, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for layouts
ALTER TABLE public.layouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view layouts" ON public.layouts;
CREATE POLICY "Anyone can view layouts" ON public.layouts FOR SELECT USING (true);

-- Seed initial layout mapping with full data
INSERT INTO public.layouts (layout_name, layout_type, layout_data)
VALUES 
('layout_1', 'Basic', '{
    "id": 1,
    "name": "Grid Rotation",
    "structure": "nextjs_compatible",
    "components": [
        { "type": "grid", "columns": 3, "gap": "20px" },
        { "type": "master", "id": 1, "animation": "rotation_glass" }
    ],
    "theme": "S22 Basic"
}'),
('layout_2', 'Basic', '{
    "id": 2,
    "name": "Accordion Slider",
    "structure": "nextjs_compatible",
    "components": [
        { "type": "flex", "wrap": false },
        { "type": "master", "id": 2, "animation": "horizontal_accordion" }
    ],
    "theme": "S22 Basic"
}'),
('layout_3', 'Premium', '{
    "id": 3,
    "name": "Pattern Grid",
    "structure": "nextjs_compatible",
    "components": [
        { "type": "masonry", "sequence": "1-2-1" },
        { "type": "master", "id": 3, "animation": "fade_translate" }
    ],
    "theme": "S22 Premium"
}'),
('layout_4', 'Premium', '{
    "id": 4,
    "name": "Info Cards",
    "structure": "nextjs_compatible",
    "components": [
        { "type": "master", "id": 4, "variant": "badge_info" }
    ],
    "theme": "S22 Premium"
}')
ON CONFLICT (layout_name) DO UPDATE SET 
    layout_type = EXCLUDED.layout_type,
    layout_data = EXCLUDED.layout_data;
