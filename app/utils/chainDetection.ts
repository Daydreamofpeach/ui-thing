/**
 * Advanced Chain Detection Utility
 * Detects linear, branching, and tree-structured automation chains
 */

export interface ChainNode {
	id: string;
	level: number; // Depth in tree (0 = root)
	isStart: boolean;
	isEnd: boolean;
	children: string[]; // IDs of nodes this connects to
	parents: string[]; // IDs of nodes that connect to this
}

export interface DetectedChain {
	id: string;
	name: string;
	type: "linear" | "branching" | "tree" | "convergent";
	nodes: ChainNode[];
	edges: string[];
	startNodes: string[]; // Can have multiple starts
	endNodes: string[]; // Can have multiple ends
	color: string;
	animationType: string;
	depth: number; // Maximum depth of tree
}

/**
 * Build a graph representation of the canvas
 */
function buildGraph(edges: any[]): Map<string, { incoming: string[], outgoing: string[] }> {
	const graph = new Map<string, { incoming: string[], outgoing: string[] }>();

	edges.forEach((edge: any) => {
		// Initialize nodes if not exists
		if (!graph.has(edge.source)) {
			graph.set(edge.source, { incoming: [], outgoing: [] });
		}
		if (!graph.has(edge.target)) {
			graph.set(edge.target, { incoming: [], outgoing: [] });
		}

		// Add connections
		graph.get(edge.source)!.outgoing.push(edge.target);
		graph.get(edge.target)!.incoming.push(edge.source);
	});

	return graph;
}

/**
 * Find all start nodes (nodes with no incoming connections or specified as start)
 */
function findStartNodes(graph: Map<string, { incoming: string[], outgoing: string[] }>): string[] {
	const startNodes: string[] = [];

	graph.forEach((connections, nodeId) => {
		if (connections.incoming.length === 0 && connections.outgoing.length > 0) {
			startNodes.push(nodeId);
		}
	});

	return startNodes;
}

/**
 * Find all end nodes (nodes with no outgoing connections)
 */
function findEndNodes(graph: Map<string, { incoming: string[], outgoing: string[] }>): string[] {
	const endNodes: string[] = [];

	graph.forEach((connections, nodeId) => {
		if (connections.outgoing.length === 0 && connections.incoming.length > 0) {
			endNodes.push(nodeId);
		}
	});

	return endNodes;
}

/**
 * Trace all paths from a start node using DFS
 */
function traceChainFromStart(
	startNodeId: string,
	graph: Map<string, { incoming: string[], outgoing: string[] }>,
	edges: any[]
): { nodes: Set<string>, edges: Set<string> } {
	const visitedNodes = new Set<string>();
	const visitedEdges = new Set<string>();

	function dfs(nodeId: string) {
		if (visitedNodes.has(nodeId)) return;
		visitedNodes.add(nodeId);

		const connections = graph.get(nodeId);
		if (!connections) return;

		connections.outgoing.forEach((targetId) => {
			// Find the edge
			const edge = edges.find((e: any) => e.source === nodeId && e.target === targetId);
			if (edge) {
				visitedEdges.add(edge.id);
				dfs(targetId);
			}
		});
	}

	dfs(startNodeId);
	return { nodes: visitedNodes, edges: visitedEdges };
}

/**
 * Calculate node levels (depth in tree)
 */
function calculateNodeLevels(
	startNodes: string[],
	graph: Map<string, { incoming: string[], outgoing: string[] }>
): Map<string, number> {
	const levels = new Map<string, number>();

	function bfs(startId: string) {
		const queue: Array<{ nodeId: string, level: number }> = [{ nodeId: startId, level: 0 }];
		const visited = new Set<string>();

		while (queue.length > 0) {
			const { nodeId, level } = queue.shift()!;
			if (visited.has(nodeId)) continue;
			visited.add(nodeId);

			// Set level (use minimum if already set)
			const currentLevel = levels.get(nodeId);
			if (currentLevel === undefined || level < currentLevel) {
				levels.set(nodeId, level);
			}

			// Add children to queue
			const connections = graph.get(nodeId);
			if (connections) {
				connections.outgoing.forEach((childId) => {
					if (!visited.has(childId)) {
						queue.push({ nodeId: childId, level: level + 1 });
					}
				});
			}
		}
	}

	startNodes.forEach((startId) => bfs(startId));
	return levels;
}

