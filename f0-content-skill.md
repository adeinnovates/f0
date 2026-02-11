# SKILL.md — f0 Content Authoring

> This skill teaches Claude how to create, structure, and manage content for **f0** (formerly LiteDocs), a filesystem-based documentation platform built on Nuxt.js. f0 renders one source file three ways: Visual UI (Vue), SEO (SSR HTML), and AI/LLM context (`/llms.txt`).

---

## Core Principle: The Filesystem IS the CMS

There is no database. No admin panel for content. The directory structure under `/content` defines the entire site. Every file you create, rename, or move changes the live documentation. Navigation, hierarchy, and routing are all derived from the filesystem.

Content changes are detected automatically via filesystem mtime comparison — no manual cache purging, no TTL expiry, no restart required.

---

## Directory Structure

```
/content/                        ← The entire documentation site
├── nav.md                       ← Top navigation bar (required)
├── home.md                      ← Landing page (renders at /)
├── _brand.md                    ← White-label branding (optional)
├── _config.md                   ← Site configuration (optional)
│
├── briefs/                      ← Tab: "Briefs"
│   ├── 01-intro.md
│   └── 02-concept.md
│
├── guides/                      ← Tab: "Guides"
│   └── setup/
│       └── install.md           ← Renders at /guides/setup/install
│
├── blog/                        ← Tab: "Blog" (date-prefixed files)
│   ├── _config.md               ← layout: blog
│   ├── 2026-02-08-first-post.md
│   └── 2026-02-11-second-post.md
│
├── api/                         ← Tab: "API"
│   └── v1-users.json            ← Auto-rendered OpenAPI/Swagger spec
│
├── assets/
│   ├── images/                  ← Content images (auto-optimized)
│   │   └── diagram.png
│   └── css/
│       └── custom.css           ← Custom CSS override (optional)
│
└── .cache/                      ← Auto-generated, gitignored
    └── images/                  ← Processed image variants
```

### Key Rules

1. **Top-level folders** under `/content` become navigation tabs (linked via `nav.md`).
2. **Nested folders** create sidebar groups that are collapsible.
3. **Files** become pages. The filename (minus extension and numeric prefix) becomes the URL slug.
4. **`/private`** directory is the secure zone — never publicly accessible via URL.
5. **`nav.md`** is the single source of truth for the top navigation bar.
6. **`_brand.md`** controls white-label branding — logos, colors, footer, favicon.
7. **`_config.md`** files in any directory set layout and behavior for that subtree.
8. **Files prefixed with `_`** are configuration-only and never rendered as pages.
9. **`assets/`** directory serves static files through the image processing pipeline.
10. **`.cache/`** is auto-generated for processed image variants — add to `.gitignore`.

---

## File Types

### Markdown (`.md`) — Primary Content

All documentation pages are standard Markdown files with optional YAML frontmatter.

### JSON (`.json`) — API Specifications

OpenAPI/Swagger specs or Postman Collections placed in the `/api` directory are auto-rendered into browsable API documentation.

### Configuration Files

| File | Purpose |
|------|---------|
| `nav.md` | Top navigation bar links |
| `_brand.md` | White-label branding (logo, colors, footer) |
| `_config.md` | Per-directory layout and behavior settings |

---

## nav.md — Top Navigation Configuration

The `nav.md` file controls the top navigation bar. It uses a simple Markdown list of links.

```markdown
- [Briefs](/briefs)
- [Guides](/guides)
- [Blog](/blog)
- [API](/api)
```

### Rules

- Each list item is a `- [Label](/path)` link.
- The path must correspond to a top-level folder under `/content`.
- Order in the file determines order in the navigation bar.
- External links are supported: `- [GitHub](https://github.com/example)`.
- This is the ONLY way to define top-level navigation. There is no config file or setting.

---

## _brand.md — White-Label Configuration

The `_brand.md` file in the content root controls branding for the entire site. All fields are optional — a missing `_brand.md` produces a clean, unbranded f0 instance.

```yaml
---
logo: ./assets/images/logo.svg
logo_dark: ./assets/images/logo-dark.svg
favicon: ./assets/images/favicon.png
accent_color: "#2563eb"
header_style: logo_and_text
footer_text: "© 2026 Acme Corp. All rights reserved."
footer_links:
  - label: Privacy
    url: /privacy
  - label: Terms
    url: /terms
custom_css: ./assets/css/custom.css
og_image: ./assets/images/og-default.png
---
```

