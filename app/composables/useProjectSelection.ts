import { ref, computed, watch, readonly } from 'vue'
import { getButtClient } from '~/utils/buttClient'
import { useSelectedOrganisationId } from './useSelectedOrganisationId'

// Global state for project selection
const selectedProjectId = ref<string | null>(null)
const selectedProject = ref<any>(null)
const projects = ref<any[]>([])
const isLoadingProjects = ref(false)

// Clear project selection function (defined before watcher)
const clearProjectSelection = () => {
  selectedProject.value = null
  selectedProjectId.value = null
}

// Load projects for a specific organization (defined at module level for watcher)
const loadProjectsForOrganization = async (organizationId: string) => {
  if (!organizationId) {
    projects.value = []
    return
  }

  console.log('[useProjectSelection] Loading projects for organization:', organizationId)
  isLoadingProjects.value = true
  try {
    const client = getButtClient()
    // Get all projects and filter by organization
    const allProjects = await client.findAllProject()
    const filteredProjects = Array.isArray(allProjects) 
      ? allProjects.filter(project => String(project.organisationId) === String(organizationId))
      : []
    
    projects.value = filteredProjects
    console.log('[useProjectSelection] Loaded projects:', filteredProjects.length)
  } catch (error) {
    console.error('[useProjectSelection] Failed to load projects:', error)
    projects.value = []
  } finally {
    isLoadingProjects.value = false
  }
}

// Watch for organization changes and automatically load projects
const selectedOrganisationId = useSelectedOrganisationId()
watch(selectedOrganisationId, async (newOrgId, oldOrgId) => {
  // When organization changes
  if (newOrgId !== oldOrgId) {
    console.log('[useProjectSelection] Organization changed from', oldOrgId, 'to', newOrgId)
    // Clear project selection
    clearProjectSelection()
    
    // Automatically load projects for the new organization
    if (newOrgId) {
      await loadProjectsForOrganization(newOrgId)
    } else {
      // No organization selected, clear projects
      projects.value = []
    }
  }
}, { immediate: true }) // immediate: true to load projects on initial mount if org is already selected

export function useProjectSelection() {
  // Set selected project
  const setSelectedProject = (project: any) => {
    selectedProject.value = project
    selectedProjectId.value = project?.id?.toString() || null
  }

  // Create a new project
  const createProject = async (projectData: any) => {
    try {
      const client = getButtClient()
      const newProject = await client.createProject(projectData)
      
      // Add to projects list
      projects.value.push(newProject)
      
      // Auto-select the new project
      setSelectedProject(newProject)
      
      return newProject
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }

  const updateProject = async (id: string, data: any) => {
    try {
      const client = getButtClient()
      const updated = await client.updateProject(id, data)
      const idx = projects.value.findIndex((p) => String(p.id) === String(id))
      if (idx !== -1 && updated) {
        projects.value[idx] = updated
      }
      if (String(selectedProjectId.value || '') === String(id)) {
        setSelectedProject(updated)
      }
      return updated
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const client = getButtClient()
      await client.deleteProject(id)
      projects.value = projects.value.filter((p) => String(p.id) !== String(id))
      if (String(selectedProjectId.value || '') === String(id)) {
        clearProjectSelection()
      }
      return true
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    }
  }

  // Computed properties
  const hasSelectedProject = computed(() => !!selectedProject.value)
  const selectedProjectName = computed(() => selectedProject.value?.name || 'No project selected')
  const availableProjects = computed(() => projects.value)

  return {
    // State
    selectedProjectId: readonly(selectedProjectId),
    selectedProject: readonly(selectedProject),
    projects: readonly(projects),
    isLoadingProjects: readonly(isLoadingProjects),
    
    // Computed
    hasSelectedProject,
    selectedProjectName,
    availableProjects,
    
    // Methods
    setSelectedProject,
    clearProjectSelection,
    loadProjectsForOrganization,
    createProject
    ,
    updateProject,
    deleteProject
  }
}
