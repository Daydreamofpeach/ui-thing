import { ref, computed, readonly } from 'vue'
import { buttClient } from '~/utils/buttClient'

export interface Template {
  id?: string
  templateId?: string
  name: string
  description: string
  butt?: string
  template: Record<string, any>
  type?: string
  version?: number
  elevated?: boolean
  privilege?: string
  author?: string
  public?: boolean
  visibility?: string
  executionType?: string
  meta?: Record<string, any>
  requirements?: Record<string, any>
  creator?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
}

export interface CreateTemplateData {
  name: string
  description: string
  butt?: string
  template: Record<string, any>
  type?: string
  elevated?: boolean
  privilege?: string
  author?: string
  public?: boolean
  visibility?: string
  executionType?: string
  meta?: Record<string, any>
  requirements?: Record<string, any>
}

export interface UpdateTemplateData {
  name?: string
  butt?: string
  description?: string
  template?: Record<string, any>
}

export const useTemplateManagement = () => {
  const templates = ref<Template[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentTemplate = ref<Template | null>(null)

  // Computed
  const templatesByProject = computed(() => (projectId: string) => {
    return templates.value.filter(template => 
      template.meta?.projectId === projectId || 
      template.requirements?.projectId === projectId
    )
  })

  const templatesByOrganization = computed(() => (organizationId: string) => {
    return templates.value.filter(template => 
      template.meta?.organizationId === organizationId || 
      template.requirements?.organizationId === organizationId
    )
  })

  // Methods
  const loadAllTemplates = async () => {
    isLoading.value = true
    error.value = null

    try {
      const data = await buttClient.findAllTemplate()
      templates.value = Array.isArray(data) ? data : []
    } catch (err: any) {
      console.error('Error loading templates:', err)
      error.value = err?.message || 'Failed to load templates'
      templates.value = []
    } finally {
      isLoading.value = false
    }
  }

  const loadTemplatesByProject = async (projectId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const data = await buttClient.findByProjectIdTemplate(projectId)
      const projectTemplates = Array.isArray(data) ? data : []
      
      // Update the main templates array with project-specific templates
      const existingTemplates = templates.value.filter(t => 
        !t.meta?.projectId || t.meta.projectId !== projectId
      )
      templates.value = [...existingTemplates, ...projectTemplates]
    } catch (err: any) {
      console.error('Error loading project templates:', err)
      error.value = err?.message || 'Failed to load project templates'
    } finally {
      isLoading.value = false
    }
  }

  const loadTemplatesByOrganization = async (organizationId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const data = await buttClient.findByOrganisationIdTemplate(organizationId)
      const orgTemplates = Array.isArray(data) ? data : []
      
      // Update the main templates array with organization-specific templates
      const existingTemplates = templates.value.filter(t => 
        !t.meta?.organizationId || t.meta.organizationId !== organizationId
      )
      templates.value = [...existingTemplates, ...orgTemplates]
    } catch (err: any) {
      console.error('Error loading organization templates:', err)
      error.value = err?.message || 'Failed to load organization templates'
    } finally {
      isLoading.value = false
    }
  }

  const loadTemplateById = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const data = await buttClient.findByIdTemplate(id)
      currentTemplate.value = data
      return data
    } catch (err: any) {
      console.error('Error loading template:', err)
      error.value = err?.message || 'Failed to load template'
      currentTemplate.value = null
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createTemplate = async (templateData: CreateTemplateData) => {
    isLoading.value = true
    error.value = null

    try {
      const data = await buttClient.createTemplate(templateData)
      
      // Add to local templates array
      if (data) {
        templates.value.unshift(data as Template)
      }
      
      return data
    } catch (err: any) {
      console.error('Error creating template:', err)
      error.value = err?.message || 'Failed to create template'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateTemplate = async (id: string, templateData: UpdateTemplateData) => {
    isLoading.value = true
    error.value = null

    try {
      const data = await buttClient.updateTemplate(id, templateData)
      
      // Update local templates array
      const index = templates.value.findIndex(t => t.id === id)
      if (index !== -1 && data) {
        templates.value[index] = { ...templates.value[index], ...data }
      }
      
      return data
    } catch (err: any) {
      console.error('Error updating template:', err)
      error.value = err?.message || 'Failed to update template'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteTemplate = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      await buttClient.deleteTemplate(id)
      
      // Remove from local templates array
      templates.value = templates.value.filter(t => t.id !== id)
      
      return true
    } catch (err: any) {
      console.error('Error deleting template:', err)
      error.value = err?.message || 'Failed to delete template'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const copyTemplate = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const data = await buttClient.copy(id)
      
      // Add to local templates array
      if (data) {
        templates.value.unshift(data as Template)
      }
      
      return data
    } catch (err: any) {
      console.error('Error copying template:', err)
      error.value = err?.message || 'Failed to copy template'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const executeTemplate = async (id: string, message: Record<string, any>) => {
    isLoading.value = true
    error.value = null

    try {
      const data = await buttClient.exec(id, { message })
      return data
    } catch (err: any) {
      console.error('Error executing template:', err)
      error.value = err?.message || 'Failed to execute template'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const previewTemplate = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const data = await buttClient.preview(id)
      return data
    } catch (err: any) {
      console.error('Error previewing template:', err)
      error.value = err?.message || 'Failed to preview template'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getTemplateUrl = async (id: string) => {
    try {
      const data = await buttClient.getTemplateUrl(id)
      return data
    } catch (err: any) {
      console.error('Error getting template URL:', err)
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentTemplate = () => {
    currentTemplate.value = null
  }

  return {
    // State
    templates: readonly(templates),
    isLoading: readonly(isLoading),
    error: readonly(error),
    currentTemplate: readonly(currentTemplate),

    // Computed
    templatesByProject,
    templatesByOrganization,

    // Methods
    loadAllTemplates,
    loadTemplatesByProject,
    loadTemplatesByOrganization,
    loadTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    copyTemplate,
    executeTemplate,
    previewTemplate,
    getTemplateUrl,
    clearError,
    clearCurrentTemplate
  }
}
