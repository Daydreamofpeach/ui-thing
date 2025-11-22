/**
 * Composable for creating and syncing environments with the Bapi
 * NEW: Works with ID-only storage pattern - no longer saves full environments locally
 */

import type { Environment } from "./useEnvironmentStore";
import { buttClient } from "~/utils/buttClient";
import { ref } from "vue";

export interface CreateEnvironmentPayload {
	name: string
	description?: string
	type: "LOCAL" | "REMOTE"
	machine?: Environment["machine"]
	machineId?: string
	butt?: string
	host?: string
}

export interface CreateEnvironmentResult {
	success: boolean
	environment?: Environment
	error?: Error
	matched?: boolean // Whether it matched an existing API environment
}

/**
 * Composable for creating environments with automatic API sync and matching
 * Generic and reusable for any environment creation needs
 */
export function useEnvironmentCreate() {
	const isCreating = ref(false);
	const isMatching = ref(false);
	const error = ref<Error | null>(null);

	/**
	 * Match a local environment with an API environment
	 * Matches by machine fingerprint, username, and type
	 */
	async function matchEnvironmentWithAPI(localEnv: Environment): Promise<Environment | null> {
		isMatching.value = true;
		error.value = null;

		try {
			console.log("🔍 Matching local environment with API:", {
				name: localEnv.name,
				type: localEnv.type,
				machineFingerprint: localEnv.machine?.fingerprint,
				username: localEnv.machine?.username
			});

			// Get all environments from API
			const apiEnvironments = await buttClient.findAllEnvironment();

			if (!Array.isArray(apiEnvironments) || apiEnvironments.length === 0) {
				console.log("ℹ️ No environments found in API to match against");
				return null;
			}

			// Match by machine fingerprint (most reliable)
			if (localEnv.machine?.fingerprint) {
				const matchedByFingerprint = apiEnvironments.find(
					(apiEnv: any) =>
						apiEnv.machine?.fingerprint === localEnv.machine?.fingerprint
						&& apiEnv.type === localEnv.type
				);

				if (matchedByFingerprint) {
					console.log("✅ Matched environment by fingerprint:", matchedByFingerprint.id);
					return {
						...localEnv,
						id: matchedByFingerprint.id,
						synced: true,
						butt: matchedByFingerprint.butt,
						creator: matchedByFingerprint.creator
					} as Environment;
				}
			}

			// Match by username and type (fallback for LOCAL environments)
			if (localEnv.type === "LOCAL" && localEnv.machine?.username) {
				const matchedByUsername = apiEnvironments.find(
					(apiEnv: any) =>
						apiEnv.type === "LOCAL"
						&& apiEnv.machine?.username === localEnv.machine?.username
				);

				if (matchedByUsername) {
					console.log("✅ Matched environment by username:", matchedByUsername.id);
					return {
						...localEnv,
						id: matchedByUsername.id,
						synced: true,
						butt: matchedByUsername.butt,
						creator: matchedByUsername.creator
					} as Environment;
				}
			}

			console.log("ℹ️ No matching environment found");
			return null;
		} catch (err) {
			console.error("❌ Failed to match environment with API:", err);
			error.value = err instanceof Error ? err : new Error("Failed to match environment");
			return null;
		} finally {
			isMatching.value = false;
		}
	}

	/**
	 * Create an environment in the Bapi
	 * @param payload - Environment creation payload
	 * @returns Result with created environment or matched existing environment
	 */
	async function createEnvironment(payload: CreateEnvironmentPayload): Promise<CreateEnvironmentResult> {
		isCreating.value = true;
		error.value = null;

		console.log("🆕 Creating environment in Bapi:", {
			name: payload.name,
			type: payload.type,
			hasMachine: !!payload.machine
		});

		try {
			// Ensure machineId exists
			const machineId = payload.machineId || payload.machine?.fingerprint || "";

			if (!machineId) {
				throw new Error("machineId is required but not provided");
			}

			// Prepare API payload - match required schema fields
			const apiPayload = {
				name: payload.name,
				description: payload.description || `${payload.type} environment`,
				butt: payload.butt || `ENVIRONMENT.${machineId}`,
				type: payload.type,
				machineId,
				machine: payload.machine || {},
				userCode: "nocode",
				meta: {}
			};

			console.log("📤 Sending to Bapi:", apiPayload);

			// Create environment via API
			const result = await buttClient.createEnvironment(apiPayload);

			console.log("✅ Environment created in Bapi:", {
				id: result?.id,
				name: result?.name,
				type: result?.type
			});

			// Convert API response to Environment format
			const environment: Environment = {
				id: result.id,
				name: result.name,
				description: result.description,
				butt: result.butt,
				type: result.type,
				creator: result.creator,
				machine: result.machine || payload.machine,
				machineId: payload.machineId || result.machine?.fingerprint,
				active: false,
				createdAt: result.createdAt || new Date().toISOString(),
				synced: true
			};

			return {
				success: true,
				environment,
				matched: false
			};
		} catch (err) {
			console.error("❌ Failed to create environment in Bapi:", err);
			const errorObj = err instanceof Error ? err : new Error("Failed to create environment");
			error.value = errorObj;

			return {
				success: false,
				error: errorObj
			};
		} finally {
			isCreating.value = false;
		}
	}

	/**
	 * Create or match an environment
	 * First tries to match with existing API environment, then creates if no match
	 * NEW: No longer saves to local Tauri store, only returns environment data
	 * @param localEnv - Local environment to create or match
	 * @returns Result with created or matched environment
	 */
	async function createOrMatchEnvironment(
		localEnv: Environment
	): Promise<CreateEnvironmentResult> {
		console.log("🔄 Creating or matching environment:", {
			name: localEnv.name,
			type: localEnv.type,
			id: localEnv.id
		});

		try {
			// First, try to match with existing API environment
			const matched = await matchEnvironmentWithAPI(localEnv);

			if (matched) {
				console.log("✅ Matched existing environment:", matched.id);

				return {
					success: true,
					environment: matched,
					matched: true
				};
			}

			// No match found, create new environment in API
			console.log("📝 No match found, creating new environment in API");

			const createPayload: CreateEnvironmentPayload = {
				name: localEnv.name,
				description: localEnv.description,
				type: localEnv.type,
				machine: localEnv.machine,
				machineId: localEnv.machineId,
				butt: localEnv.butt,
				host: localEnv.host
			};

			const createResult = await createEnvironment(createPayload);

			if (createResult.success && createResult.environment) {
				console.log("✅ Environment created:", createResult.environment.id);
				return createResult;
			}

			return createResult;
		} catch (err) {
			console.error("❌ Failed to create or match environment:", err);
			const errorObj = err instanceof Error ? err : new Error("Failed to create or match environment");
			error.value = errorObj;

			return {
				success: false,
				error: errorObj
			};
		}
	}

	return {
		// State
		isCreating,
		isMatching,
		error,

		// Methods
		createEnvironment,
		matchEnvironmentWithAPI,
		createOrMatchEnvironment
	};
}