### Supported Fields

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `logo` | string | — | Path to logo image (relative to content dir) |
| `logo_dark` | string | (falls back to `logo`) | Logo for dark mode |
| `favicon` | string | — | Browser favicon |
| `accent_color` | string | — | Hex color for links, buttons, active states (e.g. `"#2563eb"`) |
| `header_style` | string | `text_only` | One of: `logo_only`, `logo_and_text`, `text_only` |
| `footer_text` | string | — | Copyright or footer text |
| `footer_links` | array | `[]` | Footer navigation links (`label` + `url` pairs) |
| `custom_css` | string | — | Path to custom CSS file for style overrides |
| `og_image` | string | — | Default OpenGraph image for social sharing |

### Design Principle

Brand config is per-deployment, not per-environment. A studio can run the same f0 Docker image for 10 clients, each with a different content volume containing its own `_brand.md`. No code changes, no forks, no custom builds.

---

## Frontmatter

Every Markdown file supports optional YAML frontmatter at the top of the file, delimited by `---`.

```yaml
---
title: Getting Started
description: Learn how to set up f0 in under 5 minutes
order: 1
draft: false
---
```

### Supported Fields

| Field | Type | Required | Default | Purpose |
|-------|------|----------|---------|---------|
| `title` | string | No | First H1 in content | Page title (browser tab, sidebar, SEO, OG) |
| `description` | string | No | — | Meta description for SEO and social sharing |
| `order` | number | No | 999 | Sort position within its directory |
| `draft` | boolean | No | false | If `true`, page is hidden from navigation |

### Blog-Specific Frontmatter

Files in a directory with `layout: blog` in its `_config.md` support additional fields:

```yaml
---
title: Building a Filesystem CMS
description: Why we chose the filesystem over a database
date: 2026-02-11
author: Jane Doe
tags:
  - architecture
  - design
cover_image: ./assets/images/cover.png
excerpt: A short summary for blog listings and social previews.
pinned: false
---
```

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `date` | string | Extracted from filename | ISO date for sorting and display |
| `author` | string | — | Author name |
| `tags` | array | `[]` | Tags for filtering and categorization |
| `cover_image` | string | — | Cover image path (used for OG image and blog listing) |
| `excerpt` | string | — | Short summary for listings and social previews |
| `pinned` | boolean | false | Pinned posts appear first in blog listings |

### Title Resolution Order

1. Frontmatter `title` field (highest priority)
2. First `# H1` heading in the document body
3. Filename transformed to title case (fallback)

---

## Content Ordering

Files within a directory are sorted by the following priority:

1. **Frontmatter `order` value** — Lowest number appears first.
2. **Filename numeric prefix** — Files starting with `01-`, `02-`, etc.
3. **Date prefix for blog** — Files like `2026-02-11-post-title.md` sort by date (newest first).
4. **Alphabetical by title** — Final fallback.

### Example

```
content/guides/
├── 01-introduction.md      → Appears first (prefix: 01)
├── 02-setup.md             → Appears second (prefix: 02)
├── advanced-topics.md      → Appears last (no prefix, order: 999)
```

You can also use frontmatter to override filename ordering:

```yaml
---
title: Advanced Topics
order: 0
---
```

This would push "Advanced Topics" to the very top regardless of filename.

---

## Markdown Syntax Reference

f0 supports **GitHub Flavored Markdown (GFM)** plus custom extensions.

### Standard GFM

```markdown
**Bold text**
*Italic text*
~~Strikethrough~~
`inline code`
[Link text](https://example.com)
![Image alt text](./assets/images/photo.png)
```

### Headings

```markdown
# H1 — Page Title (use exactly ONE per page)
## H2 — Major Section (appears in right-side TOC)
### H3 — Subsection (appears in right-side TOC)
#### H4 — Minor heading (does NOT appear in TOC)
```

**Best Practice:** Structure every page with a single H1, then H2s for major sections, and H3s for subsections. The right-side Table of Contents is auto-generated from H2 and H3 headings only.

### Code Blocks

````markdown
```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}
```
````

Supported languages include: JavaScript, TypeScript, Python, Bash, JSON, YAML, SQL, HTML, CSS, and many more. Syntax highlighting is handled by `rehype-highlight`.

Every code block automatically gets a **copy button** in the rendered UI.

