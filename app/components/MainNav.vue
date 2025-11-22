<template>
  <header class="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
    <div class="flex h-14 w-full items-center justify-between px-6">
      <div class="flex items-center gap-10">
        <div class="flex items-center gap-5">
          <UiButton
            size="icon-sm"
            variant="outline"
            class="h-9 w-9 lg:hidden"
            @click="mobileNavState = true"
            ><Icon name="heroicons:bars-2" class="size-4" />
          </UiButton>
          <NuxtLink to="/" class="text-lg font-bold">buildit</NuxtLink>
        </div>
        <nav class="hidden items-center space-x-6 text-sm font-medium lg:flex">
          <NuxtLink
            :class="[route.path.startsWith('/getting-started/') ? '!text-primary' : '']"
            to="/getting-started/introduction"
            class="text-foreground/60 transition-colors hover:text-foreground"
            >Documentation</NuxtLink
          >
          <NuxtLink
            :class="[
              route.path.startsWith('/components/') || route.path.includes('/forms/')
                ? '!text-primary'
                : '',
            ]"
            to="/components/accordion"
            class="text-foreground/60 transition-colors hover:text-foreground"
            >Components</NuxtLink
          >
          <UiDropdownMenu>
            <UiDropdownMenuTrigger>
              <div
                class="inline-flex items-center gap-1 text-foreground/60 transition-colors hover:text-foreground"
              >
                <span>Examples</span>
                <Icon name="heroicons:chevron-down" class="h-3 w-3" />
              </div>
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent class="min-w-[180px]" align="start" :side-offset="5">
              <UiDropdownMenuItem v-for="l in localProjects" :key="l.name" as-child>
                <NuxtLink class="cursor-pointer hover:bg-muted" :to="l.link">{{ l.name }}</NuxtLink>
              </UiDropdownMenuItem>
              <template v-for="l in externalProjects" :key="l.name">
                <UiDropdownMenuItem as-child>
                  <NuxtLink
                    target="_blank"
                    external
                    class="cursor-pointer hover:bg-muted"
                    :href="l.link"
                    >{{ l.name }}</NuxtLink
                  >
                </UiDropdownMenuItem>
              </template>
            </UiDropdownMenuContent>
          </UiDropdownMenu>
          <NuxtLink
            :class="[route.path.startsWith('/style') ? '!text-primary' : '']"
            to="/style"
            class="text-foreground/60 transition-colors hover:text-foreground"
            >Style</NuxtLink
          >
          <NuxtLink
            :class="[route.path.startsWith('/magic') ? '!text-primary' : '']"
            to="/magic"
            class="text-foreground/60 transition-colors hover:text-foreground"
            >Magic</NuxtLink
          >
        </nav>
      </div>

      <div class="flex items-center">
        <UiButton
          size="sm"
          class="mr-2 hidden min-w-[300px] font-normal text-muted-foreground md:flex"
          variant="outline"
          @click="isOpen = true"
        >
          <Icon name="lucide:search" />
          Search...
          <UiKbd class="ml-auto">{{ metaSymbol }}+K</UiKbd>
        </UiButton>
        <UiButton
          size="icon"
          class="text-muted-foreground md:hidden"
          variant="ghost"
          @click="isOpen = true"
        >
          <Icon name="lucide:search" class="h-[18px] w-[18px]" />
        </UiButton>

        <ThemePopover />
        <FontSelector />
        <UiButton
          v-if="githubRepositoryUrl"
          :to="githubRepositoryUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="h-9 w-9"
          variant="ghost"
          size="icon"
          ><Icon name="radix-icons:github-logo" class="h-[18px] w-[18px]"
        /></UiButton>
        <CommandSearch v-model="isOpen" />
        <UiDropdownMenu>
          <UiDropdownMenuTrigger as-child>
            <UiButton class="h-9 w-9" variant="ghost" size="icon">
              <ClientOnly>
                <template #fallback>
                  <Icon :name="'lucide:sun'" class="h-[18px] w-[18px]" />
                </template>
                <Icon v-if="currentIcon" :name="currentIcon" class="h-[18px] w-[18px]" />
              </ClientOnly>
            </UiButton>
          </UiDropdownMenuTrigger>
          <UiDropdownMenuContent align="end" :side-offset="5">
            <UiDropdownMenuItem
              v-for="(m, i) in modes"
              :key="i"
              class="cursor-pointer"
              :icon="m.icon"
              :title="m.title"
              @click="setTheme(m.value)"
            />
          </UiDropdownMenuContent>
        </UiDropdownMenu>
      </div>
    </div>
    <MobileNav />
  </header>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref, watch } from "vue";
  import { useSelectedOrganisationId } from "~/composables/useSelectedOrganisationId";
  import { buttClient } from "~/utils/buttClient";

  const modes = [
    { icon: "lucide:sun", title: "Light", value: "light" },
    { icon: "lucide:moon", title: "Dark", value: "dark" },
    { icon: "lucide:laptop", title: "System", value: "system" },
  ];

  const route = useRoute();

  const mobileNavState = useMobileNavState();

  const colorMode = useColorMode();
  const setTheme = (val: string) => {
    colorMode.preference = val;
  };

  const currentIcon = computed(() => {
    return modes.find((m) => m.value === colorMode?.preference)?.icon;
  });

  const isOpen = ref(false);

  const metaSymbol = computed(() => useKbd().getKbdKey("meta"));

  defineShortcuts({
    meta_k: () => {
      isOpen.value = !isOpen.value;
    },
  });

  const externalProjects = [
    { name: "Settings Dashboard", link: "https://settings-dash.behonbaker.com/" },
    { name: "ETag Topup UI", link: "https://etag-ui.behonbaker.com/" },
    { name: "UI Todo", link: "https://ui-todo.behonbaker.com/" },
  ];
  const localProjects = [
    { name: "Cards", link: "/examples/cards" },
    { name: "Dashboard", link: "/examples/dashboard" },
    { name: "Schema Visualizer", link: "/examples/schema-visualizer" },
    { name: "Schema Builder", link: "/schema-builder" },
  ];

  // GitHub integration state
  const githubRepositoryUrl = ref<string | null>(null);
  const selectedOrganisationId = useSelectedOrganisationId();

  // Function to get repository URL from integration
  const getRepositoryUrl = (integration: any): string | null => {
    return integration.meta?.repository?.html_url
      || integration.data?.repository?.html_url
      || integration.data?.repository?.url
      || integration.meta?.repository?.url
      || integration.repositoryUrl
      || null;
  };

  // Load GitHub integration for the selected organization
  const loadGitHubIntegration = async () => {
    if (!selectedOrganisationId.value) {
      githubRepositoryUrl.value = null;
      return;
    }

    try {
      const orgIntegrations = await buttClient.findIntegrationsByOrganisationId(selectedOrganisationId.value);
      
      if (!Array.isArray(orgIntegrations)) {
        githubRepositoryUrl.value = null;
        return;
      }

      // Find connected GitHub integration
      const githubIntegration = orgIntegrations.find((integration: any) => {
        const isGitHub = integration.type === "GITHUB" || integration.type === "github";
        const isConnected = integration.connected === true;
        return isGitHub && isConnected;
      });

      if (githubIntegration) {
        const repoUrl = getRepositoryUrl(githubIntegration);
        githubRepositoryUrl.value = repoUrl;
      } else {
        githubRepositoryUrl.value = null;
      }
    } catch (error) {
      console.error("❌ Failed to load GitHub integration:", error);
      githubRepositoryUrl.value = null;
    }
  };

  // Watch for organization changes
  watch(selectedOrganisationId, () => {
    loadGitHubIntegration();
  }, { immediate: true });

  // Load on mount
  onMounted(() => {
    loadGitHubIntegration();
  });
</script>
