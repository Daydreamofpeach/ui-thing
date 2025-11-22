import tailwindcss from "@tailwindcss/vite";
import { resolve } from "pathe";

export default defineNuxtConfig({
  devServer: {
    port: 3000
  },
  devtools: { 
    enabled: true, // Enable devtools for development
    timeline: {
      enabled: true
    },
    vscode: {
      enabled: true
    },
    // Enable additional devtools features
    componentInspector: true,
    viteInspect: true
  },
  // Use static generation for Tauri - no SSR, no loops
  ssr: false,
  
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@canvas": resolve("./app/components/canvas"),
        "@composables": resolve("./app/composables"),
        "#ui": resolve("./app/components/ui"),
        "@utils": resolve("./app/utils"),
        "@app": resolve("./app"),
        "@components": resolve("./app/components"),
        "@childNodes": resolve("./app/components/canvas/nodes/childNodes"),
        "@nodes": resolve("./app/components/canvas/nodes"),
      }
    },
    server: {
      proxy: {
        "/bapi": {
          target: "https://api.dev.builditbuilder.com",
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/bapi/, "")
        },
        // Proxy for React Grab API to avoid CORS issues
        "/react-grab-api": {
          target: "https://react-grab.com",
          changeOrigin: true,
          secure: true,
          rewrite: (path: string) => path.replace(/^\/react-grab-api/, ""),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // Add CORS headers for React Grab requests
              proxyReq.setHeader('Origin', 'https://react-grab.com');
            });
          }
        }
      }
    },
    build: { 
      sourcemap: process.env.NODE_ENV === 'development',
      rollupOptions: {
        output: {
          manualChunks: undefined // Disable manual chunking
        }
      }
    },
    optimizeDeps: {
      include: [
        "vue",
        "vue-router",
        "@vueuse/core",
        "tailwind-merge",
        "tailwind-variants",
        "quill",
        "vue-quill-editor",
        "monaco-editor",
        "debug",
      ],
      esbuildOptions: {
        mainFields: ["module", "main"],
        format: "esm",
        plugins: [],
      },
      // Force esbuild to transform CommonJS modules
      force: false,
    },
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    },
    ssr: {
      noExternal: ["quill", "vue-quill-editor"],
    },
  },

  // Minimal modules for Tauri
  modules: [
    "@vueuse/nuxt",
    "@nuxtjs/color-mode",
    "@nuxt/content",
    "@nuxt/image", // Required for NuxtImg components
    "@nuxt/icon", // Required for Icon components
    "reka-ui/nuxt", // Required for UI components
    "@nuxt/eslint", // Required for some components
    "@vee-validate/nuxt", // Required for useForm
    "vue-sonner/nuxt", // Required for useSonner
    "@nuxtjs/turnstile", // Required for Cloudflare Turnstile
  ],

  imports: {
    // Add tv and VariantProps to the set of auto imported modules
    imports: [
      { from: "tailwind-variants", name: "tv" },
      { from: "tailwind-variants", name: "VariantProps", type: true },
      { from: "vue-sonner", name: "toast", as: "useToast" },
    ],
  },

  css: [
    "~/assets/css/theme.css",
    "~/assets/css/tailwind.css",
    "~/assets/css/tippy.css",
    "~/assets/css/quill.css",
  ],

  turnstile: {
    siteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || "",
    addValidateEndpoint: false,
  },

  colorMode: { 
    classSuffix: "", 
    fallback: "dark", 
    preference: "system" 
  },

  content: {
    // Content configuration for static generation
  },

  // VeeValidate configuration
  veeValidate: {
    // Auto-imports: useForm, useField, etc.
    autoImports: true,
  },

  // Sonner auto-imports are handled by the module

  // Runtime config for environment variables
  runtimeConfig: {
    // Private keys (only available on server-side)
    tursoDatabaseUrl: process.env.TURSO_DATABASE_URL,
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    googleFontsApiKey: process.env.GOOGLE_FONTS_API_KEY,
    
    // Public keys (exposed to client-side)
    public: {
      githubClientId: process.env.GITHUB_CLIENT_ID,
      // Always use absolute API URL in production (including Tauri builds)
      // Use proxy only in development web builds
      buttApiUrl: process.env.NODE_ENV === 'development' && !process.env.TAURI_PLATFORM 
        ? "/bapi" 
        : "https://api.dev.builditbuilder.com",
      serviceId: process.env.SERVICE_ID || "izgF1l9wZPXdTqkgW_-VuTRQWNgKYMzkZWMvkIFPa5A",
    }
  },

  app: {
    head: {
      title: "BuilditUi",
      titleTemplate: `%s | BuilditUi`,
    },
    baseURL: "/",
    buildAssetsDir: "/_nuxt/",
  },

  // Route rules for static generation
  routeRules: {
    '/blocks/**': { prerender: true },
    '/**': { prerender: true }
  },

  // Disable experimental features
  experimental: { 
    payloadExtraction: false,
  },

  // Optimize for desktop app with static generation
  nitro: {
    preset: "static",
    minify: true,
    prerender: {
      routes: [
        "/",
        "/blocks",
        "/components",
        "/examples",
        "/goodies",
        "/getting-started",
        "/magic",
        "/forms",
        "/apex-charts",
        "/cards-showcase",
        "/blocks/hero",
        "/blocks/pricing",
        "/blocks/sidebar",
        "/blocks/signup",
        "/blocks/socialproof",
        "/blocks/team",
        "/blocks/headersection",
        "/blocks/login",
        "/blocks/metric",
        "/blocks/navigation",
        "/blocks/newsletter",
        "/blocks/cta",
        "/blocks/error",
        "/blocks/faq",
        "/blocks/features",
        "/blocks/footer",
        "/blocks/forgot-reset-password",
        "/blocks/blogpage",
        "/blocks/blogpostcard",
        "/blocks/blogsection",
        "/blocks/blogsubscribe",
        "/blocks/career",
        "/blocks/contactheader",
        "/blocks/app-empty-state",
        "/blocks/app-header",
        "/blocks/app-sidebar",
        "/blocks/app-stats",
        "/blocks/banner",
        "/blocks/testimony"
      ],
      crawlLinks: true,
      failOnError: false,
      ignore: [
        "/api/**",
        "/_nuxt/**",
        "/__nuxt_content/**"
      ],
      // Ensure all content is statically generated
    },
  },

  // Disable features that cause issues
  typescript: {
    strict: false,
    typeCheck: false,
  },

  // Build optimization
  build: {
    transpile: ["vue-sonner"],
  },

  // Ensure all block and example components are available
  components: {
    dirs: [
      '~/components',
      '~/components/Ui',
      '~/components/Ui/Card',
      '~/components/Ui/Alert',
      '~/components/Ui/Form',
      '~/components/Ui/Dialog',
      '~/components/Ui/Drawer',
      '~/components/Ui/Popover',
      '~/components/Ui/Tooltip',
      '~/components/Ui/DropdownMenu',
      '~/components/Ui/ContextMenu',
      '~/components/Ui/Select',
      '~/components/Ui/Tabs',
      '~/components/Ui/Accordion',
      '~/components/content/Block',
      '~/components/content/Block/Login',
      '~/components/content/Block/Hero',
      '~/components/content/Block/Pricing',
      '~/components/content/Block/Team',
      '~/components/content/Block/CTA',
      '~/components/content/Block/SignUp',
      '~/components/content/Block/Footer',
      '~/components/content/Block/Testimony',
      '~/components/content/Block/SocialProof',
      '~/components/content/Block/Newsletter',
      '~/components/content/Block/Metric',
      '~/components/content/Block/Navigation',
      '~/components/content/Block/Banner',
      '~/components/content/Block/Feature',
      '~/components/content/Block/FAQ',
      '~/components/content/Block/Error',
      '~/components/content/Block/Blog',
      '~/components/content/Block/App',
      '~/components/content/Block/Contact',
      '~/components/content/Block/Career',
      '~/components/content/Block/Chart',
      '~/components/content/Block/HeaderSection',
      '~/components/content/Block/ForgotPassword',
      '~/components/content/Block/ResetPassword',
      '~/components/content/Block/Sidebar',
      '~/components/content/Example',
      '~/components/Examples'
    ],
    // Force global registration of all components
    global: true
  },
});