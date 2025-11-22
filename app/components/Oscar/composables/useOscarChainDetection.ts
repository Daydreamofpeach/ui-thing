import { computed } from "vue";
import { useSharedOscarCanvasContext } from "./useOscarCanvasContext";

/**
 * Known chain patterns in the canvas system
 */
export interface ChainPattern {
	id: string
	name: string
	description: string
	icon: string
	nodeSequence: string[] // Expected node types in order
	minNodes: number
	category: "automation" | "workflow" | "integration"
}

/**
 * Detected chain instance
 */
export interface DetectedChain {
	pattern: ChainPattern
	nodes: any[]
	connections: any[]
	startNode: any
	endNode: any
	completeness: number // 0-100%
}

/**
 * Composable for detecting known chain patterns in the canvas
 */
export function useOscarChainDetection() {
	const { canvasNodes, canvasEdges } = useSharedOscarCanvasContext();

	// Known chain patterns
	const knownChains: ChainPattern[] = [
		{
			id: "form-automation-chain",
			name: "Form Automation Chain",
			description: "Complete form creation, preview, and submission workflow with hooks and transports",
			icon: "i-lucide-file-text",
			nodeSequence: [
				"formAutomationTemplateNode", // Or templateConfiguredNode
				"browserNode", // Form preview
				"hookNode", // Form submission handler
				"transportNode", // Data transport/delivery
				"transportTemplateNode" // Template for transport config
			],
			minNodes: 2,
			category: "automation"
		},
		{
			id: "template-setup-chain",
			name: "Template Setup Chain",
			description: "Full template creation workflow from project selection to saving",
			icon: "i-lucide-workflow",
			nodeSequence: [
				"intentSelection", // User intent selection
				"projectExplorer", // Project folder browsing
				"projectScriptRunnerNode", // Script detection and running
				"bFolderSetupNode", // B folder configuration
				"fileCreatorNode", // File creation
				"saveTemplateNode" // Save template
			],
			minNodes: 3,
			category: "workflow"
		},
		{
			id: "template-configured-chain",
			name: "Template Configured Chain",
			description: "Full template configuration workflow from project selection to forms preview",
			icon: "i-lucide-layout-template",
			nodeSequence: [
				"intentSelection", // User selects intent
				"projectExplorer", // Browse project folder
				"projectScriptRunnerNode", // Run dev server
				"templateConfiguredNode", // Configured template with all setup
				"formsPanelNode", // Form configuration
				"browserNode" // Form preview
			],
			minNodes: 2,
			category: "workflow"
		},
		{
			id: "hook-transport-chain",
			name: "Hook & Transport Chain",
			description: "Event handling and data transport workflow",
			icon: "i-lucide-webhook",
			nodeSequence: [
				"hookNode",
				"transportNode"
			],
			minNodes: 2,
			category: "integration"
		},
		{
			id: "webview-chain",
			name: "Webview Preview Chain",
			description: "Web content rendering and viewport management",
			icon: "i-lucide-monitor",
			nodeSequence: [
				"browserNode",
				"webviewNode",
				"viewportNode"
			],
			minNodes: 2,
			category: "workflow"
		},
		{
			id: "project-analysis-chain",
			name: "Project Analysis Chain",
			description: "Analyze existing project structure and configuration",
			icon: "i-lucide-search",
			nodeSequence: [
				"projectExplorer",
				"projectScriptRunnerNode",
				"bFolderSetupNode"
			],
			minNodes: 2,
			category: "automation"
		}
	];

	/**
	 * Build a sequence starting from a specific node
	 */
	const buildSequenceFromNode = (
		startNode: any,
		pattern: ChainPattern,
		patternNodes: Map<string, any[]>,
		edges: any[]
	): { nodes: any[], connections: any[] } => {
		const sequence: any[] = [startNode];
		const connections: any[] = [];
		let currentNode = startNode;
		let patternIndex = 0;

		// Follow the pattern sequence
		while (patternIndex < pattern.nodeSequence.length - 1) {
			patternIndex++;
			const nextNodeType = pattern.nodeSequence[patternIndex] || "";

			// Find connection from current node to a node of the next type
			const outgoingEdges = edges.filter((e: any) => e.source === currentNode.id);

			let found = false;
			for (const edge of outgoingEdges) {
				const targetNode = canvasNodes.value.find((n: any) => n.id === edge.target);

				if (targetNode && targetNode.type === nextNodeType) {
					sequence.push(targetNode);
					connections.push(edge);
					currentNode = targetNode;
					found = true;
					break;
				}
			}

			if (!found) {
				// Pattern broken, stop here
				break;
			}
		}

		return { nodes: sequence, connections };
	};

	/**
	 * Build connected sequences following the pattern
	 */
	const buildConnectedSequences = (
		pattern: ChainPattern,
		patternNodes: Map<string, any[]>,
		edges: any[]
	): Array<{ nodes: any[], connections: any[] }> => {
		const sequences: Array<{ nodes: any[], connections: any[] }> = [];

		// Start from the first node type in the pattern
		const firstNodeType = pattern.nodeSequence[0] || "";
		const startNodes = patternNodes.get(firstNodeType) || [];

		for (const startNode of startNodes) {
			const sequence = buildSequenceFromNode(startNode, pattern, patternNodes, edges);
			if (sequence.nodes.length >= pattern.minNodes) {
				sequences.push(sequence);
			}
		}

		return sequences;
	};

	/**
	 * Find instances of a specific chain pattern
	 */
	const findChainInstances = (pattern: ChainPattern, nodes: any[], edges: any[]): DetectedChain[] => {
		const instances: DetectedChain[] = [];

		// Find nodes that match the pattern's node types
		const patternNodes = new Map<string, any[]>();

		for (const nodeType of pattern.nodeSequence) {
			const matchingNodes = nodes.filter((n: any) => n.type === nodeType);
			patternNodes.set(nodeType, matchingNodes);
		}

		// Check if we have the minimum required nodes
		const totalMatchingNodes = Array.from(patternNodes.values()).reduce((sum, arr) => sum + arr.length, 0);
		if (totalMatchingNodes < pattern.minNodes) {
			return instances;
		}

		// Try to build connected sequences
		const sequences = buildConnectedSequences(pattern, patternNodes, edges);

		for (const sequence of sequences) {
			if (sequence.nodes.length >= pattern.minNodes) {
				const completeness = (sequence.nodes.length / pattern.nodeSequence.length) * 100;

				instances.push({
					pattern,
					nodes: sequence.nodes,
					connections: sequence.connections,
					startNode: sequence.nodes[0],
					endNode: sequence.nodes[sequence.nodes.length - 1],
					completeness
				});
			}
		}

		return instances;
	};

	/**
	 * Detect all chains present in the current canvas
	 */
	const detectChains = computed((): DetectedChain[] => {
		const detected: DetectedChain[] = [];
		const nodes = canvasNodes.value;
		const edges = canvasEdges.value;

		console.log("🔍 OscarChainDetection: Starting chain detection");
		console.log("   Canvas nodes:", nodes.length);
		console.log("   Canvas edges:", edges.length);
		console.log("   Node types:", nodes.map((n: any) => n.type));

		if (nodes.length === 0) {
			console.log("⚠️ No nodes on canvas, cannot detect chains");
			return [];
		}

		// For each known pattern, try to find instances
		for (const pattern of knownChains) {
			const instances = findChainInstances(pattern, nodes, edges);
			if (instances.length > 0) {
				console.log(`✅ Found ${instances.length} instance(s) of ${pattern.name}`);
			}
			detected.push(...instances);
		}

		console.log(`🎯 Total chains detected: ${detected.length}`);
		return detected;
	});

	/**
	 * Get the most complete chain (highest completeness score)
	 */
	const primaryChain = computed(() => {
		const chains = detectChains.value;
		if (chains.length === 0) return null;

		// Sort by completeness, then by number of nodes
		return chains.sort((a, b) => {
			if (b.completeness !== a.completeness) {
				return b.completeness - a.completeness;
			}
			return b.nodes.length - a.nodes.length;
		})[0];
	});

	/**
	 * Check if a specific chain type is present
	 */
	const hasChain = (chainId: string): boolean => {
		return detectChains.value.some((chain) => chain.pattern.id === chainId);
	};

	/**
	 * Get all chains of a specific type
	 */
	const getChainsByType = (chainId: string): DetectedChain[] => {
		return detectChains.value.filter((chain) => chain.pattern.id === chainId);
	};

	return {
		knownChains,
		detectChains,
		primaryChain,
		hasChain,
		getChainsByType
	};
}

