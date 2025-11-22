import { useToast } from "#imports";
import { computed, ref } from "vue";
import { usePowerShellExecution } from "./usePowerShellExecution";

export interface PackageScript {
	name: string
	command: string
	description?: string
	category: "dev" | "build" | "test" | "util" | "other"
	folder?: string
	file?: string
	workingDirectory?: string
	osSpecific?: boolean
	osVersions?: Record<string, string>
}

export interface ProjectScripts {
	packageManager: string
	scripts: PackageScript[]
	projectPath: string
	packageJsonPath: string
}

export interface ScriptVersions {
	windows: { command: string, isSaved?: boolean, version?: string, timestamp?: string }
	linux: { command: string, isSaved?: boolean, version?: string, timestamp?: string }
	mac: { command: string, isSaved?: boolean, version?: string, timestamp?: string }
}

export function useProjectScriptRunner() {
	// Use the PowerShell execution composable
	const { executeScript, executeCustomCommand } = usePowerShellExecution();

	// State
	const isDetecting = ref(false);
	const isRunningCustom = ref(false);
	const customCommand = ref("");
	const detectedScripts = ref<ProjectScripts | null>(null);
	const runningScripts = ref<Set<string>>(new Set());
	const expandedScripts = ref<Set<string>>(new Set());
	const scriptVersions = ref<Record<string, ScriptVersions>>({});
	const scriptSource = ref<"bjson" | "cache" | "scan" | null>(null);
	const userOS = ref<"windows" | "linux" | "mac" | null>(null);
	const scriptCommands = ref<Record<string, Record<string, string>>>({});
	const scanProgress = ref({
		current: 0,
		total: 0,
		currentFolder: "",
		scriptsFound: 0
	});

	// Computed
	const hasScripts = computed(() => (detectedScripts.value?.scripts?.length || 0) > 0);
	const totalScripts = computed(() => detectedScripts.value?.scripts?.length || 0);

	const sortedScripts = computed(() => {
		if (!detectedScripts.value) return [];

		const priority = ["dev", "start", "build", "test", "lint", "format"];
		return detectedScripts.value.scripts.sort((a, b) => {
			const aIndex = priority.indexOf(a.name);
			const bIndex = priority.indexOf(b.name);

			if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
			if (aIndex !== -1) return -1;
			if (bIndex !== -1) return 1;
			return a.name.localeCompare(b.name);
		});
	});

	const scriptFolders = computed(() => {
		if (!detectedScripts.value) return [];

		const folders: Record<string, { scripts: PackageScript[], subfolders: Record<string, any> }> = {};

		// Group scripts by folder
		for (const script of detectedScripts.value.scripts) {
			const folder = script.folder || "root";
			if (!folders[folder]) {
				folders[folder] = { scripts: [], subfolders: {} };
			}
			folders[folder].scripts.push(script);
		}

		// Convert to array format for the tree component
		return Object.entries(folders).map(([folderName, folderData]) => ({
			name: folderName,
			scripts: folderData.scripts,
			subfolders: folderData.subfolders
		}));
	});

	// Helper functions
	const getCategoryIcon = (category: string): string => {
		const icons: Record<string, string> = {
			dev: "🚀",
			build: "🏗️",
			test: "🧪",
			util: "🔧",
			other: "📝"
		};
		return icons[category] || "📝";
	};

	const getCategoryStyle = (category: string): string => {
		const styles: Record<string, string> = {
			dev: "bg-green-500/20 text-green-400",
			build: "bg-blue-500/20 text-blue-400",
			test: "bg-purple-500/20 text-purple-400",
			util: "bg-orange-500/20 text-orange-400",
			other: "bg-gray-500/20 text-gray-400"
		};
		return styles[category] || "bg-gray-500/20 text-gray-400";
	};

	const getManagerStyle = (manager: string): string => {
		const styles: Record<string, string> = {
			npm: "bg-red-500/20 text-red-400",
			yarn: "bg-blue-500/20 text-blue-400",
			pnpm: "bg-orange-500/20 text-orange-400",
			bun: "bg-yellow-500/20 text-yellow-400"
		};
		return styles[manager] || "bg-gray-500/20 text-gray-400";
	};

	// Categorize script based on name and command
	const categorizeScript = (scriptName: string, command: string): PackageScript["category"] => {
		const name = scriptName.toLowerCase();
		const cmd = command.toLowerCase();

		// Development scripts
		if (name.includes("dev") || name.includes("start") || name.includes("serve")) {
			return "dev";
		}

		// Build scripts
		if (name.includes("build") || name.includes("compile") || name.includes("bundle")) {
			return "build";
		}

		// Test scripts
		if (name.includes("test") || name.includes("spec") || cmd.includes("jest") || cmd.includes("vitest") || cmd.includes("cypress")) {
			return "test";
		}

		// Utility scripts
		if (name.includes("lint") || name.includes("format") || name.includes("check") || name.includes("clean") || name.includes("install")) {
			return "util";
		}

		return "other";
	};

	// Detect package manager from lock files
	const detectPackageManager = async (projectPath: string): Promise<string> => {
		try {
			const lockFiles = [
				{ file: "bun.lockb", manager: "bun" },
				{ file: "bun.lock", manager: "bun" },
				{ file: "pnpm-lock.yaml", manager: "pnpm" },
				{ file: "yarn.lock", manager: "yarn" },
				{ file: "package-lock.json", manager: "npm" }
			];

			for (const { file, manager } of lockFiles) {
				try {
					const { useTauriShellCommand } = await import("#imports");
					const normalizedPath = projectPath.replace(/\//g, "\\");
					const result = await useTauriShellCommand.create("exec-pwsh", [
						"-Command",
						`if (Test-Path "${normalizedPath}\\${file}") { "1" } else { "0" }`
					]).execute();

					if ((result.stdout || "").trim() === "1") {
						return manager;
					}
				} catch {
					// Continue to next file
				}
			}

			return "npm"; // Default fallback
		} catch {
			return "npm";
		}
	};

	// Detect user's OS from bl.json
	const detectUserOS = async (projectPath: string): Promise<"windows" | "linux" | "mac" | null> => {
		try {
			const { readTextFile } = await import("@tauri-apps/plugin-fs");
			const blJsonPath = `${projectPath}/b/bl.json`;

			const content = await readTextFile(blJsonPath);

			// Remove comments from JSON content
			const cleanContent = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

			const blJsonContent = JSON.parse(cleanContent);

			// Read from the actual data that exists - environment.OS
			const osFromEnv = blJsonContent.environment?.OS?.toLowerCase();

			if (osFromEnv) {
				if (osFromEnv.includes("windows") || osFromEnv.includes("win")) {
					return "windows";
				} else if (osFromEnv.includes("linux")) {
					return "linux";
				} else if (osFromEnv.includes("darwin") || osFromEnv.includes("mac")) {
					return "mac";
				}
			}

			return null;
		} catch {
			return null;
		}
	};

	// Parse package.json with OS-specific script support
	const parsePackageJson = (content: string, folder: string = "root"): PackageScript[] => {
		const scripts: PackageScript[] = [];
		try {
			const packageJson = JSON.parse(content);
			const rawScripts = packageJson.scripts || {};

			// Parse each script and create OS-specific versions
			const parsedScripts = Object.entries(rawScripts).map(([name, command]) => {
				const baseScript = {
					name,
					command: String(command),
					category: categorizeScript(name, String(command)),
					folder,
					file: "package.json"
				};

				// Create OS-specific versions
				const osVersions: Record<string, string> = {
					windows: String(command),
					linux: String(command),
					mac: String(command)
				};

				// Check for OS-specific modifications in the script name
				// Look for patterns like "dev:windows", "build:linux", etc.
				const osSpecificPattern = /^(.+):(windows|linux|mac)$/;
				const match = name.match(osSpecificPattern);

				if (match) {
					const [, baseName, os] = match;
					if (baseName && os) {
						osVersions[os] = String(command);

						// Return the OS-specific script
						return {
							...baseScript,
							name: baseName,
							command: String(command),
							osSpecific: true,
							osVersions
						};
					}
				}

				// Return the base script with OS versions
				return {
					...baseScript,
					osVersions
				};
			});

			return parsedScripts;
		} catch {
			// Silent fail for production
		}
		return scripts;
	};

	// Read and parse package.json
	const readPackageJson = async (projectPath: string): Promise<any> => {
		const { useTauriShellCommand } = await import("#imports");
		const normalizedPath = projectPath.replace(/\//g, "\\");
		const packageJsonPath = `${normalizedPath}\\package.json`;

		const result = await useTauriShellCommand.create("exec-pwsh", [
			"-Command",
			`if (Test-Path "${packageJsonPath}") { Get-Content "${packageJsonPath}" | Out-String } else { "" }`
		]).execute();

		const content = (result.stdout || "").trim();
		if (!content) {
			throw new Error("package.json not found or empty");
		}

		return JSON.parse(content);
	};

	// Read package.json from a specific path
	const readPackageJsonFromPath = async (filePath: string): Promise<any> => {
		const { useTauriShellCommand } = await import("#imports");
		const normalizedPath = filePath.replace(/\//g, "\\");

		const result = await useTauriShellCommand.create("exec-pwsh", [
			"-Command",
			`if (Test-Path "${normalizedPath}") { Get-Content "${normalizedPath}" | Out-String } else { "" }`
		]).execute();

		const content = (result.stdout || "").trim();
		if (!content) {
			throw new Error("package.json not found or empty");
		}

		return JSON.parse(content);
	};

	// Find all package.json files recursively (excluding large/unnecessary directories)
	const findPackageJsonFiles = async (projectPath: string): Promise<string[]> => {
		const { useTauriShellCommand } = await import("#imports");
		const normalizedPath = projectPath.replace(/\//g, "\\");

		try {
			// Exclude common large directories that don't contain useful package.json files
			const excludePatterns = [
				"*node_modules*",
				"*.nuxt*",
				"*dist*",
				"*build*",
				"*.next*",
				"*.output*",
				"*coverage*",
				"*.cache*",
				"*.git*",
				"*.idea*",
				"*.vscode*",
				"*vendor*",
				"*target*",
				"*.turbo*"
			];

			// Build PowerShell filter for excluded patterns
			const excludeFilter = excludePatterns.map(pattern => `$_ -notlike "${pattern}"`).join(" -and ");

			const result = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				`Get-ChildItem -Path "${normalizedPath}" -Recurse -Name "package.json" -Depth 3 | Where-Object { ${excludeFilter} } | ForEach-Object { Join-Path "${normalizedPath}" $_ }`
			]).execute();

			const output = (result.stdout || "").trim();
			if (!output) {
				return [];
			}

			// Split by newlines and filter out empty lines
			return output.split("\n")
				.map((line) => line.trim())
				.filter((line) => line.length > 0)
				.map((line) => line.replace(/\//g, "\\")); // Normalize path separators
		} catch (error) {
			console.warn("Failed to find package.json files:", error);
			return [];
		}
	};

	// Filter and prioritize scripts - remove duplicates and prioritize modified ones
	const filterAndPrioritizeScripts = (scripts: PackageScript[], osModifications: Record<string, Record<string, string>>): PackageScript[] => {
		const scriptMap = new Map<string, PackageScript>();

		// First pass: collect all scripts, prioritizing modified ones
		for (const script of scripts) {
			const existing = scriptMap.get(script.name);
			const hasModifications = osModifications[script.name] && Object.keys(osModifications[script.name] || {}).length > 0;

			if (!existing) {
				// First occurrence - add it
				scriptMap.set(script.name, script);
			} else if (hasModifications && !scriptMap.get(script.name)?.osSpecific) {
				// Replace with modified version if current one isn't OS-specific
				scriptMap.set(script.name, script);
			} else if (script.folder === "root" && existing.folder !== "root") {
				// Prefer root folder scripts over subfolder scripts
				scriptMap.set(script.name, script);
			}
		}

		// Second pass: apply modifications to the final scripts
		const finalScripts: PackageScript[] = [];
		for (const script of scriptMap.values()) {
			const modifiedScript = applyOSModifications(script, osModifications);
			finalScripts.push(modifiedScript);
		}

		console.log(`🔍 Filtered ${scripts.length} scripts down to ${finalScripts.length} unique scripts`);
		return finalScripts;
	};

	// Detect scripts from b folder
	const detectScriptsFromBFolder = async (projectPath: string): Promise<PackageScript[]> => {
		const scripts: PackageScript[] = [];
		const { useTauriShellCommand } = await import("#imports");
		const normalizedPath = projectPath.replace(/\//g, "\\");
		const bFolderPath = `${normalizedPath}\\b`;

		try {
			// Check if b folder exists
			const checkResult = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				`if (Test-Path "${bFolderPath}") { "exists" } else { "" }`
			]).execute();

			if (!checkResult.stdout?.trim()) {
				return scripts; // b folder doesn't exist
			}

			// Look for b.json file
			const bJsonPath = `${bFolderPath}\\b.json`;
			const bJsonResult = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				`if (Test-Path "${bJsonPath}") { Get-Content "${bJsonPath}" | Out-String } else { "" }`
			]).execute();

			if (bJsonResult.stdout?.trim()) {
				try {
					const bJsonContent = JSON.parse(bJsonResult.stdout.trim());

					// Extract scripts from b.json structure
					if (bJsonContent.setup) {
						const setup = bJsonContent.setup;

						// Check each platform for actions
						["windows", "linux", "mac"].forEach((platform) => {
							if (setup[platform]?.actions) {
								setup[platform].actions.forEach((action: any, index: number) => {
									if (action.exe && action.command) {
										scripts.push({
											name: `${action.scriptName || `b-${platform}-${index}`}`,
											command: `${action.exe} ${action.command}`,
											category: action.category || "util",
											folder: action.folder || "b",
											file: action.file || "b.json",
											// Store the working directory for proper execution
											workingDirectory: action.workingDirectory
										});
									}
								});
							}
						});
					}
				} catch (parseError) {
					console.warn("Failed to parse b.json:", parseError);
				}
			}

			// Also look for bl.json (buildit lock file)
			const blJsonPath = `${bFolderPath}\\bl.json`;
			const blJsonResult = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				`if (Test-Path "${blJsonPath}") { Get-Content "${blJsonPath}" | Out-String } else { "" }`
			]).execute();

			if (blJsonResult.stdout?.trim()) {
				try {
					const blJsonContent = JSON.parse(blJsonResult.stdout.trim());

					// Extract scripts from bl.json if it has any
					if (blJsonContent.scripts) {
						Object.entries(blJsonContent.scripts).forEach(([name, command]) => {
							scripts.push({
								name: `bl-${name}`,
								command: String(command),
								category: "util",
								folder: "b",
								file: "bl.json"
							});
						});
					}
				} catch (parseError) {
					console.warn("Failed to parse bl.json:", parseError);
				}
			}

		} catch {
			// Silent fail for production
		}

		return scripts;
	};

	// Load OS-specific script modifications from b.json
	const loadOSScriptModifications = async (projectPath: string): Promise<Record<string, Record<string, string>>> => {
		const modifications: Record<string, Record<string, string>> = {};

		try {
			const { useTauriShellCommand } = await import("#imports");
			const normalizedPath = projectPath.replace(/\//g, "\\");
			const bJsonPath = `${normalizedPath}\\b\\b.json`;

			// Check if b.json exists
			const checkResult = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				`if (Test-Path "${bJsonPath}") { "exists" } else { "" }`
			]).execute();

			if (!checkResult.stdout?.trim()) {
				return modifications; // b.json doesn't exist
			}

			// Read b.json content
			const bJsonResult = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				`Get-Content "${bJsonPath}" | Out-String`
			]).execute();

			if (bJsonResult.stdout?.trim()) {
				try {
					const bJsonContent = JSON.parse(bJsonResult.stdout.trim());

					// Extract OS-specific script modifications
					if (bJsonContent.setup) {
						const setup = bJsonContent.setup;

						// Check each platform for script modifications
						["windows", "linux", "mac"].forEach((platform) => {
							if (setup[platform]?.actions) {
								setup[platform].actions.forEach((action: any) => {
									if (action.scriptName && action.command) {
										if (!modifications[action.scriptName]) {
											modifications[action.scriptName] = {};
										}
										modifications[action.scriptName]![platform] = action.command;
									}
								});
							}
						});
					}
				} catch (parseError) {
					console.warn("Failed to parse b.json for script modifications:", parseError);
				}
			}
		} catch {
			// Silent fail for production
		}

		return modifications;
	};

	// Apply OS-specific modifications to a script
	const applyOSModifications = (script: PackageScript, modifications: Record<string, Record<string, string>>): PackageScript => {
		const scriptModifications = modifications[script.name];

		if (!scriptModifications) {
			return script; // No modifications for this script
		}

		// Create OS-specific versions
		const osVersions: Record<string, string> = {
			windows: scriptModifications.windows || script.command,
			linux: scriptModifications.linux || script.command,
			mac: scriptModifications.mac || script.command
		};

		// Determine the current command based on user's OS
		const currentCommand = userOS.value && osVersions[userOS.value]
			? osVersions[userOS.value]
			: script.command;

		return {
			...script,
			command: currentCommand || script.command,
			osVersions,
			osSpecific: true
		};
	};

	// Detect scripts from package.json (recursive scan)
	const detectScriptsFromPackageJson = async (projectPath: string): Promise<PackageScript[]> => {
		const allScripts: PackageScript[] = [];

		try {
			// Load OS-specific modifications from b.json
			const osModifications = await loadOSScriptModifications(projectPath);

			// First, try to read the root package.json
			try {
				const rootPackageJson = await readPackageJson(projectPath);
				const rootScripts = parsePackageJson(JSON.stringify(rootPackageJson), "root");

				// Apply OS-specific modifications
				const modifiedRootScripts = rootScripts.map((script) => applyOSModifications(script, osModifications));
				allScripts.push(...modifiedRootScripts);
			} catch {
				// Root package.json not found, continue with recursive scan
			}

			// Perform recursive scan for package.json files
			const packageJsonFiles = await findPackageJsonFiles(projectPath);

			for (const filePath of packageJsonFiles) {
				try {
					const relativePath = filePath.replace(projectPath, "").replace(/\\/g, "/").replace(/^\//, "");
					const folderName = relativePath.split("/").slice(0, -1).join("/") || "root";

					const packageJson = await readPackageJsonFromPath(filePath);
					const scripts = parsePackageJson(JSON.stringify(packageJson), folderName);

					// Apply OS-specific modifications
					const modifiedScripts = scripts.map((script) => applyOSModifications(script, osModifications));
					allScripts.push(...modifiedScripts);
				} catch {
					// Silent fail for production
				}
			}

			// Also check for scripts in b folder
			try {
				const bScripts = await detectScriptsFromBFolder(projectPath);
				allScripts.push(...bScripts);
			} catch (error) {
				console.warn("Failed to detect scripts from b folder:", error);
			}

			// Filter out duplicates and prioritize modified scripts
			const filteredScripts = filterAndPrioritizeScripts(allScripts, osModifications);

			return filteredScripts;
		} catch (error) {
			console.error("Failed to detect scripts:", error);
			return [];
		}
	};

	// Convert command to PowerShell-compatible syntax
	const convertToPowerShellCommand = (command: string): string => {
		// Replace && with ; (PowerShell command separator)
		let psCommand = command.replace(/&&/g, ";");

		// Handle export commands (PowerShell uses $env: instead of export)
		psCommand = psCommand.replace(/export\s+([A-Z_]+)=([^;]+)/g, "$env:$1=\"$2\"");

		// Handle && in the middle of commands by using ; and ensuring proper execution
		if (command.includes("&&")) {
			// Split by && and join with ; ensuring each part runs
			const parts = command.split("&&").map((part) => part.trim());
			psCommand = parts.join("; if ($?) { ");
			// Close the conditional blocks
			for (let i = 1; i < parts.length; i++) {
				psCommand += " }";
			}
		}

		return psCommand;
	};

	// Get the correct OS-specific command for a script
	const getOSSpecificCommand = (script: PackageScript, targetOS?: "windows" | "linux" | "mac"): string => {
		const os = targetOS || userOS.value;

		// First check if we have a saved version in scriptVersions (highest priority)
		if (os && scriptVersions.value[script.name]?.[os]?.command) {
			console.log(`🎯 Using saved ${os} version for ${script.name}: ${scriptVersions.value[script.name]![os]!.command}`);
			return scriptVersions.value[script.name]![os]!.command;
		}

		// If script has OS-specific versions, use the appropriate one
		if (script.osVersions && os && script.osVersions[os]) {
			console.log(`🎯 Using OS-specific ${os} version for ${script.name}: ${script.osVersions[os]}`);
			return script.osVersions[os];
		}

		// Fall back to the base command
		console.log(`🎯 Using base command for ${script.name}: ${script.command}`);
		return script.command;
	};

	// Build the correct command for the package manager
	const buildScriptCommand = (script: PackageScript): string => {
		if (!detectedScripts.value) return script.command;

		const { packageManager } = detectedScripts.value;
		const { name } = script;

		// Get the OS-specific command
		const osCommand = getOSSpecificCommand(script);

		// If the command already contains a package manager command, convert to PowerShell
		if (osCommand.includes("yarn ") || osCommand.includes("npm ") || osCommand.includes("pnpm ") || osCommand.includes("bun ")) {
			const psCommand = convertToPowerShellCommand(osCommand);
			return psCommand;
		}

		// If the command is just the script name, build the proper command based on package manager
		if (osCommand === name) {
			switch (packageManager) {
				case "yarn":
					return `yarn ${name}`;
				case "pnpm":
					return `pnpm run ${name}`;
				case "bun":
					return `bun run ${name}`;
				case "npm":
				default:
					return `npm run ${name}`;
			}
		}

		// For any other command, convert to PowerShell
		const psCommand = convertToPowerShellCommand(osCommand);
		return psCommand;
	};

	// Try different command patterns until one works
	const tryCommandPatterns = (script: PackageScript): string[] => {
		const { command } = script;
		const patterns = [];

		// Pattern 1: Convert && to ; and export to $env:
		patterns.push(convertToPowerShellCommand(command));

		// Pattern 2: Simple && to ; replacement
		if (command.includes("&&")) {
			patterns.push(command.replace(/&&/g, ";"));
		}

		// Pattern 3: Use cmd /c for bash-like commands
		if (command.includes("export") || command.includes("&&")) {
			patterns.push(`cmd /c "${command}"`);
		}

		// Pattern 4: Use bash if available
		if (command.includes("export") || command.includes("&&")) {
			patterns.push(`bash -c "${command}"`);
		}

		// Pattern 5: Original command (fallback)
		patterns.push(command);

		return patterns.filter((pattern, index, self) => self.indexOf(pattern) === index); // Remove duplicates
	};

	// Run a script
	const runScript = async (script: PackageScript): Promise<void> => {
		if (!detectedScripts.value || runningScripts.value.has(script.name)) return;

		runningScripts.value.add(script.name);

		try {
			const { useTauriShellCommand } = await import("#imports");
			const { projectPath } = detectedScripts.value;
			
			// Determine the correct working directory based on script's original location
			let workingDirectory: string;
			if (script.workingDirectory) {
				// Use the stored working directory (for scripts from b.json)
				workingDirectory = script.workingDirectory;
			} else if (script.folder && script.folder !== "root") {
				// Script is from a subfolder, use that folder's path
				workingDirectory = `${projectPath}/${script.folder}`.replace(/\//g, "\\");
			} else {
				// Script is from root, use project path
				workingDirectory = projectPath.replace(/\//g, "\\");
			}

			console.log(`🚀 Running script "${script.name}" from folder: ${script.folder || "root"}`);
			console.log(`📁 Working directory: ${workingDirectory}`);

			// Use OS-specific command if available
			const osSpecificCommand = getOSSpecificCommand(script);
			const scriptToRun = {
				...script,
				command: osSpecificCommand
			};

			// Try different command patterns
			const commandPatterns = tryCommandPatterns(scriptToRun);

			let lastError = null;
			let success = false;

			for (let i = 0; i < commandPatterns.length; i++) {
				const command = commandPatterns[i];

				try {
					console.log(`🚀 Attempting to run script "${script.name}" with command:`, command);
					console.log(`📁 Working directory:`, workingDirectory);

					// Use the proven working pattern from Monorepo component (OscarAutomate.vue)
					// Use the modified command from b.json if available, otherwise use simple package manager command
					let commandToRun: string;
					
					if (command && command !== script.name && !command.startsWith("npm run") && !command.startsWith("yarn") && !command.startsWith("pnpm run") && !command.startsWith("bun run")) {
						// This is a modified command from b.json, use it directly
						commandToRun = command;
						console.log(`🔧 Using modified command from b.json: ${commandToRun}`);
					} else {
						// Use simple package manager command
						const pm = detectedScripts.value.packageManager || "npm";
						commandToRun = pm === "yarn" ? `yarn ${script.name}` : pm === "pnpm" ? `pnpm run ${script.name}` : pm === "bun" ? `bun run ${script.name}` : `npm run ${script.name}`;
						console.log(`🔧 Using simple package manager command: ${commandToRun}`);
					}
					
					// Properly escape the command for PowerShell
					const escapedCommand = commandToRun.replace(/"/g, '""');
					
					const ps = `Start-Process powershell -WorkingDirectory '${workingDirectory.replace(/'/g, "''")}' -WindowStyle Normal -ArgumentList "-NoProfile","-ExecutionPolicy","Bypass","-NoExit","-Command","${escapedCommand}"`;
					await useTauriShellCommand.create("exec-pwsh", ["-Command", ps]).execute();

					console.log(`✅ Script "${script.name}" launched successfully`);
					success = true;
					break;
				} catch (error) {
					console.error(`❌ Failed to run command pattern ${i + 1}:`, error);
					lastError = error;
					continue;
				}
			}

		if (success) {
			// Silent script launch - no toast
			console.log(`✅ Script "${script.name}" opened in PowerShell`);
		} else {
				throw lastError || new Error("All command patterns failed");
			}
		} catch (error) {
			console.error("Failed to run script:", error);
			useToast().add({
				title: "Script Failed",
				description: `Failed to run ${script.name}`,
				color: "error"
			});
		} finally {
			// Remove from running set after a short delay
			setTimeout(() => {
				runningScripts.value.delete(script.name);
			}, 2000);
		}
	};

	// Run custom command
	const runCustomCommand = async (): Promise<void> => {
		if (!customCommand.value || !detectedScripts.value) return;

		isRunningCustom.value = true;
		try {
			const { projectPath } = detectedScripts.value;
			const normalizedPath = projectPath.replace(/\//g, "\\");

			console.log(`🚀 Running custom command:`, customCommand.value);
			console.log(`📁 Working directory:`, normalizedPath);

			// Use the proven working pattern from Monorepo component (OscarAutomate.vue)
			const { useTauriShellCommand } = await import("#imports");
			const ps = `Start-Process powershell -WorkingDirectory '${normalizedPath.replace(/'/g, "''")}' -WindowStyle Normal -ArgumentList "-NoProfile","-ExecutionPolicy","Bypass","-NoExit","-Command","${customCommand.value}"`;
			await useTauriShellCommand.create("exec-pwsh", ["-Command", ps]).execute();

		console.log(`✅ Custom command launched successfully`);

		// Silent custom command launch - no toast
		customCommand.value = "";
		} catch {
			useToast().add({
				title: "Command Failed",
				description: "Failed to execute custom command",
				color: "error"
			});
		} finally {
			isRunningCustom.value = false;
		}
	};

	// Detect scripts
	const detectScripts = async (projectPath: string, _forceRefresh = false): Promise<void> => {
		if (!projectPath) {
			useToast().add({
				title: "No Project Path",
				description: "Please select a project directory first",
				color: "warning"
			});
			return;
		}

		isDetecting.value = true;
		scanProgress.value = { current: 0, total: 0, currentFolder: "", scriptsFound: 0 };

		try {
			// Step 1: Detect user's OS from bl.json first
			scanProgress.value.currentFolder = "Detecting OS...";
			userOS.value = await detectUserOS(projectPath);

			// Step 2: Detect package manager
			scanProgress.value.currentFolder = "Detecting package manager...";
			const packageManager = await detectPackageManager(projectPath);

			// Step 3: Find all package.json files
			scanProgress.value.currentFolder = "Scanning for package.json files...";
			const packageJsonFiles = await findPackageJsonFiles(projectPath);
			scanProgress.value.total = packageJsonFiles.length + 2; // +2 for b folder and root
			scanProgress.value.current = 1;

			// Step 4: Detect scripts from package.json files
			scanProgress.value.currentFolder = "Reading package.json files...";
			const scripts = await detectScriptsFromPackageJson(projectPath);
			scanProgress.value.scriptsFound = scripts.length;

			const projectScripts: ProjectScripts = {
				packageManager,
				scripts,
				projectPath,
				packageJsonPath: `${projectPath.replace(/\//g, "\\")}\\package.json`
			};

			detectedScripts.value = projectScripts;
			scriptSource.value = "scan";

			console.log("🔍 Debug - detectedScripts.value:", detectedScripts.value);
			console.log("🔍 Debug - scripts array:", scripts);
			console.log("🔍 Debug - scripts.length:", scripts.length);
			console.log("🔍 Debug - hasScripts computed:", hasScripts.value);

		// Initialize script versions for each detected script
		await initializeScriptVersions(scripts);

		// Silent detection - no toast (reduces notification spam)
		const osMessage = userOS.value ? ` (${userOS.value} optimized)` : "";
		const folderCount = packageJsonFiles.length;
		console.log(`✅ Scripts Detected: Found ${scripts.length} scripts in ${folderCount} package.json files${osMessage}`);
		} catch (error) {
			console.error("Script detection failed:", error);
			useToast().add({
				title: "Detection Failed",
				description: "Failed to detect project scripts",
				color: "error"
			});
		} finally {
			isDetecting.value = false;
			scanProgress.value = { current: 0, total: 0, currentFolder: "", scriptsFound: 0 };
		}
	};

	// Initialize script versions for all detected scripts
	const initializeScriptVersions = async (scripts: PackageScript[]): Promise<void> => {
		// Load saved script modifications from b.json
		const modifications = await loadOSScriptModifications(detectedScripts.value?.projectPath || "");

		for (const script of scripts) {
			if (!scriptVersions.value[script.name]) {
				// Get saved commands for each platform, fallback to original command
				const windowsCommand = modifications[script.name]?.windows || script.command;
				const linuxCommand = modifications[script.name]?.linux || script.command;
				const macCommand = modifications[script.name]?.mac || script.command;

				scriptVersions.value[script.name] = {
					windows: { command: windowsCommand, isSaved: !!modifications[script.name]?.windows },
					linux: { command: linuxCommand, isSaved: !!modifications[script.name]?.linux },
					mac: { command: macCommand, isSaved: !!modifications[script.name]?.mac }
				};

				// If user's OS has a saved version, update the main script command
				if (userOS.value && modifications[script.name]?.[userOS.value]) {
					const scriptIndex = scripts.findIndex(s => s.name === script.name);
					if (scriptIndex >= 0) {
						const savedCommand = modifications[script.name]![userOS.value];
						if (savedCommand) {
							scripts[scriptIndex]!.command = savedCommand;
							console.log(`✅ Loaded ${userOS.value} version for ${script.name}: ${savedCommand}`);
						}
					}
				}
			}
		}
	};

	// Toggle script expansion
	const toggleScript = (scriptName: string): void => {
		if (expandedScripts.value.has(scriptName)) {
			expandedScripts.value.delete(scriptName);
		} else {
			expandedScripts.value.add(scriptName);
		}
	};

	// Update script command for a specific platform
	const updateScriptCommand = (scriptName: string, platform: "windows" | "linux" | "mac", value: string): void => {
		if (!scriptVersions.value[scriptName]) {
			scriptVersions.value[scriptName] = {
				windows: { command: "", isSaved: false },
				linux: { command: "", isSaved: false },
				mac: { command: "", isSaved: false }
			};
		}
		// Preserve existing saved state when updating
		const existing = scriptVersions.value[scriptName][platform];
		scriptVersions.value[scriptName][platform] = {
			command: value,
			isSaved: existing?.isSaved || false,
			version: existing?.version,
			timestamp: existing?.timestamp
		};

		// Update reactive commands for template access
		if (!scriptCommands.value[scriptName]) {
			scriptCommands.value[scriptName] = { windows: "", linux: "", mac: "" };
		}
		scriptCommands.value[scriptName][platform] = value;
	};

	// Save script version to b.json
	const saveScriptVersion = async (scriptName: string, platform: "windows" | "linux" | "mac"): Promise<void> => {
		if (!detectedScripts.value) return;

		try {
			const { readTextFile, writeTextFile } = await import("@tauri-apps/plugin-fs");
			const bJsonPath = `${detectedScripts.value.projectPath}/b/b.json`;

			// Read existing b.json
			let bJsonContent: any = {};
			let currentVersion = "v1";

			try {
				const content = await readTextFile(bJsonPath);
				bJsonContent = JSON.parse(content);
				currentVersion = bJsonContent.version || "v1";
			} catch {
				// File doesn't exist or is invalid, start fresh
				bJsonContent = { version: "v1" };
			}

			// Increment version
			const versionMatch = currentVersion.match(/v(\d+)/);
			const versionNumber = versionMatch ? Number.parseInt(versionMatch[1] || "1") + 1 : 2;
			const newVersion = `v${versionNumber}`;
			bJsonContent.version = newVersion;

			// Ensure setup section exists
			if (!bJsonContent.setup) {
				bJsonContent.setup = {
					name: "Setup >",
					all: {},
					windows: { actions: [] },
					linux: { actions: [] },
					mac: { actions: [] }
				};
			}

			// Update the specific platform
			const command = scriptVersions.value[scriptName]?.[platform]?.command || "";
			const originalScript = detectedScripts.value.scripts.find((s) => s.name === scriptName);
			const action = {
				exe: detectedScripts.value.packageManager || "npm",
				command,
				scriptName,
				platform,
				version: newVersion,
				timestamp: new Date().toISOString(),
				description: `${scriptName} script for ${platform}`,
				category: originalScript?.category || "other",
				file: originalScript?.file || "package.json",
				folder: originalScript?.folder || "root",
				// Add the original working directory path for proper execution
				workingDirectory: originalScript?.folder && originalScript.folder !== "root" 
					? `${detectedScripts.value.projectPath}/${originalScript.folder}`.replace(/\//g, "\\")
					: detectedScripts.value.projectPath.replace(/\//g, "\\")
			};

			// Find existing action for this script/platform or add new one
			const existingIndex = bJsonContent.setup[platform].actions.findIndex(
				(a: any) => a.scriptName === scriptName && a.platform === platform
			);

			if (existingIndex >= 0) {
				bJsonContent.setup[platform].actions[existingIndex] = action;
			} else {
				bJsonContent.setup[platform].actions.push(action);
			}

			// Write back to b.json
			await writeTextFile(bJsonPath, JSON.stringify(bJsonContent, null, 2));

			// Mark the script as saved in the UI
			if (scriptVersions.value[scriptName]?.[platform]) {
				scriptVersions.value[scriptName][platform].isSaved = true;
				scriptVersions.value[scriptName][platform].version = newVersion;
				scriptVersions.value[scriptName][platform].timestamp = action.timestamp;
			}

			// If this is the current user's OS, update the main script command
			if (userOS.value === platform && detectedScripts.value) {
				const scriptIndex = detectedScripts.value.scripts.findIndex(s => s.name === scriptName);
				if (scriptIndex >= 0 && command) {
					detectedScripts.value.scripts[scriptIndex]!.command = command;
					console.log(`✅ Updated main script command for ${scriptName} to use ${platform} version: ${command}`);
				}
			}

		// Silent script save - no toast
		console.log(`✅ ${scriptName} (${platform}) saved to b.json v${newVersion}${userOS.value === platform ? ' and set as default' : ''}`);
		} catch (error) {
			console.error("Failed to save script version:", error);
			useToast().add({
				title: "Save Failed",
				description: `Failed to save ${scriptName} (${platform}) to b.json`,
				color: "error"
			});
		}
	};

	// Reset state
	const resetState = (): void => {
		detectedScripts.value = null;
		runningScripts.value.clear();
		expandedScripts.value.clear();
		scriptVersions.value = {};
		scriptCommands.value = {};
		userOS.value = null;
		scriptSource.value = null;
		customCommand.value = "";
		scanProgress.value = {
			current: 0,
			total: 0,
			currentFolder: "",
			scriptsFound: 0
		};
	};

	return {
		// State
		isDetecting,
		isRunningCustom,
		customCommand,
		detectedScripts,
		runningScripts,
		expandedScripts,
		scriptVersions,
		scriptSource,
		userOS,
		scriptCommands,
		scanProgress,

		// Computed
		hasScripts,
		totalScripts,
		sortedScripts,
		scriptFolders,

		// Helper functions
		getCategoryIcon,
		getCategoryStyle,
		getManagerStyle,
		categorizeScript,

		// Core functions
		detectScripts,
		runScript,
		runCustomCommand,
		toggleScript,
		updateScriptCommand,
		saveScriptVersion,
		resetState,
		initializeScriptVersions,

		// Utility functions
		detectPackageManager,
		detectUserOS,
		buildScriptCommand,
		convertToPowerShellCommand,
		getOSSpecificCommand,
		loadOSScriptModifications,
		applyOSModifications
	};
}