/**
 * Determine chain type based on structure
 */
function determineChainType(
	startNodes: string[],
	endNodes: string[],
	graph: Map<string, { incoming: string[], outgoing: string[] }>
): "linear" | "branching" | "tree" | "convergent" {
	if (startNodes.length === 1 && endNodes.length === 1) {
		// Check if any node has multiple outgoing connections
		let hasBranching = false;
		graph.forEach((connections) => {
			if (connections.outgoing.length > 1) {
				hasBranching = true;
			}
		});
		return hasBranching ? "branching" : "linear";
	}

	if (startNodes.length === 1 && endNodes.length > 1) {
		return "tree"; // One root, multiple leaves
	}

	if (startNodes.length > 1 && endNodes.length === 1) {
		return "convergent"; // Multiple starts, one end
	}

	return "branching"; // Complex structure
}

/**
 * Generate a smart name for the chain based on nodes
 */
function generateChainName(nodeIds: string[], nodes: any[]): string {
	const firstNode = nodes.find((n: any) => n.id === nodeIds[0]);
	const lastNode = nodes.find((n: any) => n.id === nodeIds[nodeIds.length - 1]);

	const firstName = firstNode?.data?.label || firstNode?.type || "Start";
	const lastName = lastNode?.data?.label || lastNode?.type || "End";

	// Check for known chain patterns
	const nodeTypes = nodeIds.map((id) => {
		const node = nodes.find((n: any) => n.id === id);
		return node?.type;
	});

	if (nodeTypes.includes("templateNode") && nodeTypes.includes("formsPanelNode")) {
		return "Form Chain";
	}
	if (nodeTypes.includes("templateNode") && nodeTypes.includes("hookNode")) {
		return "Hook Chain";
	}
	if (nodeTypes.includes("templateNode") && nodeTypes.includes("transportNode")) {
		return "Template Chain";
	}

	return `${firstName} → ${lastName}`;
}

/**
 * Main function to detect all chains in the canvas
 */
export function detectAllChains(nodes: any[], edges: any[]): DetectedChain[] {
	if (edges.length === 0) return [];

	const graph = buildGraph(edges);
	const startNodes = findStartNodes(graph);
	const detectedChains: DetectedChain[] = [];

	console.log("🔍 Detecting chains...");
	console.log("  Start nodes:", startNodes);
	console.log("  Total edges:", edges.length);

	// For each start node, trace the complete chain
	const processedStarts = new Set<string>();

	startNodes.forEach((startNodeId) => {
		if (processedStarts.has(startNodeId)) return;

		const { nodes: chainNodeIds, edges: chainEdgeIds } = traceChainFromStart(startNodeId, graph, edges);
		
		if (chainEdgeIds.size === 0) return;

		processedStarts.add(startNodeId);

		// Find all end nodes in this chain
		const chainEndNodes = findEndNodes(
			new Map(Array.from(chainNodeIds).map((id) => [id, graph.get(id)!]))
		);

		// Calculate levels
		const levels = calculateNodeLevels([startNodeId], graph);
		const maxDepth = Math.max(...Array.from(levels.values()), 0);

		// Build ChainNode structure
		const chainNodesStructured: ChainNode[] = Array.from(chainNodeIds).map((nodeId) => {
			const connections = graph.get(nodeId)!;
			return {
				id: nodeId,
				level: levels.get(nodeId) || 0,
				isStart: connections.incoming.length === 0,
				isEnd: connections.outgoing.length === 0,
				children: connections.outgoing,
				parents: connections.incoming
			};
		});

		// Determine chain type
		const chainType = determineChainType([startNodeId], chainEndNodes, graph);

		// Get styling from first edge
		const firstEdge = edges.find((e: any) => chainEdgeIds.has(e.id));
		const color = firstEdge?.style?.stroke || "#8b5cf6";
		const animationType = firstEdge?.animationType || "flow";

		// Generate name
		const name = generateChainName(Array.from(chainNodeIds), nodes);

		detectedChains.push({
			id: `chain-${startNodeId}-${Date.now()}`,
			name,
			type: chainType,
			nodes: chainNodesStructured,
			edges: Array.from(chainEdgeIds),
			startNodes: [startNodeId],
			endNodes: chainEndNodes,
			color,
			animationType,
			depth: maxDepth
		});
	});

	console.log(`✅ Detected ${detectedChains.length} chain(s)`);
	detectedChains.forEach((chain) => {
		console.log(`  - ${chain.name}: ${chain.type}, ${chain.nodes.length} nodes, ${chain.edges.length} edges, depth: ${chain.depth}`);
	});

	return detectedChains;
}

