---
title: "The Tri-Brid Rendering Strategy"
date: 2026-02-10
author: SA
tags: [engineering, ai, seo]
excerpt: How f0 serves the same content three ways — visual UI for humans, SSR HTML for search engines, and structured text for AI agents.
---

# The Tri-Brid Rendering Strategy

Modern documentation needs to serve three very different audiences from the same source material.

## Three Audiences, One Source

1. **Humans** need a clean, navigable UI with syntax highlighting, collapsible sidebars, and dark mode
2. **Search engines** need server-rendered HTML with proper semantic structure and meta tags
3. **AI agents** need context-dense plain text without navigation chrome or styling artifacts

## How It Works

Every Markdown file in f0 flows through a single remark/rehype pipeline. The same source produces:

- **HTML** — Rendered by Vue components in the browser
- **SSR HTML** — Pre-rendered by Nuxt for crawlers
- **Plain text** — Served at `/llms.txt` for AI consumption

```typescript
// Same source, three outputs
const parsed = await parseMarkdown(content)
// parsed.html → Browser rendering
// SSR HTML → Search engine crawling  
// parsed.plainText → /llms.txt output
```

## The `/llms.txt` Endpoint

The `/llms.txt` route concatenates all documentation into a single, structured text file:

```
## PATH: Guides > Authentication > Setup
(Source: guides/auth/setup.md)

Authentication requires an email on the allowlist...
```

No HTML tags. No CSS classes. No navigation elements. Just content with structural metadata that helps LLMs understand the document hierarchy.

## Why This Matters

As AI agents become a primary way people access documentation, treating them as a first-class audience isn't optional — it's table stakes.
