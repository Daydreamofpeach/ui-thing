<template>
  <div class="space-y-6">
    <!-- Header with Create Project Button -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">My Projects</h2>
        <p class="text-muted-foreground">Manage and view your projects</p>
      </div>
      <UiButton :disabled="loading" @click="showCreateModal = true">
        <UiLoader v-if="loading" class="h-4 w-4 mr-2" />
        <Icon v-else name="lucide:plus" class="h-4 w-4 mr-2" />
        {{ loading ? 'Loading...' : 'Create Project' }}
      </UiButton>
    </div>

    <!-- Projects Display -->
    <div v-if="projects.length > 0">
      <UiScrollArea orientation="horizontal" class="rounded-md border whitespace-nowrap">
        <div class="flex w-max gap-4 p-4">
          <div v-for="project in projects" :key="project.id" class="shrink-0">
            <UiCard class="w-[300px] h-[400px] overflow-hidden" :class="{ 'opacity-50': loading }">
              <div class="relative h-[250px] overflow-hidden">
                <img
                  v-if="project.image_url"
                  :src="project.image_url"
                  :alt="project.name"
                  class="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                >
                <div v-else class="w-full h-full bg-muted flex items-center justify-center">
                  <Icon name="lucide:folder" class="h-12 w-12 text-muted-foreground" />
                </div>
                <UiDropdownMenu>
                  <UiDropdownMenuTrigger as-child>
                    <UiButton
                      variant="ghost"
                      size="icon"
                      class="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
                      :disabled="loading"
                    >
                      <Icon name="lucide:more-horizontal" class="h-4 w-4" />
                    </UiButton>
                  </UiDropdownMenuTrigger>
                  <UiDropdownMenuContent align="end">
                    <UiDropdownMenuItem :disabled="loading" @click="editProject(project)">
                      <Icon name="lucide:edit" class="h-4 w-4 mr-2" />
                      Edit
                    </UiDropdownMenuItem>
                    <UiDropdownMenuItem class="text-destructive" :disabled="loading" @click="deleteProject(project.id)">
                      <Icon name="lucide:trash" class="h-4 w-4 mr-2" />
                      Delete
                    </UiDropdownMenuItem>
                  </UiDropdownMenuContent>
                </UiDropdownMenu>
              </div>
              <UiCardContent class="p-4">
                <h3 class="font-semibold text-lg mb-2 line-clamp-1">{{ project.name }}</h3>
                <p class="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {{ project.description || 'No description provided' }}
                </p>
                <div class="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created {{ formatDate(project.created_at) }}</span>
                  <UiBadge variant="secondary">Active</UiBadge>
                </div>
              </UiCardContent>
            </UiCard>
          </div>
        </div>
      </UiScrollArea>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <Icon name="lucide:folder-plus" class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">No projects yet</h3>
      <p class="text-muted-foreground mb-4">Create your first project to get started</p>
      <UiButton :disabled="loading" @click="showCreateModal = true">
        <UiLoader v-if="loading" class="h-4 w-4 mr-2" />
        <Icon v-else name="lucide:plus" class="h-4 w-4 mr-2" />
        {{ loading ? 'Loading...' : 'Create Project' }}
      </UiButton>
    </div>

    <!-- Create Project Modal -->
    <UiDialog v-model:open="showCreateModal">
      <UiDialogContent class="sm:max-w-[500px]">
        <UiDialogHeader>
          <UiDialogTitle>Create New Project</UiDialogTitle>
          <UiDialogDescription>Add a new project to your collection</UiDialogDescription>
        </UiDialogHeader>
        <form class="space-y-4" @submit.prevent="createProject">
          <div class="space-y-2">
            <UiLabel for="project-name">Project Name *</UiLabel>
            <UiInput
              id="project-name"
              v-model="newProject.name"
              placeholder="Enter project name"
              required
            />
          </div>
          <div class="space-y-2">
            <UiLabel for="project-description">Description</UiLabel>
            <UiTextarea
              id="project-description"
              v-model="newProject.description"
              placeholder="Project description"
              :rows="3"
            />
          </div>
          <div class="space-y-2">
            <UiLabel for="project-image">Image URL</UiLabel>
                       <UiInput
             id="project-image"
             v-model="newProject.image_url"
             placeholder="https://example.com/image.jpg"
           />
          </div>
          <div class="flex justify-end gap-3">
            <UiButton type="button" variant="outline" :disabled="loading" @click="closeModal">
              Cancel
            </UiButton>
            <UiButton type="submit" :disabled="!newProject.name.trim() || loading">
              <UiLoader v-if="loading" class="h-4 w-4 mr-2" />
              {{ loading ? 'Creating...' : 'Create Project' }}
            </UiButton>
          </div>
        </form>
      </UiDialogContent>
    </UiDialog>

    <!-- Edit Project Modal -->
    <UiDialog v-model:open="showEditModal">
      <UiDialogContent class="sm:max-w-[500px]">
        <UiDialogHeader>
          <UiDialogTitle>Edit Project</UiDialogTitle>
          <UiDialogDescription>Update your project details</UiDialogDescription>
        </UiDialogHeader>
                 <form v-if="editingProject" class="space-y-4" @submit.prevent="updateProject">
           <div class="space-y-2">
             <UiLabel for="edit-project-name">Project Name *</UiLabel>
             <UiInput
               id="edit-project-name"
               v-model="editingProject.name"
               placeholder="Enter project name"
               required
             />
           </div>
           <div class="space-y-2">
             <UiLabel for="edit-project-description">Description</UiLabel>
             <UiTextarea
               id="edit-project-description"
               v-model="editingProject.description"
               placeholder="Project description"
               :rows="3"
             />
           </div>
           <div class="space-y-2">
             <UiLabel for="edit-project-image">Image URL</UiLabel>
                        <UiInput
             id="edit-project-image"
             v-model="editingProject.image_url"
             placeholder="https://example.com/image.jpg"
           />
           </div>
          <div class="flex justify-end gap-3">
            <UiButton type="button" variant="outline" :disabled="loading" @click="closeEditModal">
              Cancel
            </UiButton>
            <UiButton type="submit" :disabled="!editingProject?.name?.trim() || loading">
              <UiLoader v-if="loading" class="h-4 w-4 mr-2" />
              {{ loading ? 'Updating...' : 'Update Project' }}
            </UiButton>
          </div>
         </form>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/lib/projects'

