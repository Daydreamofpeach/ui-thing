import { useStorage } from "@vueuse/core";

interface Config {
  theme?: Theme["name"];
  radius: number;
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
}

interface CodeConfig {
  prefix: string;
  componentsPath: string;
  utilsPath: string;
}

/** The open/closed state of the mobile drawer */
export const useMobileNavState = () => useState("mobile_nav_state", () => false);

export const RADII = [0, 0.25, 0.5, 0.625, 0.75, 1];

export function useConfigStore() {
  const config = useStorage<Config>("config", {
    theme: "zinc",
    radius: 0.625,
    fonts: {
      heading: "Inter",
      body: "Inter",
      mono: "JetBrains Mono",
    },
  });

  // Sync with user preferences when available
  const { user } = useAuth()
  
  // Watch for user changes and sync preferences
  watch(() => user.value, (newUser) => {
    if (newUser) {
      // Update theme from user preferences
      if (newUser.theme_preference && newUser.theme_preference !== config.value.theme) {
        config.value.theme = newUser.theme_preference
      }
      
      // Update fonts from user preferences
      if (newUser.font_preferences) {
        try {
          const fontPrefs = JSON.parse(newUser.font_preferences)
          config.value.fonts = {
            heading: fontPrefs.heading || config.value.fonts.heading,
            body: fontPrefs.body || config.value.fonts.body,
            mono: fontPrefs.mono || config.value.fonts.mono
          }
        } catch (error) {
          console.error('Error parsing user font preferences:', error)
        }
      }
    }
  }, { immediate: true })
  const codeConfig = useStorage<CodeConfig>("code-config", {
    prefix: "",
    componentsPath: "@/components",
    utilsPath: "@/utils",
  });

  const themeClass = computed(() => `theme-${config.value.theme}`);

  const theme = computed(() => config.value.theme);
  const radius = computed(() => config.value.radius);
  const fonts = computed(() => config.value.fonts || {
    heading: "Inter",
    body: "Inter",
    mono: "JetBrains Mono",
  });

  // Ensure fonts are always initialized
  if (!config.value.fonts) {
    config.value.fonts = {
      heading: "Inter",
      body: "Inter",
      mono: "JetBrains Mono",
    };
  }

  function setTheme(themeName: Theme["name"]) {
    config.value.theme = themeName;
  }

  function setRadius(newRadius: number) {
    config.value.radius = newRadius;
  }

  function setFonts(newFonts: Config["fonts"]) {
    config.value.fonts = newFonts;
  }

  function setHeadingFont(font: string) {
    if (!config.value.fonts) {
      config.value.fonts = {
        heading: "Inter",
        body: "Inter",
        mono: "JetBrains Mono",
      };
    }
    config.value.fonts.heading = font;
  }

  function setBodyFont(font: string) {
    if (!config.value.fonts) {
      config.value.fonts = {
        heading: "Inter",
        body: "Inter",
        mono: "JetBrains Mono",
      };
    }
    config.value.fonts.body = font;
  }

  function setMonoFont(font: string) {
    if (!config.value.fonts) {
      config.value.fonts = {
        heading: "Inter",
        body: "Inter",
        mono: "JetBrains Mono",
      };
    }
    config.value.fonts.mono = font;
  }

  const setCodeConfig = (payload: CodeConfig) => {
    codeConfig.value = payload;
  };

  return {
    config,
    theme,
    setTheme,
    radius,
    setRadius,
    fonts,
    setFonts,
    setHeadingFont,
    setBodyFont,
    setMonoFont,
    themeClass,

    codeConfig,
    setCodeConfig,
  };
}
