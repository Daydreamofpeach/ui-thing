export default defineNuxtPlugin(() => {
  // Only run on client side
  if (import.meta.client) {
    // Get config store
    const { theme, fonts } = useConfigStore()
    
    // Apply theme on page load
    const applyTheme = () => {
      if (theme.value) {
        const allColors = [
          "matter", "buildit", "lucide", "grove", "cyberpunk", "bubblegum",
          "midnight", "solardark", "zinc", "rose", "blue", "green", "orange",
          "red", "slate", "stone", "gray", "neutral", "yellow", "violet", "brutalism"
        ]
        
        // Remove all theme classes
        document.documentElement.classList.remove(...allColors.map((color) => `theme-${color}`))
        
        // Add current theme class
        document.documentElement.classList.add(`theme-${theme.value}`)
      }
    }
    
    // Apply fonts on page load
    const applyFonts = async () => {
      if (fonts.value) {
        const { getFontFamily } = await import('~/utils/fonts')
        
        // Apply heading font
        if (fonts.value.heading) {
          const headingFont = getFontFamily(fonts.value.heading)
          document.documentElement.style.setProperty('--font-heading', headingFont)
        }
        
        // Apply body font
        if (fonts.value.body) {
          const bodyFont = getFontFamily(fonts.value.body)
          document.documentElement.style.setProperty('--font-body', bodyFont)
        }
        
        // Apply mono font
        if (fonts.value.mono) {
          const monoFont = getFontFamily(fonts.value.mono)
          document.documentElement.style.setProperty('--font-mono', monoFont)
        }
      }
    }
    
    // Apply theme and fonts immediately
    applyTheme()
    applyFonts()
    
    // Watch for changes and reapply
    watch(theme, applyTheme)
    watch(fonts, applyFonts, { deep: true })
  }
})
