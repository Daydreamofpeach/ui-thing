<template>
  <div class="p-6 space-y-6">
    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <UiCard class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Active Projects</p>
            <p class="text-2xl font-bold">{{ metrics.activeProjects }}</p>
            <p class="text-xs text-green-600">+{{ metrics.newProjects }} this month</p>
          </div>
          <div class="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Icon name="lucide:folder-open" class="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </UiCard>

      <UiCard class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Team Members</p>
            <p class="text-2xl font-bold">{{ metrics.teamMembers }}</p>
            <p class="text-xs text-green-600">+{{ metrics.newMembers }} joined</p>
          </div>
          <div class="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Icon name="lucide:users" class="h-5 w-5 text-green-600" />
          </div>
        </div>
      </UiCard>

      <UiCard class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Tasks Completed</p>
            <p class="text-2xl font-bold">{{ metrics.completedTasks }}</p>
            <p class="text-xs text-blue-600">{{ metrics.completionRate }}% completion rate</p>
          </div>
          <div class="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Icon name="lucide:check-circle" class="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </UiCard>

      <UiCard class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Active Integrations</p>
            <p class="text-2xl font-bold">{{ metrics.activeIntegrations }}</p>
            <p class="text-xs text-orange-600">{{ metrics.integrationHealth }}% healthy</p>
          </div>
          <div class="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <Icon name="lucide:plug" class="h-5 w-5 text-orange-600" />
          </div>
        </div>
      </UiCard>
    </div>



    <!-- Main Dashboard Content -->
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <!-- Main Content Area -->
      <div class="xl:col-span-3 space-y-6">
        <!-- Tabs Navigation -->
        <UiTabs v-model="activeTab" class="w-full">
          <UiTabsList class="grid w-full grid-cols-2">
            <UiTabsTrigger value="overview">Overview</UiTabsTrigger>
            <UiTabsTrigger value="users">Team Members</UiTabsTrigger>
          </UiTabsList>
          
          <UiTabsContent value="overview" class="space-y-6">
        <!-- Project Performance Chart -->
        <UiCard>
          <UiCardHeader>
            <UiCardTitle>Project Performance Overview</UiCardTitle>
            <UiCardDescription>Monthly project completion and team productivity</UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <UiApexchart 
              :options="chartOptions.projectPerformance" 
              :series="chartData.projectPerformance" 
              height="350"
            />
          </UiCardContent>
        </UiCard>

        <!-- Team Activity & Tasks -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Recent Activity -->
          <UiCard>
            <UiCardHeader>
              <UiCardTitle>Recent Activity</UiCardTitle>
              <UiCardDescription>Latest team updates and project changes</UiCardDescription>
            </UiCardHeader>
            <UiCardContent>
              <div class="space-y-4">
                <div v-for="activity in recentActivity" :key="activity.id" class="flex items-start gap-3">
                  <UiAvatar class="h-8 w-8 mt-1">
                    <UiAvatarImage :src="activity.user.avatar" :alt="activity.user.name" />
                    <UiAvatarFallback>{{ activity.user.initials }}</UiAvatarFallback>
                  </UiAvatar>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium">{{ activity.user.name }}</p>
                    <p class="text-sm text-muted-foreground">{{ activity.description }}</p>
                    <p class="text-xs text-muted-foreground">{{ activity.timeAgo }}</p>
                  </div>
                  <UiBadge :variant="activity.type" class="text-xs">{{ activity.project }}</UiBadge>
                </div>
              </div>
            </UiCardContent>
          </UiCard>

          <!-- Task Overview -->
          <UiCard>
            <UiCardHeader>
              <UiCardTitle>Task Overview</UiCardTitle>
              <UiCardDescription>Current task distribution and progress</UiCardDescription>
            </UiCardHeader>
            <UiCardContent>
              <div class="space-y-4">
                <div v-for="task in taskOverview" :key="task.id" class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">{{ task.name }}</span>
                    <span class="text-sm text-muted-foreground">{{ task.progress }}%</span>
                  </div>
                  <UiProgress :value="task.progress" class="h-2" />
                  <div class="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{{ task.completed }}/{{ task.total }} tasks</span>
                    <span>{{ task.dueDate }}</span>
                  </div>
                </div>
              </div>
            </UiCardContent>
          </UiCard>
        </div>

        <!-- Projects Table -->
        <UiCard>
          <UiCardHeader>
            <div class="flex items-center justify-between">
              <div>
                <UiCardTitle>Active Projects</UiCardTitle>
                <UiCardDescription>Manage and monitor project status</UiCardDescription>
              </div>
              <UiButton variant="outline" size="sm">
                <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
                Add Project
              </UiButton>
            </div>
          </UiCardHeader>
          <UiCardContent>
            <UiTable>
              <UiTableHeader>
                <UiTableRow>
                  <UiTableHead>Project</UiTableHead>
                  <UiTableHead>Team</UiTableHead>
                  <UiTableHead>Progress</UiTableHead>
                  <UiTableHead>Status</UiTableHead>
                  <UiTableHead>Due Date</UiTableHead>
                  <UiTableHead>Actions</UiTableHead>
                </UiTableRow>
              </UiTableHeader>
              <UiTableBody>
                <UiTableRow v-for="project in projects" :key="project.id">
                  <UiTableCell>
                    <div class="flex items-center gap-3">
                      <div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon :name="project.icon" class="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p class="font-medium">{{ project.name }}</p>
                        <p class="text-sm text-muted-foreground">{{ project.description }}</p>
                      </div>
                    </div>
                  </UiTableCell>
                  <UiTableCell>
                    <div class="flex -space-x-2">
                      <UiAvatar v-for="member in project.team.slice(0, 3)" :key="member.id" class="h-6 w-6 border-2 border-background">
                        <UiAvatarImage :src="member.avatar" :alt="member.name" />
                        <UiAvatarFallback class="text-xs">{{ member.initials }}</UiAvatarFallback>
                      </UiAvatar>
                      <div v-if="project.team.length > 3" class="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                        +{{ project.team.length - 3 }}
                      </div>
                    </div>
                  </UiTableCell>
                  <UiTableCell>
                    <div class="flex items-center gap-2">
                      <UiProgress :value="project.progress" class="h-2 w-20" />
                      <span class="text-sm text-muted-foreground">{{ project.progress }}%</span>
                    </div>
                  </UiTableCell>
                  <UiTableCell>
                    <UiBadge :variant="project.status.variant">{{ project.status.label }}</UiBadge>
                  </UiTableCell>
                  <UiTableCell>
                    <span class="text-sm">{{ project.dueDate }}</span>
                  </UiTableCell>
                  <UiTableCell>
                    <UiDropdownMenu>
                      <UiDropdownMenuTrigger as-child>
                        <UiButton variant="ghost" size="sm">
                          <Icon name="lucide:more-horizontal" class="h-4 w-4" />
                        </UiButton>
                      </UiDropdownMenuTrigger>
                      <UiDropdownMenuContent>
                        <UiDropdownMenuItem>
                          <Icon name="lucide:eye" class="h-4 w-4 mr-2" />
                          View Details
                        </UiDropdownMenuItem>
                        <UiDropdownMenuItem>
                          <Icon name="lucide:edit" class="h-4 w-4 mr-2" />
                          Edit Project
                        </UiDropdownMenuItem>
                        <UiDropdownMenuItem>
                          <Icon name="lucide:users" class="h-4 w-4 mr-2" />
                          Manage Team
                        </UiDropdownMenuItem>
                        <UiDropdownMenuSeparator />
                        <UiDropdownMenuItem class="text-destructive">
                          <Icon name="lucide:trash" class="h-4 w-4 mr-2" />
                          Delete Project
                        </UiDropdownMenuItem>
                      </UiDropdownMenuContent>
                    </UiDropdownMenu>
                  </UiTableCell>
                </UiTableRow>
              </UiTableBody>
            </UiTable>
          </UiCardContent>
        </UiCard>
          </UiTabsContent>
          
          <UiTabsContent value="users" class="space-y-6">
            <UserContent :admin-user-id="currentUserId" />
          </UiTabsContent>
        </UiTabs>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <UiCard>
          <UiCardHeader>
            <UiCardTitle>Quick Actions</UiCardTitle>
          </UiCardHeader>
          <UiCardContent class="space-y-3">
            <UiButton variant="outline" class="w-full justify-start" @click="showCreateProject = true">
              <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
              Create Project
            </UiButton>
            <UiButton variant="outline" class="w-full justify-start" @click="showInviteUser = true">
              <Icon name="lucide:user-plus" class="h-4 w-4 mr-2" />
              Invite User
            </UiButton>
            <UiButton variant="outline" class="w-full justify-start" @click="showIntegration = true">
              <Icon name="lucide:plug" class="h-4 w-4 mr-2" />
              Add Integration
            </UiButton>
            <UiButton variant="outline" class="w-full justify-start">
              <Icon name="lucide:settings" class="h-4 w-4 mr-2" />
              Organization Settings
            </UiButton>
          </UiCardContent>
        </UiCard>

        <!-- Team Members -->
        <UiCard>
          <UiCardHeader>
            <UiCardTitle>Team Members</UiCardTitle>
            <UiCardDescription>{{ teamMembers.length }} active members</UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <div class="space-y-3">
              <div v-for="member in teamMembers" :key="member.id" class="flex items-center gap-3">
                <UiAvatar class="h-8 w-8">
                  <UiAvatarImage :src="member.avatar" :alt="member.name" />
                  <UiAvatarFallback>{{ member.initials }}</UiAvatarFallback>
                </UiAvatar>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ member.name }}</p>
                  <p class="text-xs text-muted-foreground truncate">{{ member.role }}</p>
                </div>
                <UiBadge :variant="member.status" class="text-xs">{{ member.statusText }}</UiBadge>
              </div>
            </div>
          </UiCardContent>
        </UiCard>

        <!-- Integration Status -->
        <UiCard>
          <UiCardHeader>
            <UiCardTitle>Integrations</UiCardTitle>
            <UiCardDescription>Connected services and APIs</UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <div class="space-y-3">
              <div v-for="integration in integrations" :key="integration.id" class="flex items-center justify-between p-3 rounded-lg border">
                <div class="flex items-center gap-3">
                  <div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon :name="integration.icon" class="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p class="text-sm font-medium">{{ integration.name }}</p>
                    <p class="text-xs text-muted-foreground">{{ integration.type }}</p>
                  </div>
                </div>
                <UiBadge :variant="integration.status" class="text-xs">{{ integration.statusText }}</UiBadge>
              </div>
            </div>
          </UiCardContent>
        </UiCard>
      </div>
    </div>

    <!-- Modals -->
    <UiDialog v-model:open="showCreateProject">
      <UiDialogContent class="sm:max-w-[500px]">
        <UiDialogHeader>
          <UiDialogTitle>Create New Project</UiDialogTitle>
          <UiDialogDescription>Set up a new project for your team</UiDialogDescription>
        </UiDialogHeader>
        <form class="space-y-4" @submit.prevent="createProject">
          <div class="space-y-2">
            <UiLabel for="project-name">Project Name</UiLabel>
            <UiInput id="project-name" v-model="newProject.name" placeholder="Enter project name" required />
          </div>
          <div class="space-y-2">
            <UiLabel for="project-description">Description</UiLabel>
            <UiTextarea id="project-description" v-model="newProject.description" placeholder="Project description" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <UiLabel for="start-date">Start Date</UiLabel>
              <UiDatepicker v-model="newProject.startDate" />
            </div>
            <div class="space-y-2">
              <UiLabel for="due-date">Due Date</UiLabel>
              <UiDatepicker v-model="newProject.dueDate" />
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <UiButton type="button" variant="outline" @click="showCreateProject = false">Cancel</UiButton>
            <UiButton type="submit">Create Project</UiButton>
          </div>
        </form>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import UserContent from '~/components/Dashboard/UserContent.vue'