**Warning:** Avoid Unicode box-drawing characters (┌─│└→) inside code blocks — they can cause the syntax highlighter to fail. Use ASCII alternatives instead.

### Tables

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Task Lists

```markdown
- [x] Completed task
- [ ] Pending task
- [ ] Another task
```

### Blockquotes

```markdown
> This is a blockquote.
> It can span multiple lines.
```

---

## Custom Syntax Extensions

### Callout Boxes

Use triple-colon (`:::`) fenced blocks for callout boxes:

```markdown
:::info
This is an informational callout. Use for tips and general notes.
:::

:::warning
This is a warning callout. Use for cautions and important notices.
:::

:::error
This is an error/danger callout. Use for critical warnings and breaking changes.
:::

:::success
This is a success callout. Use for confirmations and positive outcomes.
:::

:::tip
This is a tip callout.
:::

:::note
This is a note callout.
:::

:::danger
This is a danger callout (alias for error).
:::
```

Callout blocks support full Markdown inside them — paragraphs, code, links, lists, etc.

### YouTube Embeds

```markdown
::youtube[Video Title]{id=dQw4w9WgXcQ}
```

Replace the `id` value with the actual YouTube video ID. The video will be rendered as a responsive embed in the UI and converted to `[Video: Title - URL]` in the `/llms.txt` output.

### Generic Embeds

Embed content from supported platforms using the `::embed` directive:

```markdown
::embed[Walkthrough Video]{url=https://www.loom.com/share/abc123}
::embed[Design Mockup]{url=https://www.figma.com/file/xyz}
::embed[Code Sample]{url=https://gist.github.com/user/abc123}
::embed[External Article]{url=https://example.com/article}
```

#### Supported Providers

| Platform | Domains | Rendering |
|----------|---------|-----------|
| YouTube | youtube.com, youtu.be | Responsive iframe (16:9) |
| Loom | loom.com | Responsive iframe (16:9) |
| Figma | figma.com | Responsive iframe (4:3) |
| GitHub Gist | gist.github.com | Styled link card with icon |
| Any other URL | * | Styled link card with domain |

Unknown URLs are never silently dropped — they render as a styled link card with the title and a clickable URL.

#### Tri-brid Behavior

- **UI:** Platform-appropriate iframe or styled link card
- **SEO:** Semantic HTML with proper titles and links
- **LLM:** Converted to `[Loom Video: Title](URL)` or `[Link: Title](URL)` in `/llms.txt`

### Mermaid Diagrams

Inline diagrams using Mermaid syntax:

```markdown
::mermaid
graph TD
  A[Start] --> B[Process]
  B --> C[End]
::
```

Mermaid blocks render as styled code blocks. The diagram source code is preserved in `/llms.txt` output as `[Mermaid Diagram]` followed by the raw source, so AI agents can understand the diagram structure.

To enable client-side rendering of Mermaid diagrams into SVG, include the mermaid.js library in your `custom_css` or add it via a custom script — the `.mermaid` CSS class is already on the element.

### API Endpoint Blocks

Document API endpoints with method-colored badges:

```markdown
:::api GET /users/{id}
Get user by ID

Retrieves a specific user by their unique identifier.
:::

:::api POST /users
Create user

Creates a new user account with the provided information.
:::

:::api DELETE /users/{id}
Delete user

Permanently removes a user account.
:::
```

Supported HTTP methods and their badge colors:

| Method | Color |
|--------|-------|
| `GET` | Green |
| `POST` | Blue |
| `PUT` | Orange |
| `PATCH` | Purple |
| `DELETE` | Red |
| `OPTIONS` | Gray |
| `HEAD` | Gray |

Full Markdown is supported inside API blocks, including code examples, tables, and parameter lists.

---

## Images

### Placement

Store images in `content/assets/images/` (or any subfolder under `content/assets/`).

### Usage

```markdown
<!-- Relative path (portable — works in GitHub, VS Code, AND f0) -->
![Architecture Diagram](./assets/images/architecture.png)

<!-- Absolute path from content root -->
![Logo](/assets/images/logo.png)
```

### Automatic Image Optimization

Images referenced in Markdown are automatically wrapped in responsive `<picture>` elements with:

- **WebP srcset** at 400w, 800w, and 1200w widths
- **Lazy loading** (`loading="lazy"`) and async decoding
- **Fallback** to a resized original at 800w

