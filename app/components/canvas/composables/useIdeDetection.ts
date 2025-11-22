import { ref } from "vue";
import { useTauriShellCommand } from "#imports";

export interface IdeConfig {
	name: string
	checkCommand: string
	versionCommand: string
	openCommand?: string
	downloadUrl?: string
	executablePaths?: string[] // For opening with openPath
}

export interface IdeStatus {
	name: string
	installed: boolean
	version?: string
	error?: string
	loading: boolean
}

/**
 * Reusable composable for IDE detection and opening
 * Uses the proven methods from IdeStatusNode and IdeList
 */
export function useIdeDetection(config: IdeConfig) {
	const status = ref<IdeStatus>({
		name: config.name,
		installed: false,
		loading: false
	});

	/**
	 * Check IDE status using the proven Tauri shell command method
	 * This matches the exact implementation from IdeStatusNode and IdeList
	 */
	const checkIdeStatus = async (forceRefresh = false): Promise<{ installed: boolean; version?: string }> => {
		status.value.loading = true;

		try {
			// Check cache first unless force refresh
			if (!forceRefresh) {
				const cacheKey = `buildit_${config.name.toLowerCase().replace(/\s+/g, '_')}_status`;
				const cached = localStorage.getItem(cacheKey);
				if (cached) {
					const cachedData = JSON.parse(cached);
					status.value.installed = cachedData.installed;
					status.value.version = cachedData.version;
					return { installed: cachedData.installed, version: cachedData.version };
				}
			}

			// Use the proven method from IdeStatusNode
			const checkResponse = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				config.checkCommand
			]).execute();

			console.log(`📊 ${config.name} check result:`, {
				code: checkResponse.code,
				stdout: checkResponse.stdout,
				stderr: checkResponse.stderr
			});

			// Check if the command found the IDE (stdout contains "found")
			const found = checkResponse.code === 0 && (checkResponse.stdout || "").toLowerCase().includes("found");

			if (found) {
				// Get version if available
				let version = "Installed";
				if (config.versionCommand) {
					try {
						const versionResponse = await useTauriShellCommand.create("exec-pwsh", [
							"-Command",
							config.versionCommand
						]).execute();

						let versionText = (versionResponse.stdout || "").trim();
						// Clean version string (remove ANSI codes, get first line)
						versionText = versionText.replace(/\x1B\[[0-9;]*m/g, "");
						versionText = versionText.split('\n')[0].trim();
						version = versionText || "Installed";
					} catch (versionError) {
						console.warn(`⚠️ ${config.name} version check failed:`, versionError);
						version = "Installed";
					}
				}

				status.value.version = version;
				status.value.installed = true;
				status.value.error = undefined;

				// Cache the result
				const cacheKey = `buildit_${config.name.toLowerCase().replace(/\s+/g, '_')}_status`;
				localStorage.setItem(cacheKey, JSON.stringify({ installed: true, version }));
			} else {
				status.value.version = undefined;
				status.value.installed = false;
				status.value.error = undefined;

				// Clear cache
				const cacheKey = `buildit_${config.name.toLowerCase().replace(/\s+/g, '_')}_status`;
				localStorage.removeItem(cacheKey);
			}

			return {
				installed: status.value.installed,
				version: status.value.version
			};
		} catch (error: any) {
			status.value.installed = false;
			status.value.error = `Failed to detect ${config.name}: ${error.message}`;

			// Clear cache
			const cacheKey = `buildit_${config.name.toLowerCase().replace(/\s+/g, '_')}_status`;
			localStorage.removeItem(cacheKey);

			throw error;
		} finally {
			status.value.loading = false;
		}
	};

	/**
	 * Open IDE using the proven method from IdeStatusNode and ProjectNode
	 * Tries openPath with executable paths first, then falls back to shell command
	 */
	const openIde = async (projectPath?: string): Promise<void> => {
		try {
			const { openPath } = await import("@tauri-apps/plugin-opener");

			// Get Windows username for path expansion
			let cachedWindowsUsername: string | null = null;
			const getWindowsUsername = async (): Promise<string> => {
				if (cachedWindowsUsername) {
					return cachedWindowsUsername;
				}
				try {
					const usernameResult = await useTauriShellCommand.create("exec-pwsh", ["-Command", "$env:USERNAME"]).execute();
					cachedWindowsUsername = usernameResult.stdout.trim();
					return cachedWindowsUsername;
				} catch {
					return "";
				}
			};

			// Try executable paths first (more reliable)
			if (config.executablePaths && config.executablePaths.length > 0) {
				const username = await getWindowsUsername();
				for (const path of config.executablePaths) {
					try {
						const expandedPath = path.replace("%USERNAME%", username);
						if (projectPath) {
							// Open with project path
							const { Command } = await import("@tauri-apps/plugin-shell");
							const command = Command.create(expandedPath, [projectPath]);
							await command.spawn();
						} else {
							await openPath(expandedPath);
						}
						console.log(`✅ ${config.name} opened successfully`);
						return;
					} catch (pathError) {
						console.warn(`  Failed to open ${config.name} at ${path}:`, pathError);
						continue;
					}
				}
			}

			// Fallback: try to open with the command
			if (config.openCommand) {
				if (projectPath) {
					// Open project in IDE
					const command = `${config.openCommand} "${projectPath}"`;
					await useTauriShellCommand.create("exec-pwsh", ["-Command", command]).execute();
				} else {
					// Just open IDE
					try {
						await openPath(config.openCommand);
					} catch (openerError) {
						// Fallback to shell command
						await useTauriShellCommand.create("exec-pwsh", ["-Command", config.openCommand]).execute();
					}
				}
				console.log(`✅ ${config.name} opened successfully`);
			}
		} catch (error) {
			console.error(`❌ Failed to open ${config.name}:`, error);
			throw error;
		}
	};

	/**
	 * Open installation guide/download page
	 */
	const openInstallationGuide = () => {
		if (config.downloadUrl) {
			window.open(config.downloadUrl, "_blank");
		}
	};

	// Auto-check on initialization
	const initializeIde = async () => {
		if (!status.value.installed) {
			await checkIdeStatus();
		}
	};

	return {
		// State
		status,

		// Actions
		checkIdeStatus,
		openIde,
		openInstallationGuide,
		initializeIde,

		// Config
		config
	};
}

