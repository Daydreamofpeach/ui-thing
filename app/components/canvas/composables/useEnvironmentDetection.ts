import { ref } from "vue";

export const useEnvironmentDetection = () => {
	const nodeVersion = ref<string | null>(null);
	const packageManagers = ref<Array<{ name: string, version: string, installed: boolean }>>([]);
	const rustVersion = ref<string | null>(null);
	const phpVersion = ref<string | null>(null);
	const dotnetVersion = ref<string | null>(null);
	const pythonVersion = ref<string | null>(null);
	const javaVersion = ref<string | null>(null);
	const osInfo = ref<any>({});

	const detectNode = async (forceRefresh = false) => {
		// Check cache first unless force refresh
		if (!forceRefresh) {
			const cached = localStorage.getItem("buildit_node_version");
			if (cached) {
				nodeVersion.value = cached;
				return;
			}
		}

		try {
			const { useTauriShellCommand } = await import("#imports");
			const resp = await useTauriShellCommand.create("exec-pwsh", ["-Command", "try { node --version } catch { '' }"]).execute();
			const version = (resp.stdout || "").trim();
			if (version) {
				nodeVersion.value = version;
				localStorage.setItem("buildit_node_version", version);
			} else {
				nodeVersion.value = null;
			}
		} catch (error) {
			console.error("Error detecting Node.js:", error);
			nodeVersion.value = null;
		}
	};

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
				const { useTauriShellCommand } = await import("#imports");
				const resp = await useTauriShellCommand.create("exec-pwsh", ["-Command", `try { ${m.command} } catch { '' }`]).execute();
				const version = (resp.stdout || "").trim();
				if (version) {
					detected.push({ name: m.name, version, installed: true });
				}
			} catch {
				// Manager not installed
			}
		}
		packageManagers.value = detected;
	};

	const detectRust = async (forceRefresh = false) => {
		// Check cache first unless force refresh
		if (!forceRefresh) {
			const cached = localStorage.getItem("buildit_rust_version");
			if (cached) {
				rustVersion.value = cached;
				return;
			}
		}

		try {
			const { useTauriShellCommand } = await import("#imports");
			const resp = await useTauriShellCommand.create("exec-pwsh", ["-Command", "try { rustc --version } catch { '' }"]).execute();
			const version = (resp.stdout || "").trim();
			if (version) {
				rustVersion.value = version;
				localStorage.setItem("buildit_rust_version", version);
			} else {
				rustVersion.value = null;
			}
		} catch (error) {
			console.error("Error detecting Rust:", error);
			rustVersion.value = null;
		}
	};

	const detectPhp = async (forceRefresh = false) => {
		// Check cache first unless force refresh
		if (!forceRefresh) {
			const cached = localStorage.getItem("buildit_php_version");
			if (cached) {
				phpVersion.value = cached;
				return;
			}
		}

		try {
			const { useTauriShellCommand } = await import("#imports");
			const resp = await useTauriShellCommand.create("exec-pwsh", ["-Command", "try { php --version } catch { '' }"]).execute();
			const output = (resp.stdout || "").trim();
			const versionMatch = output.match(/PHP\s+(\S+)/);
			if (versionMatch && versionMatch[1]) {
				phpVersion.value = versionMatch[1];
				localStorage.setItem("buildit_php_version", versionMatch[1]);
			} else {
				phpVersion.value = null;
			}
		} catch (error) {
			console.error("Error detecting PHP:", error);
			phpVersion.value = null;
		}
	};

	const detectDotnet = async (forceRefresh = false) => {
		// Check cache first unless force refresh
		if (!forceRefresh) {
			const cached = localStorage.getItem("buildit_dotnet_version");
			if (cached) {
				dotnetVersion.value = cached;
				return;
			}
		}

		try {
			const { useTauriShellCommand } = await import("#imports");
			const resp = await useTauriShellCommand.create("exec-pwsh", ["-Command", "try { dotnet --version } catch { '' }"]).execute();
			const version = (resp.stdout || "").trim();
			if (version) {
				dotnetVersion.value = version;
				localStorage.setItem("buildit_dotnet_version", version);
			} else {
				dotnetVersion.value = null;
			}
		} catch (error) {
			console.error("Error detecting .NET:", error);
			dotnetVersion.value = null;
		}
	};

	const detectPython = async (forceRefresh = false) => {
		// Check cache first unless force refresh
		if (!forceRefresh) {
			const cached = localStorage.getItem("buildit_python_version");
			if (cached) {
				pythonVersion.value = cached;
				return;
			}
		}

		try {
			const { useTauriShellCommand } = await import("#imports");
			const resp = await useTauriShellCommand.create("exec-pwsh", ["-Command", "try { python --version } catch { '' }"]).execute();
			const version = (resp.stdout || "").trim();
			if (version) {
				pythonVersion.value = version.replace("Python ", "");
				localStorage.setItem("buildit_python_version", version.replace("Python ", ""));
			} else {
				pythonVersion.value = null;
			}
		} catch (error) {
			console.error("Error detecting Python:", error);
			pythonVersion.value = null;
		}
	};

	const detectJava = async (forceRefresh = false) => {
		// Check cache first unless force refresh
		if (!forceRefresh) {
			const cached = localStorage.getItem("buildit_java_version");
			if (cached) {
				javaVersion.value = cached;
				return;
			}
		}

		try {
			const { useTauriShellCommand } = await import("#imports");
			const resp = await useTauriShellCommand.create("exec-pwsh", ["-Command", "try { java -version 2>&1 } catch { '' }"]).execute();
			const output = (resp.stdout || resp.stderr || "").trim();
			const versionMatch = output.match(/version\s+"([^"]+)"/);
			if (versionMatch && versionMatch[1]) {
				javaVersion.value = versionMatch[1];
				localStorage.setItem("buildit_java_version", versionMatch[1]);
			} else {
				javaVersion.value = null;
			}
		} catch (error) {
			console.error("Error detecting Java:", error);
			javaVersion.value = null;
		}
	};

	const detectOSInfo = async () => {
		try {
			const { platform, version, arch, locale } = await import("@tauri-apps/plugin-os");
			osInfo.value = {
				platform: platform(),
				version: version(),
				arch: arch(),
				locale: locale()
			};
		} catch (error) {
			console.error("Error detecting OS info:", error);
			osInfo.value = {};
		}
	};

	const detectAll = async () => {
		await Promise.all([
			detectOSInfo(),
			detectNode(true),
			detectPackageManagers(),
			detectRust(true),
			detectPhp(true),
			detectDotnet(true),
			detectPython(true),
			detectJava(true)
		]);
	};

	return {
		// State
		nodeVersion,
		packageManagers,
		rustVersion,
		phpVersion,
		dotnetVersion,
		pythonVersion,
		javaVersion,
		osInfo,
		// Methods
		detectNode,
		detectPackageManagers,
		detectRust,
		detectPhp,
		detectDotnet,
		detectPython,
		detectJava,
		detectOSInfo,
		detectAll
	};
};
