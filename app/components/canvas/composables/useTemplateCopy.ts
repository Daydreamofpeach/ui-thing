import { buttClient } from "@utils/buttClient";

export interface TemplateCopyOptions {
	templateId: string
	name: string
	description?: string
	author?: string
	projectId?: string
}

export interface TemplateCopyResult {
	success: boolean
	copiedTemplate?: any
	error?: any
}

/**
 * Reusable composable for copying templates
 */
export function useTemplateCopy() {
	/**
	 * Copy a template with new metadata
	 */
	async function copyTemplate(options: TemplateCopyOptions): Promise<TemplateCopyResult> {
		const { templateId, name, description, author, projectId } = options;

		try {
			console.log("📋 Copying template with options:", {
				templateId,
				name,
				description,
				author,
				projectId
			});

			// Step 1: Copy the template using buttClient.copy (with empty options object)
			const copiedTemplate = await buttClient.copy(templateId, {});

			console.log("✅ Template copied, ID:", copiedTemplate.id);

			// Step 2: Update the copied template with custom metadata
			if (name || description || author) {
				console.log("📝 Updating copied template with custom metadata...");
				
				const updateData: any = {};
				if (name) updateData.name = name;
				if (description) updateData.description = description;
				if (author) updateData.author = author;

				const updatedTemplate = await buttClient.updateTemplate(copiedTemplate.id, updateData);
				
				console.log("✅ Template updated with custom metadata:", updatedTemplate);

				return {
					success: true,
					copiedTemplate: updatedTemplate
				};
			}

			return {
				success: true,
				copiedTemplate
			};
		} catch (error) {
			console.error("❌ Failed to copy template:", error);
			return {
				success: false,
				error
			};
		}
	}

	return {
		copyTemplate
	};
}

