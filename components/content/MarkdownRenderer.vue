<!--
=============================================================================
F0 - MARKDOWN RENDERER COMPONENT
=============================================================================

Renders HTML content from parsed markdown with:
- Automatic code copy buttons
- Smooth scroll to headings
- Image lazy loading
- TOC injection into layout
- Copy page button

USAGE:
<ContentMarkdownRenderer :html="parsedHtml" :toc="tocItems" :title="pageTitle" :markdown="rawMarkdown" />

PROPS:
- html: string - Pre-rendered HTML from the markdown parser
- toc: TocItem[] - Table of contents items
- title: string - Page title (optional)
- markdown: string - Raw markdown source (optional, for copy feature)
-->

<template>
  <div class="markdown-page">
    <!-- Page header with title and copy button -->
    <div class="page-header" v-if="title || !htmlHasH1">
      <h1 v-if="title && !htmlHasH1" class="page-title">{{ title }}</h1>
      <div class="page-actions">
        <ContentCopyPageButton :content="html" :markdown="markdown" :title="title" />
      </div>
    </div>
    
    <!-- Copy button for pages with H1 in content -->
    <div class="page-actions-float" v-else>
      <ContentCopyPageButton :content="html" :markdown="markdown" :title="title" />
    </div>
    
    <!-- Rendered content -->
    <div
      ref="contentRef"
      class="markdown-content"
      v-html="html"
    />
  </div>
</template>

<script setup lang="ts">
import type { TocItem } from '~/server/utils/markdown'

// Props
const props = defineProps<{
  html: string
  toc?: TocItem[]
  title?: string
  markdown?: string
}>()

// Check if HTML already has an H1
const htmlHasH1 = computed(() => {
  return props.html?.includes('<h1')
})

const contentRef = ref<HTMLElement | null>(null)

// Add copy functionality to code blocks
function setupCopyButtons() {
  if (!contentRef.value) return
  
  const copyButtons = contentRef.value.querySelectorAll('.copy-button')
  
  copyButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const codeBlock = button.closest('.code-block')
      const code = codeBlock?.querySelector('code')
      
      if (code) {
        try {
          await navigator.clipboard.writeText(code.textContent || '')
          
          // Show copied feedback
          const originalText = button.textContent
          button.textContent = 'Copied!'
          button.classList.add('copied')
          
          setTimeout(() => {
            button.textContent = originalText
            button.classList.remove('copied')
          }, 2000)
        } catch (err) {
          console.error('Failed to copy:', err)
        }
      }
    })
  })
}

// Setup external link handling
function setupExternalLinks() {
  if (!contentRef.value) return
  
  const links = contentRef.value.querySelectorAll('a')
  
  links.forEach((link) => {
    const href = link.getAttribute('href')
    
    // External links open in new tab
    if (href?.startsWith('http://') || href?.startsWith('https://')) {
      link.setAttribute('target', '_blank')
      link.setAttribute('rel', 'noopener noreferrer')
    }
  })
}

// Setup lazy loading for images
function setupLazyImages() {
  if (!contentRef.value) return
  
  const images = contentRef.value.querySelectorAll('img')
  
  images.forEach((img) => {
    img.setAttribute('loading', 'lazy')
  })
}

// Run setup after mount and when HTML changes
onMounted(() => {
  setupCopyButtons()
  setupExternalLinks()
  setupLazyImages()
})

watch(() => props.html, () => {
  // Wait for DOM update
  nextTick(() => {
    setupCopyButtons()
    setupExternalLinks()
    setupLazyImages()
  })
})
</script>

<style scoped>
.markdown-page {
  position: relative;
}

/* Page header with title and actions */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.page-header .page-title {
  margin: 0;
  flex: 1;
}

.page-actions {
  flex-shrink: 0;
}

/* Floating copy button for pages with H1 in content */
.page-actions-float {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
}

.markdown-content {
  /* Typography handled by global styles */
}

/* Ensure content takes full width */
.markdown-content :deep(> *:first-child) {
  margin-top: 0;
}

.markdown-content :deep(> *:last-child) {
  margin-bottom: 0;
}

/* Heading anchor links */
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4) {
  scroll-margin-top: calc(var(--header-height) + var(--spacing-6));
}

/* Code blocks already styled globally, but ensure no overflow */
.markdown-content :deep(pre) {
  max-width: 100%;
  overflow-x: auto;
}

/* Images */
.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
}

/* Tables responsive wrapper */
.markdown-content :deep(table) {
  display: block;
  max-width: 100%;
  overflow-x: auto;
}

/* Adjust first heading when floating copy button is present */
.page-actions-float + .markdown-content :deep(h1:first-child) {
  padding-right: 140px; /* Make room for copy button */
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-3);
  }
  
  .page-actions-float {
    position: static;
    margin-bottom: var(--spacing-4);
  }
  
  .page-actions-float + .markdown-content :deep(h1:first-child) {
    padding-right: 0;
  }
}
</style>
