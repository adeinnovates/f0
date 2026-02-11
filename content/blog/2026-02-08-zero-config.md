---
title: Zero-Config Documentation
date: 2026-02-08
author: SA
tags: [f0, devex, architecture]
excerpt: Drop Markdown files into a folder and have a fully-functional documentation site. No configuration required.
---

# Zero-Config Documentation

The best developer tool is the one that works before you configure it.

## The Problem

Most documentation frameworks require significant setup:

- Install dependencies
- Configure routing
- Set up a build pipeline
- Define content schemas
- Configure deployment

By the time you write your first doc, you've spent an hour on scaffolding.

## The f0 Approach

With f0, the minimum viable documentation site is:

```
content/
└── home.md
```

That's it. One Markdown file. f0 handles everything else:

- Navigation is auto-generated from the filesystem
- Styling uses Pico.css with sensible defaults
- SSR works out of the box
- `/llms.txt` is generated automatically
- Dark mode follows system preferences

## Convention Over Configuration

f0 follows the principle of **convention over configuration**. Want to add a guides section? Create a `guides/` folder. Want to reorder pages? Prefix filenames with numbers. Want top navigation? Create a `nav.md` file.

Every feature has a zero-config default and an opt-in configuration path. You configure *only what you want to change*.

:::tip
This principle extends to the new blog mode. Set `F0_MODE=blog` and drop Markdown files — instant blog, no config needed.
:::

## The 80/20 Rule

We intentionally don't support every possible documentation feature. We focus on the 80% of features that serve 95% of use cases, and we make those features work perfectly out of the box.
