<template>
  <div class="min-h-screen">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="var(--primary)" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UiVueSonner />
  </div>
</template>

<script lang="ts" setup>
  import { provide, onMounted } from 'vue';
  import { useLoginLoader } from '~/composables/useLoginLoader';

  const loginLoader = useLoginLoader();
  provide('loginLoader', loginLoader);

  // Intercept fetch requests to proxy React Grab API calls through our dev server
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    onMounted(() => {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const [url, options] = args;
        const urlString = typeof url === 'string' ? url : url.toString();
        
        // Intercept React Grab API requests and proxy them
        if (urlString.includes('react-grab.com/api/')) {
          const proxiedUrl = urlString.replace('https://react-grab.com/api/', '/react-grab-api/api/');
          return originalFetch(proxiedUrl, options);
        }
        
        return originalFetch(...args);
      };
    });
  }

  useSeoMeta({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS.join(", "),
    ogTitle: SITE_TITLE,
    ogDescription: SITE_DESCRIPTION,
    twitterTitle: SITE_TITLE,
    twitterDescription: SITE_DESCRIPTION,
    twitterCard: "summary_large_image",
  });

  useHead({
    htmlAttrs: { lang: "en" },
    link: [
      { rel: "icon", type: "image/png", href: "/icon.png" },
      { 
        rel: "stylesheet", 
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Source+Sans+Pro:wght@300;400;600;700&family=Playfair+Display:wght@400;500;600;700&family=Merriweather:wght@300;400;700&family=Lora:wght@400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600;700&family=Source+Code+Pro:wght@300;400;500;600;700&family=Fira+Code:wght@300;400;500;600;700&family=Silkscreen:wght@400;700&family=Wallpoet&family=Orbitron:wght@400;500;600;700;800;900&family=Audiowide&family=Press+Start+2P&display=swap"
      }
    ],
    script: [
      {
        src: "//unpkg.com/react-grab/dist/index.global.js",
        crossorigin: "anonymous",
        "data-enabled": "true",
      },
    ],
  });
</script>
