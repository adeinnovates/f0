---
title: Building a Filesystem CMS
description: Why we chose the filesystem over a database
date: 2026-02-11
author: SA
tags: [engineering, architecture, f0]
excerpt: We explored three approaches to content management and landed on the simplest one — the filesystem itself.
pinned: true
---

# Building a Filesystem CMS

When we set out to build f0, we faced the classic CMS question: where does the content live?

## The Options

We evaluated three approaches:

1. **Database-backed CMS** — Store content in PostgreSQL or MongoDB
2. **Headless CMS** — Use a third-party service like Contentful or Sanity
3. **Filesystem** — Just use `.md` files in directories

## Why Filesystem Won

The filesystem approach won for several reasons:

- **Zero dependencies** — No database to manage, no API keys to configure
- **Git-native** — Content is versioned alongside code
- **Universal tooling** — Every text editor can create content
- **Portable** — Move your docs by copying a folder

:::info
The filesystem-as-CMS model is one of f0's nine inviolable architectural constraints.
:::

## The Directory Convention

In f0, directory structure *is* site structure:

```
content/
├── nav.md           → Top navigation
├── home.md          → Landing page
├── guides/
│   ├── getting-started.md
│   └── configuration.md
└── api/
    └── reference.json
```

Every file maps to a URL. No routing tables, no database queries. Just files.

## Trade-offs

This approach isn't perfect. You lose real-time collaboration, full-text search at scale, and complex querying. But for documentation and blogs — which are fundamentally *publishing* tools — the filesystem is more than enough.

The simplest solution is often the best one.
