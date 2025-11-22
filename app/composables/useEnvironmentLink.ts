/**
 * Composable for linking environments to projects
 * Provides a generic, reusable interface for environment-project linking
 */

import { ref } from 'vue';
import { buttClient } from '~/utils/buttClient';

export interface LinkEnvironmentOptions {
	projectId: string;
	environmentId: string;
	meta?: Record<string, any>;
}

export interface LinkEnvironmentResult {
	success: boolean;
	data?: any;
	error?: Error;
}

/**
 * Composable for linking/unlinking environments to/from projects
 * Generic and reusable for any environment linking operations
 */
export function useEnvironmentLink() {
	const isLinking = ref(false);
	const isUnlinking = ref(false);
	const error = ref<Error | null>(null);

	/**
	 * Link an environment to a project
	 * @param options - Link options including projectId, environmentId, and optional metadata
	 * @returns Result object with success status and data/error
	 */
	async function linkEnvironment(options: LinkEnvironmentOptions): Promise<LinkEnvironmentResult> {
		isLinking.value = true;
		error.value = null;

		console.log('🔗 Linking environment to project:', {
			projectId: options.projectId,
			environmentId: options.environmentId,
			meta: options.meta,
		});

		try {
			// Call the Bapi linkEnvironment method
			// Endpoint pattern: POST /projects/:projectId/link/environment/:environmentId
			const result = await buttClient.linkEnvironment(
				options.projectId,
				options.environmentId,
				options.meta || {}
			);

			console.log('✅ Environment linked successfully:', result);

			return {
				success: true,
				data: result,
			};
		} catch (err) {
			console.error('❌ Failed to link environment:', err);
			const errorObj = err instanceof Error ? err : new Error('Failed to link environment');
			error.value = errorObj;

			return {
				success: false,
				error: errorObj,
			};
		} finally {
			isLinking.value = false;
		}
	}

	/**
	 * Unlink an environment from a project
	 * @param projectId - The project ID
	 * @param environmentId - The environment ID
	 * @returns Result object with success status and data/error
	 */
	async function unlinkEnvironment(
		projectId: string,
		environmentId: string
	): Promise<LinkEnvironmentResult> {
		isUnlinking.value = true;
		error.value = null;

		console.log('🔓 Unlinking environment from project:', {
			projectId,
			environmentId,
		});

		try {
			// Call the Bapi unlinkEnvironment method
			// Endpoint pattern: DELETE /projects/:projectId/unlink/environment/:environmentId
			const result = await buttClient.unlinkEnvironment(projectId, environmentId);

			console.log('✅ Environment unlinked successfully:', result);

			return {
				success: true,
				data: result,
			};
		} catch (err) {
			console.error('❌ Failed to unlink environment:', err);
			const errorObj = err instanceof Error ? err : new Error('Failed to unlink environment');
			error.value = errorObj;

			return {
				success: false,
				error: errorObj,
			};
		} finally {
			isUnlinking.value = false;
		}
	}

	/**
	 * Get linked environments for a project
	 * @param projectId - The project ID
	 * @returns Array of linked environments
	 */
	async function getLinkedEnvironments(projectId: string): Promise<any[]> {
		try {
			console.log('🔍 Fetching linked environments for project:', projectId);
			const environments = await buttClient.linkedEnvironments(projectId);
			
			console.log('✅ Linked environments retrieved:', {
				count: Array.isArray(environments) ? environments.length : 0,
				isArray: Array.isArray(environments),
				rawResponse: environments,
				firstItem: Array.isArray(environments) && environments.length > 0 ? environments[0] : null
			});

			// Log the structure of each environment for debugging
			if (Array.isArray(environments)) {
				environments.forEach((env, index) => {
					console.log(`📊 Linked Environment ${index + 1} structure:`, {
						id: env.id,
						environmentId: env.environmentId,
						projectId: env.projectId,
						hasEnvironmentObject: !!env.environment,
						environmentName: env.environment?.name,
						environmentType: env.environment?.type,
						meta: env.meta,
						fullObject: env
					});
				});
			}

			return Array.isArray(environments) ? environments : [];
		} catch (err) {
			console.error('❌ Failed to fetch linked environments:', err);
			return [];
		}
	}

	async function isEnvironmentLinkedToProject(projectId: string, environmentId: string): Promise<boolean> {
		if (!projectId || !environmentId) {
			console.warn('⚠️ isEnvironmentLinkedToProject called without projectId/environmentId', { projectId, environmentId });
			return false;
		}

		try {
			console.log('🔍 Checking environment link status', { projectId, environmentId });
			const result = await (buttClient as any).isEnvironmentLinkedToProject(projectId, environmentId);

			if (typeof result === 'boolean') {
				return result;
			}

			if (result && typeof result === 'object') {
				if ('linked' in result) {
					return !!(result as any).linked;
				}

				if ('isLinked' in result) {
					return !!(result as any).isLinked;
				}
			}

			return !!result;
		} catch (err) {
			console.error('❌ Failed to check environment link status:', err);
			return false;
		}
	}
 
	return {
		// State
		isLinking,
		isUnlinking,
		error,

		// Methods
		linkEnvironment,
		unlinkEnvironment,
		getLinkedEnvironments,
		isEnvironmentLinkedToProject,
	};
}
 
