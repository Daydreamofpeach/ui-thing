import { ref, computed } from "vue";
import type { NodeConnection } from "~/types/api-node-types";

export interface LayoutOptions {
	type: 'hierarchical' | 'circular' | 'grid' | 'force-directed' | 'custom';
	spacing: {
		horizontal: number;
		vertical: number;
	};
	padding: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
	flowDirection: 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';
	grouping: boolean;
	centerNodes: boolean;
}

export interface NodePosition {
	id: string;
	x: number;
	y: number;
	width?: number;
	height?: number;
}

export const useFlowLayout = () => {
	// Layout options
	const layoutOptions = ref<LayoutOptions>({
		type: 'hierarchical',
		spacing: {
			horizontal: 300,
			vertical: 200
		},
		padding: {
			top: 50,
			right: 50,
			bottom: 50,
			left: 50
		},
		flowDirection: 'left-to-right',
		grouping: true,
		centerNodes: true
	});

	// Layout algorithms
	const applyHierarchicalLayout = (nodes: any[], connections: NodeConnection[]): NodePosition[] => {
		const positions: NodePosition[] = [];
		const nodeMap = new Map<string, any>();
		const levels = new Map<number, string[]>();
		const visited = new Set<string>();

		// Create node map
		nodes.forEach(node => {
			nodeMap.set(node.id, node);
		});

		// Find root nodes (nodes with no incoming connections)
		const rootNodes = nodes.filter(node => 
			!connections.some(conn => conn.targetNodeId === node.id)
		);

		// Assign levels using BFS
		const queue: { nodeId: string; level: number }[] = [];
		rootNodes.forEach(node => {
			queue.push({ nodeId: node.id, level: 0 });
		});

		while (queue.length > 0) {
			const { nodeId, level } = queue.shift()!;
			if (visited.has(nodeId)) continue;
			
			visited.add(nodeId);
			if (!levels.has(level)) {
				levels.set(level, []);
			}
			levels.get(level)!.push(nodeId);

			// Add children to queue
			connections
				.filter(conn => conn.sourceNodeId === nodeId)
				.forEach(conn => {
					if (!visited.has(conn.targetNodeId)) {
						queue.push({ nodeId: conn.targetNodeId, level: level + 1 });
					}
				});
		}

		// Position nodes within each level based on flow direction
		levels.forEach((levelNodes, level) => {
			const levelWidth = levelNodes.length * layoutOptions.value.spacing.horizontal;
			const levelHeight = levelNodes.length * layoutOptions.value.spacing.vertical;
			
			levelNodes.forEach((nodeId, index) => {
				let x, y;
				
				switch (layoutOptions.value.flowDirection) {
					case 'left-to-right':
						x = layoutOptions.value.padding.left + (level * layoutOptions.value.spacing.horizontal);
						y = layoutOptions.value.padding.top + (index * layoutOptions.value.spacing.vertical);
						break;
					case 'right-to-left':
						x = layoutOptions.value.padding.left + ((levels.size - 1 - level) * layoutOptions.value.spacing.horizontal);
						y = layoutOptions.value.padding.top + (index * layoutOptions.value.spacing.vertical);
						break;
					case 'top-to-bottom':
						x = layoutOptions.value.padding.left + (index * layoutOptions.value.spacing.horizontal);
						y = layoutOptions.value.padding.top + (level * layoutOptions.value.spacing.vertical);
						break;
					case 'bottom-to-top':
						x = layoutOptions.value.padding.left + (index * layoutOptions.value.spacing.horizontal);
						y = layoutOptions.value.padding.top + ((levels.size - 1 - level) * layoutOptions.value.spacing.vertical);
						break;
					default:
						x = layoutOptions.value.padding.left + (level * layoutOptions.value.spacing.horizontal);
						y = layoutOptions.value.padding.top + (index * layoutOptions.value.spacing.vertical);
				}
				
				positions.push({
					id: nodeId,
					x,
					y
				});
			});
		});

		return positions;
	};

	const applyCircularLayout = (nodes: any[], connections: NodeConnection[]): NodePosition[] => {
		const positions: NodePosition[] = [];
		const centerX = 500;
		const centerY = 300;
		const radius = Math.max(200, nodes.length * 50);

		nodes.forEach((node, index) => {
			let angle = (2 * Math.PI * index) / nodes.length;
			
			// Adjust starting angle based on flow direction
			switch (layoutOptions.value.flowDirection) {
				case 'left-to-right':
					angle -= Math.PI / 2; // Start from top
					break;
				case 'right-to-left':
					angle += Math.PI / 2; // Start from bottom
					break;
				case 'top-to-bottom':
					angle -= Math.PI; // Start from left
					break;
				case 'bottom-to-top':
					angle = 0; // Start from right
					break;
			}
			
			const x = centerX + radius * Math.cos(angle);
			const y = centerY + radius * Math.sin(angle);
			
			positions.push({
				id: node.id,
				x,
				y
			});
		});

		return positions;
	};

	const applyGridLayout = (nodes: any[], connections: NodeConnection[]): NodePosition[] => {
		const positions: NodePosition[] = [];
		const cols = Math.ceil(Math.sqrt(nodes.length));
		const rows = Math.ceil(nodes.length / cols);

		nodes.forEach((node, index) => {
			const row = Math.floor(index / cols);
			const col = index % cols;
			
			let x, y;
			
			switch (layoutOptions.value.flowDirection) {
				case 'left-to-right':
					x = layoutOptions.value.padding.left + (col * layoutOptions.value.spacing.horizontal);
					y = layoutOptions.value.padding.top + (row * layoutOptions.value.spacing.vertical);
					break;
				case 'right-to-left':
					x = layoutOptions.value.padding.left + ((cols - 1 - col) * layoutOptions.value.spacing.horizontal);
					y = layoutOptions.value.padding.top + (row * layoutOptions.value.spacing.vertical);
					break;
				case 'top-to-bottom':
					x = layoutOptions.value.padding.left + (row * layoutOptions.value.spacing.horizontal);
					y = layoutOptions.value.padding.top + (col * layoutOptions.value.spacing.vertical);
					break;
				case 'bottom-to-top':
					x = layoutOptions.value.padding.left + (row * layoutOptions.value.spacing.horizontal);
					y = layoutOptions.value.padding.top + ((rows - 1 - col) * layoutOptions.value.spacing.vertical);
					break;
				default:
					x = layoutOptions.value.padding.left + (col * layoutOptions.value.spacing.horizontal);
					y = layoutOptions.value.padding.top + (row * layoutOptions.value.spacing.vertical);
			}
			
			positions.push({
				id: node.id,
				x,
				y
			});
		});

		return positions;
	};

	const applyForceDirectedLayout = (nodes: any[], connections: NodeConnection[]): NodePosition[] => {
		const positions: NodePosition[] = [];
		const nodeMap = new Map<string, { x: number; y: number; vx: number; vy: number }>();
		
		// Initialize positions based on flow direction
		nodes.forEach((node, index) => {
			let x, y;
			const baseX = 400;
			const baseY = 300;
			const spread = 100; // Reduced spread for more compact initial layout
			
			switch (layoutOptions.value.flowDirection) {
				case 'left-to-right':
					x = baseX + (index * 30) + (Math.random() - 0.5) * spread;
					y = baseY + (Math.random() - 0.5) * spread;
					break;
				case 'right-to-left':
					x = baseX - (index * 30) + (Math.random() - 0.5) * spread;
					y = baseY + (Math.random() - 0.5) * spread;
					break;
				case 'top-to-bottom':
					x = baseX + (Math.random() - 0.5) * spread;
					y = baseY + (index * 30) + (Math.random() - 0.5) * spread;
					break;
				case 'bottom-to-top':
					x = baseX + (Math.random() - 0.5) * spread;
					y = baseY - (index * 30) + (Math.random() - 0.5) * spread;
					break;
				default:
					x = baseX + (Math.random() - 0.5) * spread;
					y = baseY + (Math.random() - 0.5) * spread;
			}
			
			nodeMap.set(node.id, {
				x,
				y,
				vx: 0,
				vy: 0
			});
		});

		// Run force simulation
		const iterations = 100;
		const k = 150; // Reduced spring constant for tighter layout
		const c = 0.1; // Damping
		const flowBias = 0.05; // Reduced bias for more natural movement

		for (let i = 0; i < iterations; i++) {
			// Apply spring forces
			connections.forEach(conn => {
				const source = nodeMap.get(conn.sourceNodeId);
				const target = nodeMap.get(conn.targetNodeId);
				
				if (source && target) {
					const dx = target.x - source.x;
					const dy = target.y - source.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					const force = (distance - layoutOptions.value.spacing.horizontal / 4) * k;
					
					if (distance > 0) {
						const fx = (dx / distance) * force;
						const fy = (dy / distance) * force;
						
						source.vx += fx;
						source.vy += fy;
						target.vx -= fx;
						target.vy -= fy;
					}
				}
			});

			// Apply flow direction bias
			nodeMap.forEach((pos, nodeId) => {
				switch (layoutOptions.value.flowDirection) {
					case 'left-to-right':
						pos.vx += flowBias;
						break;
					case 'right-to-left':
						pos.vx -= flowBias;
						break;
					case 'top-to-bottom':
						pos.vy += flowBias;
						break;
					case 'bottom-to-top':
						pos.vy -= flowBias;
						break;
				}
			});

			// Apply repulsion forces
			nodes.forEach(node1 => {
				nodes.forEach(node2 => {
					if (node1.id !== node2.id) {
						const pos1 = nodeMap.get(node1.id);
						const pos2 = nodeMap.get(node2.id);
						
						if (pos1 && pos2) {
							const dx = pos2.x - pos1.x;
							const dy = pos2.y - pos1.y;
							const distance = Math.sqrt(dx * dx + dy * dy);
							const force = (k * k) / (distance * 2);
							
							if (distance > 0) {
								const fx = (dx / distance) * force;
								const fy = (dy / distance) * force;
								
								pos1.vx -= fx;
								pos1.vy -= fy;
								pos2.vx += fx;
								pos2.vy += fy;
							}
						}
					}
				});
			});

			// Update positions
			nodeMap.forEach(pos => {
				pos.vx *= c;
				pos.vy *= c;
				pos.x += pos.vx;
				pos.y += pos.vy;
			});
		}

		// Convert to positions array
		nodeMap.forEach((pos, nodeId) => {
			positions.push({
				id: nodeId,
				x: pos.x,
				y: pos.y
			});
		});

		return positions;
	};

	// Main layout function
	const applyLayout = (nodes: any[], connections: NodeConnection[]): NodePosition[] => {
		if (nodes.length === 0) return [];

		let positions: NodePosition[] = [];

		switch (layoutOptions.value.type) {
			case 'hierarchical':
				positions = applyHierarchicalLayout(nodes, connections);
				break;
			case 'circular':
				positions = applyCircularLayout(nodes, connections);
				break;
			case 'grid':
				positions = applyGridLayout(nodes, connections);
				break;
			case 'force-directed':
				positions = applyForceDirectedLayout(nodes, connections);
				break;
			default:
				positions = applyHierarchicalLayout(nodes, connections);
		}

		// Center the layout if requested
		if (layoutOptions.value.centerNodes) {
			const bounds = getLayoutBounds(positions);
			const centerX = 400;
			const centerY = 300;
			const offsetX = centerX - (bounds.minX + bounds.width / 2);
			const offsetY = centerY - (bounds.minY + bounds.height / 2);

			positions.forEach(pos => {
				pos.x += offsetX;
				pos.y += offsetY;
			});
		}

		return positions;
	};

	// Helper function to get layout bounds
	const getLayoutBounds = (positions: NodePosition[]) => {
		if (positions.length === 0) {
			return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
		}

		const xs = positions.map(p => p.x);
		const ys = positions.map(p => p.y);
		
		const minX = Math.min(...xs);
		const maxX = Math.max(...xs);
		const minY = Math.min(...ys);
		const maxY = Math.max(...ys);

		return {
			minX,
			minY,
			maxX,
			maxY,
			width: maxX - minX,
			height: maxY - minY
		};
	};

	// Update layout options
	const updateLayoutOptions = (options: Partial<LayoutOptions>) => {
		layoutOptions.value = { ...layoutOptions.value, ...options };
	};

	// Reset to default layout
	const resetLayout = () => {
		layoutOptions.value = {
			type: 'hierarchical',
			spacing: {
				horizontal: 300,
				vertical: 200
			},
			padding: {
				top: 50,
				right: 50,
				bottom: 50,
				left: 50
			},
			flowDirection: 'left-to-right',
			grouping: true,
			centerNodes: true
		};
	};

	// Preset layouts
	const applyPresetLayout = (preset: 'compact' | 'spacious' | 'wide' | 'tall') => {
		const presets = {
			compact: {
				spacing: { horizontal: 200, vertical: 150 },
				padding: { top: 30, right: 30, bottom: 30, left: 30 }
			},
			spacious: {
				spacing: { horizontal: 400, vertical: 250 },
				padding: { top: 80, right: 80, bottom: 80, left: 80 }
			},
			wide: {
				spacing: { horizontal: 500, vertical: 150 },
				padding: { top: 50, right: 50, bottom: 50, left: 50 }
			},
			tall: {
				spacing: { horizontal: 200, vertical: 300 },
				padding: { top: 50, right: 50, bottom: 50, left: 50 }
			}
		};

		updateLayoutOptions(presets[preset]);
	};

	return {
		layoutOptions: readonly(layoutOptions),
		applyLayout,
		updateLayoutOptions,
		resetLayout,
		applyPresetLayout,
		getLayoutBounds
	};
};
