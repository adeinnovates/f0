<!--
=============================================================================
F0 - SEARCH MODAL COMPONENT
=============================================================================

A command-palette style search modal triggered by Cmd/Ctrl+K.
Provides instant search across all documentation.

USAGE:
<SearchModal />
-->

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="search-overlay"
        @click.self="closeSearch"
      >
        <div class="search-modal" role="dialog" aria-modal="true" aria-label="Search documentation">
          <!-- Search Input -->
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              ref="searchInput"
              type="text"
              class="search-input"
              placeholder="Search documentation..."
              :value="query"
              @input="onInput"
              @keydown="onKeydown"
            />
            <kbd class="search-shortcut">ESC</kbd>
          </div>
          
          <!-- Results -->
          <div class="search-results">
            <!-- Loading State -->
            <div v-if="isLoading" class="search-loading">
              <span class="loading-spinner"></span>
              Searching...
            </div>
            
            <!-- Empty State (before search) -->
            <div v-else-if="!query || query.length < 2" class="search-empty">
              <p>Type to search documentation</p>
              <div class="search-tips">
                <span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
                <span><kbd>↵</kbd> to select</span>
                <span><kbd>ESC</kbd> to close</span>
              </div>
            </div>
            
            <!-- No Results -->
            <div v-else-if="results.length === 0" class="search-no-results">
              <p>No results found for "<strong>{{ query }}</strong>"</p>
              <p class="search-suggestion">Try different keywords or check spelling</p>
            </div>
            
            <!-- Results List -->
            <div v-else class="search-results-list">
              <button
                v-for="(result, index) in results"
                :key="result.path"
                class="search-result"
                :class="{ active: selectedIndex === index }"
                @click="selectResult(result)"
                @mouseenter="selectedIndex = index"
              >
                <div class="search-result-header">
                  <span class="search-result-section">{{ result.section }}</span>
                  <span class="search-result-title">{{ result.title }}</span>
                </div>
                <p class="search-result-excerpt" v-html="highlightMatches(result.excerpt)"></p>
              </button>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="search-footer">
            <span class="search-footer-hint">
              <kbd>⌘</kbd><kbd>K</kbd> to search anywhere
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { isOpen, query, results, isLoading, closeSearch, search, goToResult } = useSearch()

const searchInput = ref<HTMLInputElement | null>(null)
const selectedIndex = ref(0)

// Focus input when modal opens
watch(isOpen, (open) => {
  if (open) {
    selectedIndex.value = 0
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})

// Reset selection when results change
watch(results, () => {
  selectedIndex.value = 0
})

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  search(target.value)
}

function onKeydown(e: KeyboardEvent) {
  const resultCount = results.value.length
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      if (resultCount > 0) {
        selectedIndex.value = (selectedIndex.value + 1) % resultCount
      }
      break
      
    case 'ArrowUp':
      e.preventDefault()
      if (resultCount > 0) {
        selectedIndex.value = (selectedIndex.value - 1 + resultCount) % resultCount
      }
      break
      
    case 'Enter':
      e.preventDefault()
      if (resultCount > 0 && results.value[selectedIndex.value]) {
        selectResult(results.value[selectedIndex.value])
      }
      break
  }
}

function selectResult(result: { title: string; path: string; excerpt: string; section: string }) {
  goToResult(result)
}

function highlightMatches(text: string): string {
  if (!query.value) return escapeHtml(text)
  
  const terms = query.value.toLowerCase().split(/\s+/).filter(t => t.length > 1)
  let result = escapeHtml(text)
  
  for (const term of terms) {
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi')
    result = result.replace(regex, '<mark>$1</mark>')
  }
  
  return result
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>

<style scoped>
/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .search-modal,
.modal-leave-active .search-modal {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.modal-enter-from .search-modal,
.modal-leave-to .search-modal {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
}

/* Overlay */
.search-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

/* Modal */
.search-modal {
  width: 100%;
  max-width: 600px;
  margin: 0 var(--spacing-4);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

/* Search Input */
.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-border-primary);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-shortcut {
  font-size: var(--font-size-xs);
  padding: var(--spacing-1) var(--spacing-2);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
}

/* Results */
.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.search-loading,
.search-empty,
.search-no-results {
  padding: var(--spacing-8) var(--spacing-4);
  text-align: center;
  color: var(--color-text-muted);
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border-primary);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-tips {
  display: flex;
  justify-content: center;
  gap: var(--spacing-4);
  margin-top: var(--spacing-4);
  font-size: var(--font-size-sm);
}

.search-tips kbd {
  font-size: var(--font-size-xs);
  padding: 2px 6px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-sm);
  margin-right: 2px;
}

.search-suggestion {
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-2);
}

/* Results List */
.search-results-list {
  padding: var(--spacing-2);
}

.search-result {
  display: block;
  width: 100%;
  text-align: left;
  padding: var(--spacing-3) var(--spacing-4);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.search-result:hover,
.search-result.active {
  background-color: var(--color-bg-secondary);
}

.search-result-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-1);
}

.search-result-section {
  font-size: var(--font-size-xs);
  color: var(--color-accent);
  font-weight: 500;
}

.search-result-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.search-result-excerpt {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.search-result-excerpt :deep(mark) {
  background-color: var(--color-accent);
  color: white;
  padding: 0 2px;
  border-radius: 2px;
}

/* Footer */
.search-footer {
  padding: var(--spacing-3) var(--spacing-4);
  border-top: 1px solid var(--color-border-primary);
  background-color: var(--color-bg-secondary);
}

.search-footer-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.search-footer-hint kbd {
  font-size: 10px;
  padding: 2px 4px;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-sm);
  margin-right: 2px;
}
</style>
