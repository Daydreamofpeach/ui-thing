import { ref, computed } from 'vue';
import { useTauriShellCommand, useTauriOsPlatform, useTauriOsVersion, useTauriOsArch, useTauriOsLocale } from "~/composables/tauri";
import { useToast } from "#ui/composables/useToast";

export const useSetupData = () => {
	// CLI Status
	const cliStatus = ref({
		installed: false,
		version: '',
		checking: false,
		installing: false
	});

	// Package Managers
	const packageManagers = ref<Array<{ name: string, version: string, installed: boolean }>>([]);

	// Environment Tools
	const nodeVersion = ref('');
	const rustVersion = ref('');
	const phpVersion = ref('');
	const dotnetVersion = ref('');
	const pythonVersion = ref('');
	const javaVersion = ref('');
	const chocolateyVersion = ref('');

	// OS Information
	const osInfo = ref({
		platform: '',
		version: '',
		arch: '',
		locale: ''
	});

	// IDE Information
	const ideInfo = ref<Array<{
		name: string
		status: "checking" | "installed" | "not-installed"
		version?: string
		downloadUrl?: string
		checkCommand: string
		versionCommand: string
		openCommand?: string
	}>>([]);

	// Environment Variables
	const envVars = ref<Record<string, string>>({});

	// Computed setup data
	const setupData = computed(() => ({
		cliStatus: cliStatus.value,
		packageManagers: packageManagers.value,
		chocolateyVersion: chocolateyVersion.value,
		nodeVersion: nodeVersion.value,
		rustVersion: rustVersion.value,
		phpVersion: phpVersion.value,
		dotnetVersion: dotnetVersion.value,
		pythonVersion: pythonVersion.value,
		javaVersion: javaVersion.value,
		osInfo: osInfo.value,
		ideInfo: ideInfo.value,
		envVars: envVars.value
	}));

	// Check Buildit CLI
	const checkBuilditCli = async () => {
		cliStatus.value.checking = true;
		try {
			const resp = await useTauriShellCommand.create("exec-pwsh", ["-Command", "buildit --version"]).execute();
			const version = (resp.stdout || "").trim();
			cliStatus.value.installed = !!version;
			cliStatus.value.version = version;
		} catch {
			cliStatus.value.installed = false;
			cliStatus.value.version = '';
		} finally {
			cliStatus.value.checking = false;
		}
	};

	// Install Buildit CLI
	const installBuilditCli = async () => {
		cliStatus.value.installing = true;
		try {
			// Use chocolatey to install buildit
			await useTauriShellCommand.create("exec-pwsh", ["-Command", "choco install buildit -y"]).execute();
			await checkBuilditCli();
			useToast().add({
				title: "Installation Complete",
				description: "Buildit CLI installed successfully",
				color: "success"
			});
		} catch (error) {
			console.error("Failed to install Buildit CLI:", error);
			useToast().add({
				title: "Installation Failed",
				description: "Failed to install Buildit CLI",
				color: "error"
			});
		} finally {
			cliStatus.value.installing = false;
		}
	};

	// Detect package managers
	const detectPackageManagers = async () => {
		const managers = [
			{ name: "npm", command: "npm --version" },
			{ name: "yarn", command: "yarn --version" },
			{ name: "pnpm", command: "pnpm --version" },
			{ name: "bun", command: "bun --version" }
		];
		const detected: Array<{ name: string, version: string, installed: boolean }> = [];
		
		for (const m of managers) {
			try {
				const resp = await useTauriShellCommand.create("exec-pwsh", ["-Command", `try { ${m.command} } catch { '' }`]).execute();
				detected.push({ 
					name: m.name, 
					version: (resp.stdout || "").trim(), 
					installed: !!(resp.stdout || "").trim() 
				});
			} catch {
				detected.push({ name: m.name, version: "", installed: false });
			}
		}
		packageManagers.value = detected;
	};

	// Detect Node.js version
	const detectNode = async (forceRefresh = false) => {
		if (!forceRefresh) {
			const cached = localStorage.getItem("buildit_node_version");
			if (cached) {
				nodeVersion.value = cached;
				return;
			}
		}

		try {
			const resp = await useTauriShellCommand.create("exec-pwsh", ["-Command", "node --version"]).execute();
			const version = (resp.stdout || "").trim();
			nodeVersion.value = version;

			if (version) {
				localStorage.setItem("buildit_node_version", version);
			} else {
				localStorage.removeItem("buildit_node_version");
			}
		} catch {
			nodeVersion.value = "";
			localStorage.removeItem("buildit_node_version");
		}
	};

	// Detect Chocolatey version
	const detectChocolatey = async (forceRefresh = false) => {
		if (!forceRefresh) {
			const cached = localStorage.getItem("buildit_chocolatey_version");
			if (cached) {
				chocolateyVersion.value = cached;
				return;
			}
		}

		try {
			const resp = await useTauriShellCommand.create("exec-pwsh", ["-Command", "choco --version"]).execute();
			const version = (resp.stdout || "").trim();
			chocolateyVersion.value = version;

			if (version) {
				localStorage.setItem("buildit_chocolatey_version", version);
			} else {
				localStorage.removeItem("buildit_chocolatey_version");
			}
		} catch {
			chocolateyVersion.value = "";
			localStorage.removeItem("buildit_chocolatey_version");
		}
	};

	// Detect Rust version
	const detectRust = async (forceRefresh = false) => {
		if (!forceRefresh) {
			const cached = localStorage.getItem("buildit_rust_version");
			if (cached) {
				rustVersion.value = cached;
				return;
			}
		}

		try {
			const resp = await useTauriShellCommand.create("exec-pwsh", ["-Command", "rustc --version"]).execute();
			const version = (resp.stdout || "").trim();
			rustVersion.value = version;

			if (version) {
				localStorage.setItem("buildit_rust_version", version);
			} else {
				localStorage.removeItem("buildit_rust_version");
			}
		} catch {
			rustVersion.value = "";
			localStorage.removeItem("buildit_rust_version");
		}
	};

	// Detect PHP version
	const detectPhp = async (forceRefresh = false) => {
		if (!forceRefresh) {
			const cached = localStorage.getItem("buildit_php_version");
			if (cached) {
				phpVersion.value = cached;
				return;
			}
		}

		try {
			const resp = await useTauriShellCommand.create("exec-pwsh", ["-Command", "php --version"]).execute();
			const version = (resp.stdout || "").trim();
			phpVersion.value = version;

			if (version) {
				localStorage.setItem("buildit_php_version", version);
			} else {
				localStorage.removeItem("buildit_php_version");
			}
		} catch {
			phpVersion.value = "";
			localStorage.removeItem("buildit_php_version");
		}
	};

	// Detect .NET version
	const detectDotNet = async (forceRefresh = false) => {
		if (!forceRefresh) {
			const cached = localStorage.getItem("buildit_dotnet_version");
			if (cached) {
				dotnetVersion.value = cached;
				return;
			}
		}

		try {
			const resp = await useTauriShellCommand.create("exec-pwsh", ["-Command", "dotnet --version"]).execute();
			const version = (resp.stdout || "").trim();
			dotnetVersion.value = version;

			if (version) {
				localStorage.setItem("buildit_dotnet_version", version);
			} else {
				localStorage.removeItem("buildit_dotnet_version");
			}
		} catch {
			dotnetVersion.value = "";
			localStorage.removeItem("buildit_dotnet_version");
		}
	};

	// Detect Python version
	const detectPython = async (forceRefresh = false) => {
		if (!forceRefresh) {
			const cached = localStorage.getItem("buildit_python_version");
			if (cached) {
				pythonVersion.value = cached;
				return;
			}
		}

		try {
			const resp = await useTauriShellCommand.create("exec-pwsh", ["-Command", "python --version"]).execute();
			const version = (resp.stdout || "").trim();
			pythonVersion.value = version;

			if (version) {
				localStorage.setItem("buildit_python_version", version);
			} else {
				localStorage.removeItem("buildit_python_version");
			}
		} catch {
			pythonVersion.value = "";
			localStorage.removeItem("buildit_python_version");
		}
	};

	// Detect Java version
	const detectJava = async (forceRefresh = false) => {
		if (!forceRefresh) {
			const cached = localStorage.getItem("buildit_java_version");
			if (cached) {
				javaVersion.value = cached;
				return;
			}
		}

		try {
			const resp = await useTauriShellCommand.create("exec-pwsh", ["-Command", "java --version"]).execute();
			const version = (resp.stdout || "").trim();
			javaVersion.value = version;

			if (version) {
				localStorage.setItem("buildit_java_version", version);
			} else {
				localStorage.removeItem("buildit_java_version");
			}
		} catch {
			javaVersion.value = "";
			localStorage.removeItem("buildit_java_version");
		}
	};

	// Detect IDE information
	const detectIDEInfo = async () => {
		const ides = [
			{
				name: "Visual Studio Code",
				status: "checking" as const,
				checkCommand: "Get-Command code -ErrorAction SilentlyContinue",
				versionCommand: "code --version | Select-Object -First 1",
				openCommand: "code",
				downloadUrl: "https://code.visualstudio.com/download"
			},
			{
				name: "Visual Studio",
				status: "checking" as const,
				checkCommand: "Get-ChildItem 'C:\\Program Files\\Microsoft Visual Studio\\*' -ErrorAction SilentlyContinue",
				versionCommand: "Get-ChildItem 'C:\\Program Files\\Microsoft Visual Studio\\*' | Select-Object -First 1 | ForEach-Object { $_.Name }",
				openCommand: "& 'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\Common7\\IDE\\devenv.exe'",
				downloadUrl: "https://visualstudio.microsoft.com/downloads/"
			},
			{
				name: "IntelliJ IDEA",
				status: "checking" as const,
				checkCommand: "Get-ChildItem 'C:\\Program Files\\JetBrains\\IntelliJ IDEA*' -ErrorAction SilentlyContinue",
				versionCommand: "Get-ChildItem 'C:\\Program Files\\JetBrains\\IntelliJ IDEA*' | Select-Object -First 1 | ForEach-Object { $_.Name }",
				openCommand: "& 'C:\\Program Files\\JetBrains\\IntelliJ IDEA Community Edition\\bin\\idea64.exe'",
				downloadUrl: "https://www.jetbrains.com/idea/download/"
			},
			{
				name: "WebStorm",
				status: "checking" as const,
				checkCommand: "Get-ChildItem 'C:\\Program Files\\JetBrains\\WebStorm*' -ErrorAction SilentlyContinue",
				versionCommand: "Get-ChildItem 'C:\\Program Files\\JetBrains\\WebStorm*' | Select-Object -First 1 | ForEach-Object { $_.Name }",
				openCommand: "& 'C:\\Program Files\\JetBrains\\WebStorm\\bin\\webstorm64.exe'",
				downloadUrl: "https://www.jetbrains.com/webstorm/download/"
			},
			{
				name: "PyCharm",
				status: "checking" as const,
				checkCommand: "Get-ChildItem 'C:\\Program Files\\JetBrains\\PyCharm*' -ErrorAction SilentlyContinue",
				versionCommand: "Get-ChildItem 'C:\\Program Files\\JetBrains\\PyCharm*' | Select-Object -First 1 | ForEach-Object { $_.Name }",
				openCommand: "& 'C:\\Program Files\\JetBrains\\PyCharm Community Edition\\bin\\pycharm64.exe'",
				downloadUrl: "https://www.jetbrains.com/pycharm/download/"
			}
		];

		ideInfo.value = ides;

		// Check each IDE
		for (const ide of ideInfo.value) {
			try {
				const checkResponse = await useTauriShellCommand.create("exec-pwsh", [
					"-Command",
					ide.checkCommand
				]).execute();

				if (checkResponse.code === 0 && checkResponse.stdout.trim()) {
					const versionResponse = await useTauriShellCommand.create("exec-pwsh", [
						"-Command",
						ide.versionCommand
					]).execute();
					ide.status = "installed";
					ide.version = versionResponse.stdout.trim();
				} else {
					ide.status = "not-installed";
				}
			} catch (error) {
				ide.status = "not-installed";
			}
		}
	};

	// Get environment variables
	const refreshEnvVars = async () => {
		try {
			const resp = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				"Get-ChildItem Env: | ForEach-Object { \"$($_.Name)=$($_.Value)\" } | Out-String"
			]).execute();

			const envString = resp.stdout || "";
			const envLines = envString.split('\n').filter(line => line.includes('='));
			const env: Record<string, string> = {};

			envLines.forEach(line => {
				const [key, ...valueParts] = line.split('=');
				if (key && valueParts.length > 0) {
					env[key.trim()] = valueParts.join('=').trim();
				}
			});

			envVars.value = env;
		} catch (error) {
			console.error("Failed to get environment variables:", error);
		}
	};

	// Get OS information
	const getOSInfo = async () => {
		try {
			console.log("🔍 Detecting OS information using Tauri OS functions...");
			
			// Use Tauri OS functions for accurate system information (same as automate page)
			osInfo.value.platform = useTauriOsPlatform();
			osInfo.value.version = useTauriOsVersion();
			osInfo.value.arch = useTauriOsArch();
			osInfo.value.locale = await useTauriOsLocale() || "";

			console.log("✅ OS information detected:", osInfo.value);
		} catch (error) {
			console.warn("Failed to get Tauri OS info, falling back to browser detection:", error);
			// Fallback to browser-based detection (same as automate page)
			const userAgent = navigator.userAgent;
			if (userAgent.includes("Windows")) {
				osInfo.value.platform = "Windows";
			} else if (userAgent.includes("Mac")) {
				osInfo.value.platform = "macOS";
			} else if (userAgent.includes("Linux")) {
				osInfo.value.platform = "Linux";
			} else {
				osInfo.value.platform = "Unknown";
			}
			osInfo.value.version = "unknown";
			osInfo.value.arch = "unknown";
			osInfo.value.locale = navigator.language;
			
			console.log("⚠️ Using browser fallback OS info:", osInfo.value);
		}
	};

	// Initialize all setup data
	const initializeSetupData = async () => {
		await Promise.all([
			checkBuilditCli(),
			detectPackageManagers(),
			detectNode(),
			detectChocolatey(),
			detectRust(),
			detectPhp(),
			detectDotNet(),
			detectPython(),
			detectJava(),
			detectIDEInfo(),
			refreshEnvVars(),
			getOSInfo()
		]);
	};

	return {
		// State
		cliStatus,
		packageManagers,
		nodeVersion,
		rustVersion,
		phpVersion,
		dotnetVersion,
		pythonVersion,
		javaVersion,
		chocolateyVersion,
		osInfo,
		ideInfo,
		envVars,
		setupData,

		// Actions
		checkBuilditCli,
		installBuilditCli,
		detectPackageManagers,
		detectNode,
		detectChocolatey,
		detectRust,
		detectPhp,
		detectDotNet,
		detectPython,
		detectJava,
		detectIDEInfo,
		refreshEnvVars,
		getOSInfo,
		initializeSetupData
	};
};
