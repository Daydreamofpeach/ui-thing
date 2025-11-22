import { ref } from "vue";
import { useToast } from "~/components/Ui/composables/useToast";
import { useIdeDetection, type IdeConfig, ideConfigs } from "./useIdeDetection";
import { useTauriShellCommand } from "#imports";

export interface AppConfig {
	name: string
	checkCommand: string
	versionCommand: string
	cacheKey: string
	versionPattern?: RegExp
	openCommand?: string
	executablePaths?: string[]
	downloadUrl?: string
	installGuide: {
		title: string
		description: string
		url: string
		script: string
	}
}

export interface AppStatus {
	name: string
	installed: boolean
	version?: string
	error?: string
	loading: boolean
}

export function useAppDetection(config: AppConfig) {
	const toast = useToast();
	const status = ref<AppStatus>({
		name: config.name,
		installed: false,
		loading: false
	});

	// Check if this is an IDE and use the proven IDE detection method
	const isIde = (name: string): boolean => {
		const ideNames = ["VS Code", "Cursor", "Visual Studio", "IntelliJ IDEA", "PyCharm", "WebStorm", "Sublime Text", "Notepad++"];
		return ideNames.includes(name);
	};

	// Get IDE config if this is an IDE
	const getIdeConfig = (): IdeConfig | null => {
		if (!isIde(config.name)) return null;
		
		const ideKey = config.name.toLowerCase().replace(/\s+/g, "").replace("++", "pp");
		const ideKeyMap: Record<string, keyof typeof ideConfigs> = {
			"vscode": "vscode",
			"cursor": "cursor",
			"visualstudio": "visualstudio",
			"intellijidea": "intellij",
			"pycharm": "pycharm",
			"webstorm": "webstorm",
			"sublimetext": "sublime",
			"notepad++": "notepadpp"
		};
		
		const key = ideKeyMap[ideKey];
		return key ? ideConfigs[key] : null;
	};

	const detectApp = async (forceRefresh = false) => {
		status.value.loading = true;

		try {
			// Use proven IDE detection method for IDEs
			const ideConfig = getIdeConfig();
			if (ideConfig) {
				const { checkIdeStatus } = useIdeDetection(ideConfig);
				const result = await checkIdeStatus(forceRefresh);
				status.value.installed = result.installed;
				status.value.version = result.version;
				status.value.error = undefined;
				return result;
			}

			// For non-IDEs, use the original method but with proven Tauri shell command
			// Check cache first unless force refresh
			if (!forceRefresh) {
				const cached = localStorage.getItem(config.cacheKey);
				if (cached) {
					status.value.version = cached;
					status.value.installed = cached !== "Not installed";
					return { installed: status.value.installed, version: status.value.version };
				}
			}

			// Execute the check command using proven method
			const checkResp = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				config.checkCommand
			]).execute();

			console.log(`📊 ${config.name} check result:`, {
				code: checkResp.code,
				stdout: checkResp.stdout,
				stderr: checkResp.stderr
			});

			const found = checkResp.code === 0 && (checkResp.stdout || "").toLowerCase().includes("found");

			if (found) {
				// Get version if available
				let version = "Installed";
				if (config.versionCommand) {
					const versionResp = await useTauriShellCommand.create("exec-pwsh", [
						"-Command",
						config.versionCommand
					]).execute();
					
					let versionOutput = (versionResp.stdout || "").trim();
					// Clean version string (remove ANSI codes, get first line)
					versionOutput = versionOutput.replace(/\x1B\[[0-9;]*m/g, "");
					versionOutput = versionOutput.split('\n')[0].trim();
					
					if (versionOutput) {
						if (config.versionPattern) {
							const versionMatch = versionOutput.match(config.versionPattern);
							version = versionMatch ? versionMatch[1] || versionOutput : versionOutput;
						} else {
							version = versionOutput || "Installed";
						}
					}
				}

				status.value.version = version;
				status.value.installed = true;
				status.value.error = undefined;

				// Cache the result
				localStorage.setItem(config.cacheKey, version);
			} else {
				status.value.version = undefined;
				status.value.installed = false;
				status.value.error = undefined;

				// Clear cache
				localStorage.removeItem(config.cacheKey);
			}

			return {
				installed: status.value.installed,
				version: status.value.version,
				error: status.value.error
			};
		} catch (error: any) {
			status.value.installed = false;
			status.value.error = `Failed to detect ${config.name}: ${error.message}`;

			// Clear cache
			localStorage.removeItem(config.cacheKey);

			toast.add({
				title: `${config.name} Detection Failed`,
				description: error.message || `Failed to detect ${config.name}`,
				color: "error"
			});

			throw error;
		} finally {
			status.value.loading = false;
		}
	};

	const openApp = async (projectPath?: string): Promise<void> => {
		try {
			// Use proven IDE opening method for IDEs
			const ideConfig = getIdeConfig();
			if (ideConfig) {
				const { openIde } = useIdeDetection(ideConfig);
				await openIde(projectPath);
				return;
			}

			// For non-IDEs, try to open with openCommand if available
			if (config.openCommand) {
				const { openPath } = await import("@tauri-apps/plugin-opener");
				try {
					await openPath(config.openCommand);
				} catch {
					// Fallback to shell command
					await useTauriShellCommand.create("exec-pwsh", ["-Command", config.openCommand]).execute();
				}
			} else if (config.executablePaths && config.executablePaths.length > 0) {
				const { openPath } = await import("@tauri-apps/plugin-opener");
				const usernameResult = await useTauriShellCommand.create("exec-pwsh", ["-Command", "$env:USERNAME"]).execute();
				const username = usernameResult.stdout.trim();
				
				for (const path of config.executablePaths) {
					try {
						const expandedPath = path.replace("%USERNAME%", username);
						await openPath(expandedPath);
						return;
					} catch {
						continue;
					}
				}
			}
		} catch (error) {
			console.error(`❌ Failed to open ${config.name}:`, error);
			throw error;
		}
	};

	const installApp = async () => {
		try {
			toast.add({
				title: `Installing ${config.name}`,
				description: `Opening PowerShell with ${config.name} installation commands. Follow the prompts in the terminal.`,
				color: "info"
			});

			const { writeTextFile } = await import("@tauri-apps/plugin-fs");
			const { join } = await import("@tauri-apps/api/path");
			const { useTauriOsTempDir } = await import("#imports");
			const { Command } = await import("@tauri-apps/plugin-shell");

			const tempDir = await useTauriOsTempDir();
			const scriptPath = await join(tempDir, `install-${config.name.toLowerCase().replace(/\s+/g, '-')}.ps1`);
			await writeTextFile(scriptPath, config.installGuide.script);

			// Execute PowerShell with the script in a new window
			const command = Command.create("powershell", [
				"-NoExit",
				"-ExecutionPolicy", "Bypass",
				"-File", scriptPath
			]);

			await command.spawn();

			return { success: true };
		} catch (error: any) {
			toast.add({
				title: "Installation Failed",
				description: `Failed to open installation window. Please install ${config.name} manually from ${config.installGuide.url}`,
				color: "error"
			});

			throw error;
		}
	};

	const openInstallationGuide = () => {
		const url = config.downloadUrl || config.installGuide.url;
		if (url) {
			window.open(url, "_blank");
		}
	};

	// Auto-check on initialization
	const initializeApp = async () => {
		if (!status.value.installed) {
			await detectApp();
		}
	};

	return {
		// State
		status,

		// Actions
		detectApp,
		openApp,
		installApp,
		openInstallationGuide,
		initializeApp,

		// Config
		config
	};
}

