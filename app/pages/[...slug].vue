
<template>
  <div
    :class="[
      (toc && toc.links && toc.links.length && !isBlocksPage) || isNodesPage
        ? 'xl:grid-cols-[1fr_250px]'
        : 'xl:grid-cols-1',
    ]"
    class="xl:grid xl:gap-5"
  >
    <!-- Page content -->
    <div
      class="mx-auto prose prose-base max-w-none min-w-0 py-5 xl:container dark:prose-invert prose-headings:scroll-mt-16 prose-headings:tracking-tight prose-h2:mt-6 prose-h2:border-b prose-h2:pb-3 first:prose-h2:mt-10 prose-a:decoration-primary prose-a:decoration-wavy prose-a:underline-offset-2 prose-a:hover:text-primary prose-pre:text-base"
    >
      <DocsHeader v-if="page" :page />
      <ContentRenderer v-if="page" :value="page" />
      <DocsFooter />
    </div>
    <!-- Table of contents for current page OR Node categories for nodes page -->
    <ClientOnly>
      <!-- Node categories sidebar for nodes page -->
      <aside
        v-if="isNodesPage"
        class="sticky top-14 z-20 hidden h-[calc(100dvh-57px)] border-l xl:block"
      >
        <UiScrollArea type="auto" class="h-full bg-background/20">
          <div class="flex flex-col gap-5 p-5">
            <NodeCategoriesSidebar />
          </div>
        </UiScrollArea>
      </aside>
      <!-- Regular TOC sidebar for other pages -->
      <aside
        v-else-if="toc && toc.links && toc.links.length && !isBlocksPage"
        class="sticky top-14 z-20 hidden h-[calc(100dvh-57px)] border-l xl:block"
      >
        <UiScrollArea type="auto" class="h-full bg-background/20">
          <div class="flex flex-col gap-5 p-5">
            <p class="text-sm font-semibold">On this page</p>
            <DocsToclink :set-active="setActive" :active-id="activeId" :links="toc.links" />
            <p class="text-sm font-semibold">Extra stuff</p>
            <DocsExtraStuff />
          </div>
        </UiScrollArea>
      </aside>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
  import { snakeCase } from "lodash-es";
  import { useActiveScroll } from "vue-use-active-scroll";
  import type { Targets } from "vue-use-active-scroll";
  import NodeCategoriesSidebar from "~/components/content/Docs/Nodes/NodeCategoriesSidebar.vue";

  const route = useRoute();
  const { data: page } = await useAsyncData(snakeCase(route.path), () => {
    return queryCollection("content").path(route.path).first();
  }, {
    server: false
  });
  if (!page.value) {
    throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
  }
  const toc = computed(() => {
    if (!page.value) return;
    return page.value?.body?.toc;
  });

  // Check if a page starts with `/blocks/` The sidenave will be removed if this is true
  const isBlocksPage = computed(() => route.path.startsWith("/blocks/"));
  
  // Check if this is the nodes documentation page
  const isNodesPage = computed(() => route.path === "/components/nodes");

  const targets = computed(() => {
    // Skip TOC logic for nodes page
    if (isNodesPage.value) return [];
    return toc.value?.links?.flatMap(({ id, children = [] }: any) => [
      id,
      ...children.map(({ id }: { id: string }) => id),
    ]) || [];
  });

  const { activeId, setActive } = useActiveScroll(targets as Targets, {
    replaceHash: true,
    overlayHeight: 80,
  });

  useSeoMeta({
    title: page?.value?.title,
    titleTemplate: `%s | ${SITE_NAME}`,
    description: page.value?.description,
    keywords: SITE_KEYWORDS.join(", "),
    ogTitle: page.value?.title,
    ogDescription: page.value?.description,
    twitterTitle: page.value?.title,
    twitterDescription: page.value?.description,
    twitterCard: "summary_large_image",
    ogUrl: `${SITE_URL}${route.path}`,
  });

  // Removed defineOgImageComponent for static generation
</script>
