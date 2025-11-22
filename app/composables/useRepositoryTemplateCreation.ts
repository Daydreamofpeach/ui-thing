import { ref } from 'vue';
import { buttClient } from '~/utils/buttClient';
import { useToast } from "#imports";

export interface RepositoryTemplateData {
	projectPath: string;
	projectName: string;
	bJsonData: any;
	blJsonData: any;
	setupData: any;
	analysis?: any;
}

export function useRepositoryTemplateCreation() {
	const isCreatingTemplate = ref(false);
	const error = ref<string | null>(null);

	const createRepositoryTemplate = async (data: RepositoryTemplateData) => {
		isCreatingTemplate.value = true;
		error.value = null;

		try {
			console.log("🚀 Creating repository template:", data);

			// Generate a unique BUTT identifier
			const buttId = `TEMPLATE.${data.projectName.replace(/[^a-zA-Z0-9]/g, '')}.${Date.now()}`;
			
			// Create template data following the existing pattern
			const templateData = {
				name: `${data.projectName} Configuration`,
				description: `Repository configuration template for ${data.projectName} project`,
				butt: buttId,
				template: {
					// Include the b.json content as the main template data
					...data.bJsonData,
					// Add repository-specific metadata
					repository: {
						path: data.projectPath,
						name: data.projectName,
						analysis: data.analysis,
						createdAt: new Date().toISOString()
					},
					// Include the bl.json data for local configuration
					localConfig: data.blJsonData,
					// Add setup data for environment information
					setupData: data.setupData
				},
				author: "BUILDIT",
				public: false,
				elevated: false,
				type: "REPOSITORY_TEMPLATE",
				meta: {
					projectPath: data.projectPath,
					projectName: data.projectName,
					butt: buttId,
					createdFrom: "repository",
					analysis: data.analysis,
					setupData: data.setupData,
					// Add filtering tags for easy identification
					tags: ["repository", "configuration", "project-template", "b-json", "bl-json"]
				},
				// Add requirements for filtering
				requirements: {
					templateType: "repository",
					sourceType: "b-json",
					hasLocalConfig: true,
					hasSetupData: true
				}
			};

			console.log("📋 Template data prepared:", templateData);

			// Create the template using the buttClient
			const createdTemplate = await buttClient.createTemplate(templateData);
			
			console.log("✅ Template created successfully:", createdTemplate);

			// Show success toast
			useToast().add({
				title: "Template Created",
				description: `"${data.projectName} Configuration" has been created successfully`,
				color: "success"
			});

			return createdTemplate;

		} catch (err: any) {
			console.error("❌ Error creating repository template:", err);
			error.value = err?.message || "Failed to create template";
			
			// Show error toast
			useToast().add({
				title: "Template Creation Failed",
				description: error.value,
				color: "error"
			});
			
			throw err;
		} finally {
			isCreatingTemplate.value = false;
		}
	};

	return {
		isCreatingTemplate,
		error,
		createRepositoryTemplate
	};
}
