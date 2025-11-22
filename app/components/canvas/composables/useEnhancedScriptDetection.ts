import type { ConfigFile } from "./useConfigFileDetection";
import { ref } from "vue";
import { useConfigFileDetection } from "./useConfigFileDetection";
import { useProjectScriptRunner } from "./useProjectScriptRunner";

export interface EnhancedScriptResult {
	packageManager: string
	configFiles: ConfigFile[]
	allScripts: Array<{
		name: string
		command: string
		category: string
		description?: string
		order?: number
		sourceFile: string
		sourceType: string
	}>
	projectPath: string
	packageJsonPath?: string
}

/**
 * Enhanced script detection that combines package.json and config files
 */
export function useEnhancedScriptDetection() {
	const { detectConfigFiles } = useConfigFileDetection();
	const { detectScripts: detectPackageScripts } = useProjectScriptRunner();

	const isDetecting = ref(false);
	const detectionError = ref<string | null>(null);

	/**
	 * Detect scripts from all sources (package.json + config files)
	 */
	const detectAllScripts = async (projectPath: string): Promise<EnhancedScriptResult | null> => {
		if (!projectPath) {
			detectionError.value = "No project path provided";
			return null;
		}

		isDetecting.value = true;
		detectionError.value = null;

		try {
			console.log("🔍 Starting enhanced script detection for:", projectPath);

			// Detect package.json scripts (existing functionality)
			const packageScripts = await detectPackageScripts(projectPath);

			// Detect config file scripts (new functionality)
			const configFiles = await detectConfigFiles(projectPath);

			console.log("✅ Found package.json scripts:", packageScripts?.scripts?.length || 0);
			console.log("✅ Found config files:", configFiles.length);
			configFiles.forEach((cf) => {
				console.log(`   - ${cf.fileName}: ${cf.scripts.length} scripts`);
			});

			// Combine all scripts
			const allScripts: EnhancedScriptResult["allScripts"] = [];

			// Add package.json scripts
			if (packageScripts?.scripts) {
				packageScripts.scripts.forEach((script: any) => {
					allScripts.push({
						name: script.name,
						command: script.command,
						category: script.category || "other",
						description: script.description,
						order: script.order,
						sourceFile: "package.json",
						sourceType: "package.json"
					});
				});
			}

			// Add config file scripts
			configFiles.forEach((configFile) => {
				configFile.scripts.forEach((script) => {
					allScripts.push({
						name: script.name,
						command: script.command,
						category: script.category || "other",
						description: script.description,
						order: script.order,
						sourceFile: configFile.fileName,
						sourceType: configFile.type
					});
				});
			});

			const result: EnhancedScriptResult = {
				packageManager: packageScripts?.packageManager || "npm",
				configFiles,
				allScripts,
				projectPath,
				packageJsonPath: packageScripts?.packageJsonPath
			};

			console.log("✅ Enhanced script detection complete:", {
				totalScripts: allScripts.length,
				configFiles: configFiles.length,
				packageManager: result.packageManager
			});

			return result;
		} catch (error) {
			console.error("❌ Enhanced script detection failed:", error);
			detectionError.value = `Detection failed: ${error}`;
			return null;
		} finally {
			isDetecting.value = false;
		}
	};

	return {
		detectAllScripts,
		isDetecting,
		detectionError
	};
}
