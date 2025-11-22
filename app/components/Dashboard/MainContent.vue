<template>
  <div class="h-full w-full">
    <div class="p-4 sm:p-6 lg:p-8 w-full max-w-none">
      <h1 class="text-2xl font-bold mb-4">{{ currentTab.title }}</h1>
      <p class="text-muted-foreground mb-6">{{ currentTab.content }}</p>
      
      <!-- Tab-specific content -->
      <div class="space-y-6">
        <!-- Projects Tab -->
        <div v-if="activeTab === 'Projects'" class="space-y-4">
          <ProjectContent :user-id="userId" />
        </div>

        <!-- Users Tab -->
        <div v-else-if="activeTab === 'Users'" class="space-y-4">
          <UserContent :admin-user-id="userId" />
        </div>

        <!-- Tasks Tab -->
        <div v-else-if="activeTab === 'Tasks'" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 w-full">
              <div class="p-4 border rounded-lg">
                <h3 class="font-semibold mb-2">Total Tasks</h3>
                <p class="text-2xl font-bold text-primary">156</p>
                <p class="text-sm text-muted-foreground">87% completion rate</p>
              </div>
              <div class="p-4 border rounded-lg">
                <h3 class="font-semibold mb-2">Pending</h3>
                <p class="text-2xl font-bold text-yellow-600">23</p>
                <p class="text-sm text-muted-foreground">Awaiting action</p>
              </div>
              <div class="p-4 border rounded-lg">
                <h3 class="font-semibold mb-2">Overdue</h3>
                <p class="text-2xl font-bold text-red-600">5</p>
                <p class="text-sm text-muted-foreground">Needs attention</p>
              </div>
            </div>
          </div>

        <!-- Templates Tab -->
        <div v-else-if="activeTab === 'Templates'" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 w-full">
              <div class="p-4 border rounded-lg">
                <h3 class="font-semibold mb-2">Project Templates</h3>
                <p class="text-2xl font-bold text-primary">8</p>
                <p class="text-sm text-muted-foreground">Available</p>
              </div>
              <div class="p-4 border rounded-lg">
                <h3 class="font-semibold mb-2">Task Templates</h3>
                <p class="text-2xl font-bold text-green-600">24</p>
                <p class="text-sm text-muted-foreground">Created</p>
              </div>
              <div class="p-4 border rounded-lg">
                <h3 class="font-semibold mb-2">Used This Month</h3>
                <p class="text-2xl font-bold text-blue-600">12</p>
                <p class="text-sm text-muted-foreground">Times</p>
              </div>
            </div>
          </div>

        <!-- Solutions Tab -->
        <div v-else-if="activeTab === 'Solutions'" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 w-full">
              <div class="p-4 border rounded-lg">
                <h3 class="font-semibold mb-2">Active Solutions</h3>
                <p class="text-2xl font-bold text-primary">6</p>
                <p class="text-sm text-muted-foreground">Running</p>
              </div>
              <div class="p-4 border rounded-lg">
                <h3 class="font-semibold mb-2">Available</h3>
                <p class="text-2xl font-bold text-green-600">15</p>
                <p class="text-sm text-muted-foreground">In marketplace</p>
              </div>
              <div class="p-4 border rounded-lg">
                <h3 class="font-semibold mb-2">Custom</h3>
                <p class="text-2xl font-bold text-blue-600">3</p>
                <p class="text-sm text-muted-foreground">Built</p>
              </div>
            </div>
          </div>

        <!-- Integrations Tab -->
        <div v-else-if="activeTab === 'Integrations'" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 w-full">
              <div class="p-4 border rounded-lg">
                <h3 class="font-semibold mb-2">Connected</h3>
                <p class="text-2xl font-bold text-primary">9</p>
                <p class="text-sm text-muted-foreground">Active</p>
              </div>
              <div class="p-4 border rounded-lg">
                <h3 class="font-semibold mb-2">Available</h3>
                <p class="text-2xl font-bold text-green-600">45</p>
                <p class="text-sm text-muted-foreground">To connect</p>
              </div>
              <div class="p-4 border rounded-lg">
                <h3 class="font-semibold mb-2">API Calls</h3>
                <p class="text-2xl font-bold text-blue-600">1.2K</p>
                <p class="text-sm text-muted-foreground">This month</p>
              </div>
            </div>
          </div>

        <!-- Settings Tab -->
        <div v-else-if="activeTab === 'Settings'" class="space-y-4">
          <SettingsContent />
        </div>

        <!-- Profile Tab -->
        <div v-else-if="activeTab === 'Profile'" class="space-y-4">
          <ProfileContent />
        </div>

        <!-- Default content for other tabs -->
        <div v-else class="p-8 text-center">
          <Icon :name="currentTab.icon" class="size-12 mx-auto mb-4 text-muted-foreground" />
          <h2 class="text-xl font-semibold mb-2">{{ currentTab.title }}</h2>
          <p class="text-muted-foreground">{{ currentTab.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ProfileContent from './ProfileContent.vue'
import SettingsContent from './SettingsContent.vue'
import ProjectContent from './ProjectContent.vue'
import UserContent from './UserContent.vue'

const props = defineProps<{
  activeTab: string
}>()

// Get current user
const { user } = useAuth()
const userId = computed(() => user.value?.id || 0)

// Find the current tab based on activeTab
const currentTab = computed(() => {
  return tabs.find(tab => tab.title === props.activeTab) || tabs[0]
})

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
</script>