// Pre-configured app configs
export const appConfigs = {
	vscode: {
		name: "VS Code",
		checkCommand: "if (Get-Command code -ErrorAction SilentlyContinue) { 'found' } else { '' }",
		versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (code --version 2>$null | Select-Object -First 1); if ($version) { $version } else { 'Installed' }",
		cacheKey: "buildit_vscode_version",
		openCommand: "code",
		downloadUrl: "https://code.visualstudio.com/download",
		executablePaths: [
			"C:/Users/%USERNAME%/AppData/Local/Programs/Microsoft VS Code/Code.exe",
			"C:/Program Files/Microsoft VS Code/Code.exe",
			"C:/Program Files (x86)/Microsoft VS Code/Code.exe"
		],
		installGuide: {
			title: "VS Code Installation Guide",
			description: "Download and install Visual Studio Code",
			url: "https://code.visualstudio.com/download",
			script: `# VS Code Installation Script
Write-Host "Installing VS Code..." -ForegroundColor Green
Write-Host "This will download and install Visual Studio Code." -ForegroundColor Yellow
Write-Host ""

# Check if VS Code is already installed
try {
    $vscodeVersion = code --version 2>$null
    if ($vscodeVersion) {
        Write-Host "VS Code is already installed: $vscodeVersion" -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
} catch {
    # VS Code not installed, continue with installation
}

# Download VS Code installer
Write-Host "Downloading VS Code installer..." -ForegroundColor Yellow
try {
    $url = "https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-user"
    $output = "$env:TEMP\\VSCodeSetup.exe"
    Invoke-WebRequest -Uri $url -OutFile $output
    Write-Host "Running VS Code installer..." -ForegroundColor Yellow
    Start-Process -FilePath $output -ArgumentList "/VERYSILENT /NORESTART" -Wait
    Write-Host "Cleaning up installer..." -ForegroundColor Yellow
    Remove-Item $output -Force
    Write-Host ""
    Write-Host "VS Code installation completed!" -ForegroundColor Green
    Write-Host "Please restart your terminal or run: refreshenv" -ForegroundColor Yellow
    Write-Host "Then run: code --version" -ForegroundColor Yellow
} catch {
    Write-Host "Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please install VS Code manually from: https://code.visualstudio.com/download" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`
		}
	},
	cursor: {
		name: "Cursor",
		checkCommand: "if (Get-Command cursor -ErrorAction SilentlyContinue) { 'found' } else { '' }",
		versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (cursor --version 2>$null | Select-Object -First 1); if ($version) { $version } else { 'Installed' }",
		cacheKey: "buildit_cursor_version",
		openCommand: "cursor",
		downloadUrl: "https://www.cursor.so/",
		executablePaths: [
			"C:/Users/%USERNAME%/AppData/Local/Programs/Cursor/Cursor.exe",
			"C:/Program Files/Cursor/Cursor.exe",
			"C:/Program Files (x86)/Cursor/Cursor.exe"
		],
		installGuide: {
			title: "Cursor Installation Guide",
			description: "Download and install Cursor",
			url: "https://www.cursor.so/",
			script: `# Cursor Installation Script
Write-Host "Installing Cursor..." -ForegroundColor Green
Write-Host "This will open the Cursor download page." -ForegroundColor Yellow
Write-Host ""

# Check if Cursor is already installed
try {
    $cursorVersion = cursor --version 2>$null
    if ($cursorVersion) {
        Write-Host "Cursor is already installed: $cursorVersion" -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
} catch {
    # Cursor not installed, continue with installation
}

# Open download page
Write-Host "Opening Cursor download page..." -ForegroundColor Yellow
Start-Process "https://www.cursor.so/"

Write-Host ""
Write-Host "Please download and install Cursor from the website." -ForegroundColor Yellow
Write-Host "After installation, restart your terminal and run: cursor --version" -ForegroundColor Yellow

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`
		}
	},
	visualstudio: {
		name: "Visual Studio",
		checkCommand: "if (Test-Path 'C:\\Program Files\\Microsoft Visual Studio\\*\\*\\Common7\\IDE\\devenv.exe') { 'found' } else { '' }",
		versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $vsPath = Get-ChildItem 'C:\\Program Files\\Microsoft Visual Studio\\*\\*\\Common7\\IDE\\devenv.exe' -ErrorAction SilentlyContinue | Select-Object -First 1; if ($vsPath) { $vsPath.Directory.Parent.Parent.Name } else { 'Installed' }",
		cacheKey: "buildit_visualstudio_version",
		openCommand: "start devenv",
		downloadUrl: "https://visualstudio.microsoft.com/downloads/",
		installGuide: {
			title: "Visual Studio Installation Guide",
			description: "Download and install Visual Studio",
			url: "https://visualstudio.microsoft.com/downloads/",
			script: `# Visual Studio Installation Script
Write-Host "Installing Visual Studio..." -ForegroundColor Green
Write-Host "This will open the Visual Studio download page." -ForegroundColor Yellow
Write-Host ""

# Check if Visual Studio is already installed
try {
    $vsPath = Get-ChildItem 'C:\\Program Files\\Microsoft Visual Studio\\*\\*\\Common7\\IDE\\devenv.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($vsPath) {
        Write-Host "Visual Studio is already installed" -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
} catch {
    # Visual Studio not installed, continue with installation
}

# Open download page
Write-Host "Opening Visual Studio download page..." -ForegroundColor Yellow
Start-Process "https://visualstudio.microsoft.com/downloads/"

Write-Host ""
Write-Host "Please download and install Visual Studio from the website." -ForegroundColor Yellow
Write-Host "After installation, restart your terminal." -ForegroundColor Yellow

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`
		}
	},
	intellij: {
		name: "IntelliJ IDEA",
		checkCommand: "if (Test-Path 'C:\\Program Files\\JetBrains\\IntelliJ*') { 'found' } else { '' }",
		versionCommand: "(Get-ChildItem 'C:\\Program Files\\JetBrains\\IntelliJ*' -ErrorAction SilentlyContinue | Select-Object -First 1).Name",
		cacheKey: "buildit_intellij_version",
		installGuide: {
			title: "IntelliJ IDEA Installation Guide",
			description: "Download and install IntelliJ IDEA",
			url: "https://www.jetbrains.com/idea/download/",
			script: `# IntelliJ IDEA Installation Script
Write-Host "Installing IntelliJ IDEA..." -ForegroundColor Green
Write-Host "This will open the IntelliJ IDEA download page." -ForegroundColor Yellow
Write-Host ""

# Check if IntelliJ IDEA is already installed
try {
    $ideaPath = Get-ChildItem 'C:\\Program Files\\JetBrains\\IntelliJ*' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($ideaPath) {
        Write-Host "IntelliJ IDEA is already installed: $($ideaPath.Name)" -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
} catch {
    # IntelliJ IDEA not installed, continue with installation
}

# Open download page
Write-Host "Opening IntelliJ IDEA download page..." -ForegroundColor Yellow
Start-Process "https://www.jetbrains.com/idea/download/"

Write-Host ""
Write-Host "Please download and install IntelliJ IDEA from the website." -ForegroundColor Yellow
Write-Host "After installation, restart your terminal." -ForegroundColor Yellow

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`
		}
	},
	pycharm: {
		name: "PyCharm",
		checkCommand: "if (Test-Path 'C:\\Program Files\\JetBrains\\PyCharm*') { 'found' } else { '' }",
		versionCommand: "(Get-ChildItem 'C:\\Program Files\\JetBrains\\PyCharm*' -ErrorAction SilentlyContinue | Select-Object -First 1).Name",
		cacheKey: "buildit_pycharm_version",
		installGuide: {
			title: "PyCharm Installation Guide",
			description: "Download and install PyCharm",
			url: "https://www.jetbrains.com/pycharm/download/",
			script: `# PyCharm Installation Script
Write-Host "Installing PyCharm..." -ForegroundColor Green
Write-Host "This will open the PyCharm download page." -ForegroundColor Yellow
Write-Host ""

# Check if PyCharm is already installed
try {
    $pycharmPath = Get-ChildItem 'C:\\Program Files\\JetBrains\\PyCharm*' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($pycharmPath) {
        Write-Host "PyCharm is already installed: $($pycharmPath.Name)" -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
} catch {
    # PyCharm not installed, continue with installation
}

# Open download page
Write-Host "Opening PyCharm download page..." -ForegroundColor Yellow
Start-Process "https://www.jetbrains.com/pycharm/download/"

Write-Host ""
Write-Host "Please download and install PyCharm from the website." -ForegroundColor Yellow
Write-Host "After installation, restart your terminal." -ForegroundColor Yellow

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`
		}
	},
	webstorm: {
		name: "WebStorm",
		checkCommand: "if (Test-Path 'C:\\Program Files\\JetBrains\\WebStorm*') { 'found' } else { '' }",
		versionCommand: "(Get-ChildItem 'C:\\Program Files\\JetBrains\\WebStorm*' -ErrorAction SilentlyContinue | Select-Object -First 1).Name",
		cacheKey: "buildit_webstorm_version",
		installGuide: {
			title: "WebStorm Installation Guide",
			description: "Download and install WebStorm",
			url: "https://www.jetbrains.com/webstorm/download/",
			script: `# WebStorm Installation Script
Write-Host "Installing WebStorm..." -ForegroundColor Green
Write-Host "This will open the WebStorm download page." -ForegroundColor Yellow
Write-Host ""

# Check if WebStorm is already installed
try {
    $webstormPath = Get-ChildItem 'C:\\Program Files\\JetBrains\\WebStorm*' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($webstormPath) {
        Write-Host "WebStorm is already installed: $($webstormPath.Name)" -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
} catch {
    # WebStorm not installed, continue with installation
}

# Open download page
Write-Host "Opening WebStorm download page..." -ForegroundColor Yellow
Start-Process "https://www.jetbrains.com/webstorm/download/"

Write-Host ""
Write-Host "Please download and install WebStorm from the website." -ForegroundColor Yellow
Write-Host "After installation, restart your terminal." -ForegroundColor Yellow

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`
		}
	},
	sublime: {
		name: "Sublime Text",
		checkCommand: "if (Get-Command subl -ErrorAction SilentlyContinue) { 'found' } elseif (Test-Path 'C:\\Program Files\\Sublime Text\\sublime_text.exe') { 'found' } else { '' }",
		versionCommand: "if (Test-Path 'C:\\Program Files\\Sublime Text\\sublime_text.exe') { 'Sublime Text' } else { 'Unknown' }",
		cacheKey: "buildit_sublime_version",
		openCommand: "& 'C:\\Program Files\\Sublime Text\\sublime_text.exe'",
		downloadUrl: "https://www.sublimetext.com/download",
		executablePaths: [
			"C:/Program Files/Sublime Text/sublime_text.exe",
			"C:/Program Files (x86)/Sublime Text/sublime_text.exe"
		],
		installGuide: {
			title: "Sublime Text Installation Guide",
			description: "Download and install Sublime Text",
			url: "https://www.sublimetext.com/download",
			script: `# Sublime Text Installation Script
Write-Host "Installing Sublime Text..." -ForegroundColor Green
Write-Host "This will open the Sublime Text download page." -ForegroundColor Yellow
Write-Host ""

# Check if Sublime Text is already installed
try {
    if (Get-Command subl -ErrorAction SilentlyContinue) {
        Write-Host "Sublime Text is already installed" -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
    if (Test-Path 'C:\\Program Files\\Sublime Text\\sublime_text.exe') {
        Write-Host "Sublime Text is already installed" -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
} catch {
    # Sublime Text not installed, continue with installation
}

# Open download page
Write-Host "Opening Sublime Text download page..." -ForegroundColor Yellow
Start-Process "https://www.sublimetext.com/download"

Write-Host ""
Write-Host "Please download and install Sublime Text from the website." -ForegroundColor Yellow
Write-Host "After installation, restart your terminal." -ForegroundColor Yellow

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`
		}
	},
	notepadpp: {
		name: "Notepad++",
		checkCommand: "if (Test-Path 'C:\\Program Files\\Notepad++\\notepad++.exe') { 'found' } elseif (Test-Path 'C:\\Program Files (x86)\\Notepad++\\notepad++.exe') { 'found' } else { '' }",
		versionCommand: "if (Test-Path 'C:\\Program Files\\Notepad++\\notepad++.exe') { 'Notepad++' } else { 'Notepad++' }",
		cacheKey: "buildit_notepadpp_version",
		openCommand: "start notepad++",
		downloadUrl: "https://notepad-plus-plus.org/downloads/",
		executablePaths: [
			"C:/Program Files/Notepad++/notepad++.exe",
			"C:/Program Files (x86)/Notepad++/notepad++.exe"
		],
		installGuide: {
			title: "Notepad++ Installation Guide",
			description: "Download and install Notepad++",
			url: "https://notepad-plus-plus.org/downloads/",
			script: `# Notepad++ Installation Script
Write-Host "Installing Notepad++..." -ForegroundColor Green
Write-Host "This will open the Notepad++ download page." -ForegroundColor Yellow
Write-Host ""

# Check if Notepad++ is already installed
try {
    if (Test-Path 'C:\\Program Files\\Notepad++\\notepad++.exe') {
        Write-Host "Notepad++ is already installed" -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
    if (Test-Path 'C:\\Program Files (x86)\\Notepad++\\notepad++.exe') {
        Write-Host "Notepad++ is already installed" -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
} catch {
    # Notepad++ not installed, continue with installation
}

# Open download page
Write-Host "Opening Notepad++ download page..." -ForegroundColor Yellow
Start-Process "https://notepad-plus-plus.org/downloads/"

Write-Host ""
Write-Host "Please download and install Notepad++ from the website." -ForegroundColor Yellow
Write-Host "After installation, restart your terminal." -ForegroundColor Yellow

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`
		}
	},
	docker: {
		name: "Docker",
		checkCommand: "if (Get-Command docker -ErrorAction SilentlyContinue) { 'found' } else { '' }",
		versionCommand: "docker --version 2>&1",
		cacheKey: "buildit_docker_version",
		versionPattern: /Docker version (\d+\.\d+\.\d+)/,
		downloadUrl: "https://www.docker.com/products/docker-desktop",
		installGuide: {
			title: "Docker Installation Guide",
			description: "Download and install Docker Desktop",
			url: "https://www.docker.com/products/docker-desktop",
			script: `# Docker Installation Script
Write-Host "Installing Docker..." -ForegroundColor Green
Write-Host "This will open the Docker Desktop download page." -ForegroundColor Yellow
Write-Host ""

# Check if Docker is already installed
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "Docker is already installed: $dockerVersion" -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
} catch {
    # Docker not installed, continue with installation
}

# Open download page
Write-Host "Opening Docker Desktop download page..." -ForegroundColor Yellow
Start-Process "https://www.docker.com/products/docker-desktop"

Write-Host ""
Write-Host "Please download and install Docker Desktop from the website." -ForegroundColor Yellow
Write-Host "After installation, restart your terminal and run: docker --version" -ForegroundColor Yellow

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`
		}
	},
	git: {
		name: "Git",
		checkCommand: "if (Get-Command git -ErrorAction SilentlyContinue) { 'found' } else { '' }",
		versionCommand: "git --version 2>&1",
		cacheKey: "buildit_git_version",
		versionPattern: /git version (\d+\.\d+\.\d+)/,
		downloadUrl: "https://git-scm.com/download/win",
		installGuide: {
			title: "Git Installation Guide",
			description: "Install Git via Chocolatey package manager",
			url: "https://git-scm.com/download/win",
			script: `# Git Installation Script
Write-Host "Installing Git..." -ForegroundColor Green
Write-Host "This will install Git via Chocolatey package manager." -ForegroundColor Yellow
Write-Host ""

# Check if Git is already installed
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "Git is already installed:" -ForegroundColor Green
        Write-Host $gitVersion -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
} catch {
    # Git not installed, continue with installation
}

# Check if Chocolatey is installed
try {
    $chocoVersion = choco --version 2>$null
    if (-not $chocoVersion) {
        Write-Host "Chocolatey is not installed. Installing Chocolatey first..." -ForegroundColor Yellow
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        Write-Host "Chocolatey installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Chocolatey is already installed: $chocoVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "Failed to install Chocolatey: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please install Chocolatey manually from: https://chocolatey.org/install" -ForegroundColor Yellow
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Install Git
Write-Host "Installing Git via Chocolatey..." -ForegroundColor Yellow
try {
    choco install git -y
    Write-Host ""
    Write-Host "Git installation completed!" -ForegroundColor Green
    Write-Host "Please restart your terminal or run: refreshenv" -ForegroundColor Yellow
    Write-Host "Then run: git --version" -ForegroundColor Yellow
} catch {
    Write-Host "Git installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please install Git manually from: https://git-scm.com/download/win" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`
		}
	}
};

