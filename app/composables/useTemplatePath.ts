import { ref, computed } from "vue";

export function useTemplatePath() {
	const baseTemplatePath = ref("./templates");
	const currentTemplateId = ref<string | null>(null);

	// Computed template path
	const templatePath = computed(() => {
		if (!currentTemplateId.value) {
			return baseTemplatePath.value;
		}
		return `${baseTemplatePath.value}/${currentTemplateId.value}`;
	});

	// Set the current template ID
	const setTemplateId = (id: string) => {
		currentTemplateId.value = id;
	};

	// Get template path for a specific template
	const getTemplatePath = (templateId: string) => {
		return `${baseTemplatePath.value}/${templateId}`;
	};

	// Get relative path from template root
	const getRelativePath = (templateId: string, filePath: string) => {
		return `${baseTemplatePath.value}/${templateId}/${filePath}`;
	};

	// Validate if a template path exists
	const validateTemplatePath = async (templateId: string) => {
		try {
			const { invoke } = await import("@tauri-apps/api/core");
			await invoke("plugin:fs|exists", {
				path: getTemplatePath(templateId)
			});
			return true;
		} catch (error) {
			console.error("Template path validation failed:", error);
			return false;
		}
	};

	// Create template directory if it doesn't exist
	const ensureTemplateDirectory = async (templateId: string) => {
		try {
			const { invoke } = await import("@tauri-apps/api/core");
			await invoke("plugin:fs|create", {
				path: getTemplatePath(templateId),
				recursive: true
			});
			return true;
		} catch (error) {
			console.error("Failed to create template directory:", error);
			return false;
		}
	};

	// Get template directory structure
	const getTemplateStructure = async (templateId: string) => {
		try {
			const { invoke } = await import("@tauri-apps/api/core");
			const result = await invoke("plugin:fs|read_dir", {
				path: getTemplatePath(templateId),
				recursive: true
			});
			return result;
		} catch (error) {
			console.error("Failed to read template structure:", error);
			return null;
		}
	};

	return {
		// State
		baseTemplatePath,
		currentTemplateId,
		templatePath,

		// Methods
		setTemplateId,
		getTemplatePath,
		getRelativePath,
		validateTemplatePath,
		ensureTemplateDirectory,
		getTemplateStructure
	};
} 