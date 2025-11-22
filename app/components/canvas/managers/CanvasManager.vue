<template>
	<div class="canvas-manager">
		<slot
			:nodes="allNodes"
			:edges="allEdges"
			:node-types="nodeTypesObject"
			:add-node="addNode"
			:delete-node="deleteNode"
			:clear-canvas="clearCanvas"
			:get-connections="getConnectionsForNodeWithType"
			:connection-handlers="connectionHandlers"
		/>
	</div>
</template>

<script lang="ts" setup>
	import { computed, ref } from "vue";
	import { useNodeConnections } from "../composables/useNodeConnections";
	import { useNodeRegistry } from "../composables/useNodeRegistry";
	import type { ConnectionHandle } from "../composables/useNodeConnections";

	// Import all node components
	import DecisionNode from "~/components/nodes/flowchart/DecisionNode.vue";
	import ProcessNode from "~/components/nodes/flowchart/ProcessNode.vue";
	import HookNode from "~/components/nodes/hook/HookNode.vue";
	import TextNode from "~/components/nodes/text/TextNode.vue";
	import TemplateNode from "~/components/nodes/template/TemplateNode.vue";
	import TransportNode from "~/components/nodes/transport/TransportNode.vue";
	import ConnectionLinkNode from "~/components/nodes/connection/ConnectionLinkNode.vue";
	import BuilditCLINode from "~/components/canvas/nodes/BuilditCLINode.vue";

	interface Props {
		canvasType?: string;
		initialNodes?: any[];
		initialEdges?: any[];
	}

	const props = withDefaults(defineProps<Props>(), {
		canvasType: "default",
		initialNodes: () => [],
		initialEdges: () => []
	});

	const emit = defineEmits<{
		nodeConfigure: [nodeId: string];
		nodeDelete: [nodeId: string];
		nodeCreated: [node: any];
	}>();

	// Node registry
	const { createNode, nodeTypes } = useNodeRegistry();

	// Connection management
	const {
		edges,
		startConnection,
		endConnection,
		setHoveredHandle,
		deleteConnectionsForNode,
		getConnectionsForNodeWithType,
		createConnection,
		availableTypes
	} = useNodeConnections();

	// Node storage - using a single reactive map for all node types
	const nodeStorage = ref<Map<string, any[]>>(new Map());

	// Initialize node storage for all available node types
	nodeTypes.value.forEach((nodeType) => {
		if (!nodeStorage.value.has(nodeType.id)) {
			nodeStorage.value.set(nodeType.id, []);
		}
	});

	// Computed properties
	const allNodes = computed(() => {
		const nodes: any[] = [];
		nodeStorage.value.forEach(nodeArray => {
			nodes.push(...nodeArray);
		});
		return nodes;
	});

	const allEdges = computed(() => edges.value);

	// Node component mapping
	const nodeComponentMap: Record<string, any> = {
		// Text nodes
		text: TextNode,
		
		// Flowchart nodes
		process: ProcessNode,
		decision: DecisionNode,
		
		// Specialized nodes
		hookNode: HookNode,
		transportNode: TransportNode,
		templateNode: TemplateNode,
		connectionLinkNode: ConnectionLinkNode,
		"buildit-cli": BuilditCLINode
	};

	// Create nodeTypes object for VueFlow
	const nodeTypesObject = computed(() => {
		const types: Record<string, any> = {};
		nodeTypes.value.forEach((nodeType) => {
			const component = nodeComponentMap[nodeType.id];
			if (component) {
				types[nodeType.id] = component;
			}
		});
		return types;
	});

	// Connection handlers
	const connectionHandlers = {
		start: startConnection,
		end: endConnection,
		hover: setHoveredHandle,
		leave: () => setHoveredHandle(null),
		create: (connectionData: any) => {
			// Handle connection creation with proper parameters
			if (connectionData.start && connectionData.end) {
				createConnection(connectionData.start, connectionData.end, connectionData.type);
			}
		},
		delete: (connectionId: string) => {
			edges.value = edges.value.filter(e => e.id !== connectionId);
		},
		updateType: (connectionId: string, type: string) => {
			const edge = edges.value.find(e => e.id === connectionId);
			if (edge) {
				edge.type = type;
			}
		}
	};

	// Methods
	const addNode = (nodeType: string, position: { x: number; y: number }) => {
		console.log("CanvasManager: addNode called with:", nodeType, position);
		console.log("CanvasManager: Available node types:", Array.from(nodeStorage.value.keys()));
		const newNode = createNode(nodeType, position);
		console.log("CanvasManager: Created node:", newNode);
		if (newNode) {
			const nodeArray = nodeStorage.value.get(nodeType);
			console.log("CanvasManager: Node array for type", nodeType, ":", nodeArray);
			if (nodeArray) {
				nodeArray.push(newNode);
				emit("nodeCreated", newNode);
				console.log("CanvasManager: Node added to array, new length:", nodeArray.length);
				console.log("CanvasManager: All nodes now:", allNodes.value);
			} else {
				console.log("CanvasManager: No node array found for type:", nodeType);
			}
			return newNode;
		}
		console.log("CanvasManager: Failed to create node");
		return null;
	};

	const deleteNode = (nodeId: string) => {
		// Find and remove from appropriate array
		nodeStorage.value.forEach(nodeArray => {
			const index = nodeArray.findIndex(n => n.id === nodeId);
			if (index !== -1) {
				nodeArray.splice(index, 1);
			}
		});

		// Remove connections for this node
		deleteConnectionsForNode(nodeId);

		// Emit event
		emit("nodeDelete", nodeId);
	};

	const clearCanvas = () => {
		nodeStorage.value.forEach(nodeArray => {
			nodeArray.length = 0;
		});
		edges.value = [];
	};

	// Initialize with provided nodes
	if (props.initialNodes.length > 0) {
		props.initialNodes.forEach(node => {
			const nodeArray = nodeStorage.value.get(node.type);
			if (nodeArray) {
				nodeArray.push(node);
			}
		});
	}

	if (props.initialEdges.length > 0) {
		edges.value = [...props.initialEdges];
	}
</script>

<style scoped>
	.canvas-manager {
		width: 100%;
		height: 100%;
	}
</style>