/**
 * Get animation sequence for a branching chain
 * Returns array of parallel animation groups
 */
export function getAnimationSequence(chain: DetectedChain): string[][] {
	const sequence: string[][] = [];
	
	// Group nodes by level for parallel animation
	const levelGroups = new Map<number, string[]>();
	
	chain.nodes.forEach((node) => {
		const level = node.level;
		if (!levelGroups.has(level)) {
			levelGroups.set(level, []);
		}
		levelGroups.get(level)!.push(node.id);
	});

	// Sort levels and create sequence
	const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);
	sortedLevels.forEach((level) => {
		sequence.push(levelGroups.get(level)!);
	});

	return sequence;
}

/**
 * Get edges to animate for a specific level transition
 */
export function getEdgesForLevel(
	fromLevel: number,
	toLevel: number,
	chain: DetectedChain,
	allEdges: any[]
): string[] {
	const fromNodes = chain.nodes.filter((n) => n.level === fromLevel).map((n) => n.id);
	const toNodes = chain.nodes.filter((n) => n.level === toLevel).map((n) => n.id);

	const edgeIds: string[] = [];
	
	allEdges.forEach((edge: any) => {
		if (fromNodes.includes(edge.source) && toNodes.includes(edge.target)) {
			edgeIds.push(edge.id);
		}
	});

	return edgeIds;
}

/**
 * Merge multiple chains into a unified flow
 */
export function mergeChains(chains: DetectedChain[]): DetectedChain {
	const allNodes = new Map<string, ChainNode>();
	const allEdges = new Set<string>();
	const allStartNodes = new Set<string>();
	const allEndNodes = new Set<string>();

	chains.forEach((chain) => {
		chain.nodes.forEach((node) => {
			allNodes.set(node.id, node);
		});
		chain.edges.forEach((edgeId) => {
			allEdges.add(edgeId);
		});
		chain.startNodes.forEach((id) => allStartNodes.add(id));
		chain.endNodes.forEach((id) => allEndNodes.add(id));
	});

	const maxDepth = Math.max(...Array.from(allNodes.values()).map((n) => n.level), 0);

	return {
		id: `merged-chain-${Date.now()}`,
		name: "Unified Flow",
		type: allStartNodes.size === 1 && allEndNodes.size > 1 ? "tree" : "branching",
		nodes: Array.from(allNodes.values()),
		edges: Array.from(allEdges),
		startNodes: Array.from(allStartNodes),
		endNodes: Array.from(allEndNodes),
		color: chains[0]?.color || "#8b5cf6",
		animationType: chains[0]?.animationType || "flow",
		depth: maxDepth
	};
}