SVGs and GIFs are excluded from responsive treatment (only get lazy loading).

### On-Demand Processing via URL

The asset endpoint supports query parameters for on-demand image processing:

```
/api/content/assets/images/photo.png              → Original file
/api/content/assets/images/photo.png?w=800        → Resized to 800px wide
/api/content/assets/images/photo.png?w=800&f=webp → Resized + WebP format
/api/content/assets/images/photo.png?w=400&q=80   → Resized, quality 80
```

Parameters: `w` (width), `h` (height), `f` (format: webp/avif/jpeg/png), `q` (quality: 1-100).

Processed variants are cached to disk (`content/.cache/images/`) with mtime-based invalidation. If processing fails for any reason, the original file is served.

### Path Portability

Authors write standard relative paths (`./assets/images/x.png`). These preview correctly in GitHub, VS Code, and any Markdown viewer. The remark pipeline resolves them to API URLs during rendering.

### LLM Behavior

Images are converted to `[Image: alt-text]` in the `/llms.txt` output, so always provide descriptive alt text.

### Asset Validation

When content files are parsed, all image references are validated against the filesystem. Missing assets produce structured log warnings with the exact image path and the file that references it. Pages still render — validation is warnings-only, never blocking.

---

## Content for Tri-Brid Rendering

Every piece of content you write is consumed three ways. Author with all three in mind:

### 1. Visual UI (Vue/HTML)

- Markdown is rendered to HTML via the remark/rehype pipeline.
- Code blocks get syntax highlighting and copy buttons.
- Callouts render as styled boxes. API blocks get colored method badges.
- Embeds render as responsive iframes or styled link cards.
- Images are wrapped in `<picture>` with responsive srcset and lazy loading.
- H2/H3 headings populate the right-side Table of Contents.

### 2. SEO (SSR HTML)

- Nuxt server-side renders every page as full HTML for crawlers.
- Frontmatter `title` becomes `<title>`, `og:title`, and `twitter:title`.
- Frontmatter `description` becomes `<meta name="description">`, `og:description`.
- Blog posts get `article:published_time`, `article:author`, and `article:tag` meta.
- `cover_image` becomes `og:image` for social sharing previews.
- A canonical `<link rel="canonical">` is generated from `NUXT_PUBLIC_SITE_URL` + path.
- `sitemap.xml` is auto-generated from the content directory.
- Heading hierarchy (H1 → H2 → H3) signals content structure to search engines.

### 3. AI/LLM Context (`/llms.txt`)

- All content is concatenated into a single plain-text stream.
- CSS, navbars, footers, and interactive elements are stripped.
- File paths are injected as context headers so the LLM understands hierarchy.
- Images become `[Image: alt-text]`, videos become `[Video: title - URL]`.
- Embeds become `[Platform: Title](URL)` text references.
- Mermaid diagrams preserve their source code for structural understanding.

**Example `/llms.txt` output:**

```
# Acme Docs - Documentation Context

> SYSTEM INFO: This document is optimized for LLM/AI agent ingestion.
> GENERATED: 2026-02-11T12:00:00Z

---

## PATH: Guides > Getting Started
(Source: guides/01-getting-started.md)

Getting Started
===============

Welcome to the documentation. This guide will help you...

---

## PATH: Api > Index
(Source: api/index.md)

Users API
=========

The Users API provides endpoints for managing user accounts...
```

---

## Writing Best Practices

### Structure

- **One H1 per page.** Use it as the page title or rely on frontmatter `title`.
- **Use H2 for major sections** — these become TOC entries and LLM section markers.
- **Use H3 for subsections** — these also appear in the TOC.
- **Keep pages focused.** One concept per page. Link between pages for cross-references.

### Naming

- **Filenames become URLs.** Use lowercase, hyphen-separated names: `getting-started.md` → `/getting-started`.
- **Folder names become URL segments.** `guides/auth/setup.md` → `/guides/auth/setup`.
- **Numeric prefixes control order** but are stripped from URLs: `01-intro.md` → `/intro`.
- **Date prefixes for blog posts:** `2026-02-11-post-title.md` → `/blog/post-title`.

### Content Quality for AI

