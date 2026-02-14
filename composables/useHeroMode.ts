/**
 * =============================================================================
 * F0 - HERO MODE COMPOSABLE
 * =============================================================================
 * 
 * Shared state that signals to the layout that a full-bleed hero is active.
 * When active, the layout hides sidebar/TOC and makes main-content full-width.
 * 
 * Used by BlogIndex (activates when heroImage present) and default layout
 * (applies CSS class that triggers full-width mode).
 */

export function useHeroMode() {
  const isHeroMode = useState<boolean>('f0-hero-mode', () => false)

  function activateHero() {
    isHeroMode.value = true
  }

  function deactivateHero() {
    isHeroMode.value = false
  }

  return {
    isHeroMode: computed(() => isHeroMode.value),
    activateHero,
    deactivateHero,
  }
}