definePageMeta({ layout: 'dashboard' })

// Check authentication
const { isLoggedIn, user } = useAuth()

// Redirect to login if not authenticated
if (!isLoggedIn.value) {
  await navigateTo('/account/login')
}

useSeoMeta({
  title: 'Organization Dashboard',
  description: 'Enterprise-grade organization management dashboard',
})

// Reactive data
const activeTab = ref('overview')
const currentUserId = computed(() => user.value?.id || 1) // Use actual user ID from auth
const showCreateProject = ref(false)
const showInviteUser = ref(false)
const showIntegration = ref(false)

const newProject = ref({
  name: '',
  description: '',
  startDate: null,
  dueDate: null
})

// Metrics data
const metrics = ref({
  activeProjects: 12,
  newProjects: 3,
  teamMembers: 24,
  newMembers: 2,
  completedTasks: 156,
  completionRate: 87,
  activeIntegrations: 8,
  integrationHealth: 95
})

// Chart data
const chartOptions = {
  projectPerformance: {
    chart: {
      type: 'area' as const,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `${value}%`
      }
    },
    legend: {
      position: 'top' as const
    }
  }
}

const chartData = {
  projectPerformance: [
    {
      name: 'Project Completion',
      data: [65, 72, 68, 75, 82, 78, 85, 88, 92, 89, 94, 96]
    },
    {
      name: 'Team Productivity',
      data: [58, 64, 62, 69, 75, 71, 78, 81, 85, 82, 87, 89]
    },
    {
      name: 'Task Efficiency',
      data: [72, 78, 75, 82, 88, 85, 91, 94, 97, 95, 98, 99]
    }
  ]
}

