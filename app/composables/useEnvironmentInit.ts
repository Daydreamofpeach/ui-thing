import { getButtClient } from '~/utils/buttClient';

/**
 * Composable for initializing environment on login
 * Uses Windows GUID to find or create environment record via buttClient
 */

import { ref } from 'vue';
// Note: keep Tauri shell commands by using the official plugin-shell API
const buttClient = getButtClient();

export interface EnvironmentInitResult {
	success: boolean;
	environmentId?: string;
	error?: Error;
}

/**
 * Composable for environment initialization on login
 * Finds or creates environment using Windows machine GUID
 */
export function useEnvironmentInit() {
	const isInitializing = ref(false);
	const error = ref<Error | null>(null);
	const isDesktop = !!(import.meta as any).env?.TAURI_PLATFORM;

	/**
	 * Get the Windows machine GUID (UUID)
	 */
	async function getWindowsGuid(): Promise<string> {
		if (!isDesktop) {
			throw new Error("Not running in desktop context");
		}
		console.log("🔍 Getting Windows machine GUID...");
		// Dynamically import to avoid Vite resolving in web builds
		// eslint-disable-next-line no-new-func
		const dynImport: any = new Function('p', 'return import(p)');
		const { Command } = await dynImport('@tauri-apps/plugin-shell');
		// Try pwsh first, then powershell
		let guid = "";
		try {
			const res = await Command.create("pwsh", ["-Command", "(Get-CimInstance -ClassName Win32_ComputerSystemProduct).UUID"]).execute();
			guid = (res.stdout ?? "").trim();
		} catch {}
		if (!guid) {
			const res = await Command.create("powershell", ["-Command", "(Get-CimInstance -ClassName Win32_ComputerSystemProduct).UUID"]).execute();
			guid = (res.stdout ?? "").trim();
		}

		if (guid && guid !== "" && !guid.toLowerCase().includes("error")) {
			console.log("✅ Windows machine GUID retrieved:", guid);
			return guid;
		}

		throw new Error("Could not retrieve Windows GUID - command returned empty or error");
	}

	/**
	 * Get basic machine info for environment creation
	 */
	async function getMachineInfo() {
		try {
			if (!isDesktop) {
				return {
					osType: "web",
					osVersion: navigator.userAgent,
					osArch: "unknown",
					osLocale: navigator.language || "en-US",
					username: "web",
					platform: navigator.platform || "web",
					cpuCores: typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator ? navigator.hardwareConcurrency : undefined
				};
			}
			// Dynamically import to avoid Vite resolving in web builds
			// eslint-disable-next-line no-new-func
			const dynImport: any = new Function('p', 'return import(p)');
			const os = await dynImport('@tauri-apps/api/os');
			const [osType, osVersion, osArch, osLocale] = await Promise.all([
				os.platform(),
				os.version(),
				os.arch(),
				os.locale().catch(() => "en-US")
			]);

			// Get Windows username
			let username = "unknown";
			try {
				// eslint-disable-next-line no-new-func
				const dynImport: any = new Function('p', 'return import(p)');
				const { Command } = await dynImport('@tauri-apps/plugin-shell');
				const usernameResult = await Command.create("pwsh", ["-Command", "$env:USERNAME"]).execute();
				username = (usernameResult.stdout ?? "").trim() || "unknown";
			} catch (err) {
				try {
					// eslint-disable-next-line no-new-func
					const dynImport: any = new Function('p', 'return import(p)');
					const { Command } = await dynImport('@tauri-apps/plugin-shell');
					const usernameResult = await Command.create("powershell", ["-Command", "$env:USERNAME"]).execute();
					username = (usernameResult.stdout ?? "").trim() || "unknown";
				} catch (e) {
					console.warn("Failed to get username:", e);
				}
			}

			// Get hardware info
			let cpuCores: number | undefined;
			if ("hardwareConcurrency" in navigator) {
				cpuCores = navigator.hardwareConcurrency;
			}

			return {
				osType,
				osVersion,
				osArch,
				osLocale: osLocale || "unknown",
				username,
				platform: `${osType}-${osArch}`,
				cpuCores
			};
		} catch (err) {
			console.warn("Failed to get machine info:", err);
			return {
				osType: "Windows",
				osVersion: "unknown",
				osArch: "unknown",
				osLocale: "unknown",
				username: "unknown",
				platform: "unknown",
				cpuCores: undefined
			};
		}
	}

	/**
	 * Find environment by machine ID using buttClient
	 * Since findByMachineId doesn't exist, we use findAllEnvironment and filter
	 */
	async function findByMachineId(machineId: string): Promise<any | null> {
		try {
			console.log("🔍 Finding environment by machine ID:", machineId);
			
			// Get all environments from API
			const environments = await buttClient.findAllEnvironment();
			
			if (!Array.isArray(environments) || environments.length === 0) {
				console.log("ℹ️ No environments found in API");
				return null;
			}

			// Find environment with matching machineId
			const matchedEnv = environments.find((env: any) => 
				env.machineId === machineId || 
				env.machine?.fingerprint === machineId
			);

			if (matchedEnv) {
				console.log("✅ Found environment by machine ID:", matchedEnv.id);
				return matchedEnv;
			}

			console.log("ℹ️ No environment found for machine ID:", machineId);
			return null;
		} catch (err) {
			console.error("❌ Failed to find environment by machine ID:", err);
			throw err;
		}
	}

	/**
	 * Create new environment using buttClient
	 */
	async function createEnvironment(machineId: string, machineInfo: any): Promise<any> {
		try {
			console.log("🆕 Creating new environment for machine:", machineId);
			
			const payload = {
				name: `${machineInfo.username}'s ${machineInfo.osType} Machine`,
				description: `AUTO-CREATED: ${machineInfo.platform} environment`,
				butt: `ENVIRONMENT.${machineId}`,
				type: "LOCAL" as const,
				machineId: machineId,
				machine: {
					osType: machineInfo.osType,
					osVersion: machineInfo.osVersion,
					osArch: machineInfo.osArch,
					osLocale: machineInfo.osLocale,
					username: machineInfo.username,
					platform: machineInfo.platform,
					cpuCores: machineInfo.cpuCores,
					fingerprint: machineId
				},
				userCode: "nocode",
				meta: {
					autoCreated: true,
					createdAt: new Date().toISOString()
				}
			};

			console.log("📤 Creating environment with payload:", payload);
			
			const result = await buttClient.createEnvironment(payload);
			
			console.log("✅ Environment created successfully:", result.id);
			return result;
		} catch (err) {
			console.error("❌ Failed to create environment:", err);
			throw err;
		}
	}

	/**
	 * Initialize environment on login
	 * Finds existing environment by machine GUID or creates a new one
	 * Returns the environment ID to be stored locally
	 */
	async function initializeEnvironment(): Promise<EnvironmentInitResult> {
		isInitializing.value = true;
		error.value = null;

		try {
			console.log("🚀 Initializing environment on login...");

			// If web, skip desktop-only steps and succeed fast
			if (!isDesktop) {
				console.log("🌐 Web environment detected - skipping desktop GUID steps");
				return { success: true, environmentId: "WEB" };
			}

			// Step 1: Get Windows machine GUID
			const machineId = await getWindowsGuid();
			console.log("📍 Machine ID:", machineId);

			// Step 2: Try to find existing environment by machine ID
			let environment = await findByMachineId(machineId);

			// Step 3: If not found, create new environment
			if (!environment) {
				console.log("💡 No existing environment found, creating new one...");
				const machineInfo = await getMachineInfo();
				environment = await createEnvironment(machineId, machineInfo);
			}

			// Step 4: Store only the environment ID locally
			const environmentId = environment.id;
			console.log("✅ Environment initialized, storing ID:", environmentId);
			
			// Store environment ID in localStorage
			localStorage.setItem("environment_id", environmentId);
			localStorage.setItem("machine_id", machineId);

			return {
				success: true,
				environmentId: environmentId
			};
		} catch (err) {
			const errorObj = err instanceof Error ? err : new Error("Failed to initialize environment");
			console.error("❌ Environment initialization failed:", errorObj);
			error.value = errorObj;

			return {
				success: false,
				error: errorObj
			};
		} finally {
			isInitializing.value = false;
		}
	}

	/**
	 * Get the stored environment ID
	 */
	function getStoredEnvironmentId(): string | null {
		return localStorage.getItem("environment_id");
	}

	/**
	 * Get the stored machine ID
	 */
	function getStoredMachineId(): string | null {
		return localStorage.getItem("machine_id");
	}

	/**
	 * Clear stored environment data
	 */
	function clearStoredEnvironment(): void {
		localStorage.removeItem("environment_id");
		localStorage.removeItem("machine_id");
		console.log("🧹 Cleared stored environment data");
	}

	return {
		// State
		isInitializing,
		error,

		// Methods
		initializeEnvironment,
		getStoredEnvironmentId,
		getStoredMachineId,
		clearStoredEnvironment,
		getWindowsGuid,
		findByMachineId
	};
}

