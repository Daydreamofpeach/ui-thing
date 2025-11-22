import { ref, computed, readonly } from "vue";
import type { UserFlowNode, UserFlowData, ExecutionStep, NodeField, NodeConnection, UserNodeData } from "~/types/api-node-types";
import { USER_NODE_TYPES } from "~/types/api-node-types";

export const useUserNodes = () => {
	// State
	const userFlowData = ref<UserFlowData>({
		nodes: [],
		connections: [],
		globalVariables: {},
		executionHistory: []
	});

	const isExecuting = ref(false);
	const currentStep = ref<ExecutionStep | null>(null);

	// Create a default user flow
	const createDefaultUserFlow = () => {
		// Clear existing nodes
		userFlowData.value.nodes = [];
		userFlowData.value.connections = [];

		// Create user flow nodes with better spacing
		const getAllUsersNode = createUserNode('getAllUsers', { x: 200, y: 100 });
		const getUserNode = createUserNode('getUser', { x: 500, y: 100 });
		const updateUserNode = createUserNode('updateUser', { x: 200, y: 300 });
		const assignRoleNode = createUserNode('assignRole', { x: 500, y: 300 });
		const assignPermissionsNode = createUserNode('assignPermissions', { x: 800, y: 300 });
		const getUserWithRoleNode = createUserNode('getUserWithRole', { x: 200, y: 500 });
		const getUserPermissionsNode = createUserNode('getUserPermissions', { x: 500, y: 500 });
		const deleteUserNode = createUserNode('deleteUser', { x: 800, y: 500 });

		// Create connections for the flow
		const connections: NodeConnection[] = [
			{
				id: 'user-conn-1',
				sourceNodeId: getAllUsersNode.id,
				targetNodeId: getUserNode.id,
				sourceField: 'output',
				targetField: 'input',
				type: 'data'
			},
			{
				id: 'user-conn-2',
				sourceNodeId: getUserNode.id,
				targetNodeId: updateUserNode.id,
				sourceField: 'output',
				targetField: 'input',
				type: 'data'
			},
			{
				id: 'user-conn-3',
				sourceNodeId: updateUserNode.id,
				targetNodeId: assignRoleNode.id,
				sourceField: 'output',
				targetField: 'input',
				type: 'data'
			},
			{
				id: 'user-conn-4',
				sourceNodeId: assignRoleNode.id,
				targetNodeId: assignPermissionsNode.id,
				sourceField: 'output',
				targetField: 'input',
				type: 'data'
			},
			{
				id: 'user-conn-5',
				sourceNodeId: assignPermissionsNode.id,
				targetNodeId: getUserWithRoleNode.id,
				sourceField: 'output',
				targetField: 'input',
				type: 'data'
			},
			{
				id: 'user-conn-6',
				sourceNodeId: getUserWithRoleNode.id,
				targetNodeId: getUserPermissionsNode.id,
				sourceField: 'output',
				targetField: 'input',
				type: 'data'
			},
			{
				id: 'user-conn-7',
				sourceNodeId: getUserPermissionsNode.id,
				targetNodeId: deleteUserNode.id,
				sourceField: 'output',
				targetField: 'input',
				type: 'data'
			}
		];

		userFlowData.value.connections = connections;
	};

	// Create a new user node with flow positioning
	const createUserNode = (type: string, position?: { x: number; y: number }) => {
		// If no position provided, calculate based on flow layout
		if (!position) {
			const flowPositions: Record<string, { x: number; y: number }> = {
				getUser: { x: 200, y: 200 },
				updateUser: { x: 400, y: 200 },
				deleteUser: { x: 600, y: 200 },
				getAllUsers: { x: 200, y: 100 },
				assignRole: { x: 400, y: 300 },
				removeRole: { x: 600, y: 300 },
				assignPermissions: { x: 400, y: 400 },
				removePermissions: { x: 600, y: 400 },
				getUserWithRole: { x: 200, y: 500 },
				getUserPermissions: { x: 400, y: 500 },
				magicCard: { x: 800, y: 200 },
				orbitCard: { x: 1000, y: 200 }
			};
			position = flowPositions[type] || { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 };
		}
		const nodeId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		const baseFields: NodeField[] = [
			{
				id: 'userId',
				name: 'User ID',
				type: 'string',
				value: '',
				required: true,
				description: 'Unique user identifier',
				validation: {
					minLength: 1
				}
			}
		];

		// Add type-specific fields
		const typeSpecificFields = getTypeSpecificFields(type);
		const allFields = [...baseFields, ...typeSpecificFields];

		const newNode: UserFlowNode = {
			id: nodeId,
			type: type as any,
			name: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
			description: `User management ${type} operation`,
			endpoint: {
				id: nodeId,
				name: `${type} endpoint`,
				path: `/users/${type}`,
				method: type === 'getUser' || type === 'getAllUsers' || type === 'getUserWithRole' || type === 'getUserPermissions' ? 'GET' : 
					   type === 'updateUser' ? 'PUT' : 
					   type === 'deleteUser' || type === 'removeRole' || type === 'removePermissions' ? 'DELETE' : 'POST',
				description: `User management ${type} endpoint`,
				auth: 'secure',
				parameters: [],
				headers: []
			},
			position,
			fields: allFields,
			connections: [],
			status: 'idle'
		};

		userFlowData.value.nodes.push(newNode);
		return newNode;
	};

	// Get type-specific fields
	const getTypeSpecificFields = (type: string): NodeField[] => {
		switch (type) {
			case 'updateUser':
				return [
					{
						id: 'name',
						name: 'Name',
						type: 'string',
						value: '',
						required: true,
						description: 'User full name',
						validation: {
							minLength: 2
						}
					},
					{
						id: 'email',
						name: 'Email',
						type: 'string',
						value: '',
						required: true,
						description: 'User email address',
						validation: {
							pattern: '^[^@]+@[^@]+\\.[^@]+$'
						}
					}
				];
			case 'assignRole':
				return [
					{
						id: 'roleId',
						name: 'Role ID',
						type: 'string',
						value: '',
						required: true,
						description: 'Role identifier or butt string',
						validation: {
							minLength: 1
						}
					}
				];
			case 'assignPermissions':
			case 'removePermissions':
				return [
					{
						id: 'permissionGroupIds',
						name: 'Permission Group IDs',
						type: 'array',
						value: [],
						required: true,
						description: 'Array of permission group IDs',
						validation: {
							minLength: 1
						}
					}
				];
			case 'magicCard':
				return [
					// Card Content
					{
						id: 'cardTitle',
						name: 'Card Title',
						type: 'string',
						value: 'MAGIC CARD',
						required: false,
						description: 'Title displayed on the magic card',
						validation: {
							maxLength: 50
						}
					},
					{
						id: 'line1',
						name: 'Line 1',
						type: 'string',
						value: 'Interactive Node',
						required: false,
						description: 'First line of text on the card',
						validation: {
							maxLength: 30
						}
					},
					{
						id: 'line2',
						name: 'Line 2',
						type: 'string',
						value: 'Click to explore',
						required: false,
						description: 'Second line of text on the card',
						validation: {
							maxLength: 30
						}
					},
					{
						id: 'line3',
						name: 'Line 3',
						type: 'string',
						value: 'Amazing effects!',
						required: false,
						description: 'Third line of text on the card',
						validation: {
							maxLength: 30
						}
					},
					{
						id: 'footer',
						name: 'Footer',
						type: 'string',
						value: 'Node Magic',
						required: false,
						description: 'Footer text on the card',
						validation: {
							maxLength: 20
						}
					},
					// Card Color
					{
						id: 'cardColor',
						name: 'Card Color',
						type: 'string',
						value: '#00ff88',
						required: false,
						description: 'Primary color for the magic card effects',
						validation: {
							pattern: '^#[0-9A-Fa-f]{6}$'
						}
					},
					// Icon Color
					{
						id: 'iconColor',
						name: 'Icon Color',
						type: 'string',
						value: '#00ff88',
						required: false,
						description: 'Color of the SVG icon in the center',
						validation: {
							pattern: '^#[0-9A-Fa-f]{6}$'
						}
					},
					// SVG Settings
					{
						id: 'selectedSvg',
						name: 'Icon Style',
						type: 'string',
						value: 'pentagon',
						required: false,
						description: 'Icon style for the card',
						validation: {}
					},
					{
						id: 'svgSize',
						name: 'Icon Size',
						type: 'number',
						value: 70,
						required: false,
						description: 'Size of the icon',
						validation: {
							min: 20,
							max: 120
						}
					},
					// Particle Settings
					{
						id: 'particleCount',
						name: 'Particle Count',
						type: 'number',
						value: 100,
						required: false,
						description: 'Number of particles',
						validation: {
							min: 0,
							max: 500
						}
					},
					// Line Settings
					{
						id: 'lineCount',
						name: 'Line Count',
						type: 'number',
						value: 15,
						required: false,
						description: 'Number of flowing lines',
						validation: {
							min: 0,
							max: 50
						}
					}
				];
			case 'orbitCard':
				return [
					// Orbit Title
					{
						id: 'orbitTitle',
						name: 'Orbit Title',
						type: 'string',
						value: 'Tasks Orbit View',
						required: false,
						description: 'Title displayed in the orbit view',
						validation: {
							maxLength: 50
						}
					},
					// Auto Rotation
					{
						id: 'autoRotate',
						name: 'Auto Rotate',
						type: 'boolean',
						value: true,
						required: false,
						description: 'Enable automatic rotation of the orbit',
						validation: {}
					},
					// Rotation Speed
					{
						id: 'rotationSpeed',
						name: 'Rotation Speed',
						type: 'number',
						value: 0.3,
						required: false,
						description: 'Speed of orbit rotation',
						validation: {
							min: 0.1,
							max: 2.0
						}
					},
					// Zoom Level
					{
						id: 'zoomLevel',
						name: 'Zoom Level',
						type: 'number',
						value: 1.0,
						required: false,
						description: 'Initial zoom level of the orbit',
						validation: {
							min: 0.5,
							max: 3.0
						}
					},
					// Center Icon Color
					{
						id: 'centerIconColor',
						name: 'Center Icon Color',
						type: 'string',
						value: '#ffffff',
						required: false,
						description: 'Color of the center icon',
						validation: {
							pattern: '^#[0-9A-Fa-f]{6}$'
						}
					},
					// Sample Tasks Count
					{
						id: 'sampleTasksCount',
						name: 'Sample Tasks Count',
						type: 'number',
						value: 3,
						required: false,
						description: 'Number of sample tasks to display',
						validation: {
							min: 1,
							max: 10
						}
					}
				];
			default:
				return [];
		}
	};

	// Make API call for user operations
	const makeUserApiCall = async (node: UserFlowNode): Promise<any> => {
		// For now, return mock data since BApi is not available
		// const { BApi } = await import('@butt/client');
		// const api = new BApi();

		// Extract field values
		const getFieldValue = (fieldId: string) => {
			const field = node.fields.find(f => f.id === fieldId);
			return field?.value;
		};

		const userId = getFieldValue('userId');
		const name = getFieldValue('name');
		const email = getFieldValue('email');
		const roleId = getFieldValue('roleId');
		const permissionGroupIds = getFieldValue('permissionGroupIds');

		switch (node.type) {
			case 'getUser':
				return { id: userId, name: 'John Doe', email: 'john@example.com', role: 'admin' };
			case 'updateUser':
				return { id: userId, name, email, updated: true };
			case 'deleteUser':
				return { id: userId, deleted: true };
			case 'getAllUsers':
				return [
					{ id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
					{ id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
				];
			case 'assignRole':
				return { id: userId, roleId, assigned: true };
			case 'removeRole':
				return { id: userId, roleRemoved: true };
			case 'assignPermissions':
				return { id: userId, permissionGroupIds, assigned: true };
			case 'removePermissions':
				return { id: userId, permissionGroupIds, removed: true };
			case 'getUserWithRole':
				return { id: userId, name: 'John Doe', email: 'john@example.com', role: 'admin', permissions: ['read', 'write'] };
			case 'getUserPermissions':
				return { id: userId, permissions: ['read', 'write', 'delete'] };
			case 'magicCard':
				// Magic card doesn't make API calls, just returns success
				return { success: true, message: 'Magic card displayed successfully' };
			case 'orbitCard':
				// Orbit card doesn't make API calls, just returns success
				return { success: true, message: 'Orbit card displayed successfully' };
			default:
				throw new Error(`Unknown user node type: ${node.type}`);
		}
	};

	// Execute a user node
	const executeUserNode = async (nodeId: string) => {
		if (isExecuting.value) return;

		const node = userFlowData.value.nodes.find(n => n.id === nodeId);
		if (!node) return;

		isExecuting.value = true;
		node.status = 'running';
		node.lastError = undefined;

		const step: ExecutionStep = {
			id: `step_${Date.now()}`,
			nodeId: node.id,
			timestamp: new Date(),
			status: 'started',
			input: node.fields.reduce((acc, field) => {
				acc[field.id] = field.value;
				return acc;
			}, {} as Record<string, any>)
		};

		userFlowData.value.executionHistory.push(step);
		currentStep.value = step;

		try {
			const result = await makeUserApiCall(node);
			node.status = 'success';
			node.lastResult = result;
			step.status = 'completed';
			step.output = result;
		} catch (error: any) {
			node.status = 'error';
			node.lastError = error.message || 'Unknown error occurred';
			step.status = 'failed';
			step.error = error.message || 'Unknown error occurred';
		} finally {
			isExecuting.value = false;
			currentStep.value = null;
		}
	};

	// Update node field
	const updateUserNodeField = (nodeId: string, fieldId: string, value: any) => {
		const node = userFlowData.value.nodes.find(n => n.id === nodeId);
		if (node) {
			const field = node.fields.find(f => f.id === fieldId);
			if (field) {
				field.value = value;
			}
		}
	};

	// Update multiple fields at once
	const updateUserNodeFields = (nodeId: string, fields: Record<string, any>) => {
		const node = userFlowData.value.nodes.find(n => n.id === nodeId);
		if (node) {
			Object.entries(fields).forEach(([fieldId, value]) => {
				const field = node.fields.find(f => f.id === fieldId);
				if (field) {
					field.value = value;
				}
			});
		}
	};

	// Delete user node
	const deleteUserNode = (nodeId: string) => {
		const index = userFlowData.value.nodes.findIndex(n => n.id === nodeId);
		if (index > -1) {
			userFlowData.value.nodes.splice(index, 1);
		}
		// Remove connections involving this node
		userFlowData.value.connections = userFlowData.value.connections.filter(
			conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
		);
	};

	// Clear user flow
	const clearUserFlow = () => {
		userFlowData.value.nodes = [];
		userFlowData.value.connections = [];
		userFlowData.value.executionHistory = [];
	};

	// Computed properties
	const nodeCount = computed(() => userFlowData.value.nodes.length);
	const connectionCount = computed(() => userFlowData.value.connections.length);
	const executionCount = computed(() => userFlowData.value.executionHistory.length);
	const successCount = computed(() => 
		userFlowData.value.executionHistory.filter(s => s.status === 'completed').length
	);
	const errorCount = computed(() => 
		userFlowData.value.executionHistory.filter(s => s.status === 'failed').length
	);

	return {
		// State
		userFlowData,
		isExecuting: readonly(isExecuting),
		currentStep: readonly(currentStep),
		
		// Computed
		nodeCount,
		connectionCount,
		executionCount,
		successCount,
		errorCount,
		
		// Methods
		createUserNode,
		createDefaultUserFlow,
		updateUserNodeField,
		executeUserNode,
		deleteUserNode,
		clearUserFlow
	};
};
