import { ref, computed } from 'vue';
import { buttClient } from '~/utils/buttClient';
import { useToast } from '~/components/Ui/composables/useToast';

export interface ThemeTemplate {
  id: string;
  name: string;
  description: string;
  theme: {
    name: string;
    label: string;
    fonts: {
      heading: string;
      body: string;
      mono: string;
    };
    cssVars: {
      light: Record<string, string>;
      dark: Record<string, string>;
    };
    borders?: {
      radius: string;
    };
    spacing?: {
      scale: string;
      customMultiplier: number;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

export function useThemeTemplateManagement() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const templates = ref<ThemeTemplate[]>([]);
  const toast = useToast();

  // Load theme templates from BAPI
  const loadThemeTemplates = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // Fetch all templates and filter for theme templates
      const allTemplates = await buttClient.findAllTemplate();
      
      // Filter templates that have THEME identifier in description
      const themeTemplates = allTemplates
        .filter((template: any) => 
          template.description?.includes('THEME') || 
          template.meta?.themeType === 'custom'
        )
        .map((template: any) => {
          try {
            const themeData = template.template?.theme || template.template;
            return {
              id: template.id,
              name: template.name,
              description: template.description,
              theme: themeData,
              createdAt: template.createdAt,
              updatedAt: template.updatedAt,
            } as ThemeTemplate;
          } catch (err) {
            console.error('Error parsing theme template:', err);
            return null;
          }
        })
        .filter((t): t is ThemeTemplate => t !== null);

      templates.value = themeTemplates;
      return themeTemplates;
    } catch (err: any) {
      error.value = err.message || 'Failed to load theme templates';
      toast.error('Error', {
        description: error.value,
      });
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  // Save theme as template to BAPI
  const saveThemeAsTemplate = async (themeData: {
    name: string;
    description: string;
    theme: {
      name: string;
      label: string;
      fonts: {
        heading: string;
        body: string;
        mono: string;
      };
      cssVars: {
        light: Record<string, string>;
        dark: Record<string, string>;
      };
      borders?: {
        radius: string;
      };
      spacing?: {
        scale: string;
        customMultiplier: number;
      };
    };
  }) => {
    isLoading.value = true;
    error.value = null;

    try {
      // Generate a BUTT identifier
      const buttId = `THEME.${themeData.name.replace(/\s+/g, '')}.${Date.now()}`;

      // Add THEME identifier to description (silent injection)
      const descriptionWithFlag = themeData.description
        ? `${themeData.description} THEME`
        : `Custom theme: ${themeData.name} THEME`;

      // Prepare template data according to BAPI specification
      const templatePayload = {
        name: themeData.name,
        description: descriptionWithFlag,
        template: {
          type: 'THEME',
          theme: {
            name: themeData.theme.name,
            label: themeData.theme.label,
            fonts: themeData.theme.fonts,
            cssVars: themeData.theme.cssVars,
            borders: themeData.theme.borders,
            spacing: themeData.theme.spacing,
          },
        },
        author: 'USER',
        public: false,
        elevated: false,
        meta: {
          butt: buttId,
          themeType: 'custom',
          themeName: themeData.theme.name,
        },
      };

      console.log('💾 Saving theme template to BAPI:', templatePayload);

      // Call BAPI to create template
      const createdTemplate = await buttClient.createTemplate(templatePayload);

      toast.success('Theme Saved', {
        description: `"${themeData.name}" has been saved as a template`,
      });

      // Reload templates
      await loadThemeTemplates();

      return createdTemplate;
    } catch (err: any) {
      error.value = err.message || 'Failed to save theme template';
      toast.error('Error', {
        description: error.value,
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Delete theme template
  const deleteThemeTemplate = async (templateId: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      await buttClient.deleteTemplate(templateId);

      toast.success('Theme Deleted', {
        description: 'Theme template has been deleted successfully',
      });

      // Reload templates
      await loadThemeTemplates();
    } catch (err: any) {
      error.value = err.message || 'Failed to delete theme template';
      toast.error('Error', {
        description: error.value,
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Get theme template by ID
  const getThemeTemplateById = async (templateId: string): Promise<ThemeTemplate | null> => {
    try {
      const template = await buttClient.findByIdTemplate(templateId);
      if (!template) return null;

      const themeData = template.template?.theme || template.template;
      return {
        id: template.id,
        name: template.name,
        description: template.description,
        theme: themeData,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      } as ThemeTemplate;
    } catch (err: any) {
      error.value = err.message || 'Failed to load theme template';
      return null;
    }
  };

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    templates: computed(() => templates.value),
    loadThemeTemplates,
    saveThemeAsTemplate,
    deleteThemeTemplate,
    getThemeTemplateById,
  };
}

