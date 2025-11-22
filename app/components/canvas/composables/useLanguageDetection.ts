import { ref } from "vue";
import { useToast } from "~/components/Ui/composables/useToast";

export interface LanguageConfig {
	name: string
	command: string
	versionPattern: RegExp
	cacheKey: string
	installGuide: {
		title: string
		description: string
		url: string
		script: string
	}
}

export interface LanguageStatus {
	name: string
	installed: boolean
	version?: string
	error?: string
	loading: boolean
}

export function useLanguageDetection(config: LanguageConfig) {
	const toast = useToast();
	const status = ref<LanguageStatus>({
		name: config.name,
		installed: false,
		loading: false
	});

	const detectLanguage = async (forceRefresh = false) => {
		status.value.loading = true;

		try {
			// Check cache first unless force refresh
			if (!forceRefresh) {
				const cached = localStorage.getItem(config.cacheKey);
				if (cached) {
					status.value.version = cached;
					status.value.installed = cached !== "Not installed";
					return { installed: status.value.installed, version: status.value.version };
				}
			}

			const { useTauriShellCommand } = await import("#imports");

			// Try the primary command first
			let resp = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				`try { ${config.command} --version 2>&1 } catch { $null }`
			]).execute();

			let version = (resp.stdout || "").trim();

			// For Python, try multiple commands if the first one fails
			if ((!version || resp.code !== 0) && config.name === "Python") {
				// Try python3
				resp = await useTauriShellCommand.create("exec-pwsh", [
					"-Command",
					`try { python3 --version 2>&1 } catch { $null }`
				]).execute();
				version = (resp.stdout || "").trim();

				// Try py (Python Launcher on Windows)
				if (!version || resp.code !== 0) {
					resp = await useTauriShellCommand.create("exec-pwsh", [
						"-Command",
						`try { py --version 2>&1 } catch { $null }`
					]).execute();
					version = (resp.stdout || "").trim();
				}
			}

			// For Node.js, try nodejs as fallback
			if ((!version || resp.code !== 0) && config.name === "Node.js") {
				resp = await useTauriShellCommand.create("exec-pwsh", [
					"-Command",
					`try { nodejs --version 2>&1 } catch { $null }`
				]).execute();
				version = (resp.stdout || "").trim();
			}

			if (version && resp.code === 0) {
				// Extract version using the provided pattern
				const versionMatch = version.match(config.versionPattern);
				const cleanVersion = versionMatch ? versionMatch[1] || version : version;

				status.value.version = cleanVersion;
				status.value.installed = true;
				status.value.error = undefined;

				// Cache the result
				localStorage.setItem(config.cacheKey, cleanVersion);
			} else {
				status.value.version = "Not installed";
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
			status.value.version = "Not installed";
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

	const installLanguage = async () => {
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
		window.open(config.installGuide.url, "_blank");
	};

	// Auto-check on initialization
	const initializeLanguage = async () => {
		if (!status.value.installed) {
			await detectLanguage();
		}
	};

	return {
		// State
		status,

		// Actions
		detectLanguage,
		installLanguage,
		openInstallationGuide,
		initializeLanguage,

		// Config
		config
	};
}

// Pre-configured language configs
export const languageConfigs = {
	rust: {
		name: "Rust",
		command: "rustc",
		versionPattern: /rustc (\d+\.\d+\.\d+)/,
		cacheKey: "buildit_rust_version",
		installGuide: {
			title: "Rust Installation Guide",
			description: "Download and install the Rust toolchain",
			url: "https://rustup.rs/",
			script: `# Rust Installation Script
Write-Host "Installing Rust..." -ForegroundColor Green
Write-Host "This will download and install the Rust toolchain." -ForegroundColor Yellow
Write-Host ""

# Check if rustup is already installed
try {
    $rustVersion = rustc --version 2>$null
    if ($rustVersion) {
        Write-Host "Rust is already installed: $rustVersion" -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
} catch {
    # Rust not installed, continue with installation
}

# Download and run rustup installer
Write-Host "Downloading rustup installer..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "rustup-init.exe"
    Write-Host "Running rustup installer..." -ForegroundColor Yellow
    .\\rustup-init.exe -y
    Write-Host "Cleaning up installer..." -ForegroundColor Yellow
    Remove-Item rustup-init.exe -Force
    Write-Host ""
    Write-Host "Rust installation completed!" -ForegroundColor Green
    Write-Host "Please restart your terminal or run: refreshenv" -ForegroundColor Yellow
    Write-Host "Then run: rustc --version" -ForegroundColor Yellow
} catch {
    Write-Host "Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please install Rust manually from: https://rustup.rs/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`
		}
	},
	php: {
		name: "PHP",
		command: "php",
		versionPattern: /PHP (\d+\.\d+\.\d+)/,
		cacheKey: "buildit_php_version",
		installGuide: {
			title: "PHP Installation Guide",
			description: "Install PHP via Chocolatey package manager",
			url: "https://www.php.net/downloads.php",
			script: `# PHP Installation Script
Write-Host "Installing PHP..." -ForegroundColor Green
Write-Host "This will install PHP via Chocolatey package manager." -ForegroundColor Yellow
Write-Host ""

# Check if PHP is already installed
try {
    $phpVersion = php --version 2>$null
    if ($phpVersion) {
        Write-Host "PHP is already installed:" -ForegroundColor Green
        Write-Host $phpVersion -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
} catch {
    # PHP not installed, continue with installation
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

# Install PHP
Write-Host "Installing PHP via Chocolatey..." -ForegroundColor Yellow
try {
    choco install php -y
    Write-Host ""
    Write-Host "PHP installation completed!" -ForegroundColor Green
    Write-Host "Please restart your terminal or run: refreshenv" -ForegroundColor Yellow
    Write-Host "Then run: php --version" -ForegroundColor Yellow
} catch {
    Write-Host "PHP installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please install PHP manually from: https://www.php.net/downloads" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`
		}
	},
	dotnet: {
		name: ".NET",
		command: "dotnet",
		versionPattern: /(\d+\.\d+\.\d+)/,
		cacheKey: "buildit_dotnet_version",
		installGuide: {
			title: ".NET Installation Guide",
			description: "Install .NET SDK via Chocolatey package manager",
			url: "https://dotnet.microsoft.com/download",
			script: `# .NET Installation Script
Write-Host "Installing .NET SDK..." -ForegroundColor Green
Write-Host "This will install .NET SDK via Chocolatey package manager." -ForegroundColor Yellow
Write-Host ""

# Check if .NET is already installed
try {
    $dotnetVersion = dotnet --version 2>$null
    if ($dotnetVersion) {
        Write-Host ".NET is already installed: $dotnetVersion" -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
} catch {
    # .NET not installed, continue with installation
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

# Install .NET SDK
Write-Host "Installing .NET SDK via Chocolatey..." -ForegroundColor Yellow
try {
    choco install dotnet-sdk -y
    Write-Host ""
    Write-Host ".NET SDK installation completed!" -ForegroundColor Green
    Write-Host "Please restart your terminal or run: refreshenv" -ForegroundColor Yellow
    Write-Host "Then run: dotnet --version" -ForegroundColor Yellow
} catch {
    Write-Host ".NET installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please install .NET manually from: https://dotnet.microsoft.com/download" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`
		}
	},
	python: {
		name: "Python",
		command: "python",
		versionPattern: /Python (\d+\.\d+\.\d+)/,
		cacheKey: "buildit_python_version",
		installGuide: {
			title: "Python Installation Guide",
			description: "Install Python via Chocolatey package manager",
			url: "https://www.python.org/downloads/",
			script: `# Python Installation Script
Write-Host "Installing Python..." -ForegroundColor Green
Write-Host "This will install Python via Chocolatey package manager." -ForegroundColor Yellow
Write-Host ""

# Check if Python is already installed
$pythonFound = $false
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0 -and $pythonVersion) {
        Write-Host "Python is already installed:" -ForegroundColor Green
        Write-Host $pythonVersion -ForegroundColor Green
        $pythonFound = $true
    }
} catch {
    # Try python3
    try {
        $python3Version = python3 --version 2>&1
        if ($LASTEXITCODE -eq 0 -and $python3Version) {
            Write-Host "Python3 is already installed:" -ForegroundColor Green
            Write-Host $python3Version -ForegroundColor Green
            $pythonFound = $true
        }
    } catch {
        # Try py (Python Launcher on Windows)
        try {
            $pyVersion = py --version 2>&1
            if ($LASTEXITCODE -eq 0 -and $pyVersion) {
                Write-Host "Python (via py launcher) is already installed:" -ForegroundColor Green
                Write-Host $pyVersion -ForegroundColor Green
                $pythonFound = $true
            }
        } catch {
            # Python not installed, continue with installation
        }
    }
}

if ($pythonFound) {
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 0
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

# Install Python
Write-Host "Installing Python via Chocolatey..." -ForegroundColor Yellow
try {
    choco install python -y
    Write-Host ""
    Write-Host "Python installation completed!" -ForegroundColor Green
    Write-Host "Please restart your terminal or run: refreshenv" -ForegroundColor Yellow
    Write-Host "Then run: python --version" -ForegroundColor Yellow
} catch {
    Write-Host "Python installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please install Python manually from: https://www.python.org/downloads/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`
		}
	},
	java: {
		name: "Java",
		command: "java",
		versionPattern: /(\d+\.\d+\.\d+)/,
		cacheKey: "buildit_java_version",
		installGuide: {
			title: "Java Installation Guide",
			description: "Install OpenJDK via Chocolatey package manager",
			url: "https://adoptium.net/",
			script: `# Java Installation Script
Write-Host "Installing OpenJDK..." -ForegroundColor Green
Write-Host "This will install OpenJDK via Chocolatey package manager." -ForegroundColor Yellow
Write-Host ""

# Check if Java is already installed
try {
    $javaVersion = java --version 2>$null
    if ($javaVersion) {
        Write-Host "Java is already installed:" -ForegroundColor Green
        Write-Host $javaVersion -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
} catch {
    # Java not installed, continue with installation
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

# Install OpenJDK
Write-Host "Installing OpenJDK via Chocolatey..." -ForegroundColor Yellow
try {
    choco install openjdk -y
    Write-Host ""
    Write-Host "OpenJDK installation completed!" -ForegroundColor Green
    Write-Host "Please restart your terminal or run: refreshenv" -ForegroundColor Yellow
    Write-Host "Then run: java --version" -ForegroundColor Yellow
} catch {
    Write-Host "Java installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please install Java manually from: https://adoptium.net/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`
		}
	},
	node: {
		name: "Node.js",
		command: "node",
		versionPattern: /v?(\d+\.\d+\.\d+)/,
		cacheKey: "buildit_node_version",
		installGuide: {
			title: "Node.js Installation Guide",
			description: "Install Node.js via Chocolatey package manager",
			url: "https://nodejs.org/en/download/",
			script: `# Node.js Installation Script
Write-Host "Installing Node.js..." -ForegroundColor Green
Write-Host "This will install Node.js via Chocolatey package manager." -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is already installed
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "Node.js is already installed:" -ForegroundColor Green
        Write-Host $nodeVersion -ForegroundColor Green
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
} catch {
    # Node.js not installed, continue with installation
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

# Install Node.js
Write-Host "Installing Node.js via Chocolatey..." -ForegroundColor Yellow
try {
    choco install nodejs -y
    Write-Host ""
    Write-Host "Node.js installation completed!" -ForegroundColor Green
    Write-Host "Please restart your terminal or run: refreshenv" -ForegroundColor Yellow
    Write-Host "Then run: node --version" -ForegroundColor Yellow
} catch {
    Write-Host "Node.js installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please install Node.js manually from: https://nodejs.org/en/download/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`
		}
	}
};
