import { ref } from "vue";

export interface ScriptMetadata {
	description?: string
	order?: number
	commands?: {
		windows?: string
		linux?: string
		mac?: string
	}
}

/**
 * Composable for managing script metadata (description, order, OS commands)
 * Handles reading from and writing to b.json files
 */
export function useScriptMetadataEditor() {
	const hasUnsavedChanges = ref(false);
	const isSaving = ref(false);

	/**
	 * Save script metadata to b.json
	 */
	const saveScriptMetadata = async (
		projectPath: string,
		scriptName: string,
		metadata: ScriptMetadata
	): Promise<void> => {
		if (!projectPath || !scriptName) {
			throw new Error("Project path and script name are required");
		}

		isSaving.value = true;

		try {
			const { readTextFile, writeTextFile } = await import("@tauri-apps/plugin-fs");
			const bJsonPath = `${projectPath}\\b\\b.json`;

			console.log("📖 Reading b.json from:", bJsonPath);

			// Read existing b.json
			let bJsonContent: any = {};
			let currentVersion = "v1";

			try {
				const content = await readTextFile(bJsonPath);
				bJsonContent = JSON.parse(content);
				currentVersion = bJsonContent.version || "v1";
			} catch (error) {
				console.warn("⚠️ Could not read existing b.json, will create new:", error);
				bJsonContent = { version: "v1" };
			}

			// Ensure setup structure exists
			if (!bJsonContent.setup) {
				bJsonContent.setup = {
					name: "Setup >",
					all: { scripts: [] },
					windows: { actions: [] },
					linux: { actions: [] },
					mac: { actions: [] }
				};
			}

			if (!bJsonContent.setup.all) {
				bJsonContent.setup.all = { scripts: [] };
			}

			if (!bJsonContent.setup.all.scripts) {
				bJsonContent.setup.all.scripts = [];
			}

			// Find the script in the all.scripts array
			let scriptEntry = bJsonContent.setup.all.scripts.find((s: any) => s.name === scriptName);

			if (!scriptEntry) {
				// Create new script entry if it doesn't exist
				scriptEntry = {
					name: scriptName,
					description: "",
					order: 0
				};
				bJsonContent.setup.all.scripts.push(scriptEntry);
				console.log("➕ Created new script entry:", scriptName);
			}

			// Update metadata
			if (metadata.description !== undefined) {
				scriptEntry.description = metadata.description;
			}
			if (metadata.order !== undefined) {
				scriptEntry.order = metadata.order;
			}

			// Update OS-specific commands if provided
			if (metadata.commands) {
				const platforms = ["windows", "linux", "mac"] as const;

				for (const platform of platforms) {
					const command = metadata.commands[platform];
					if (command !== undefined && command !== "") {
						// Ensure platform section exists
						if (!bJsonContent.setup[platform]) {
							bJsonContent.setup[platform] = { actions: [] };
						}
						if (!bJsonContent.setup[platform].actions) {
							bJsonContent.setup[platform].actions = [];
						}

						// Find or create action for this script
						let action = bJsonContent.setup[platform].actions.find((a: any) => a.name === scriptName);

						if (!action) {
							// Create new action entry
							action = {
								name: scriptName,
								exe: "npm", // Default, can be enhanced
								actions: [command]
							};
							bJsonContent.setup[platform].actions.push(action);
						} else {
							// Update existing action's command
							if (Array.isArray(action.actions)) {
								action.actions[0] = command;
							} else {
								action.actions = [command];
							}
						}

						console.log(`✅ Updated ${platform} command for ${scriptName}`);
					}
				}
			}

		// Sort scripts by order
		bJsonContent.setup.all.scripts.sort((a: any, b: any) => {
			const orderA = a.order || 0;
			const orderB = b.order || 0;
			return orderA - orderB;
		});

		// Keep existing version - no version increment for script updates
		console.log(`💾 Updating b.json (keeping version: ${currentVersion})`);

		// Write updated b.json directly (no backup/versioning)
		const updatedContent = JSON.stringify(bJsonContent, null, 2);
		await writeTextFile(bJsonPath, updatedContent);

		console.log(`✅ Saved script metadata to b.json`);
		console.log("📋 Updated script:", scriptEntry);

			hasUnsavedChanges.value = false;
		} catch (error) {
			console.error("❌ Error saving script metadata:", error);
			throw error;
		} finally {
			isSaving.value = false;
		}
	};

	/**
	 * Read script metadata from b.json
	 */
	const readScriptMetadata = async (
		projectPath: string,
		scriptName: string
	): Promise<ScriptMetadata | null> => {
		try {
			const { readTextFile } = await import("@tauri-apps/plugin-fs");
			const bJsonPath = `${projectPath}\\b\\b.json`;

			const content = await readTextFile(bJsonPath);
			const bJsonContent = JSON.parse(content);

			// Find script in all.scripts
			const scriptEntry = bJsonContent.setup?.all?.scripts?.find((s: any) => s.name === scriptName);

			if (!scriptEntry) {
				return null;
			}

			// Get OS-specific commands
			const commands: any = {};
			const platforms = ["windows", "linux", "mac"] as const;

			for (const platform of platforms) {
				const action = bJsonContent.setup?.[platform]?.actions?.find((a: any) => a.name === scriptName);
				if (action && action.actions && action.actions[0]) {
					commands[platform] = action.actions[0];
				}
			}

			return {
				description: scriptEntry.description || "",
				order: scriptEntry.order || 0,
				commands
			};
		} catch (error) {
			console.error("❌ Error reading script metadata:", error);
			return null;
		}
	};

	return {
		saveScriptMetadata,
		readScriptMetadata,
		hasUnsavedChanges,
		isSaving
	};
}
