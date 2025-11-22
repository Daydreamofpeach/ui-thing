import type { Edge, Node } from "@vue-flow/core";
import { reactive, ref } from "vue";

interface NodeFamily {
	id: string
	parentNodeId: string
	subNodes: string[]
	connections: string[]
	position: { x: number, y: number }
}

interface SubNodeConfig {
	type: "logitConsole" | "uiComponent" | "apiResponse"
	name: string
	componentType?: string
	filterPath?: string
	position: { x: number, y: number }
}

export const useNodeFamilyManager = () => {
	const nodeFamilies = ref<Map<string, NodeFamily>>(new Map());
	const subNodes = ref<Map<string, Node>>(new Map());
	const familyConnections = ref<Map<string, Edge>>(new Map());

	// Create a new node family
	const createNodeFamily = (parentNodeId: string, position: { x: number, y: number }) => {
		const familyId = `family_${parentNodeId}`;

		const family: NodeFamily = {
			id: familyId,
			parentNodeId,
			subNodes: [],
			connections: [],
			position
		};

		nodeFamilies.value.set(familyId, family);
		return family;
	};

	// Add a sub-node to a family
	const addSubNode = (familyId: string, config: SubNodeConfig) => {
		const family = nodeFamilies.value.get(familyId);
		if (!family) return null;

		const subNodeId = `${config.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		const subNode: Node = {
			id: subNodeId,
			type: `${config.type}Node`,
			position: config.position,
			data: {
				id: subNodeId,
				type: config.type,
				name: config.name,
				parentNodeId: family.parentNodeId,
				componentType: config.componentType,
				filterPath: config.filterPath,
				status: "idle"
			},
			draggable: true,
			selectable: true
		};

		subNodes.value.set(subNodeId, subNode);
		family.subNodes.push(subNodeId);

		// Create connection from parent to sub-node
		const connectionId = `conn_${family.parentNodeId}_${subNodeId}`;
		const connection: Edge = {
			id: connectionId,
			source: family.parentNodeId,
			target: subNodeId,
			type: "smoothstep",
			animated: true,
			style: {
				stroke: getConnectionColor(config.type),
				strokeWidth: 2,
				strokeDasharray: "5,5"
			},
			label: config.name,
			labelStyle: {
				fill: getConnectionColor(config.type),
				fontWeight: 600,
				fontSize: "10px"
			}
		};

		familyConnections.value.set(connectionId, connection);
		family.connections.push(connectionId);

		return { subNode, connection };
	};

	// Get all nodes in a family
	const getFamilyNodes = (familyId: string) => {
		const family = nodeFamilies.value.get(familyId);
		if (!family) return [];

		return family.subNodes.map((nodeId) => subNodes.value.get(nodeId)).filter(Boolean) as Node[];
	};

	// Get all connections in a family
	const getFamilyConnections = (familyId: string) => {
		const family = nodeFamilies.value.get(familyId);
		if (!family) return [];

		return family.connections.map((connId) => familyConnections.value.get(connId)).filter(Boolean) as Edge[];
	};

	// Get family by parent node ID
	const getFamilyByParent = (parentNodeId: string) => {
		for (const family of nodeFamilies.value.values()) {
			if (family.parentNodeId === parentNodeId) {
				return family;
			}
		}
		return null;
	};

	// Update sub-node data
	const updateSubNodeData = (nodeId: string, data: any) => {
		const node = subNodes.value.get(nodeId);
		if (node) {
			node.data = { ...node.data, ...data };
		}
	};

	// Remove a sub-node
	const removeSubNode = (nodeId: string) => {
		const node = subNodes.value.get(nodeId);
		if (!node) return;

		// Find and remove from family
		for (const family of nodeFamilies.value.values()) {
			const index = family.subNodes.indexOf(nodeId);
			if (index > -1) {
				family.subNodes.splice(index, 1);
				break;
			}
		}

		// Remove connections
		const connectionsToRemove: string[] = [];
		for (const [connId, connection] of familyConnections.value.entries()) {
			if (connection.source === nodeId || connection.target === nodeId) {
				connectionsToRemove.push(connId);
			}
		}

		connectionsToRemove.forEach((connId) => {
			familyConnections.value.delete(connId);
		});

		subNodes.value.delete(nodeId);
	};

	// Remove entire family
	const removeFamily = (familyId: string) => {
		const family = nodeFamilies.value.get(familyId);
		if (!family) return;

		// Remove all sub-nodes
		family.subNodes.forEach((nodeId) => {
			subNodes.value.delete(nodeId);
		});

		// Remove all connections
		family.connections.forEach((connId) => {
			familyConnections.value.delete(connId);
		});

		nodeFamilies.value.delete(familyId);
	};

	// Get connection color based on sub-node type
	const getConnectionColor = (type: string) => {
		const colorMap: Record<string, string> = {
			logitConsole: "#06b6d4", // cyan
			uiComponent: "#8b5cf6", // purple
			apiResponse: "#10b981" // green
		};
		return colorMap[type] || "#6b7280";
	};

	// Calculate sub-node positions around parent
	const calculateSubNodePositions = (parentPosition: { x: number, y: number }, count: number) => {
		const positions: { x: number, y: number }[] = [];
		const radius = 200;
		const angleStep = (2 * Math.PI) / count;

		for (let i = 0; i < count; i++) {
			const angle = i * angleStep;
			positions.push({
				x: parentPosition.x + Math.cos(angle) * radius,
				y: parentPosition.y + Math.sin(angle) * radius
			});
		}

		return positions;
	};

	return {
		nodeFamilies,
		subNodes,
		familyConnections,
		createNodeFamily,
		addSubNode,
		getFamilyNodes,
		getFamilyConnections,
		getFamilyByParent,
		updateSubNodeData,
		removeSubNode,
		removeFamily,
		calculateSubNodePositions
	};
};
