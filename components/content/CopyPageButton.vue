<!--
=============================================================================
F0 - COPY PAGE BUTTON
=============================================================================

A dropdown button that allows users to copy the entire page content
in different formats (plain text, markdown, or HTML).

Similar to Notion's "Copy page" feature.

USAGE:
<CopyPageButton :content="pageContent" :title="pageTitle" />
-->

<template>
  <div class="copy-page-wrapper" ref="wrapperRef">
    <button
      class="copy-page-btn"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      aria-haspopup="true"
    >
      <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span>Copy page</span>
      <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
    
    <Transition name="dropdown">
      <div v-if="isOpen" class="copy-dropdown">
        <button class="dropdown-item" @click="copyAsText">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Copy as plain text</span>
        </button>
        
        <button class="dropdown-item" @click="copyAsMarkdown">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M8 13h2l1 2 2-4 1 2h2"></path>
          </svg>
          <span>Copy as Markdown</span>
        </button>
        
        <button class="dropdown-item" @click="copyLink">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span>Copy link to page</span>
        </button>
        
        <div class="dropdown-divider"></div>
        
        <button class="dropdown-item" @click="downloadMarkdown">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Download .md file</span>
        </button>
      </div>
    </Transition>
    
    <!-- Toast notification -->
    <Transition name="toast">
      <div v-if="showToast" class="copy-toast">
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** HTML content of the page */
  content?: string
  /** Markdown content (original source) */
  markdown?: string
  /** Page title */
  title?: string
  /** Page path for download endpoint */
  path?: string
}

const props = defineProps<Props>()

const isOpen = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const wrapperRef = ref<HTMLElement | null>(null)

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

/**
 * Show a toast notification
 */
function showNotification(message: string) {
  toastMessage.value = message
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

/**
 * Convert HTML to plain text
 */
function htmlToPlainText(html: string): string {
  // Create a temporary element
  const temp = document.createElement('div')
  temp.innerHTML = html
  
  // Handle code blocks - preserve them with indentation
  temp.querySelectorAll('pre code').forEach(code => {
    const text = code.textContent || ''
    code.textContent = '\n' + text.split('\n').map(line => '    ' + line).join('\n') + '\n'
  })
  
  // Handle lists
  temp.querySelectorAll('li').forEach(li => {
    li.textContent = '• ' + li.textContent
  })
  
  // Handle headings - add extra newlines
  temp.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
    heading.textContent = '\n' + heading.textContent + '\n'
  })
  
  // Get text content
  let text = temp.textContent || temp.innerText || ''
  
  // Clean up excessive whitespace
  text = text
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  
  // Add title if present
  if (props.title) {
    text = props.title + '\n' + '='.repeat(props.title.length) + '\n\n' + text
  }
  
  return text
}

/**
 * Convert HTML back to Markdown (best effort)
 */
function htmlToMarkdown(html: string): string {
  // If we have the original markdown, use it
  if (props.markdown) {
    return props.markdown
  }
  
  // Otherwise, do basic conversion
  let md = html
  
  // Convert headings
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
  
  // Convert bold/italic
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
  md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**')
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*')
  md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*')
  
  // Convert code
  md = md.replace(/<code>(.*?)<\/code>/gi, '`$1`')
  
  // Convert links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
  
  // Convert lists
  md = md.replace(/<li>(.*?)<\/li>/gi, '- $1\n')
  md = md.replace(/<\/?[uo]l[^>]*>/gi, '\n')
  
  // Convert paragraphs
  md = md.replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
  
  // Convert line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n')
  
  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, '')
  
  // Decode HTML entities
  md = md
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
  
  // Clean up whitespace
  md = md
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  
  // Add title if present
  if (props.title) {
    md = `# ${props.title}\n\n${md}`
  }
  
  return md
}

/**
 * Copy page as plain text
 */
async function copyAsText() {
  try {
    const text = htmlToPlainText(props.content || '')
    await navigator.clipboard.writeText(text)
    showNotification('Copied as plain text')
    closeDropdown()
  } catch (err) {
    console.error('Failed to copy:', err)
    showNotification('Failed to copy')
  }
}

/**
 * Copy page as Markdown
 */
async function copyAsMarkdown() {
  try {
    const md = htmlToMarkdown(props.content || '')
    await navigator.clipboard.writeText(md)
    showNotification('Copied as Markdown')
    closeDropdown()
  } catch (err) {
    console.error('Failed to copy:', err)
    showNotification('Failed to copy')
  }
}

/**
 * Copy link to current page
 */
async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    showNotification('Link copied')
    closeDropdown()
  } catch (err) {
    console.error('Failed to copy:', err)
    showNotification('Failed to copy')
  }
}

/**
 * Download raw markdown file
 */
function downloadMarkdown() {
  try {
    // Get the current path from props or window location
    const pagePath = props.path || window.location.pathname
    const cleanPath = pagePath.replace(/^\//, '') || 'home'
    
    // Create download URL
    const downloadUrl = `/api/content/raw/${cleanPath}?download=true`
    
    // Create a link and trigger download
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `${cleanPath.replace(/\//g, '-')}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showNotification('Downloading...')
    closeDropdown()
  } catch (err) {
    console.error('Failed to download:', err)
    showNotification('Failed to download')
  }
}

// Close dropdown when clicking outside
onMounted(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
      closeDropdown()
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>

<style scoped>
.copy-page-wrapper {
  position: relative;
}

.copy-page-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.copy-page-btn:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-secondary);
  color: var(--color-text-primary);
}

.copy-icon {
  width: 16px;
  height: 16px;
}

.chevron-icon {
  width: 14px;
  height: 14px;
  margin-left: var(--spacing-1);
}

/* Dropdown */
.copy-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--spacing-2);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);
  min-width: 200px;
  padding: var(--spacing-2);
  z-index: 50;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.dropdown-item:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.dropdown-item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--color-border-primary);
  margin: var(--spacing-2) 0;
}

/* Toast notification */
.copy-toast {
  position: fixed;
  bottom: var(--spacing-6);
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-text-primary);
  color: var(--color-bg-primary);
  padding: var(--spacing-3) var(--spacing-5);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: 500;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>
