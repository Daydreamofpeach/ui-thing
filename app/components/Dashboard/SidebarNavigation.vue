<template>
  <div class="flex flex-col h-full">
    <!-- Main navigation tabs -->
    <div class="flex-1 flex flex-col justify-evenly">
      <!-- Icon-only version for collapsed sidebar -->
      <div v-if="isCollapsed" class="flex flex-col h-full justify-evenly">
        <UiTooltip v-for="t in mainTabs" :key="t.title">
          <UiTooltipTrigger as-child>
            <span class="h-full">
              <button
                :class="[
                  'relative w-full justify-center p-2 rounded-md transition-colors',
                  'hover:bg-accent hover:text-foreground',
                  activeTab === t.title ? 'bg-accent text-foreground' : 'text-muted-foreground'
                ]"
                @click="setActiveTab(t.title)"
              >
                <Icon :name="t.icon" class="size-4" />
              </button>
            </span>
          </UiTooltipTrigger>
          <UiTooltipContent side="right" class="px-2 py-1 text-xs">{{ t.title }}</UiTooltipContent>
        </UiTooltip>
      </div>

      <!-- Full version for expanded sidebar -->
      <div v-else class="flex flex-col h-full justify-evenly">
        <button
          v-for="t in mainTabs"
          :key="t.title"
          :class="[
            'relative w-full justify-start p-2 rounded-md transition-colors flex items-center gap-2',
            'hover:bg-accent hover:text-foreground',
            activeTab === t.title ? 'bg-accent text-foreground' : 'text-muted-foreground'
          ]"
          @click="setActiveTab(t.title)"
        >
          <Icon :name="t.icon" class="size-4" />
          <span class="text-sm">{{ t.title }}</span>
        </button>
      </div>
    </div>

    <!-- Bottom tabs (Settings & Profile) -->
    <div class="border-t border-border/40 pt-2">
      <!-- Icon-only version for collapsed sidebar -->
      <div v-if="isCollapsed" class="flex flex-col gap-1">
        <UiTooltip v-for="t in bottomTabs" :key="t.title">
          <UiTooltipTrigger as-child>
            <span class="h-full">
              <button
                :class="[
                  'relative w-full justify-center p-2 rounded-md transition-colors',
                  'hover:bg-accent hover:text-foreground',
                  activeTab === t.title ? 'bg-accent text-foreground' : 'text-muted-foreground'
                ]"
                @click="setActiveTab(t.title)"
              >
                <Icon :name="t.icon" class="size-4" />
              </button>
            </span>
          </UiTooltipTrigger>
          <UiTooltipContent side="right" class="px-2 py-1 text-xs">{{ t.title }}</UiTooltipContent>
        </UiTooltip>
      </div>

      <!-- Full version for expanded sidebar -->
      <div v-else class="flex flex-col gap-1">
        <button
          v-for="t in bottomTabs"
          :key="t.title"
          :class="[
            'relative w-full justify-start p-2 rounded-md transition-colors flex items-center gap-2',
            'hover:bg-accent hover:text-foreground',
            activeTab === t.title ? 'bg-accent text-foreground' : 'text-muted-foreground'
          ]"
          @click="setActiveTab(t.title)"
        >
          <Icon :name="t.icon" class="size-4" />
          <span class="text-sm">{{ t.title }}</span>
        </button>
      </div>
    </div>
  </div>
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

// Main navigation tabs (centered in sidebar)
const mainTabs = [
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
]

// Bottom tabs (Settings & Profile)
const bottomTabs = [
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

// Combined tabs for reference
const tabs = [...mainTabs, ...bottomTabs]

const activeTab = computed({
  get: () => props.activeTab || 'Projects',
  set: (value: string) => emit('update:activeTab', value)
})

const setActiveTab = (value: string) => {
  activeTab.value = value
}
</script>
