import { ref, computed } from "vue";
import { buttClient } from "~/utils/buttClient";
import { useToast } from "~/components/Ui/composables/useToast";
import { useSelectedOrganisationId } from "./useSelectedOrganisationId";
import { useProjectSelection } from "./useProjectSelection";
import { generateAutomationSteps } from "~/utils/formAutomationSteps";

export interface FormTemplate {
	id: string
	name: string
	description: string
	title: string
	submitLabel: string
	fields: FormField[]
	category: string
	tags: string[]
	version: string
	createdAt: string
	updatedAt: string
	template?: {
		type: string
		formData?: any
		projectId?: string
	}
	meta?: {
		projectId?: string
		butt?: string
		formType?: string
	}
}

export interface FormField {
	label: string
	name: string
	type: string
	component: string
	placeholder?: string
	required?: boolean
	description?: string
	options?: Array<{ label: string; value: string }>
}

const templates = ref<FormTemplate[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

export function useFormTemplateManagement() {
	const toast = useToast();
	const { selectedOrganisationId } = useSelectedOrganisationId();
	const { selectedProjectId } = useProjectSelection();

	// Load templates from BAPI
	const loadTemplates = async () => {
		isLoading.value = true;
		error.value = null;

		try {
			// Load templates from BAPI
			const allTemplates = await buttClient.findAllTemplate();
			
			// Filter for form automation templates - ONLY show templates with FORMTEMPLATE flag
			const formTemplates = allTemplates
				.filter((t: any) => {
					// Require FORMTEMPLATE flag in description (silent flag for filtering)
					const hasFormTemplateFlag = t.description?.includes("FORMTEMPLATE") || 
						t.meta?.description?.includes("FORMTEMPLATE");
					// Only include if it has the FORMTEMPLATE flag
					return hasFormTemplateFlag;
				})
				.map((t: any) => {
					// Strip FORMTEMPLATE flag from description for display
					const cleanDescription = (t.description || "")
						.replace(/\s*FORMTEMPLATE\s*/gi, "")
						.trim();
					
					return {
						id: t.id,
						name: t.name,
						description: cleanDescription,
						title: t.template?.formData?.title || t.name,
						submitLabel: t.template?.formData?.submitLabel || "Submit",
						fields: t.template?.formData?.fields || [],
						category: t.template?.formData?.category || "custom",
						tags: t.template?.formData?.tags || ["custom"],
						version: t.template?.formData?.version || "1.0.0",
						createdAt: t.createdAt || new Date().toISOString(),
						updatedAt: t.updatedAt || new Date().toISOString(),
						template: t.template,
						meta: t.meta
					};
				});

			templates.value = formTemplates;
			return formTemplates;
		} catch (err: any) {
			error.value = err.message || "Failed to load templates";
			toast.add({
				title: "Error",
				description: error.value,
				color: "error"
			});
			return [];
		} finally {
			isLoading.value = false;
		}
	};

	// Save form as template to BAPI
	const saveFormAsTemplate = async (formData: {
		title: string
		description: string
		submitLabel: string
		fields: FormField[]
		category?: string
		tags?: string[]
	}) => {
		isLoading.value = true;
		error.value = null;

		try {
			// Generate a BUTT identifier
			const buttId = `FORM_TEMPLATE.${formData.title.replace(/\s+/g, "")}.${Date.now()}`;

			// Generate automation steps from form configuration
			const automationSteps = generateAutomationSteps(
				formData.title,
				formData.description,
				formData.submitLabel,
				formData.fields
			);

			// Prepare template data according to BAPI specification
			// Add FORMTEMPLATE flag to description for filtering
			const descriptionWithFlag = formData.description 
				? `${formData.description} FORMTEMPLATE`
				: `Form automation template: ${formData.title} FORMTEMPLATE`;
			
			const templatePayload = {
				name: formData.title,
				description: descriptionWithFlag,
				template: {
					type: "FORM_AUTOMATION",
					formData: {
						title: formData.title,
						description: formData.description,
						submitLabel: formData.submitLabel,
						fields: formData.fields,
						category: formData.category || "custom",
						tags: formData.tags || ["custom", "user-created"],
						version: "1.0.0"
					},
					automationSteps, // Include automation steps in template
					projectId: selectedProjectId.value || undefined
				},
				author: "USER",
				public: false,
				elevated: false,
				meta: {
					projectId: selectedProjectId.value || undefined,
					butt: buttId,
					formType: "automation"
				}
			};

			console.log("💾 Saving form template to BAPI:", templatePayload);

			// Call BAPI to create template
			const createdTemplate = await buttClient.createTemplate(templatePayload);

			toast.add({
				title: "Template Saved",
				description: `"${formData.title}" has been saved as a template`,
				color: "success"
			});

			// Reload templates
			await loadTemplates();

			return createdTemplate;
		} catch (err: any) {
			error.value = err.message || "Failed to save template";
			toast.add({
				title: "Error",
				description: error.value,
				color: "error"
			});
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	// Update existing template
	const updateTemplate = async (templateId: string, updates: Partial<FormTemplate>) => {
		isLoading.value = true;
		error.value = null;

		try {
			// Get existing template
			const existingTemplate = await buttClient.findByIdTemplate(templateId);

			// Prepare update payload
			const updatePayload = {
				...existingTemplate,
				name: updates.name || existingTemplate.name,
				description: updates.description || existingTemplate.description,
				template: {
					...existingTemplate.template,
					formData: {
						...existingTemplate.template?.formData,
						...updates,
						updatedAt: new Date().toISOString()
					}
				},
				updatedAt: new Date().toISOString()
			};

			const updatedTemplate = await buttClient.updateTemplate(templateId, updatePayload);

			toast.add({
				title: "Template Updated",
				description: `"${updates.title || existingTemplate.name}" has been updated`,
				color: "success"
			});

			// Reload templates
			await loadTemplates();

			return updatedTemplate;
		} catch (err: any) {
			error.value = err.message || "Failed to update template";
			toast.add({
				title: "Error",
				description: error.value,
				color: "error"
			});
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	// Delete template
	const deleteTemplate = async (templateId: string) => {
		isLoading.value = true;
		error.value = null;

		try {
			await buttClient.deleteTemplate(templateId);

			toast.add({
				title: "Template Deleted",
				description: "Template has been deleted successfully",
				color: "success"
			});

			// Reload templates
			await loadTemplates();
		} catch (err: any) {
			error.value = err.message || "Failed to delete template";
			toast.add({
				title: "Error",
				description: error.value,
				color: "error"
			});
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	// Get template by ID
	const getTemplateById = async (templateId: string): Promise<FormTemplate | null> => {
		try {
			const template = await buttClient.findByIdTemplate(templateId);
			if (!template) return null;

			return {
				id: template.id,
				name: template.name,
				description: template.description || "",
				title: template.template?.formData?.title || template.name,
				submitLabel: template.template?.formData?.submitLabel || "Submit",
				fields: template.template?.formData?.fields || [],
				category: template.template?.formData?.category || "custom",
				tags: template.template?.formData?.tags || ["custom"],
				version: template.template?.formData?.version || "1.0.0",
				createdAt: template.createdAt || new Date().toISOString(),
				updatedAt: template.updatedAt || new Date().toISOString(),
				template: template.template,
				meta: template.meta
			};
		} catch (err: any) {
			error.value = err.message || "Failed to load template";
			return null;
		}
	};

	const templatesByCategory = computed(() => {
		const grouped: Record<string, FormTemplate[]> = {};
		templates.value.forEach((template) => {
			const category = template.category || "custom";
			if (!grouped[category]) {
				grouped[category] = [];
			}
			grouped[category].push(template);
		});
		return grouped;
	});

	return {
		templates: computed(() => templates.value),
		isLoading: computed(() => isLoading.value),
		error: computed(() => error.value),
		templatesByCategory,
		loadTemplates,
		saveFormAsTemplate,
		updateTemplate,
		deleteTemplate,
		getTemplateById
	};
}