// Sample data
const recentActivity = ref([
  {
    id: 1,
    user: { name: 'Sarah Chen', avatar: 'https://github.com/shadcn.png', initials: 'SC' },
    description: 'Completed the API integration for payment processing',
    project: 'E-commerce Platform',
    type: 'default' as const,
    timeAgo: '2 minutes ago'
  },
  {
    id: 2,
    user: { name: 'Alex Rodriguez', avatar: 'https://github.com/shadcn.png', initials: 'AR' },
    description: 'Updated the mobile app design system',
    project: 'Mobile App',
    type: 'secondary' as const,
    timeAgo: '15 minutes ago'
  },
  {
    id: 3,
    user: { name: 'Emily Watson', avatar: 'https://github.com/shadcn.png', initials: 'EW' },
    description: 'Deployed the new authentication system',
    project: 'Security Update',
    type: 'destructive' as const,
    timeAgo: '1 hour ago'
  }
])

const taskOverview = ref([
  { id: 1, name: 'Frontend Development', progress: 85, completed: 17, total: 20, dueDate: 'Dec 15' },
  { id: 2, name: 'Backend API', progress: 72, completed: 18, total: 25, dueDate: 'Dec 20' },
  { id: 3, name: 'Database Migration', progress: 95, completed: 19, total: 20, dueDate: 'Dec 10' }
])