- Write clear, self-contained sections. LLMs read the `/llms.txt` stream without visual context.
- Use descriptive alt text on images — it's the only thing AI agents see.
- Avoid relying on visual formatting (colors, layout) to convey meaning.
- Use explicit language: "see the section below" is meaningless to an LLM — use "see the Authentication Setup section" instead.
- Mermaid diagrams are preserved as source code in `/llms.txt` — AI agents can understand them.
- Embeds become text references — always provide a meaningful title in the `::embed` directive.

### API Documentation

- Use `:::api` blocks for inline endpoint documentation.
- For full OpenAPI/Swagger specs, drop `.json` files in the `/api` directory.
- Include request/response examples as JSON code blocks inside API blocks.
- Document error responses in a table format for clarity.

---

## Agent APIs (For Programmatic Access)

f0 exposes APIs for AI agents and retrieval systems:

### Full LLM Context

```
GET /llms.txt
```

Returns all public documentation concatenated as plain text, optimized for LLM ingestion. Cached and pre-computed at startup — serves in ~3ms.

### Scoped LLM Context

```
GET /llms.txt?section=guides         → Only /guides content
GET /llms.txt?section=api            → Only /api content
GET /llms.txt?section=guides/auth    → Only /guides/auth subtree
```

Section filtering lets agents fetch only what they need, staying within context window limits. The section parameter maps to a content subdirectory path.

### LLM Discovery Index

```
GET /llms-index.txt
```

Returns a table of contents of available sections with page counts and token estimates. This is the f0 equivalent of `robots.txt` for AI — agents read it first, then decide which section(s) to fetch.

Example output:

```
# Acme Docs — Documentation Index
> Generated: 2026-02-11T12:00:00Z

## Available Sections

/api          — 1 page, ~81 tokens
/blog         — 3 pages, ~1,144 tokens
/guides       — 4 pages, ~1,663 tokens

## Full Site: 9 pages, ~3,225 tokens

## Access

GET /llms.txt                    → Full documentation
GET /llms.txt?section=guides     → Guides only
```

### Semantic Search

```
GET /api/agents/search?q=query&limit=5&include_content=true
```

Parameters: `q` (required), `limit` (1-20, default 5), `include_content` (boolean), `section` (filter by nav section).

### Raw Markdown Download

```
GET /api/content/raw/{path}
```

Returns the raw Markdown source of any page. Supports `?download=true` for file download. Response headers include `X-Page-Title`, `X-Page-Path`, and `X-Word-Count`.

### Sitemap

```
GET /sitemap.xml
```

Auto-generated XML sitemap with `lastmod` from file mtimes, `changefreq` by content type (blog=weekly, docs=monthly), and `priority` by depth.

### RSS Feed

```
GET /feed.xml
```

RSS feed for blog content.

### Health & Readiness

```
GET /_health    → Liveness probe (always 200 if process alive)
GET /_ready     → Readiness probe (checks content directory accessible)
```

Both endpoints bypass authentication in private mode and return JSON with diagnostics.

---

## Content Validation CLI

f0 includes a standalone validation tool for checking content quality before deployment. No server required.

```bash
node bin/validate.mjs ./content
npm run validate -- ./content
```

### Checks Performed

| Check | Severity | Description |
|-------|----------|-------------|
| Frontmatter YAML validity | Error | Malformed YAML will crash the parser |
| Image reference existence | Warning | Broken image paths |
| Heading hierarchy | Warning | H1→H4 without H2/H3 confuses TOC |
| Title resolution | Warning | No title source (no frontmatter, no H1) |
| nav.md link targets | Warning | Links to directories that don't exist |
| Duplicate slugs | Error | Two files resolving to the same URL |
| File size | Warning | Files over 500KB (slow to parse) |
| Character encoding | Warning | Non-UTF-8 files |

### Exit Codes

- `0` — All checks passed (warnings are OK)
- `1` — Errors found (broken deployment)
- `2` — Invalid arguments

Example output:

```
f0 Content Validation
==================================================

Scanning ./content...

✓ nav.md parsed successfully (4 sections)
✓ 47 markdown files found
✓ 12 images found

Warnings:
  ⚠ guides/setup.md:8: Image not found: ./assets/images/old-diagram.png
  ⚠ api/users.md:45: Heading jump from H2 to H4 (skipped H3)

Errors:
  ✗ guides/advanced.md: Invalid YAML frontmatter (unterminated string)

Summary: 47 files, 1 errors, 2 warnings (40ms)
```

