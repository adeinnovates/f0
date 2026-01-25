<!--
=============================================================================
F0 - THEME TOGGLE COMPONENT
=============================================================================

A button to toggle between light and dark themes.
Shows sun icon for light mode, moon icon for dark mode.

USAGE:
<ThemeToggle />
-->

<template>
  <button
    class="theme-toggle"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <span v-if="mounted && isDark" class="theme-icon">☀️</span>
    <span v-else class="theme-icon">🌙</span>
  </button>
</template>

<script setup lang="ts">
const { isDark, toggle } = useTheme()

// Track if component is mounted (for SSR hydration)
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
  font-size: 18px;
  line-height: 1;
}

.theme-toggle:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-accent);
  transform: scale(1.05);
}

.theme-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
