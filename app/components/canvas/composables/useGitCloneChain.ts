import { ref } from 'vue';

/**
 * Git Clone Chain Composable
 * 
 * Manages the creation and orchestration of the Git Clone template chain.
 * Handles creating all three nodes and linking them together, as well as
 * integrating with the project orbit system.
 */

export interface GitCloneConfig {
	repositoryUrl: string;
	cloneDirectory: string;
	repositories: Array<{ name: string; url: string; path: string }>;
}

export interface GitCloneChainHandlers {
	createNode: (type: string, data: any, position: { x: number; y: number }) => any;
	createEdge: (source: string, target: string) => void;
	addOrbitItem: (nodeId: string, orbitItemData: any) => void;
}

export function useGitCloneChain() {
	const chainNodes = ref<Array<{ id: string; type: string }>>([]);
	const chainEdges = ref<Array<{ id: string; source: string; target: string }>>([]);

	/**
	 * Create the full Git Clone chain with all three nodes
	 */
	const createGitCloneChain = async (
		config: GitCloneConfig,
		handlers: GitCloneChainHandlers,
		basePosition: { x: number; y: number } = { x: 100, y: 100 }
	) => {
		console.log("═══════════════════════════════════════════");
		console.log("🚀 Creating Git Clone Template Chain");
		console.log("  Repository URL:", config.repositoryUrl);
		console.log("  Base Position:", basePosition);
		console.log("═══════════════════════════════════════════");

		try {
			// Node 1: Git Clone Repository
			const repositoryNode = handlers.createNode(
				"gitCloneRepositoryNode",
				{
					gitUrl: config.repositoryUrl,
					cloneDir: config.cloneDirectory,
					clonedRepositories: config.repositories
				},
				basePosition
			);

			chainNodes.value.push({
				id: repositoryNode.id,
				type: "gitCloneRepositoryNode"
			});

			console.log("✅ Created Git Clone Repository Node:", repositoryNode.id);

			// Node 2: Git Clone Requirements (positioned to the right)
			const requirementsNode = handlers.createNode(
				"gitCloneRequirementsNode",
				{
					selectedRepository: config.repositories[0] || null
				},
				{
					x: basePosition.x + 500,
					y: basePosition.y
				}
			);

			chainNodes.value.push({
				id: requirementsNode.id,
				type: "gitCloneRequirementsNode"
			});

			console.log("✅ Created Git Clone Requirements Node:", requirementsNode.id);

			// Create edge: Repository -> Requirements
			handlers.createEdge(repositoryNode.id, requirementsNode.id);
			chainEdges.value.push({
				id: `${repositoryNode.id}-to-${requirementsNode.id}`,
				source: repositoryNode.id,
				target: requirementsNode.id
			});

			console.log("✅ Created edge: Repository → Requirements");

			// Node 3: Git Clone Dependencies (positioned further right)
			const dependenciesNode = handlers.createNode(
				"gitCloneDependenciesNode",
				{
					selectedRepository: config.repositories[0] || null
				},
				{
					x: basePosition.x + 1000,
					y: basePosition.y
				}
			);

			chainNodes.value.push({
				id: dependenciesNode.id,
				type: "gitCloneDependenciesNode"
			});

			console.log("✅ Created Git Clone Dependencies Node:", dependenciesNode.id);

			// Create edge: Requirements -> Dependencies
			handlers.createEdge(requirementsNode.id, dependenciesNode.id);
			chainEdges.value.push({
				id: `${requirementsNode.id}-to-${dependenciesNode.id}`,
				source: requirementsNode.id,
				target: dependenciesNode.id
			});

			console.log("✅ Created edge: Requirements → Dependencies");
			console.log("═══════════════════════════════════════════");

			return {
				nodes: [repositoryNode, requirementsNode, dependenciesNode],
				edges: chainEdges.value
			};
		} catch (error) {
			console.error("❌ Error creating Git Clone chain:", error);
			throw error;
		}
	};

	/**
	 * Link the Git Clone chain to a project orbit
	 * This adds all three nodes as orbit items to the project node
	 */
	const linkChainToProjectOrbit = async (
		chainNodeIds: { repository: string; requirements: string; dependencies: string },
		projectNodeId: string,
		handlers: GitCloneChainHandlers
	) => {
		console.log("═══════════════════════════════════════════");
		console.log("🔗 Linking Git Clone Chain to Project Orbit");
		console.log("  Project Node ID:", projectNodeId);
		console.log("  Chain Node IDs:", chainNodeIds);
		console.log("═══════════════════════════════════════════");

		try {
			// Add Repository node to orbit
			handlers.addOrbitItem(projectNodeId, {
				id: chainNodeIds.repository,
				icon: "i-lucide-git-branch",
				label: "Clone Repository",
				color: "rgba(249, 115, 22, 0.95)",
				tooltip: "Git Clone Repository Node"
			});

			console.log("✅ Added Repository node to orbit");

			// Add Requirements node to orbit
			handlers.addOrbitItem(projectNodeId, {
				id: chainNodeIds.requirements,
				icon: "i-lucide-list-checks",
				label: "Requirements",
				color: "rgba(59, 130, 246, 0.95)",
				tooltip: "Git Clone Requirements Node"
			});

			console.log("✅ Added Requirements node to orbit");

			// Add Dependencies node to orbit
			handlers.addOrbitItem(projectNodeId, {
				id: chainNodeIds.dependencies,
				icon: "i-lucide-package",
				label: "Dependencies",
				color: "rgba(34, 197, 94, 0.95)",
				tooltip: "Git Clone Dependencies Node"
			});

			console.log("✅ Added Dependencies node to orbit");
			console.log("═══════════════════════════════════════════");

			return true;
		} catch (error) {
			console.error("❌ Error linking chain to orbit:", error);
			throw error;
		}
	};

	/**
	 * Create the full workflow: Chain → Orbit
	 * This is the main entry point for creating and linking everything
	 */
	const createAndLinkGitCloneWorkflow = async (
		config: GitCloneConfig,
		handlers: GitCloneChainHandlers & {
			addOrbitItem: (nodeId: string, data: any) => void;
		},
		basePosition?: { x: number; y: number },
		projectNodeId?: string
	) => {
		// Create the chain
		const chainResult = await createGitCloneChain(config, handlers, basePosition);

		// Link to orbit if project node ID provided
		if (projectNodeId && chainResult.nodes.length === 3) {
			await linkChainToProjectOrbit(
				{
					repository: chainResult.nodes[0].id,
					requirements: chainResult.nodes[1].id,
					dependencies: chainResult.nodes[2].id
				},
				projectNodeId,
				handlers
			);
		}

		return chainResult;
	};

	/**
	 * Clear the chain state
	 */
	const clearChain = () => {
		chainNodes.value = [];
		chainEdges.value = [];
	};

	return {
		// State
		chainNodes,
		chainEdges,

		// Methods
		createGitCloneChain,
		linkChainToProjectOrbit,
		createAndLinkGitCloneWorkflow,
		clearChain
	};
}

