import { ref, computed } from "vue";
import type { AuthFlowNode, UserFlowNode, CombinedFlowData, NodeConnection, ExecutionStep } from "~/types/api-node-types";
import { useAuthNodes } from "./useAuthNodes";
import { useUserNodes } from "./useUserNodes";
import { useFlowLayout } from "./useFlowLayout";

export const useCombinedFlow = () => {
	const authNodes = useAuthNodes();
	const userNodes = useUserNodes();
	const flowLayout = useFlowLayout();

	// Combined flow data
	const combinedFlowData = ref<CombinedFlowData>({
		authNodes: [],
		userNodes: [],
		connections: [],
		globalVariables: {},
		executionHistory: []
	});

	// Create a grand unified flow
	const createGrandUnifiedFlow = () => {
		// Clear existing data
		combinedFlowData.value = {
			authNodes: [],
			userNodes: [],
			connections: [],
			globalVariables: {},
			executionHistory: []
		};

		// Create auth flow
		authNodes.createDefaultAuthFlow();
		combinedFlowData.value.authNodes = [...authNodes.authFlowData.value.nodes];

		// Create user flow
		userNodes.createDefaultUserFlow();
		combinedFlowData.value.userNodes = [...userNodes.userFlowData.value.nodes];

		// Create connections between auth and user flows
		const authToUserConnections: NodeConnection[] = [
			{
				id: 'unified-conn-1',
				sourceNodeId: combinedFlowData.value.authNodes.find(n => n.type === 'login')?.id || '',
				targetNodeId: combinedFlowData.value.userNodes.find(n => n.type === 'getUser')?.id || '',
				sourceField: 'output',
				targetField: 'input',
				type: 'data'
			},
			{
				id: 'unified-conn-2',
				sourceNodeId: combinedFlowData.value.authNodes.find(n => n.type === 'register')?.id || '',
				targetNodeId: combinedFlowData.value.userNodes.find(n => n.type === 'getAllUsers')?.id || '',
				sourceField: 'output',
				targetField: 'input',
				type: 'data'
			},
			{
				id: 'unified-conn-3',
				sourceNodeId: combinedFlowData.value.userNodes.find(n => n.type === 'getUser')?.id || '',
				targetNodeId: combinedFlowData.value.userNodes.find(n => n.type === 'updateUser')?.id || '',
				sourceField: 'output',
				targetField: 'input',
				type: 'data'
			}
		];

		// Combine all connections
		combinedFlowData.value.connections = [
			...authNodes.authFlowData.value.connections,
			...userNodes.userFlowData.value.connections,
			...authToUserConnections
		];

		// Position user flow to the right of auth flow
		combinedFlowData.value.userNodes.forEach((node, index) => {
			node.position.x += 1000; // Move user nodes to the right
		});
	};

	// Create separate flows
	const createSeparateFlows = () => {
		// Create auth flow only
		authNodes.createDefaultAuthFlow();
		
		// Create user flow only
		userNodes.createDefaultUserFlow();
	};

	// Get all nodes for Vue Flow
	const getAllNodes = computed(() => {
		const authVueNodes = authNodes.authFlowData.value.nodes.map(node => ({
			id: node.id,
			type: getAuthNodeType(node),
			position: node.position,
			data: node,
			draggable: true,
			selectable: true
		}));

		const userVueNodes = userNodes.userFlowData.value.nodes.map(node => ({
			id: node.id,
			type: getUserNodeType(node),
			position: node.position,
			data: node,
			draggable: true,
			selectable: true
		}));

		return [...authVueNodes, ...userVueNodes];
	});

	// Get all connections for Vue Flow
	const getAllConnections = computed(() => {
		const authConnections = authNodes.authFlowData.value.connections.map(conn => ({
			id: conn.id,
			source: conn.sourceNodeId,
			target: conn.targetNodeId,
			label: getConnectionLabel(conn.id, 'auth'),
			type: 'smoothstep',
			animated: true,
			style: {
				stroke: conn.type === 'data' ? '#10b981' : '#ef4444',
				strokeWidth: 2
			},
			labelStyle: {
				fill: conn.type === 'data' ? '#10b981' : '#ef4444',
				fontWeight: 600
			}
		}));

		const userConnections = userNodes.userFlowData.value.connections.map(conn => ({
			id: conn.id,
			source: conn.sourceNodeId,
			target: conn.targetNodeId,
			label: getConnectionLabel(conn.id, 'user'),
			type: 'smoothstep',
			animated: true,
			style: {
				stroke: conn.type === 'data' ? '#3b82f6' : '#ef4444',
				strokeWidth: 2
			},
			labelStyle: {
				fill: conn.type === 'data' ? '#3b82f6' : '#ef4444',
				fontWeight: 600
			}
		}));

		return [...authConnections, ...userConnections];
	});

	// Helper function to get connection labels
	const getConnectionLabel = (connId: string, flowType: 'auth' | 'user') => {
		const labelMap: Record<string, string> = {
			// Auth connections
			'conn-1': 'Registration Success',
			'conn-2': 'Login Success',
			'conn-3': 'Token Refresh',
			'conn-4': 'Password Reset',
			'conn-5': 'Email Verified',
			// User connections
			'user-conn-1': 'Select User',
			'user-conn-2': 'Edit User',
			'user-conn-3': 'Assign Role',
			'user-conn-4': 'Assign Permissions',
			'user-conn-5': 'Verify Setup',
			'user-conn-6': 'Check Permissions',
			'user-conn-7': 'Delete User'
		};
		return labelMap[connId] || 'Data Flow';
	};

	// Get node type for Vue Flow
	const getAuthNodeType = (node: AuthFlowNode) => {
		if (node.fields?.some(f => f.id === 'functionType')) {
			const functionType = node.fields.find(f => f.id === 'functionType')?.value;
			if (functionType === 'condition') return 'conditionNode';
			return 'functionNode';
		}

		const typeMap: Record<string, string> = {
			login: 'loginNode',
			logout: 'logoutNode',
			register: 'enhancedAuthNode',
			verify: 'enhancedAuthNode',
			refresh: 'enhancedAuthNode',
			reset: 'enhancedAuthNode',
			createClient: 'enhancedAuthNode'
		};
		return typeMap[node.type] || 'enhancedAuthNode';
	};

	const getUserNodeType = (node: UserFlowNode) => {
		// Map specific user node types to their components
		const typeMap: Record<string, string> = {
			getUser: 'getUserNode',
			updateUser: 'updateUserNode',
			deleteUser: 'deleteUserNode',
			getAllUsers: 'getAllUsersNode',
			assignRole: 'assignRoleNode',
			removeRole: 'removeRoleNode',
			assignPermissions: 'assignPermissionsNode',
			removePermissions: 'removePermissionsNode',
			getUserWithRole: 'getUserWithRoleNode',
			getUserPermissions: 'getUserPermissionsNode',
			magicCard: 'magicCardNode',
			orbitCard: 'orbitCardNode'
		};
		return typeMap[node.type] || 'enhancedUserNode';
	};

	// Execute any node
	const executeNode = async (nodeId: string) => {
		// Check if it's an auth node
		const authNode = authNodes.authFlowData.value.nodes.find(n => n.id === nodeId);
		if (authNode) {
			await authNodes.executeNode(nodeId);
			return;
		}

		// Check if it's a user node
		const userNode = userNodes.userFlowData.value.nodes.find(n => n.id === nodeId);
		if (userNode) {
			await userNodes.executeUserNode(nodeId);
			return;
		}
	};

	// Apply layout to all nodes
	const applyLayoutToAllNodes = () => {
		const allNodes = [...authNodes.authFlowData.value.nodes, ...userNodes.userFlowData.value.nodes];
		const allConnections = [...authNodes.authFlowData.value.connections, ...userNodes.userFlowData.value.connections];
		
		const positions = flowLayout.applyLayout(allNodes, allConnections);
		
		// Update auth nodes
		positions.forEach(pos => {
			const authNode = authNodes.authFlowData.value.nodes.find(n => n.id === pos.id);
			if (authNode) {
				authNode.position = { x: pos.x, y: pos.y };
			}
		});
		
		// Update user nodes
		positions.forEach(pos => {
			const userNode = userNodes.userFlowData.value.nodes.find(n => n.id === pos.id);
			if (userNode) {
				userNode.position = { x: pos.x, y: pos.y };
			}
		});
	};

	// Apply layout to specific flow
	const applyLayoutToFlow = (flowType: 'auth' | 'user' | 'combined') => {
		if (flowType === 'auth' || flowType === 'combined') {
			const positions = flowLayout.applyLayout(authNodes.authFlowData.value.nodes, authNodes.authFlowData.value.connections);
			positions.forEach(pos => {
				const node = authNodes.authFlowData.value.nodes.find(n => n.id === pos.id);
				if (node) {
					node.position = { x: pos.x, y: pos.y };
				}
			});
		}
		
		if (flowType === 'user' || flowType === 'combined') {
			const positions = flowLayout.applyLayout(userNodes.userFlowData.value.nodes, userNodes.userFlowData.value.connections);
			positions.forEach(pos => {
				const node = userNodes.userFlowData.value.nodes.find(n => n.id === pos.id);
				if (node) {
					node.position = { x: pos.x, y: pos.y };
				}
			});
		}
	};

	// Clear all flows
	const clearAllFlows = () => {
		authNodes.clearFlow();
		userNodes.clearUserFlow();
		combinedFlowData.value = {
			authNodes: [],
			userNodes: [],
			connections: [],
			globalVariables: {},
			executionHistory: []
		};
	};

	// Computed properties
	const totalNodeCount = computed(() => 
		authNodes.nodeCount.value + userNodes.nodeCount.value
	);

	const totalConnectionCount = computed(() => 
		authNodes.connectionCount.value + userNodes.connectionCount.value
	);

	const totalExecutionCount = computed(() => 
		authNodes.executionCount.value + userNodes.executionCount.value
	);

	const totalSuccessCount = computed(() => 
		authNodes.successCount.value + userNodes.successCount.value
	);

	const totalErrorCount = computed(() => 
		authNodes.errorCount.value + userNodes.errorCount.value
	);

	return {
		// Individual flows
		authNodes,
		userNodes,
		
		// Layout system
		flowLayout,
		
		// Combined data
		combinedFlowData,
		
		// Methods
		createGrandUnifiedFlow,
		createSeparateFlows,
		executeNode,
		clearAllFlows,
		applyLayoutToAllNodes,
		applyLayoutToFlow,
		
		// Vue Flow data
		getAllNodes,
		getAllConnections,
		
		// Computed
		totalNodeCount,
		totalConnectionCount,
		totalExecutionCount,
		totalSuccessCount,
		totalErrorCount
	};
};
