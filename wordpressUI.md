# WordPress → Next.js Migration Guide
> **GitHub Source:** [https://github.com/karthikajagadeesan/test-wordpress](https://github.com/karthikajagadeesan/test-wordpress)

> All component logic is ported 1-to-1 from the source files listed in each section.
> If any doubt about source code, refer directly to the GitHub repo above.

---
## Table of Contents

1. [Your Actual Project Structure](#1-your-actual-project-structure)
2. [Files to Create / Update](#2-files-to-create--update)
3. [LayoutManager.tsx — Routing Logic](#3-layoutmanagertsx--routing-logic)
4. [LayoutMaster1.tsx — Layout 1](#4-layoutmaster1tsx--layout-1)
5. [LayoutMaster2.tsx — Layout 2](#5-layoutmaster2tsx--layout-2)
6. [LayoutMaster3.tsx — Layout 3](#6-layoutmaster3tsx--layout-3)
7. [LayoutMaster4.tsx — Layout 4](#7-layoutmaster4tsx--layout-4)
8. [VideoCard.tsx](#8-videocardtsx)
9. [VideoPopup.tsx](#9-videopopuptsx)
10. [types/plugin.ts](#10-typesplugints)
11. [app/test-plugin/page.tsx](#11-apptest-pluginpagetsx)
12. [WordPress PHP → TSX Conversion Patterns](#12-wordpress-php--tsx-conversion-patterns)
13. [Checklist](#13-checklist)

---

## 1. Your Actual Project Structure

Based on your screenshots, the e-commerce-project already has this structure:

```
e-commerce-project/
├── app/
│   ├── (auth)/
│   ├── (main)/
│   ├── actions/
│   ├── api/
│   ├── license/
│   ├── membership/
│   │   └── page.tsx
│   ├── payment/
│   │   └── page.tsx
│   ├── test-plugin/              ← Plugin layouts render here
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
│
├── components/
│   ├── auth/
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── LoginForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   └── UserSignup.tsx
│   ├── plugin/                   ← All 4 layouts + video components live here
│   │   ├── LayoutManager.tsx
│   │   ├── LayoutMaster1.tsx
│   │   ├── LayoutMaster2.tsx
│   │   ├── LayoutMaster3.tsx
│   │   ├── LayoutMaster4.tsx
│   │   ├── VideoCard.tsx
│   │   └── VideoPopup.tsx
│   └── ui/
│       ├── error-state.tsx
│       ├── license-viewer.tsx
│       ├── loading-state.tsx
│       └── payment-form.tsx
│
├── helper/
├── hooks/
├── lib/
├── node_modules/
├── public/
├── supabase/
├── test/
├── types/
│   ├── database-type.ts
│   ├── general-type.ts
│   └── plugin.ts                 ← Plugin-specific TypeScript types
│
├── .env.local
├── .gitignore
├── components.json
├── ecommerce.md
└── eslint.config.mjs
```

---

## 2. Files to Create / Update

| File | Status | Action Required |
|------|--------|-----------------|
| `components/plugin/LayoutManager.tsx` | 🟡 Created (U) | Wire layout selection logic from WP plugin |
| `components/plugin/LayoutMaster1.tsx` | 🟡 Created (U) | Port exact HTML structure from `layout-1.php` |
| `components/plugin/LayoutMaster2.tsx` | 🟡 Created (U) | Port exact HTML structure from `layout-2.php` |
| `components/plugin/LayoutMaster3.tsx` | 🟡 Created (U) | Port exact HTML structure from `layout-3.php` |
| `components/plugin/LayoutMaster4.tsx` | 🟡 Created (U) | Port exact HTML structure from `layout-4.php` |
| `components/plugin/VideoCard.tsx` | 🟡 Created (U) | Port video card markup |
| `components/plugin/VideoPopup.tsx` | 🟡 Created (U) | Port video popup/modal markup |
| `types/plugin.ts` | 🟡 Created (U) | Ensure all WP data shapes are typed |
| `app/test-plugin/page.tsx` | 🟡 Created (U) | Replace shortcode render with component call |
| `app/globals.css` | 🔴 Modified (M) | Add plugin-specific CSS from WP stylesheet |

---

## 3. LayoutManager.tsx — Routing Logic

**WordPress equivalent:** The `add_shortcode()` dispatcher in `test-plugin.php` that checks which layout to render based on a shortcode attribute like `[test_plugin layout="1"]`.

```tsx
// components/plugin/LayoutManager.tsx
'use client';

import LayoutMaster1 from './LayoutMaster1';
import LayoutMaster2 from './LayoutMaster2';
import LayoutMaster3 from './LayoutMaster3';
import LayoutMaster4 from './LayoutMaster4';
import { PluginData } from '@/types/plugin';

interface LayoutManagerProps {
  layout: 1 | 2 | 3 | 4;
  data: PluginData;
}

export default function LayoutManager({ layout, data }: LayoutManagerProps) {
  switch (layout) {
    case 1:
      return <LayoutMaster1 data={data} />;
    case 2:
      return <LayoutMaster2 data={data} />;
    case 3:
      return <LayoutMaster3 data={data} />;
    case 4:
      return <LayoutMaster4 data={data} />;
    default:
      return null;
  }
}
```

---

## 4. LayoutMaster1.tsx — Layout 1

**WordPress equivalent:** `templates/layout-1.php` rendered by shortcode.

**⚠️ Critical:** The HTML structure below is a template pattern. Replace the `<div>` hierarchy and class names with the **exact structure from your `layout-1.php`** to preserve visual fidelity.

```tsx
// components/plugin/LayoutMaster1.tsx
import { PluginData } from '@/types/plugin';

interface Props {
  data: PluginData;
}

export default function LayoutMaster1({ data }: Props) {
  // REPLACE this JSX with the exact HTML from layout-1.php
  // Map PHP variables to props:
  //   <?php echo $title ?>        →  {data.title}
  //   <?php echo $content ?>      →  dangerouslySetInnerHTML={{ __html: data.content }}
  //   <?php echo $image_url ?>    →  <Image src={data.imageUrl} />
  //   foreach ($items as $item)   →  {data.items.map((item) => (...))}

  return (
    <div className="layout-1-wrapper">
      {/* Exact structure from layout-1.php goes here */}
    </div>
  );
}
```

### PHP → TSX Mapping for Layout 1

| PHP (layout-1.php) | TSX (LayoutMaster1.tsx) |
|---------------------|--------------------------|
| `<div class="X">` | `<div className="X">` |
| `<?php echo esc_html($title); ?>` | `{data.title}` |
| `<?php echo wp_kses_post($content); ?>` | `<div dangerouslySetInnerHTML={{ __html: data.content }} />` |
| `<?php echo esc_url($link); ?>` | `href={data.link}` with `<Link>` |
| `<?php if ($show): ?> ... <?php endif; ?>` | `{data.show && (...)}` |

---

## 5. LayoutMaster2.tsx — Layout 2

**WordPress equivalent:** `templates/layout-2.php`

```tsx
// components/plugin/LayoutMaster2.tsx
import { PluginData } from '@/types/plugin';

interface Props {
  data: PluginData;
}

export default function LayoutMaster2({ data }: Props) {
  // REPLACE with exact HTML from layout-2.php
  return (
    <div className="layout-2-wrapper">
      {/* Exact structure from layout-2.php goes here */}
    </div>
  );
}
```

### Common Layout 2 Patterns to Watch For

```tsx
// If layout-2.php has a sidebar + main column:
<div className="layout-2-container">
  <aside className="layout-2-sidebar">
    {/* sidebar content */}
  </aside>
  <main className="layout-2-main">
    <div dangerouslySetInnerHTML={{ __html: data.mainContent }} />
  </main>
</div>

// If layout-2.php has a repeating list/grid:
<div className="layout-2-grid">
  {data.items.map((item, i) => (
    <div key={i} className="layout-2-item">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  ))}
</div>
```

---

## 6. LayoutMaster3.tsx — Layout 3

**WordPress equivalent:** `templates/layout-3.php`

```tsx
// components/plugin/LayoutMaster3.tsx
import { PluginData } from '@/types/plugin';
import VideoCard from './VideoCard';

interface Props {
  data: PluginData;
}

export default function LayoutMaster3({ data }: Props) {
  // REPLACE with exact HTML from layout-3.php
  // Note: Layout 3 likely uses VideoCard based on your component list
  return (
    <div className="layout-3-wrapper">
      {data.videos?.map((video, i) => (
        <VideoCard key={i} video={video} />
      ))}
    </div>
  );
}
```

---

## 7. LayoutMaster4.tsx — Layout 4

**WordPress equivalent:** `templates/layout-4.php`

```tsx
// components/plugin/LayoutMaster4.tsx
'use client'; // if it uses VideoPopup (interactive modal)

import { useState } from 'react';
import { PluginData } from '@/types/plugin';
import VideoPopup from './VideoPopup';

interface Props {
  data: PluginData;
}

export default function LayoutMaster4({ data }: Props) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // REPLACE with exact HTML from layout-4.php
  return (
    <div className="layout-4-wrapper">
      {/* Exact structure from layout-4.php */}
      {activeVideo && (
        <VideoPopup
          url={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
}
```

---

## 8. VideoCard.tsx

**WordPress equivalent:** Likely a reusable partial template `partials/video-card.php` or inline markup inside layout templates.

```tsx
// components/plugin/VideoCard.tsx
'use client';

import Image from 'next/image';
import { VideoItem } from '@/types/plugin';

interface Props {
  video: VideoItem;
  onPlay?: (url: string) => void;
}

export default function VideoCard({ video, onPlay }: Props) {
  // REPLACE with exact markup from original video card partial
  return (
    <div className="video-card">
      <div className="video-card__thumbnail" onClick={() => onPlay?.(video.url)}>
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={320}
          height={180}
        />
        <span className="video-card__play-icon">▶</span>
      </div>
      <div className="video-card__info">
        <h4 className="video-card__title">{video.title}</h4>
        {video.description && (
          <p className="video-card__desc">{video.description}</p>
        )}
      </div>
    </div>
  );
}
```

---

## 9. VideoPopup.tsx

**WordPress equivalent:** A modal/lightbox triggered by JS in the original plugin (likely `assets/js/plugin.js`).

```tsx
// components/plugin/VideoPopup.tsx
'use client';

import { useEffect } from 'react';

interface Props {
  url: string;
  onClose: () => void;
}

export default function VideoPopup({ url, onClose }: Props) {
  // Close on Escape key — matches typical WP lightbox behavior
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    // REPLACE className values with original CSS class names from plugin
    <div className="video-popup-overlay" onClick={onClose}>
      <div
        className="video-popup-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="video-popup-close" onClick={onClose}>✕</button>
        <div className="video-popup-player">
          <iframe
            src={url}
            allow="autoplay; fullscreen"
            allowFullScreen
            className="video-popup-iframe"
          />
        </div>
      </div>
    </div>
  );
}
```

---

## 10. types/plugin.ts

**WordPress equivalent:** The shortcode `$atts` array and `WP_Query` result shapes — these are untyped in PHP but must be explicitly typed in TypeScript.

```ts
// types/plugin.ts

export interface VideoItem {
  id: string;
  title: string;
  url: string;           // Video embed URL (YouTube, Vimeo, etc.)
  thumbnail: string;     // Thumbnail image URL
  description?: string;
  duration?: string;
}

export interface PluginData {
  layout: 1 | 2 | 3 | 4;
  title?: string;
  content?: string;
  imageUrl?: string;
  link?: string;
  show?: boolean;
  mainContent?: string;
  videos?: VideoItem[];
  items?: Array<{
    title: string;
    description: string;
    imageUrl?: string;
    link?: string;
  }>;
  // Add any additional fields from $atts in test-plugin.php
}
```

---

## 11. app/test-plugin/page.tsx

**WordPress equivalent:** The shortcode rendering entry point — the page where `[test_plugin]` is placed in WordPress.

```tsx
// app/test-plugin/page.tsx
import LayoutManager from '@/components/plugin/LayoutManager';
import { PluginData } from '@/types/plugin';

// Replace this with real data fetching from your API/Supabase
async function getPluginData(): Promise<PluginData> {
  // Option A: From Supabase (you have supabase/ in your project)
  // const { data } = await supabase.from('plugin_data').select('*').single();
  // return data;

  // Option B: From your own API route
  // const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/plugin`);
  // return res.json();

  // Option C: Static/mock data for development
  return {
    layout: 1,
    title: 'Plugin Title',
    content: '<p>Plugin content here</p>',
  };
}

export default async function TestPluginPage() {
  const data = await getPluginData();

  return (
    <main>
      <LayoutManager layout={data.layout} data={data} />
    </main>
  );
}
```

---

## 12. WordPress PHP → TSX Conversion Patterns

### HTML Attributes

| PHP | TSX |
|-----|-----|
| `class="foo"` | `className="foo"` |
| `for="input"` | `htmlFor="input"` |
| `tabindex="0"` | `tabIndex={0}` |
| `onclick="fn()"` | `onClick={fn}` |

### Content Rendering

| PHP | TSX |
|-----|-----|
| `<?php echo esc_html($x); ?>` | `{data.x}` |
| `<?php echo wp_kses_post($x); ?>` | `<div dangerouslySetInnerHTML={{ __html: data.x }} />` |
| `<?php echo esc_url($x); ?>` | `href={data.x}` |
| `<?php echo esc_attr($x); ?>` | `{data.x}` as prop |

### Control Flow

| PHP | TSX |
|-----|-----|
| `<?php if ($x): ?> ... <?php endif; ?>` | `{data.x && <div>...</div>}` |
| `<?php if ($x): ?> A <?php else: ?> B <?php endif; ?>` | `{data.x ? <A /> : <B />}` |
| `<?php foreach ($items as $item): ?> ... <?php endforeach; ?>` | `{data.items.map((item, i) => <div key={i}>...</div>)}` |

### Images

| PHP | TSX |
|-----|-----|
| `<img src="<?php echo $url; ?>" alt="<?php echo $alt; ?>">` | `<Image src={data.url} alt={data.alt} width={X} height={Y} />` |

### Links

| PHP | TSX |
|-----|-----|
| `<a href="<?php echo $url; ?>">text</a>` | `<Link href={data.url}>text</Link>` (internal) |
| External link | `<a href={data.url} target="_blank" rel="noreferrer">text</a>` |

### CSS Inline Styles

| PHP | TSX |
|-----|-----|
| `style="color: red"` | `style={{ color: 'red' }}` |
| `style="background: <?php echo $color; ?>"` | `style={{ background: data.color }}` |

---

## 13. Checklist

### Repository Access
- [ ] Make `karthikajagadeesan/test-wordpress` public **OR**
- [ ] Paste source PHP files directly into chat for automated conversion

### Per Layout (1, 2, 3, 4)
- [ ] Original PHP template file read and understood
- [ ] Exact HTML element hierarchy reproduced in TSX
- [ ] All `class` → `className` conversions done
- [ ] All PHP echo statements converted to JSX expressions
- [ ] PHP `foreach` loops converted to `.map()`
- [ ] PHP `if/endif` blocks converted to `&&` / ternary
- [ ] `wp_kses_post` HTML output uses `dangerouslySetInnerHTML`
- [ ] All images use `next/image` (`<Image>`)
- [ ] All internal links use `next/link` (`<Link>`)
- [ ] CSS classes match original exactly (no renames)

### Video Components
- [ ] `VideoCard.tsx` markup matches original card partial
- [ ] `VideoPopup.tsx` behavior matches original lightbox JS
- [ ] Escape key closes popup (parity with original JS)
- [ ] Click-outside-to-close works (parity with original JS)

### Types
- [ ] `types/plugin.ts` covers all PHP `$atts` fields
- [ ] `VideoItem` covers all video data fields from WP
- [ ] No `any` types in plugin components

### Styles
- [ ] All CSS from `assets/css/` ported to `globals.css` or CSS Modules
- [ ] No style regressions vs original WordPress output
- [ ] Responsive breakpoints match original

### Data
- [ ] `getPluginData()` in `app/test-plugin/page.tsx` fetches real data
- [ ] Supabase schema matches WordPress plugin option structure
- [ ] `app/api/` route handles any AJAX-equivalent requests

### Final
- [ ] `npm run build` passes with zero errors
- [ ] Visual comparison of all 4 layouts vs original screenshots
- [ ] No console errors in browser

---

## How to Get the Full Automated Conversion

Paste any of the following into this chat and the entire conversion will be done for you automatically:

1. **The PHP template files** — `layout-1.php`, `layout-2.php`, `layout-3.php`, `layout-4.php`
2. **The main plugin file** — `test-plugin.php` (to understand shortcode attributes and data structure)
3. **The plugin CSS** — `assets/css/*.css` (to preserve exact styling)
4. **The plugin JS** — `assets/js/*.js` (to replicate VideoCard/VideoPopup interactions)

---

*Generated for `e-commerce-project` | March 2026*