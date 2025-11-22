/**
 * Composable to access environment data
 * NEW: Only stores environment ID locally, fetches full data from API when needed
 */

import { buttClient } from "~/utils/buttClient";
import { computed, ref } from "vue";

export interface Environment {
	id: string
	name: string
	description?: string
	butt?: string
	type: "LOCAL" | "REMOTE"
	creator?: string
	deletedAt?: string
	host?: string
	machineId?: string
	machine?: {
		osType: string
		osVersion: string
		osArch: string
		osLocale: string
		username: string
		platform: string
		ramGB?: number
		cpuCores?: number
		cpuModel?: string
		host?: string
		fingerprint: string
	}
	active: boolean
	createdAt: string
	synced?: boolean
}

/**
 * Composable for accessing environment data
 * Stores only environment ID locally, fetches full data from API
 */
export function useEnvironmentStore() {
	const currentEnvironmentId = ref<string | null>(null);
	const currentEnvironment = ref<Environment | null>(null);
	const isLoading = ref(false);
	const error = ref<Error | null>(null);

	/**
	 * Load current environment ID from localStorage
	 */
	function loadEnvironmentId() {
		try {
			const storedId = localStorage.getItem("environment_id");
			if (storedId) {
				currentEnvironmentId.value = storedId;
				console.log("✅ Loaded environment ID from storage:", storedId);
			} else {
				console.log("ℹ️ No environment ID found in storage");
			}
		} catch (err) {
			console.error("Failed to load environment ID:", err);
		}
	}

	/**
	 * Fetch full environment data by ID from API
	 */
	async function fetchEnvironmentById(id: string): Promise<Environment | null> {
		isLoading.value = true;
		error.value = null;

		try {
			console.log("🔍 Fetching environment data for ID:", id);

			// Get environment from API using findById
			// If buttClient doesn't have findByIdEnvironment, we use findAllEnvironment and filter
			const environments = await buttClient.findAllEnvironment();

			if (!Array.isArray(environments)) {
				throw new TypeError("Invalid response from API");
			}

			const environment = environments.find((env: any) => env.id === id);

			if (!environment) {
				console.warn("⚠️ Environment not found:", id);
				return null;
			}

			console.log("✅ Environment data fetched:", environment.name);
			return environment as Environment;
		} catch (err) {
			console.error("Failed to fetch environment:", err);
			error.value = err instanceof Error ? err : new Error("Failed to fetch environment");
			return null;
		} finally {
			isLoading.value = false;
		}
	}

	/**
	 * Load current environment (ID from storage, full data from API)
	 */
	async function loadCurrentEnvironment() {
		isLoading.value = true;
		error.value = null;

		try {
			// Load environment ID from storage
			loadEnvironmentId();

			if (!currentEnvironmentId.value) {
				console.log("ℹ️ No current environment ID to load");
				currentEnvironment.value = null;
				return;
			}

			// Fetch full environment data from API
			const environment = await fetchEnvironmentById(currentEnvironmentId.value);
			currentEnvironment.value = environment;

			if (environment) {
				console.log("✅ Current environment loaded:", environment.name);
			}
		} catch (err) {
			console.error("Failed to load current environment:", err);
			error.value = err instanceof Error ? err : new Error("Failed to load current environment");
			currentEnvironment.value = null;
		} finally {
			isLoading.value = false;
		}
	}

	/**
	 * Get the currently active environment (same as currentEnvironment)
	 */
	const activeEnvironment = computed(() => currentEnvironment.value);

	/**
	 * Set environment ID
	 */
	function setEnvironmentId(id: string) {
		try {
			localStorage.setItem("environment_id", id);
			currentEnvironmentId.value = id;
			console.log("✅ Environment ID set:", id);

			// Reload environment data
			loadCurrentEnvironment();
		} catch (err) {
			console.error("Failed to set environment ID:", err);
		}
	}

	/**
	 * Clear current environment
	 */
	function clearEnvironment() {
		try {
			localStorage.removeItem("environment_id");
			currentEnvironmentId.value = null;
			currentEnvironment.value = null;
			console.log("🧹 Environment cleared");
		} catch (err) {
			console.error("Failed to clear environment:", err);
		}
	}

	/**
	 * Get environment by ID (fetches from API)
	 */
	async function getEnvironmentById(id: string): Promise<Environment | null> {
		return await fetchEnvironmentById(id);
	}

	/**
	 * Fetch all environments from API
	 */
	async function fetchAllEnvironments(): Promise<Environment[]> {
		isLoading.value = true;
		error.value = null;

		try {
			console.log("🔍 Fetching all environments from API...");
			const environments = await buttClient.findAllEnvironment();

			if (!Array.isArray(environments)) {
				throw new TypeError("Invalid response from API");
			}

			console.log("✅ Fetched environments:", environments.length);
			return environments as Environment[];
		} catch (err) {
			console.error("Failed to fetch environments:", err);
			error.value = err instanceof Error ? err : new Error("Failed to fetch environments");
			return [];
		} finally {
			isLoading.value = false;
		}
	}

	/**
	 * Format environment for display
	 */
	function formatEnvironment(env: Environment) {
		return {
			id: env.id,
			name: env.name,
			type: env.type,
			status: env.active ? "Active" : "Inactive",
			description: env.description,
			machine: env.machine
				? {
					os: `${env.machine.osType} ${env.machine.osVersion}`,
					arch: env.machine.osArch,
					username: env.machine.username,
					cpu: env.machine.cpuCores ? `${env.machine.cpuCores} cores` : "Unknown",
					ram: env.machine.ramGB ? `${env.machine.ramGB}GB` : "Unknown"
				}
				: null,
			createdAt: new Date(env.createdAt).toLocaleDateString(),
			synced: env.synced || false
		};
	}

	return {
		// State
		currentEnvironmentId,
		currentEnvironment,
		isLoading,
		error,

		// Computed
		activeEnvironment,

		// Methods
		loadEnvironmentId,
		loadCurrentEnvironment,
		fetchEnvironmentById,
		fetchAllEnvironments,
		setEnvironmentId,
		clearEnvironment,
		getEnvironmentById,
		formatEnvironment
	};
}
