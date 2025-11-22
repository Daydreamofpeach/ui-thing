import { buttClient } from "@utils/buttClient";

export interface TemplateUnlinkOptions {
	projectId: string
	templateId: string
}

export interface TemplateUnlinkResult {
	success: boolean
	error?: any
}

/**
 * Reusable composable for unlinking templates from projects
 */
export function useTemplateUnlink() {
	/**
	 * Unlink a template from a project
	 */
	async function unlinkTemplate(options: TemplateUnlinkOptions): Promise<TemplateUnlinkResult> {
		const { projectId, templateId } = options;

		try {
			console.log("🔓 Unlinking template from project:", {
				projectId,
				templateId
			});

			// Call the unlinkTemplate API endpoint
			await buttClient.unlinkTemplate(projectId, templateId);

			console.log("✅ Template unlinked successfully");

			return {
				success: true
			};
		} catch (error) {
			console.error("❌ Failed to unlink template:", error);
			return {
				success: false,
				error
			};
		}
	}

	return {
		unlinkTemplate
	};
}