const projects = ref([
  {
    id: 1,
    name: 'E-commerce Platform',
    description: 'Modern online shopping experience',
    icon: 'lucide:shopping-cart',
    team: [
      { id: 1, name: 'Sarah Chen', avatar: 'https://github.com/shadcn.png', initials: 'SC' },
      { id: 2, name: 'Alex Rodriguez', avatar: 'https://github.com/shadcn.png', initials: 'AR' }
    ],
    progress: 85,
    status: { label: 'In Progress', variant: 'default' as const },
    dueDate: 'Dec 15, 2024'
  },
  {
    id: 2,
    name: 'Mobile App Redesign',
    description: 'iOS and Android app overhaul',
    icon: 'lucide:smartphone',
    team: [
      { id: 3, name: 'Emily Watson', avatar: 'https://github.com/shadcn.png', initials: 'EW' },
      { id: 4, name: 'Mike Johnson', avatar: 'https://github.com/shadcn.png', initials: 'MJ' }
    ],
    progress: 62,
    status: { label: 'Planning', variant: 'secondary' as const },
    dueDate: 'Jan 20, 2025'
  },
  {
    id: 3,
    name: 'API Gateway',
    description: 'Microservices architecture',
    icon: 'lucide:server',
    team: [
      { id: 5, name: 'David Kim', avatar: 'https://github.com/shadcn.png', initials: 'DK' },
      { id: 6, name: 'Lisa Wang', avatar: 'https://github.com/shadcn.png', initials: 'LW' }
    ],
    progress: 93,
    status: { label: 'Testing', variant: 'default' as const },
    dueDate: 'Dec 10, 2024'
  }
])

const teamMembers = ref([
  { id: 1, name: 'Sarah Chen', role: 'Senior Developer', avatar: 'https://github.com/shadcn.png', initials: 'SC', status: 'default' as const, statusText: 'Online' },
  { id: 2, name: 'Alex Rodriguez', role: 'Product Manager', avatar: 'https://github.com/shadcn.png', initials: 'AR', status: 'default' as const, statusText: 'Online' },
  { id: 3, name: 'Emily Watson', role: 'UX Designer', avatar: 'https://github.com/shadcn.png', initials: 'EW', status: 'secondary' as const, statusText: 'Away' },
  { id: 4, name: 'Mike Johnson', role: 'DevOps Engineer', avatar: 'https://github.com/shadcn.png', initials: 'MJ', status: 'default' as const, statusText: 'Online' }
])

const integrations = ref([
  { id: 1, name: 'GitHub', type: 'Version Control', icon: 'lucide:github', status: 'default' as const, statusText: 'Connected' },
  { id: 2, name: 'Slack', type: 'Communication', icon: 'lucide:message-circle', status: 'default' as const, statusText: 'Connected' },
  { id: 3, name: 'Jira', type: 'Project Management', icon: 'lucide:kanban', status: 'secondary' as const, statusText: 'Syncing' },
  { id: 4, name: 'AWS', type: 'Cloud Services', icon: 'lucide:cloud', status: 'default' as const, statusText: 'Connected' }
])

// Methods
const createProject = () => {
  // Add project creation logic here
  console.log('Creating project:', newProject.value)
  showCreateProject.value = false
  newProject.value = { name: '', description: '', startDate: null, dueDate: null }
}
</script>
