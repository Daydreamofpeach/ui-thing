import { ref } from "vue";
import { buttClient } from "@utils/buttClient";

export type InstallStatus = "idle" | "searching" | "installing" | "success" | "failed" | "skipped";

export interface InstallResult {
	status: InstallStatus;
	message: string;
	error?: any;
}

/**
 * Reusable composable for installing tools/IDEs from templates
 */
export function useTemplateInstaller() {
	const isInstalling = ref(false);
	const installStatus = ref<InstallStatus>("idle");
	const installMessage = ref("");

	/**
	 * Search for a template by name and install it
	 */
	async function installFromTemplate(
		toolName: string,
		options: {
			currentOS?: string;
			currentVersion?: string;
			projectId?: string;
			projectName?: string;
		} = {}
	): Promise<InstallResult> {
		const {
			currentOS = "windows",
			currentVersion = "11",
			projectId = "",
			projectName = ""
		} = options;

		isInstalling.value = true;
		installStatus.value = "searching";
		installMessage.value = `Searching for ${toolName} template...`;

		try {
			console.log("═══════════════════════════════════════════");
			console.log(`📦 INSTALLING ${toolName} FROM TEMPLATE`);
			console.log("  Tool Name:", toolName);
			console.log("  OS:", currentOS);
			console.log("  Version:", currentVersion);
			console.log("═══════════════════════════════════════════");

			// Step 1: Search for template
			console.log(`🔍 Searching for template with name: ${toolName}`);
			let searchResults: any;
			
			try {
				// Try searchPublic first
				searchResults = await buttClient.searchPublic(toolName);
			} catch (searchError: any) {
				console.error(`❌ Template search failed for ${toolName}:`, searchError);
				
				// If search fails (e.g., CORS or network issue), we can't proceed with template-based installation
				throw new Error(`Unable to find installation template for ${toolName}. This may be due to a network issue or CORS restriction.`);
			}

			console.log("📊 Search results:", searchResults);

			// Parse search results
			let templates: any[] = [];
			if (Array.isArray(searchResults)) {
				templates = searchResults;
			} else if (searchResults.templates && Array.isArray(searchResults.templates)) {
				templates = searchResults.templates;
			} else if (searchResults.results && Array.isArray(searchResults.results)) {
				templates = searchResults.results;
			} else if (searchResults.data && Array.isArray(searchResults.data)) {
				templates = searchResults.data;
			}

			if (templates.length === 0) {
				console.warn(`⚠️ No templates found for ${toolName}`);
				installStatus.value = "failed";
				installMessage.value = `No installation template found for ${toolName}`;
				return {
					status: "failed",
					message: `No installation template found for ${toolName}`
				};
			}

			// Use the first matching template
			const template = templates[0];
			console.log(`✅ Found template:`, template);
			console.log(`  Template name:`, template.name);
			console.log(`  Template version:`, template?.version || template?.template?.version || 'Not specified');

			installStatus.value = "installing";
			installMessage.value = `Installing ${toolName}...`;

			// Step 2: Check for install hooks
			const hooks = template?.template?.hooks || template?.hooks;
			if (!hooks || !hooks.install) {
				console.log(`⏭️ No install hooks found for ${toolName}`);
				installStatus.value = "skipped";
				installMessage.value = `No installation script available for ${toolName}`;
				return {
					status: "skipped",
					message: `No installation script available for ${toolName}`
				};
			}

			console.log("✅ Install hooks found:", hooks.install);

			// Step 3: Navigate to OS-specific hooks
			const osHooks = hooks.install[currentOS];
			if (!osHooks) {
				console.log(`⏭️ No ${currentOS} install hooks for ${toolName}`);
				installStatus.value = "skipped";
				installMessage.value = `No ${currentOS} installation script available`;
				return {
					status: "skipped",
					message: `No ${currentOS} installation script available`
				};
			}

			// Step 4: Navigate to version-specific hooks
			const versionHooks = osHooks[currentVersion];
			if (!versionHooks) {
				console.log(`⏭️ No version ${currentVersion} hooks for ${toolName}`);
				installStatus.value = "skipped";
				installMessage.value = `No installation script for ${currentOS} ${currentVersion}`;
				return {
					status: "skipped",
					message: `No installation script for ${currentOS} ${currentVersion}`
				};
			}

			// Step 5: Get actions
			const actions = versionHooks.actions;
			if (!Array.isArray(actions) || actions.length === 0) {
				console.log(`⏭️ No actions found for ${toolName}`);
				installStatus.value = "skipped";
				installMessage.value = `No installation actions configured`;
				return {
					status: "skipped",
					message: `No installation actions configured`
				};
			}

			console.log(`Found ${actions.length} action(s) to execute`);

			// Step 6: Execute actions
			const { useTauriShellCommand } = await import("#imports");

			for (let i = 0; i < actions.length; i++) {
				const action = actions[i];
				console.log(`\n📌 Action ${i + 1}/${actions.length}:`, action);

				const exe = action.exe || "powershell.exe";
				let command = action.command;
				const preCheckCommand = action.preCheck;

				if (!command) {
					console.warn(`⚠️ No command specified in action ${i + 1}`);
					continue;
				}

				// Extract version from template (prefer template.version, then template.template.version)
				const templateVersion = template?.version || template?.template?.version || '';
				console.log(`  📌 Template version for placeholders: "${templateVersion}"`);
				
				// If command has {VERSION} placeholder but no version in template, remove the version specifier
				if (command.includes('{VERSION}') && !templateVersion) {
					console.warn(`⚠️ Command has {VERSION} placeholder but no version found in template - removing version specifier`);
					// Remove version specifiers like @{VERSION} or ={VERSION}
					command = command.replace(/@\{VERSION\}/g, '').replace(/=\{VERSION\}/g, '');
					console.log(`  🔄 After removing version specifier: ${command}`);
				}

				// Replace placeholders
				const placeholders: Record<string, string> = {
					'{VERSION}': templateVersion,
					'{PROJECT_NAME}': projectName || 'project',
					'{PROJECT_ID}': projectId || '',
					'{TOOL_NAME}': toolName,
					'{TEMPLATE_NAME}': template.name || toolName
				};

				for (const [placeholder, value] of Object.entries(placeholders)) {
					if (value) { // Only replace if value exists
						command = command.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
					}
				}

				console.log(`📝 Original command: ${action.command}`);
				console.log(`🔄 Processed command: ${command}`);

				installMessage.value = `Running installation step ${i + 1}/${actions.length}...`;

				try {
					// Execute pre-check if available
					if (preCheckCommand) {
						console.log(`🔍 Running pre-check: ${preCheckCommand}`);

						try {
							const preCheckResult = await useTauriShellCommand.create("exec-pwsh", [
								"-Command",
								preCheckCommand
							]).execute();

							console.log(`📊 Pre-check result:`, {
								code: preCheckResult.code,
								stdout: preCheckResult.stdout,
								stderr: preCheckResult.stderr
							});

							if (preCheckResult.code === 0 && preCheckResult.stdout.includes("found")) {
								console.log(`✅ Pre-check passed - ${toolName} already installed or check succeeded`);
								installStatus.value = "skipped";
								installMessage.value = `${toolName} is already installed`;
								return {
									status: "skipped",
									message: `${toolName} is already installed`
								};
							}
						} catch (preCheckError) {
							console.warn(`⚠️ Pre-check failed (continuing with install):`, preCheckError);
						}
					}

					// Execute main command
					console.log(`🚀 Executing: ${exe} ${command}`);
					const result = await useTauriShellCommand.create("exec-pwsh", [
						"-Command",
						command
					]).execute();

					console.log(`📊 Execution result:`, {
						code: result.code,
						stdout: result.stdout,
						stderr: result.stderr
					});

					// Check for success indicators in output
					const output = `${result.stdout} ${result.stderr}`.toLowerCase();
					const isAlreadyInstalled = output.includes("already installed") || 
						output.includes("no applicable update") ||
						output.includes("already exists");
					const isSuccess = result.code === 0 || 
						output.includes("successfully installed") ||
						output.includes("installation successful");

					if (isAlreadyInstalled) {
						console.log(`✅ ${toolName} already installed`);
						installStatus.value = "skipped";
						installMessage.value = `${toolName} is already installed`;
						return {
							status: "skipped",
							message: `${toolName} is already installed`
						};
					}

					if (isSuccess) {
						console.log(`✅ Action ${i + 1} completed successfully`);
					} else {
						throw new Error(`Command failed with exit code ${result.code}`);
					}
				} catch (actionError) {
					console.error(`❌ Action ${i + 1} failed:`, actionError);
					installStatus.value = "failed";
					installMessage.value = `Installation failed: ${actionError}`;
					return {
						status: "failed",
						message: `Installation failed at step ${i + 1}`,
						error: actionError
					};
				}
			}

			// All actions completed successfully
			console.log(`✅ ${toolName} installed successfully`);
			installStatus.value = "success";
			installMessage.value = `${toolName} installed successfully`;

			return {
				status: "success",
				message: `${toolName} installed successfully`
			};

		} catch (error: any) {
			console.error(`❌ Installation failed for ${toolName}:`, error);
			
			// Check if it's a CORS error
			const isCorsError = error.message?.includes('CORS') || 
				error.message?.includes('fetch') ||
				error.message?.includes('Failed to search');
			
			let errorMessage = `Installation failed: ${error.message || error}`;
			if (isCorsError) {
				errorMessage = `Unable to search for ${toolName} template. Please check your network connection or try again later.`;
			}
			
			installStatus.value = "failed";
			installMessage.value = errorMessage;
			return {
				status: "failed",
				message: errorMessage,
				error
			};
		} finally {
			isInstalling.value = false;
			console.log("═══════════════════════════════════════════");
		}
	}

	return {
		isInstalling,
		installStatus,
		installMessage,
		installFromTemplate
	};
}

