<template>
  <UiTabs 
    :model-value="activeTab" 
    @update:model-value="setActiveTab"
    orientation="vertical" 
    class="w-full flex-row"
  >
    <!-- Collapsed State - Icon Only (when sidebar is collapsed) -->
    <UiTabsList 
      class="flex-col gap-1 rounded-none bg-transparent px-1 py-0 text-foreground"
      :class="{ 'hidden': !isCollapsed, 'flex': isCollapsed }"
    >
      <UiTooltip v-for="t in tabs" :key="t.title">
        <UiTooltipTrigger as-child>
          <span class="h-full">
            <UiTabsTrigger 
              :value="t.title" 
              class="relative w-full justify-center py-3 after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
            >
              <Icon :name="t.icon" class="size-4 opacity-60" />
            </UiTabsTrigger>
          </span>
        </UiTooltipTrigger>
        <UiTooltipContent side="right" class="px-2 py-1 text-xs">{{ t.title }}</UiTooltipContent>
      </UiTooltip>
    </UiTabsList>

    <!-- Expanded State - Icon + Text (when sidebar is expanded) -->
    <UiTabsList 
      class="flex-col gap-1 rounded-none bg-transparent px-1 py-0 text-foreground"
      :class="{ 'flex': !isCollapsed, 'hidden': isCollapsed }"
    >
      <UiTabsTrigger
        v-for="t in tabs"
        :key="t.title"
        :value="t.title"
        class="relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
      >
        <Icon :name="t.icon" class="-ms-0.5 me-1.5 size-4 opacity-60" />
        {{ t.title }}
      </UiTabsTrigger>
    </UiTabsList>

    <!-- Tab Content -->
    <div class="grow">
      <UiTabsContent v-for="t in tabs" :key="t.title" :value="t.title">
        <slot :name="t.title.toLowerCase()" :tab="t">
          <div class="p-4">
            <h2 class="text-lg font-semibold mb-2">{{ t.title }}</h2>
            <p class="text-sm text-muted-foreground">{{ t.content }}</p>
          </div>
        </slot>
      </UiTabsContent>
    </div>
  </UiTabs>
</template>

<script lang="ts" setup>
const props = defineProps<{
  activeTab?: string
}>()

const emit = defineEmits<{
  'update:activeTab': [value: string]
}>()

// Get sidebar state from context
const { state } = useSidebar()
const isCollapsed = computed(() => state.value === 'collapsed')

const tabs = [
  {
    title: "Projects",
    icon: "lucide:panels-top-left",
    content: "Manage and monitor your organization's projects. Create new projects, assign teams, and track progress.",
  },
  {
    title: "Users",
    icon: "lucide:users",
    content: "User management and team organization. Invite new members, manage roles, and track user activity.",
  },
  {
    title: "Tasks",
    icon: "lucide:check-square",
    content: "Task management and workflow automation. Create, assign, and track tasks across all projects.",
  },
  {
    title: "Templates",
    icon: "lucide:layers",
    content: "Project and task templates for faster setup. Create reusable templates for common workflows.",
  },
  {
    title: "Solutions",
    icon: "lucide:puzzle",
    content: "Integration solutions and third-party services. Connect with external tools and automate workflows.",
  },
  {
    title: "Integrations",
    icon: "lucide:plug",
    content: "Connect and manage third-party integrations. Set up APIs, webhooks, and external service connections.",
  },
  {
    title: "Settings",
    icon: "lucide:settings",
    content: "Organization settings and configuration. Manage preferences, integrations, and system settings.",
  },
  {
    title: "Profile",
    icon: "lucide:user",
    content: "User profile and account management. Update your information, preferences, and security settings.",
  },
]

const activeTab = computed({
  get: () => props.activeTab || 'Projects',
  set: (value: string) => emit('update:activeTab', value)
})

const setActiveTab = (value: string) => {
  activeTab.value = value
}
</script>