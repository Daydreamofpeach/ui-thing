/**
 * Composable for linking Git Clone repository chains to project orbits
 * Manages the creation of orbit nodes and task nodes for cloned repositories
 */

import { ref, computed } from "vue";
import type { Ref } from "vue";

export interface ClonedRepository {
	name: string;
	url: string;
	path: string;
	packageManager?: string;
}

export interface OrbitLinkConfig {
	repositories: ClonedRepository[];
	gitUrl: string;
	cloneDir: string;
	nodeId: string;
	sourceNodeId?: string;
}

export function useGitCloneOrbitLink() {
	const isLinking = ref(false);
	const linkError = ref<string | null>(null);
	const linkedOrbitNodeId = ref<string | null>(null);

	/**
	 * Link cloned repositories to a project orbit
	 * Creates new orbit nodes and task nodes for each repository
	 */
	const linkToOrbit = async (
		config: OrbitLinkConfig,
		handlers: {
			createOrbitNode?: (data: any) => string;
			createTaskNode?: (parentId: string, data: any) => string;
			addEdge?: (source: string, target: string) => void;
		}
	) => {
		isLinking.value = true;
		linkError.value = null;

		try {
			console.log("═══════════════════════════════════════════");
			console.log("🔗 Linking Git Clone to Orbit");
			console.log("  Repositories:", config.repositories.length);
			console.log("  Source Node:", config.nodeId);
			console.log("═══════════════════════════════════════════");

			if (!handlers.createOrbitNode) {
				throw new Error("createOrbitNode handler is required");
			}

			if (config.repositories.length === 0) {
				throw new Error("No repositories to link");
			}

			// Create orbit node for the first repository
			const firstRepo = config.repositories[0];
			const orbitNodeData = {
				label: `${firstRepo.name} Orbit`,
				type: "orbitCardNode",
				repositories: config.repositories,
				linkedRepository: {
					url: config.gitUrl,
					name: firstRepo.name
				},
				cloneDir: config.cloneDir
			};

			const orbitNodeId = handlers.createOrbitNode(orbitNodeData);
			linkedOrbitNodeId.value = orbitNodeId;

			console.log("✅ Orbit node created:", orbitNodeId);

			// Create task nodes for each repository (if handler exists)
			if (handlers.createTaskNode) {
				for (const repo of config.repositories) {
					const taskData = {
						title: `Setup ${repo.name}`,
						description: `Configure and setup cloned repository from ${repo.url}`,
						repositoryPath: repo.path,
						repositoryUrl: repo.url,
						packageManager: repo.packageManager || "npm"
					};

					const taskNodeId = handlers.createTaskNode(orbitNodeId, taskData);

					if (handlers.addEdge) {
						handlers.addEdge(orbitNodeId, taskNodeId);
					}

					console.log("✅ Task node created for", repo.name, ":", taskNodeId);
				}
			}

			console.log("═══════════════════════════════════════════");
			console.log("✅ Git Clone chain linked to orbit successfully");
			console.log("═══════════════════════════════════════════");

			return {
				success: true,
				orbitNodeId,
				taskCount: config.repositories.length
			};
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : "Unknown error";
			linkError.value = errorMsg;
			console.error("❌ Error linking to orbit:", errorMsg);
			throw error;
		} finally {
			isLinking.value = false;
		}
	};

	/**
	 * Clear linking state
	 */
	const clearLinkingState = () => {
		isLinking.value = false;
		linkError.value = null;
		linkedOrbitNodeId.value = null;
	};

	return {
		// State
		isLinking: computed(() => isLinking.value),
		linkError: computed(() => linkError.value),
		linkedOrbitNodeId: computed(() => linkedOrbitNodeId.value),

		// Methods
		linkToOrbit,
		clearLinkingState
	};
}

