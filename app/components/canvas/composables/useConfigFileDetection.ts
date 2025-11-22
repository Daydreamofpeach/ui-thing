import { exists, readTextFile } from "@tauri-apps/plugin-fs";

export interface ConfigFile {
	type: "package.json" | "amplify.yaml" | "vercel.json" | "netlify.toml" | "firebase.json" | "azure-pipelines.yml" | "unknown"
	path: string
	fileName: string
	folder: string
	scripts: Array<{
		name: string
		command: string
		category: string
		description?: string
		order?: number
	}>
}

/**
 * Categorize a script by name
 */
const categorizeScript = (scriptName: string): string => {
	const name = scriptName.toLowerCase();

	if (name.includes("test")) return "test";
	if (name.includes("build")) return "build";
	if (name.includes("dev") || name.includes("start") || name.includes("serve")) return "dev";
	if (name.includes("lint") || name.includes("format") || name.includes("clean")) return "util";
	if (name.includes("deploy") || name.includes("publish")) return "deploy";

	return "other";
};

/**
 * Detect and parse various configuration files for scripts
 */
export function useConfigFileDetection() {
	/**
	 * Parse package.json
	 */
	const parsePackageJson = (content: string, path: string, fileName: string, folder: string): ConfigFile | null => {
		try {
			const pkg = JSON.parse(content);
			const scripts: ConfigFile["scripts"] = [];

			if (pkg.scripts) {
				for (const [name, command] of Object.entries(pkg.scripts)) {
					if (typeof command === "string") {
						scripts.push({
							name,
							command,
							category: categorizeScript(name)
						});
					}
				}
			}

			return {
				type: "package.json",
				path,
				fileName,
				folder,
				scripts
			};
		} catch (error) {
			console.error("Failed to parse package.json:", error);
			return null;
		}
	};

	/**
	 * Parse amplify.yaml (simple text-based parsing)
	 */
	const parseAmplifyYaml = (content: string, path: string, fileName: string, folder: string): ConfigFile | null => {
		try {
			const scripts: ConfigFile["scripts"] = [];
			const lines = content.split("\n");

			// Simple regex-based parsing for commands
			let currentPhase = "";
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				if (!line) continue;

				// Detect phase
				if (line.includes("preBuild:")) currentPhase = "preBuild";
				else if (line.includes("build:") && !line.includes("preBuild") && !line.includes("postBuild")) currentPhase = "build";
				else if (line.includes("postBuild:")) currentPhase = "postBuild";

				// Extract commands (lines starting with - )
				const trimmedLine = line.trim();
				if (trimmedLine.startsWith("-") && currentPhase) {
					const command = trimmedLine.substring(1).trim();
					if (command) {
						scripts.push({
							name: `${currentPhase}-${scripts.filter((s) => s.name.startsWith(currentPhase)).length + 1}`,
							command,
							category: "build"
						});
					}
				}
			}

			return scripts.length > 0
				? {
					type: "amplify.yaml",
					path,
					fileName,
					folder,
					scripts
				}
				: null;
		} catch (error) {
			console.error("Failed to parse amplify.yaml:", error);
			return null;
		}
	};

	/**
	 * Parse vercel.json
	 */
	const parseVercelJson = (content: string, path: string, fileName: string, folder: string): ConfigFile | null => {
		try {
			const vercel = JSON.parse(content);
			const scripts: ConfigFile["scripts"] = [];

			// Extract build command
			if (vercel.buildCommand) {
				scripts.push({
					name: "build",
					command: vercel.buildCommand,
					category: "build"
				});
			}

			// Extract dev command
			if (vercel.devCommand) {
				scripts.push({
					name: "dev",
					command: vercel.devCommand,
					category: "dev"
				});
			}

			// Extract install command
			if (vercel.installCommand) {
				scripts.push({
					name: "install",
					command: vercel.installCommand,
					category: "other"
				});
			}

			return {
				type: "vercel.json",
				path,
				fileName,
				folder,
				scripts
			};
		} catch (error) {
			console.error("Failed to parse vercel.json:", error);
			return null;
		}
	};

	/**
	 * Parse netlify.toml (simple parser for build commands)
	 */
	const parseNetlifyToml = (content: string, path: string, fileName: string, folder: string): ConfigFile | null => {
		try {
			const scripts: ConfigFile["scripts"] = [];

			// Simple regex-based parsing for common commands
			const commandMatch = content.match(/command\s*=\s*["'](.+?)["']/);
			if (commandMatch && commandMatch[1]) {
				scripts.push({
					name: "build",
					command: commandMatch[1],
					category: "build"
				});
			}

			const publishMatch = content.match(/publish\s*=\s*["'](.+?)["']/);
			if (publishMatch && publishMatch[1]) {
				scripts.push({
					name: "publish",
					command: `publish ${publishMatch[1]}`,
					category: "other"
				});
			}

			return {
				type: "netlify.toml",
				path,
				fileName,
				folder,
				scripts
			};
		} catch (error) {
			console.error("Failed to parse netlify.toml:", error);
			return null;
		}
	};

	/**
	 * Parse firebase.json
	 */
	const parseFirebaseJson = (content: string, path: string, fileName: string, folder: string): ConfigFile | null => {
		try {
			const firebase = JSON.parse(content);
			const scripts: ConfigFile["scripts"] = [];

			// Extract predeploy/postdeploy hooks
			if (firebase.hosting?.predeploy) {
				const commands = Array.isArray(firebase.hosting.predeploy)
					? firebase.hosting.predeploy
					: [firebase.hosting.predeploy];

				commands.forEach((cmd: string, idx: number) => {
					scripts.push({
						name: `predeploy-${idx + 1}`,
						command: cmd,
						category: "build"
					});
				});
			}

			if (firebase.hosting?.postdeploy) {
				const commands = Array.isArray(firebase.hosting.postdeploy)
					? firebase.hosting.postdeploy
					: [firebase.hosting.postdeploy];

				commands.forEach((cmd: string, idx: number) => {
					scripts.push({
						name: `postdeploy-${idx + 1}`,
						command: cmd,
						category: "other"
					});
				});
			}

			return {
				type: "firebase.json",
				path,
				fileName,
				folder,
				scripts
			};
		} catch (error) {
			console.error("Failed to parse firebase.json:", error);
			return null;
		}
	};

	/**
	 * Parse azure-pipelines.yml (simple text-based parsing)
	 */
	const parseAzurePipelinesYml = (content: string, path: string, fileName: string, folder: string): ConfigFile | null => {
		try {
			const scripts: ConfigFile["scripts"] = [];
			const lines = content.split("\n");

			// Simple text-based parsing for script commands
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				if (!line) continue;

				// Look for script: commands
				if (line.includes("script:")) {
					const parts = line.split("script:");
					if (parts.length > 1 && parts[1]) {
						const command = parts[1].trim();
						if (command) {
							// Try to find displayName on previous lines
							let displayName = `step-${scripts.length + 1}`;
							for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
								const prevLine = lines[j];
								if (prevLine && prevLine.includes("displayName:")) {
									const nameParts = prevLine.split("displayName:");
									if (nameParts.length > 1 && nameParts[1]) {
										displayName = nameParts[1].trim().replace(/["']/g, "");
										break;
									}
								}
							}

							scripts.push({
								name: displayName,
								command,
								category: "build"
							});
						}
					}
				}
			}

			return scripts.length > 0
				? {
					type: "azure-pipelines.yml",
					path,
					fileName,
					folder,
					scripts
				}
				: null;
		} catch (error) {
			console.error("Failed to parse azure-pipelines.yml:", error);
			return null;
		}
	};

	/**
	 * Parse a specific config file and extract scripts
	 */
	const parseConfigFile = async (
		filePath: string,
		type: ConfigFile["type"],
		projectPath: string
	): Promise<ConfigFile | null> => {
		try {
			const content = await readTextFile(filePath);
			const fileName = filePath.split("\\").pop() || filePath.split("/").pop() || "unknown";
			const folder = filePath.replace(projectPath, "").split("\\").slice(0, -1).join("\\") || "root";

			switch (type) {
			case "package.json":
				return parsePackageJson(content, filePath, fileName, folder);
			case "amplify.yaml":
				return parseAmplifyYaml(content, filePath, fileName, folder);
			case "vercel.json":
				return parseVercelJson(content, filePath, fileName, folder);
			case "netlify.toml":
				return parseNetlifyToml(content, filePath, fileName, folder);
			case "firebase.json":
				return parseFirebaseJson(content, filePath, fileName, folder);
			case "azure-pipelines.yml":
				return parseAzurePipelinesYml(content, filePath, fileName, folder);
			default:
				return null;
			}
		}
		catch (error) {
			console.error(`Failed to parse ${type}:`, error);
			return null;
		}
	};

	/**
	 * Detect all config files in a project
	 */
	const detectConfigFiles = async (projectPath: string): Promise<ConfigFile[]> => {
		const configFiles: ConfigFile[] = [];

		// Define config files to check
		const configFilesToCheck = [
			{ type: "package.json" as const, path: "package.json" },
			{ type: "amplify.yaml" as const, path: "amplify.yaml" },
			{ type: "amplify.yaml" as const, path: "amplify.yml" },
			{ type: "vercel.json" as const, path: "vercel.json" },
			{ type: "netlify.toml" as const, path: "netlify.toml" },
			{ type: "firebase.json" as const, path: "firebase.json" },
			{ type: "azure-pipelines.yml" as const, path: "azure-pipelines.yml" },
			{ type: "azure-pipelines.yml" as const, path: "azure-pipelines.yaml" }
		];

		for (const config of configFilesToCheck) {
			const fullPath = `${projectPath}\\${config.path}`;

			try {
				const fileExists = await exists(fullPath);
				if (fileExists) {
					const configFile = await parseConfigFile(fullPath, config.type, projectPath);
					if (configFile && configFile.scripts.length > 0) {
						configFiles.push(configFile);
					}
				}
			}
			catch (error) {
				console.warn(`Failed to check ${config.path}:`, error);
			}
		}

		return configFiles;
	};

	return {
		detectConfigFiles,
		parseConfigFile
	};
}

