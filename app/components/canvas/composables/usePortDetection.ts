import { ref, computed } from "vue";

export interface PortConfig {
	port: number | null;
	source: string; // File where port was found
	framework: string; // nuxt, next, vite, etc.
	configPath: string; // Full path to config file
	scriptCommand?: string; // The script that uses this port
}

export function usePortDetection(projectPath: string) {
	const detectedPorts = ref<PortConfig[]>([]);
	const isDetecting = ref(false);
	const detectionError = ref<string | null>(null);

	// Config files to check and their patterns
	const CONFIG_FILES = [
		{ file: "package.json", framework: "npm" },
		{ file: "nuxt.config.ts", framework: "nuxt" },
		{ file: "nuxt.config.js", framework: "nuxt" },
		{ file: "next.config.js", framework: "next" },
		{ file: "next.config.mjs", framework: "next" },
		{ file: "vite.config.ts", framework: "vite" },
		{ file: "vite.config.js", framework: "vite" },
		{ file: "vue.config.js", framework: "vue-cli" },
		{ file: "angular.json", framework: "angular" },
		{ file: "src-tauri/tauri.conf.json", framework: "tauri" },
		{ file: ".env", framework: "env" },
		{ file: ".env.local", framework: "env" },
		{ file: "webpack.config.js", framework: "webpack" }
	];

	// Port extraction patterns for different config types
	const PORT_PATTERNS = {
		nuxt: [
			/devServer\s*:\s*{[^}]*port\s*:\s*(\d+)/s,
			/server\s*:\s*{[^}]*port\s*:\s*(\d+)/s,
			/"port"\s*:\s*(\d+)/,
			/port:\s*(\d+)/,
			/listen:\s*(\d+)/
		],
		next: [
			/PORT\s*=\s*(\d+)/,
			/-p\s+(\d+)/,
			/--port[=\s]+(\d+)/,
			/"dev"\s*:\s*"next dev -p (\d+)"/
		],
		vite: [
			/server\s*:\s*{[^}]*port\s*:\s*(\d+)/s,
			/preview\s*:\s*{[^}]*port\s*:\s*(\d+)/s,
			/"port"\s*:\s*(\d+)/,
			/port:\s*(\d+)/
		],
		"vue-cli": [
			/devServer\s*:\s*{[^}]*port\s*:\s*(\d+)/s,
			/"port"\s*:\s*(\d+)/,
			/port:\s*(\d+)/
		],
		angular: [
			/"port"\s*:\s*(\d+)/,
			/--port[=\s]+(\d+)/,
			/"serve"[^}]*"options"[^}]*"port"\s*:\s*(\d+)/s
		],
		tauri: [
			/"devPath"\s*:\s*"http:\/\/localhost:(\d+)"/,
			/"beforeDevCommand"\s*:[^"]*--port[=\s]+(\d+)/,
			/"beforeDevCommand"\s*:[^"]*-p\s+(\d+)/
		],
		env: [
			/PORT\s*=\s*(\d+)/,
			/VITE_PORT\s*=\s*(\d+)/,
			/NUXT_PORT\s*=\s*(\d+)/,
			/NEXT_PUBLIC_PORT\s*=\s*(\d+)/,
			/DEV_PORT\s*=\s*(\d+)/,
			/SERVER_PORT\s*=\s*(\d+)/
		],
		npm: [
			/"dev"\s*:\s*"[^"]*(?:-p|--port)[=\s]+(\d+)/,
			/"start"\s*:\s*"[^"]*(?:-p|--port)[=\s]+(\d+)/,
			/"serve"\s*:\s*"[^"]*(?:-p|--port)[=\s]+(\d+)/,
			/"dev"\s*:\s*"[^"]*localhost:(\d+)/,
			/"start"\s*:\s*"[^"]*localhost:(\d+)/
		],
		webpack: [
			/devServer\s*:\s*{[^}]*port\s*:\s*(\d+)/s,
			/"port"\s*:\s*(\d+)/,
			/port:\s*(\d+)/
		]
	};

	const detectPorts = async () => {
		isDetecting.value = true;
		detectionError.value = null;
		detectedPorts.value = [];

		try {
			console.log("🔍 Detecting ports in project:", projectPath);

			// Use the same Tauri shell command as ProjectScriptRunner
			const { useTauriShellCommand } = await import("#imports");
			const normalizedPath = projectPath.replace(/\//g, "\\");

			// Exclude patterns (same as ProjectScriptRunner)
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
				"*out*",
				"*.turbo*"
			];

			const searchPatterns = [
				"package.json",
				"nuxt.config.ts",
				"nuxt.config.js",
				"next.config.js",
				"next.config.mjs",
				"vite.config.ts",
				"vite.config.js",
				"vue.config.js",
				"angular.json",
				"tauri.conf.json",
				".env",
				".env.local",
				"webpack.config.js"
			];

			console.log(`🔍 Searching for config files in: ${normalizedPath}`);
			console.log(`📋 Looking for: ${searchPatterns.join(", ")}`);

			// Build PowerShell filter for excluded patterns
			const excludeFilter = excludePatterns.map(pattern => `$_ -notlike "${pattern}"`).join(" -and ");

			// Build PowerShell command to find all config files (same approach as ProjectScriptRunner)
			const findCommand = `Get-ChildItem -Path "${normalizedPath}" -Recurse -Include ${searchPatterns.map(p => `"${p}"`).join(",")} -File -Depth 3 -ErrorAction SilentlyContinue | Where-Object { $fullPath = $_.FullName; ${excludeFilter.replace(/\$_/g, '$fullPath')} } | Select-Object -ExpandProperty FullName`;

			const result = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				findCommand
			]).execute();

			if (result.code !== 0) {
				console.warn("⚠️ PowerShell command failed:", result.stderr);
				detectionError.value = "Failed to search for config files";
				return;
			}

			const foundFiles = result.stdout.trim().split("\n").filter((line: string) => line.trim());
			console.log(`📁 Found ${foundFiles.length} config file(s)`);

			// Read and parse each found config file using PowerShell (same as ProjectScriptRunner)
			for (const filePath of foundFiles) {
				const cleanPath = filePath.trim();
				if (!cleanPath) continue;

				const fileName = cleanPath.split("\\").pop() || "";
				const configFile = CONFIG_FILES.find(cf => cf.file === fileName);
				
				if (!configFile) continue;

				try {
					console.log(`🔍 Checking ${fileName} at: ${cleanPath}`);
					
					// Read file using PowerShell (same as ProjectScriptRunner)
					const readResult = await useTauriShellCommand.create("exec-pwsh", [
						"-Command",
						`if (Test-Path "${cleanPath}") { Get-Content "${cleanPath}" | Out-String } else { "" }`
					]).execute();
					
					const content = (readResult.stdout || "").trim();
					if (!content) {
						console.log(`  ⚠️ File empty or not found: ${fileName}`);
						continue;
					}
					
					console.log(`  ✅ Read ${content.length} characters from ${fileName}`);

					// Extract ports based on framework
					const patterns = PORT_PATTERNS[configFile.framework as keyof typeof PORT_PATTERNS] || [];
					
					for (const pattern of patterns) {
						const match = content.match(pattern);
						if (match && match[1]) {
							const port = parseInt(match[1], 10);
							
							// Check if this port is already detected
							const existing = detectedPorts.value.find(p => p.port === port);
							if (!existing) {
								detectedPorts.value.push({
									port,
									source: fileName,
									framework: configFile.framework,
									configPath: cleanPath,
									scriptCommand: extractScriptCommand(content, port)
								});
								console.log(`✅ Found port ${port} in ${fileName} (${configFile.framework})`);
							}
						}
					}
				} catch (fileError) {
					console.warn(`⚠️ Error reading ${fileName}:`, fileError);
					continue;
				}
			}

			if (detectedPorts.value.length === 0) {
				console.log("ℹ️ No ports detected in config files");
				console.log(`ℹ️ Searched ${foundFiles.length} file(s) but found no port configurations`);
			} else {
				console.log(`✅ Detected ${detectedPorts.value.length} port configuration(s)`);
			}
		} catch (error) {
			console.error("❌ Error detecting ports:", error);
			detectionError.value = error instanceof Error ? error.message : String(error);
		} finally {
			isDetecting.value = false;
		}
	};

	const updatePort = async (config: PortConfig, newPort: number) => {
		try {
			console.log(`🔧 Updating port in ${config.source} from ${config.port} to ${newPort}`);

			// Use the same Tauri shell command as ProjectScriptRunner
			const { useTauriShellCommand } = await import("#imports");
			const normalizedPath = config.configPath.replace(/\//g, "\\");

			// Read current file content using PowerShell
			const readResult = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				`if (Test-Path "${normalizedPath}") { Get-Content "${normalizedPath}" | Out-String } else { "" }`
			]).execute();

			const content = (readResult.stdout || "").trim();
			if (!content) {
				throw new Error(`Could not read ${config.source}`);
			}

			// Replace the port based on framework
			let updatedContent = content;
			const patterns = PORT_PATTERNS[config.framework as keyof typeof PORT_PATTERNS] || [];

			for (const pattern of patterns) {
				if (pattern.test(content)) {
					updatedContent = updatedContent.replace(
						pattern,
						(match) => match.replace(String(config.port), String(newPort))
					);
					break;
				}
			}

			// Escape content for PowerShell
			const escapedContent = updatedContent
				.replace(/'/g, "''")
				.replace(/`/g, "``")
				.replace(/\$/g, "`$");

			// Write updated content back using PowerShell
			const writeCommand = `Set-Content -Path "${normalizedPath}" -Value @'
${escapedContent}
'@ -Force`;

			await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				writeCommand
			]).execute();

			// Update local state
			config.port = newPort;

			console.log(`✅ Successfully updated port in ${config.source}`);
			return true;
		} catch (error) {
			console.error(`❌ Error updating port in ${config.source}:`, error);
			throw error;
		}
	};

	const extractScriptCommand = (content: string, port: number): string | undefined => {
		// Try to find the script command that uses this port
		const scriptMatches = content.matchAll(/"(dev|start|serve)"\s*:\s*"([^"]*)"/g);
		
		for (const match of scriptMatches) {
			if (match[2] && match[2].includes(String(port))) {
				return match[2];
			}
		}
		
		return undefined;
	};

	const primaryPort = computed(() => {
		// Return the most likely primary port (prefer dev/start scripts)
		const devPort = detectedPorts.value.find(p => 
			p.source === "package.json" || 
			p.framework === "nuxt" || 
			p.framework === "vite"
		);
		return devPort || detectedPorts.value[0] || null;
	});

	const getPortByFramework = (framework: string) => {
		return detectedPorts.value.find(p => p.framework === framework);
	};

	return {
		detectedPorts,
		isDetecting,
		detectionError,
		primaryPort,
		detectPorts,
		updatePort,
		getPortByFramework
	};
}

