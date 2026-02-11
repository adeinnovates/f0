---
title: Welcome to f0
description: AI-first documentation platform for Humans, Search Engines, and LLMs
---

# Welcome to f0

f0 is a **zero-configuration** documentation platform designed for the AI era. Write Markdown, organize folders, deploy. One source of truth renders three ways: a visual UI for humans, SSR HTML for search engines, and structured plain text for AI agents.

## Getting Started

1. **Browse** — Use the sidebar to navigate sections
2. **Search** — Press `Cmd+K` to find content instantly
3. **AI Access** — Agents fetch `/llms.txt` or scoped sections via `/llms.txt?section=guides`

## Platform Features

### Filesystem as CMS

No database. No admin panel. Your directory structure under `/content` defines the entire site — navigation, hierarchy, routing, and content. Create a folder, drop in Markdown, and it's live.

### Tri-brid Rendering

Every page is rendered three ways from the same source file:

- **Visual UI** — Vue.js interface with syntax highlighting, responsive images, callout boxes, and dark mode
- **SEO HTML** — Server-side rendered with OpenGraph meta, Twitter Cards, canonical URLs, and auto-generated sitemap
- **LLM Context** — Stripped plain text at `/llms.txt` with hierarchical path headers and section filtering

### White-Label Branding

Deploy for any client without touching source code. Drop a `_brand.md` file in your content directory to configure logo, favicon, accent color, footer, and custom CSS. One Docker image, unlimited branded deployments.

### Image Processing

Images are automatically optimized on demand. The pipeline generates responsive `<picture>` elements with WebP srcset at multiple widths, lazy loading, and disk-cached variants. Authors write standard Markdown image paths that preview correctly in GitHub and VS Code.

### Embed System

Embed content from multiple platforms with a single directive:

```
::embed[Demo Video]{url=https://www.loom.com/share/abc123}
::embed[Design Mockup]{url=https://www.figma.com/file/xyz}
```

Supports YouTube, Loom, Figma, GitHub Gists, and any URL. Mermaid diagrams render inline with `::mermaid` blocks.

### AI Agent APIs

f0 treats AI agents as first-class consumers:

- **`/llms.txt`** — Full documentation as context-dense plain text (~3ms cached)
- **`/llms.txt?section=guides`** — Scoped to a specific section for context window management
- **`/llms-index.txt`** — Discovery endpoint with section list, page counts, and token estimates
- **`/api/agents/search`** — Semantic search across all content

### Blog Engine

Date-prefixed Markdown files in a blog directory get automatic listing pages, tag filtering, RSS feed, and article-specific OpenGraph meta — without any configuration beyond `layout: blog` in a `_config.md`.

### Infrastructure

- **Health probes** at `/_health` and `/_ready` for container orchestration
- **Startup validation** — fail-fast on misconfigurations, cache pre-warming for instant first requests
- **Structured JSON logging** — parseable by Datadog, Loki, CloudWatch, or grep
- **`Server-Timing` headers** on every response for performance monitoring
- **Content validation CLI** — `npm run validate` checks frontmatter, image refs, heading hierarchy, and more

:::info
f0 operates under strict architectural constraints. The filesystem is always the single source of truth. Content caches use mtime comparison, never TTL. Image processing fails gracefully to originals. Fatal misconfigurations are caught at startup, not request time.
:::

## Quick Links

- [Getting Started Guide](/guides/getting-started) — Set up your first docs
- [Authentication](/guides/authentication/overview) — Secure your documentation
- [API Reference](/api) — Explore available endpoints

## For AI Agents

If you're an AI agent, start with `/llms-index.txt` to see what sections are available and their token counts. Then fetch `/llms.txt` for the full context, or `/llms.txt?section=guides` for just the section you need. For targeted retrieval, use `/api/agents/search?q=your+query`.