// Pre-configured IDE configs matching IdeStatusNode definitions
export const ideConfigs = {
	vscode: {
		name: "VS Code",
		checkCommand: "if (Get-Command code -ErrorAction SilentlyContinue) { 'found' } else { '' }",
		versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (code --version 2>$null | Select-Object -First 1); if ($version) { $version } else { 'Installed' }",
		openCommand: "code",
		downloadUrl: "https://code.visualstudio.com/download",
		executablePaths: [
			"C:/Users/%USERNAME%/AppData/Local/Programs/Microsoft VS Code/Code.exe",
			"C:/Program Files/Microsoft VS Code/Code.exe",
			"C:/Program Files (x86)/Microsoft VS Code/Code.exe"
		]
	},
	cursor: {
		name: "Cursor",
		checkCommand: "if (Get-Command cursor -ErrorAction SilentlyContinue) { 'found' } else { '' }",
		versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (cursor --version 2>$null | Select-Object -First 1); if ($version) { $version } else { 'Installed' }",
		openCommand: "cursor",
		downloadUrl: "https://www.cursor.so/",
		executablePaths: [
			"C:/Users/%USERNAME%/AppData/Local/Programs/Cursor/Cursor.exe",
			"C:/Program Files/Cursor/Cursor.exe",
			"C:/Program Files (x86)/Cursor/Cursor.exe"
		]
	},
	visualstudio: {
		name: "Visual Studio",
		checkCommand: "if (Test-Path 'C:\\Program Files\\Microsoft Visual Studio\\*\\*\\Common7\\IDE\\devenv.exe') { 'found' } else { '' }",
		versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $vsPath = Get-ChildItem 'C:\\Program Files\\Microsoft Visual Studio\\*\\*\\Common7\\IDE\\devenv.exe' -ErrorAction SilentlyContinue | Select-Object -First 1; if ($vsPath) { $vsPath.Directory.Parent.Parent.Name } else { 'Installed' }",
		openCommand: "start devenv",
		downloadUrl: "https://visualstudio.microsoft.com/downloads/"
	},
	intellij: {
		name: "IntelliJ IDEA",
		checkCommand: "if (Test-Path 'C:\\Program Files\\JetBrains\\IntelliJ*') { 'found' } else { '' }",
		versionCommand: "(Get-ChildItem 'C:\\Program Files\\JetBrains\\IntelliJ*' -ErrorAction SilentlyContinue | Select-Object -First 1).Name",
		downloadUrl: "https://www.jetbrains.com/idea/download/"
	},
	pycharm: {
		name: "PyCharm",
		checkCommand: "if (Test-Path 'C:\\Program Files\\JetBrains\\PyCharm*') { 'found' } else { '' }",
		versionCommand: "(Get-ChildItem 'C:\\Program Files\\JetBrains\\PyCharm*' -ErrorAction SilentlyContinue | Select-Object -First 1).Name",
		downloadUrl: "https://www.jetbrains.com/pycharm/download/"
	},
	webstorm: {
		name: "WebStorm",
		checkCommand: "if (Test-Path 'C:\\Program Files\\JetBrains\\WebStorm*') { 'found' } else { '' }",
		versionCommand: "(Get-ChildItem 'C:\\Program Files\\JetBrains\\WebStorm*' -ErrorAction SilentlyContinue | Select-Object -First 1).Name",
		downloadUrl: "https://www.jetbrains.com/webstorm/download/"
	},
	sublime: {
		name: "Sublime Text",
		checkCommand: "if (Get-Command subl -ErrorAction SilentlyContinue) { 'found' } elseif (Test-Path 'C:\\Program Files\\Sublime Text\\sublime_text.exe') { 'found' } else { '' }",
		versionCommand: "if (Test-Path 'C:\\Program Files\\Sublime Text\\sublime_text.exe') { 'Sublime Text' } else { 'Unknown' }",
		openCommand: "& 'C:\\Program Files\\Sublime Text\\sublime_text.exe'",
		downloadUrl: "https://www.sublimetext.com/download",
		executablePaths: [
			"C:/Program Files/Sublime Text/sublime_text.exe",
			"C:/Program Files (x86)/Sublime Text/sublime_text.exe"
		]
	},
	notepadpp: {
		name: "Notepad++",
		checkCommand: "if (Test-Path 'C:\\Program Files\\Notepad++\\notepad++.exe') { 'found' } elseif (Test-Path 'C:\\Program Files (x86)\\Notepad++\\notepad++.exe') { 'found' } else { '' }",
		versionCommand: "if (Test-Path 'C:\\Program Files\\Notepad++\\notepad++.exe') { 'Notepad++' } else { 'Notepad++' }",
		openCommand: "start notepad++",
		downloadUrl: "https://notepad-plus-plus.org/downloads/",
		executablePaths: [
			"C:/Program Files/Notepad++/notepad++.exe",
			"C:/Program Files (x86)/Notepad++/notepad++.exe"
		]
	},
	docker: {
		name: "Docker",
		checkCommand: "if (Get-Command docker -ErrorAction SilentlyContinue) { 'found' } else { '' }",
		versionCommand: "docker --version 2>&1",
		downloadUrl: "https://www.docker.com/products/docker-desktop"
	},
	git: {
		name: "Git",
		checkCommand: "if (Get-Command git -ErrorAction SilentlyContinue) { 'found' } else { '' }",
		versionCommand: "git --version 2>&1",
		downloadUrl: "https://git-scm.com/download/win"
	}
};