// Props
const props = defineProps<{
  userId: number
}>()

// Reactive data
const projects = ref<Project[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const loading = ref(false)

const newProject = ref({
  name: '',
  description: '',
  image_url: ''
})

const editingProject = ref<Project | null>(null)

// Toast notifications - useSonner is auto-imported

// Methods
const fetchProjects = async () => {
  try {
    loading.value = true
    const response = await $fetch<{ success: boolean; projects: Project[] }>(`/api/projects?user_id=${props.userId}`)
    if (response.success) {
      projects.value = response.projects
    }
  } catch {
    useSonner.error('Failed to load projects', {
      description: 'Please try again later'
    })
  } finally {
    loading.value = false
  }
}

const createProject = async () => {
  if (!newProject.value.name.trim()) {
    useSonner.error('Project name is required')
    return
  }

  try {
    loading.value = true
    const response = await $fetch<{ success: boolean; project: Project }>('/api/projects', {
      method: 'POST',
      body: {
        name: newProject.value.name,
        description: newProject.value.description,
        image_url: newProject.value.image_url,
        user_id: props.userId
      }
    })

    if (response.success && response.project) {
      projects.value.unshift(response.project)
      closeModal()
      useSonner.success('Project created successfully', {
        description: `${response.project.name} has been added to your projects`
      })
    }
  } catch {
    useSonner.error('Failed to create project', {
      description: 'Please try again later'
    })
  } finally {
    loading.value = false
  }
}

const editProject = (project: Project) => {
  editingProject.value = { ...project }
  showEditModal.value = true
}

const updateProject = async () => {
  if (!editingProject.value || !editingProject.value.id) {
    useSonner.error('No project selected for editing')
    return
  }

  if (!editingProject.value.name.trim()) {
    useSonner.error('Project name is required')
    return
  }

  try {
    loading.value = true
    const response = await $fetch<{ success: boolean; project: Project }>(`/api/projects/${editingProject.value.id}`, {
      method: 'PUT',
      body: {
        name: editingProject.value.name,
        description: editingProject.value.description,
        image_url: editingProject.value.image_url
      }
    })

    if (response.success && response.project) {
      const index = projects.value.findIndex(p => p.id === editingProject.value!.id)
      if (index !== -1) {
        projects.value[index] = response.project
      }
      closeEditModal()
      useSonner.success('Project updated successfully', {
        description: `${response.project.name} has been updated`
      })
    }
  } catch {
    useSonner.error('Failed to update project', {
      description: 'Please try again later'
    })
  } finally {
    loading.value = false
  }
}

const deleteProject = async (projectId: number) => {
  const project = projects.value.find(p => p.id === projectId)
  if (!project) return

  // Show confirmation dialog
  const confirmed = await new Promise<boolean>((resolve) => {
    // You can replace this with a proper confirmation dialog component
    resolve(confirm(`Are you sure you want to delete "${project.name}"?`))
  })

  if (!confirmed) return

  try {
    loading.value = true
    
    // Optimistically remove the project from the UI immediately
    const projectIndex = projects.value.findIndex(p => p.id === projectId)
    if (projectIndex === -1) return
    
    // Store the project for potential restoration
    const projectToDelete = projects.value[projectIndex]
    projects.value.splice(projectIndex, 1)
    
    // Show immediate feedback
    useSonner.success('Project deleted', {
      description: `${projectToDelete.name} has been removed`
    })
    
    // Make the API call in the background
    try {
      await $fetch<{ success: boolean }>(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })
    } catch (apiError: any) {
      // If API fails, restore the project and show error
      if (apiError.statusCode !== 404) {
        projects.value.splice(projectIndex, 0, projectToDelete)
        useSonner.error('Failed to delete project', {
          description: 'The project has been restored. Please try again.'
        })
      }
    }
    
  } catch {
    useSonner.error('Failed to delete project', {
      description: 'Please try again later'
    })
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  newProject.value = { name: '', description: '', image_url: '' }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingProject.value = null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  fetchProjects()
})

// Watch for userId changes
watch(() => props.userId, () => {
  if (props.userId) {
    fetchProjects()
  }
})
</script>
