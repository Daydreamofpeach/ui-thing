import { ref, computed, watch } from 'vue';
import { useVueFlow } from '@vue-flow/core';

/**
 * Orbit Item Configuration
 */
export interface OrbitItem {
	id: string;
	icon?: string;
	label: string;
	color?: string;
	disabled?: boolean;
	tooltip?: string;
	badgeGradient?: [string, string];
	haloColor?: string;
	iconColor?: string;
	initial?: string;
	payload?: Record<string, any>;
}

/**
 * Orbit Node Metadata
 */
export interface OrbitNodeMeta {
	id: string;
	type: string;
	label: string;
	data: Record<string, any>;
}

/**
 * Orbit Node State for Tracking
 */
export type OrbitNodeState = {
	hidden?: boolean;
	collapsed?: boolean;
};

/**
 * Composable for managing orbit node operations
 * Handles: visibility, active state, initialization, and node operations
 */
export function useOrbitNodeManager(centerNodeId: string, setNodesCallback?: (fn: (nodes: any[]) => any[]) => void) {
	const vueFlow = useVueFlow();
	
	// State
	const orbitItems = ref<OrbitItem[]>([]);
	const orbitNodeMeta = ref<Record<string, OrbitNodeMeta>>({});
	const activeOrbitNodeId = ref<string | null>(null);
	const orbitNodesExpanded = ref(false);
	const orbitItemsInitialized = ref(false);
	const previousNodeStates = ref<Record<string, OrbitNodeState>>({});
	const collapseTimers: number[] = [];

	// Computed
	const orbitCenterIcon = computed(() => 
		orbitNodesExpanded.value ? 'i-lucide-minimize-2' : 'i-lucide-maximize-2'
	);
	
	const orbitToggleLabel = computed(() => 
		orbitNodesExpanded.value ? 'Hide all orbit nodes' : 'Show all orbit nodes'
	);

	/**
	 * Restore orbit nodes to their original state
	 */
	const restoreOrbitNodes = (ids?: string[], removeFromOrbit = true) => {
		const targetIds = ids ?? Object.keys(previousNodeStates.value);
		if (!targetIds.length || !setNodesCallback) {
			return;
		}

		const snapshot = { ...previousNodeStates.value };
		const targetSet = new Set(targetIds);

		setNodesCallback((nodes: any[]) =>
			nodes.map((node: any) => {
				if (!targetSet.has(node.id)) {
					return node;
				}

				const previous = snapshot[node.id] || {};
				const newData = { ...(node.data || {}) };

				if (typeof previous.collapsed === 'boolean') {
					newData.collapsed = previous.collapsed;
				} else {
					delete newData.collapsed;
				}

				delete (newData as any).orbitHidden;

				return {
					...node,
					hidden: previous.hidden ?? false,
					data: newData
				};
			})
		);

		targetIds.forEach((id) => {
			delete snapshot[id];
		});

		previousNodeStates.value = snapshot;

		if (removeFromOrbit) {
			orbitItems.value = orbitItems.value.filter((item) => !targetSet.has(item.id));
			const newMeta = { ...orbitNodeMeta.value };
			targetIds.forEach((id) => {
				delete newMeta[id];
			});
			orbitNodeMeta.value = newMeta;
		}

		if (!orbitItems.value.length) {
			activeOrbitNodeId.value = null;
		} else if (!orbitItems.value.some((item) => item.id === activeOrbitNodeId.value)) {
			activeOrbitNodeId.value = orbitItems.value[0].id;
		}

		if (!removeFromOrbit) {
			orbitNodesExpanded.value = true;
		} else if (!orbitItems.value.length) {
			orbitNodesExpanded.value = false;
		}
	};

	/**
	 * Show nodes for the orbit (ensures they are unhidden and expanded)
	 */
	const showNodesForOrbit = (ids: string[]) => {
		if (!ids.length || !setNodesCallback) {
			return;
		}

		setNodesCallback((nodes: any[]) =>
			nodes.map((node: any) => {
				if (!ids.includes(node.id)) {
					return node;
				}

				const newData = { ...(node.data || {}) };
				delete (newData as any).orbitHidden;
				newData.collapsed = false;

				return {
					...node,
					hidden: false,
					data: newData
				};
			})
		);

		ids.forEach((id) => {
			vueFlow.updateNodeInternals?.(id);
		});

		orbitNodesExpanded.value = true;
	};

	/**
	 * Hide nodes for the orbit
	 */
	const hideNodesForOrbit = (ids: string[]) => {
		if (!ids.length || !setNodesCallback) {
			return;
		}

		const currentStates: Record<string, OrbitNodeState> = {};

		setNodesCallback((nodes: any[]) =>
			nodes.map((node: any) => {
				if (!ids.includes(node.id)) {
					return node;
				}

				currentStates[node.id] = {
					hidden: node.hidden,
					collapsed: node.data?.collapsed
				};

				return {
					...node,
					hidden: true,
					data: {
						...(node.data || {}),
						orbitHidden: true,
						collapsed: false
					}
				};
			})
		);

		previousNodeStates.value = {
			...previousNodeStates.value,
			...currentStates
		};
		orbitNodesExpanded.value = false;
	};

	/**
	 * Open a node from the orbit
	 */
	const openNodeFromOrbit = (id: string) => {
		// First, try to restore from saved state, but ensure the node is shown
		restoreOrbitNodes([id], false);
		
		// Explicitly ensure the node is not hidden
		if (setNodesCallback) {
			setNodesCallback((nodes: any[]) =>
				nodes.map((node: any) => {
					if (node.id !== id) {
						return node;
					}
					
					const newData = { ...(node.data || {}) };
					delete (newData as any).orbitHidden;
					
					return {
						...node,
						hidden: false,
						data: newData
					};
				})
			);
		}
		
		activeOrbitNodeId.value = id;
		orbitNodesExpanded.value = true;
		vueFlow.updateNodeInternals?.(id);
		vueFlow.fitView?.({
			nodes: [id],
			duration: 600,
			padding: 0.3
		});
	};

	/**
	 * Close an active orbit node
	 */
	const closeOrbitNode = () => {
		if (activeOrbitNodeId.value) {
			const nodeId = activeOrbitNodeId.value;
			activeOrbitNodeId.value = null;
			
			// Hide the node and return to orbit view
			if (setNodesCallback) {
				setNodesCallback((nodes: any[]) =>
					nodes.map((node: any) => {
						if (node.id !== nodeId) {
							return node;
						}
						
						return {
							...node,
							hidden: true,
							data: {
								...(node.data || {}),
								orbitHidden: true
							}
						};
					})
				);
				
				vueFlow.updateNodeInternals?.(nodeId);
			}
		}
	};

	/**
	 * Toggle orbit nodes visibility
	 */
	const toggleOrbitNodes = () => {
		const connectedIds = orbitItems.value.map((item) => item.id);
		if (!connectedIds.length) {
			return;
		}

		if (orbitNodesExpanded.value) {
			hideNodesForOrbit(connectedIds);
			vueFlow.fitView?.({
				nodes: [centerNodeId],
				duration: 500,
				padding: 0.25
			});
		} else {
			restoreOrbitNodes(connectedIds, false);
			showNodesForOrbit(connectedIds);
			const focusNodes = [centerNodeId, ...connectedIds];
			vueFlow.fitView?.({
				nodes: focusNodes,
				duration: 600,
				padding: 0.35
			});
		}
	};

	/**
	 * Set orbit items
	 */
	const setOrbitItems = (items: OrbitItem[], metadata?: Record<string, OrbitNodeMeta>) => {
		orbitItemsInitialized.value = false;
		orbitItems.value = items;
		if (metadata) {
			orbitNodeMeta.value = metadata;
		}
	};

	/**
	 * Clear orbit state
	 */
	const clearOrbit = () => {
		orbitItems.value = [];
		orbitNodeMeta.value = {};
		activeOrbitNodeId.value = null;
		orbitNodesExpanded.value = false;
		orbitItemsInitialized.value = false;
		previousNodeStates.value = {};
	};

	/**
	 * Watcher: Initialize active orbit node on first items load
	 */
	watch(orbitItems, (items) => {
		if (!items.length) {
			activeOrbitNodeId.value = null;
			orbitItemsInitialized.value = false;
			return;
		}

		// Only auto-select on first initialization
		if (!orbitItemsInitialized.value && items.length > 0) {
			activeOrbitNodeId.value = items[0].id;
			orbitItemsInitialized.value = true;
			return;
		}

		// If activeId is no longer in the list, select the first item
		if (!items.some((item) => item.id === activeOrbitNodeId.value)) {
			activeOrbitNodeId.value = items[0].id;
		}
	});

	return {
		// State
		orbitItems,
		orbitNodeMeta,
		activeOrbitNodeId,
		orbitNodesExpanded,
		previousNodeStates,

		// Computed
		orbitCenterIcon,
		orbitToggleLabel,

		// Methods
		restoreOrbitNodes,
		hideNodesForOrbit,
		openNodeFromOrbit,
		closeOrbitNode,
		toggleOrbitNodes,
		showNodesForOrbit,
		setOrbitItems,
		clearOrbit
	};
}