Integrate into CI/CD to gate deployments on content quality.

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `NUXT_PUBLIC_SITE_NAME` | `f0` | Site name (header, OG tags, RSS) |
| `NUXT_PUBLIC_SITE_DESCRIPTION` | `Documentation` | Default meta description |
| `NUXT_PUBLIC_SITE_URL` | — | Base URL for sitemap, canonical links, OG (e.g. `https://docs.acme.com`) |
| `CONTENT_DIR` | `./content` | Path to content directory |
| `AUTH_MODE` | `public` | `public` or `private` (email OTP auth) |

---

## Common Mistakes to Avoid

| Mistake | Why It Breaks | Fix |
|---------|---------------|-----|
| No `nav.md` file | Top navigation bar is empty | Create `content/nav.md` with list links |
| Multiple H1 headings | Confuses TOC and SEO | Use exactly one H1 per page |
| Unicode art in code blocks | Crashes syntax highlighter | Use ASCII characters only |
| Images without alt text | LLM output shows `[Image: ]` | Always write descriptive alt text |
| Files in `/private` directory | Publicly accessible via URL | Use the `/private` root directory (outside `/content`) |
| Spaces in filenames | Broken URLs | Use hyphens: `my-page.md` |
| Missing frontmatter `---` delimiters | Frontmatter rendered as content | Ensure opening AND closing `---` |
| Files over 1MB | Rejected by parser | Split into smaller pages |
| Broken image paths | Warning in logs, broken img in UI | Run `npm run validate` before deploying |
| Missing `_config.md` for blog | Blog features not active | Add `_config.md` with `layout: blog` to blog directory |
| No `NUXT_PUBLIC_SITE_URL` | Relative canonical/OG URLs | Set the env var for absolute URLs in sitemap and meta |

---

## Template: New Documentation Page

```markdown
---
title: Your Page Title
description: A brief description for SEO and previews
order: 1
---

# Your Page Title

Introduction paragraph explaining what this page covers.

## Prerequisites

What the reader needs before starting.

## Step 1: First Thing

Explanation of the first step.

\`\`\`bash
# Example command
npm install something
\`\`\`

## Step 2: Second Thing

Explanation of the second step.

:::info
Helpful tip related to this step.
:::

## Next Steps

Links to related pages and follow-up content.
```

---

## Template: API Documentation Page

```markdown
---
title: Users API
description: API reference for user management endpoints
order: 2
---

# Users API

The Users API provides endpoints for managing user accounts.

## Endpoints

:::api GET /users
List all users

Returns a paginated list of all users.
:::

:::api GET /users/{id}
Get user by ID

Retrieves a specific user by their unique identifier.
:::

:::api POST /users
Create user

Creates a new user account.
:::

\`\`\`json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "admin"
}
\`\`\`

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request — Invalid parameters |
| 401 | Unauthorized — Missing or invalid token |
| 404 | Not Found — User doesn't exist |

## Rate Limiting

:::warning
API requests are rate-limited to 100 requests per minute per API key.
:::
```

---

## Template: Blog Post

```markdown
---
title: Announcing Our New Feature
description: A deep dive into what we shipped and why
date: 2026-02-11
author: Jane Doe
tags:
  - announcements
  - features
cover_image: ./assets/images/feature-launch.png
excerpt: We shipped the thing. Here's the story of how and why.
---

# Announcing Our New Feature

Opening paragraph with the key message.

## The Problem

What we were trying to solve.

## Our Approach

How we thought about the solution.

::embed[Design Exploration]{url=https://www.figma.com/file/abc123}

## Implementation

Technical details.

::mermaid
graph LR
  A[Request] --> B{Cache?}
  B -->|Hit| C[Serve]
  B -->|Miss| D[Process]
  D --> C
::

\`\`\`typescript
const result = await processContent(file)
\`\`\`

## What's Next

Links to follow-up content and related pages.
```

---

## Template: _brand.md (White-Label)

```yaml
---
logo: ./assets/images/logo.svg
logo_dark: ./assets/images/logo-dark.svg
favicon: ./assets/images/favicon.png
accent_color: "#2563eb"
header_style: logo_and_text
footer_text: "© 2026 Acme Corp. All rights reserved."
footer_links:
  - label: Privacy
    url: /privacy
  - label: Terms
    url: /terms
  - label: Status
    url: https://status.acme.com
custom_css: ./assets/css/custom.css
og_image: ./assets/images/og-default.png
---
```
