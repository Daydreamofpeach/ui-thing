<template>
  <div class="w-full space-y-6">
    <!-- Theme Settings -->
    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Theme Settings</UiCardTitle>
        <UiCardDescription>Customize your application theme and appearance</UiCardDescription>
      </UiCardHeader>
      <UiCardContent class="space-y-4">
        <!-- Theme Selection -->
        <div class="space-y-2">
          <UiLabel>Theme</UiLabel>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            <UiButton
              v-for="color in allColors"
              :key="color"
              :variant="selectedTheme === color ? 'default' : 'outline'"
              :class="`theme-${color}`"
              class="h-12 w-full justify-start"
              @click="updateTheme(color)"
            >
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-primary"></div>
                <span class="capitalize">{{ color }}</span>
              </div>
            </UiButton>
          </div>
        </div>

        <!-- Dark/Light Mode Toggle -->
        <div class="space-y-2">
          <UiLabel>Color Mode</UiLabel>
          <div class="flex space-x-2">
            <UiButton
              :variant="!isDark ? 'default' : 'outline'"
              class="flex-1"
              @click="toggleColorMode"
            >
              <Icon name="lucide:sun" class="mr-2 size-4" />
              Light
            </UiButton>
            <UiButton
              :variant="isDark ? 'default' : 'outline'"
              class="flex-1"
              @click="toggleColorMode"
            >
              <Icon name="lucide:moon" class="mr-2 size-4" />
              Dark
            </UiButton>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <!-- Font Settings -->
    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Font Settings</UiCardTitle>
        <UiCardDescription>Customize your typography preferences</UiCardDescription>
      </UiCardHeader>
      <UiCardContent class="space-y-4">
        <!-- Heading Font -->
        <div class="space-y-2">
          <UiLabel>Heading Font</UiLabel>
          <UiSelect v-model="selectedFonts.heading" @update:model-value="updateHeadingFont">
            <UiSelectTrigger>
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="font in availableFonts"
                :key="font.name"
                :value="font.name"
                :style="{ fontFamily: getFontFamily(font.name) }"
              >
                {{ font.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>

        <!-- Body Font -->
        <div class="space-y-2">
          <UiLabel>Body Font</UiLabel>
          <UiSelect v-model="selectedFonts.body" @update:model-value="updateBodyFont">
            <UiSelectTrigger>
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="font in availableFonts"
                :key="font.name"
                :value="font.name"
                :style="{ fontFamily: getFontFamily(font.name) }"
              >
                {{ font.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>

        <!-- Monospace Font -->
        <div class="space-y-2">
          <UiLabel>Monospace Font</UiLabel>
          <UiSelect v-model="selectedFonts.mono" @update:model-value="updateMonoFont">
            <UiSelectTrigger>
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="font in availableFonts.filter(f => f.category === 'monospace')"
                :key="font.name"
                :value="font.name"
                :style="{ fontFamily: getFontFamily(font.name) }"
              >
                {{ font.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>

        <!-- Font Preview -->
        <div class="space-y-2">
          <UiLabel>Preview</UiLabel>
          <div class="p-4 border rounded-lg space-y-2">
            <div 
              class="text-2xl font-bold"
              :style="{ fontFamily: getFontFamily(selectedFonts.heading) }"
            >
              Heading: The quick brown fox jumps over the lazy dog
            </div>
            <div 
              class="text-base"
              :style="{ fontFamily: getFontFamily(selectedFonts.body) }"
            >
              Body: The quick brown fox jumps over the lazy dog
            </div>
            <div 
              class="text-sm font-mono"
              :style="{ fontFamily: getFontFamily(selectedFonts.mono) }"
            >
              Monospace: console.log('Hello World');
            </div>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <!-- Save Settings -->
    <div class="flex justify-end">
      <UiButton @click="saveSettings" :disabled="isSaving">
        <Icon name="lucide:save" class="mr-2 size-4" />
        {{ isSaving ? 'Saving...' : 'Save Settings' }}
      </UiButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { availableFonts, getFontFamily } from '~/utils/fonts'

// Get current user from auth
const { user, setUser } = useAuth()

// Get config store
const { theme, setTheme, fonts, setHeadingFont, setBodyFont, setMonoFont } = useConfigStore()

// Color mode
const { $colorMode } = useNuxtApp()
const isDark = computed(() => $colorMode.value === 'dark')

// Available themes
const allColors = [
  "matter", "buildit", "lucide", "grove", "cyberpunk", "bubblegum",
  "midnight", "solardark", "zinc", "rose", "blue", "green", "orange",
  "red", "slate", "stone", "gray", "neutral", "yellow", "violet", "brutalism"
]

// Local state
const selectedTheme = ref(theme.value || 'zinc')
const selectedFonts = ref({
  heading: 'Inter',
  body: 'Inter',
  mono: 'JetBrains Mono'
})
const isSaving = ref(false)

// Initialize from user preferences
onMounted(() => {
  if (user.value) {
    selectedTheme.value = user.value.theme_preference || theme.value || 'zinc'
    
    if (user.value.font_preferences) {
      try {
        const fontPrefs = JSON.parse(user.value.font_preferences)
        selectedFonts.value = {
          heading: fontPrefs.heading || 'Inter',
          body: fontPrefs.body || 'Inter',
          mono: fontPrefs.mono || 'JetBrains Mono'
        }
      } catch (error) {
        console.error('Error parsing font preferences:', error)
      }
    }
  }
})

// Watch for user changes
watch(() => user.value, (newUser) => {
  if (newUser) {
    selectedTheme.value = newUser.theme_preference || 'zinc'
    
    if (newUser.font_preferences) {
      try {
        const fontPrefs = JSON.parse(newUser.font_preferences)
        selectedFonts.value = {
          heading: fontPrefs.heading || 'Inter',
          body: fontPrefs.body || 'Inter',
          mono: fontPrefs.mono || 'JetBrains Mono'
        }
      } catch (error) {
        console.error('Error parsing font preferences:', error)
      }
    }
  }
}, { immediate: true })

// Theme update function
const updateTheme = (themeName: string) => {
  selectedTheme.value = themeName
  setTheme(themeName as any)
  
  // Apply theme to document
  const allColors = [
    "matter", "buildit", "lucide", "grove", "cyberpunk", "bubblegum",
    "midnight", "solardark", "zinc", "rose", "blue", "green", "orange",
    "red", "slate", "stone", "gray", "neutral", "yellow", "violet", "brutalism"
  ]
  document.documentElement.classList.remove(...allColors.map((color) => `theme-${color}`))
  document.documentElement.classList.add(`theme-${themeName}`)
}

// Color mode toggle
const toggleColorMode = () => {
  $colorMode.preference = $colorMode.value === 'dark' ? 'light' : 'dark'
}

// Font update functions
const updateHeadingFont = (font: string) => {
  selectedFonts.value.heading = font
  setHeadingFont(font)
  applyFontToDocument('heading', font)
}

const updateBodyFont = (font: string) => {
  selectedFonts.value.body = font
  setBodyFont(font)
  applyFontToDocument('body', font)
}

const updateMonoFont = (font: string) => {
  selectedFonts.value.mono = font
  setMonoFont(font)
  applyFontToDocument('mono', font)
}

// Apply font to document
const applyFontToDocument = (type: 'heading' | 'body' | 'mono', font: string) => {
  const fontFamily = getFontFamily(font)
  const cssVar = `--font-${type}`
  document.documentElement.style.setProperty(cssVar, fontFamily)
}

// Save settings to database
const saveSettings = async () => {
  if (!user.value?.id) {
    useSonner.error("Error", {
      description: "User not authenticated"
    })
    return
  }

  isSaving.value = true

  try {
    const response = await $fetch<{ success: boolean; user: any; message: string }>('/api/user/profile', {
      method: 'PUT',
      body: {
        id: user.value.id,
        name: user.value.name,
        email: user.value.email,
        theme_preference: selectedTheme.value,
        font_preferences: JSON.stringify(selectedFonts.value)
      }
    })

    if (response.success) {
      // Update the user state with the new data
      setUser(response.user)
      
      useSonner.success("Settings Saved", {
        description: "Your preferences have been saved successfully"
      })
    }
  } catch (error: any) {
    console.error('Settings save error:', error)
    
    let errorMessage = 'Failed to save settings. Please try again.'
    
    if (error.data?.statusMessage) {
      errorMessage = error.data.statusMessage
    } else if (error.message) {
      errorMessage = error.message
    }
    
    useSonner.error("Save Failed", {
      description: errorMessage
    })
  } finally {
    isSaving.value = false
  }
}
</script>
