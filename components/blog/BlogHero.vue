<!--
  F0 - BLOG HERO
  Full-bleed background image header for blog index pages.
  
  HOW IT WORKS:
  The layout uses position:fixed sidebar + margin-left on .main-content.
  To make the hero full-bleed, we inject a <style> tag into <head> on mount
  that overrides all layout constraints. On unmount, the style is removed
  and the normal 3-column layout returns.
  
  This approach guarantees specificity wins — the injected rules use
  !important and target every selector that constrains .main-content.
-->

<template>
  <section class="blog-hero" :style="heroStyle">
    <div class="blog-hero-overlay" />
    
    <div class="blog-hero-content">
      <div class="blog-hero-rule" />
      <p v-if="siteName" class="blog-hero-eyebrow">{{ siteName }}</p>
      <h1 class="blog-hero-title">{{ title }}</h1>
      <p v-if="subtitle || description" class="blog-hero-description">
        {{ subtitle || description }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle?: string
  description?: string
  image: string
  siteName?: string
}>()

const heroStyle = computed(() => ({
  backgroundImage: `url(${props.image})`,
}))

// ---------------------------------------------------------------------------
// LAYOUT OVERRIDE — Injected <style> tag
// ---------------------------------------------------------------------------
// We inject a <style> tag that forces full-bleed layout by hiding the
// sidebar/TOC and removing all margin/max-width constraints on .main-content.
// This covers: default state, sidebar-collapsed state, and media queries.

const STYLE_ID = 'f0-hero-mode-override'

onMounted(() => {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    /* Hero mode: hide sidebar and TOC, make main-content full-width */
    .sidebar {
      display: none !important;
    }
    .toc {
      display: none !important;
    }
    .main-content {
      margin-left: 0 !important;
      max-width: 100% !important;
      padding: 0 !important;
    }
    .content-wrapper {
      max-width: 100% !important;
    }
    /* Override any page-level wrapper (e.g. .home-page) that caps width */
    .content-wrapper > * {
      max-width: 100% !important;
    }
    /* Also override sidebar-collapsed state */
    .sidebar-collapsed .main-content {
      margin-left: 0 !important;
      max-width: 100% !important;
    }
    .sidebar-collapsed .sidebar {
      display: none !important;
    }
  `
  document.head.appendChild(style)
})

onUnmounted(() => {
  if (typeof document === 'undefined') return
  const el = document.getElementById(STYLE_ID)
  if (el) el.remove()
})
</script>

<style scoped>
.blog-hero {
  position: relative;
  width: 100%;
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.blog-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.35) 0%,
    rgba(0, 0, 0, 0.50) 40%,
    rgba(0, 0, 0, 0.65) 100%
  );
  z-index: 1;
}

.blog-hero-content {
  position: relative;
  z-index: 2;
  max-width: 720px;
  padding: var(--spacing-12, 3rem) var(--spacing-6, 1.5rem);
}

.blog-hero-rule {
  width: 72px;
  height: 4px;
  background-color: var(--color-accent, #e53e3e);
  margin: 0 auto var(--spacing-5, 1.25rem);
  border-radius: 2px;
}

.blog-hero-eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 var(--spacing-3, 0.75rem) 0;
}

.blog-hero-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  line-height: 1.05;
  color: #ffffff;
  margin: 0 0 var(--spacing-8, 2rem) 0;
  letter-spacing: -0.035em;
}

.blog-hero-description {
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 auto;
  max-width: 600px;
  font-weight: 400;
}

@media (max-width: 768px) {
  .blog-hero {
    min-height: 400px;
  }
  .blog-hero-content {
    padding: var(--spacing-8, 2rem) var(--spacing-4, 1rem);
  }
}
</style>
