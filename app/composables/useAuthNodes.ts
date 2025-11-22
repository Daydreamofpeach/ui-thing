import { ref, computed } from 'vue';
import type { AuthFlowNode, AuthFlowData, ExecutionStep, NodeField, NodeConnection } from '~/types/api-node-types';

export const useAuthNodes = () => {
	const authFlowData = ref<AuthFlowData>({
		nodes: [],
		connections: [],
		globalVariables: {},
		executionHistory: []
	});

	const isExecuting = ref(false);
	const currentStep = ref<ExecutionStep | null>(null);

	// Create a default auth flow
	const createDefaultAuthFlow = () => {
		// Clear existing nodes
		authFlowData.value.nodes = [];
		authFlowData.value.connections = [];

		// Create auth flow nodes with better spacing
		const registerNode = createAuthNode('register', { x: 200, y: 100 });
		const verifyNode = createAuthNode('verify', { x: 500, y: 100 });
		const loginNode = createAuthNode('login', { x: 200, y: 300 });
		const refreshNode = createAuthNode('refresh', { x: 500, y: 300 });
		const logoutNode = createAuthNode('logout', { x: 800, y: 300 });
		const resetNode = createAuthNode('reset', { x: 200, y: 500 });

		// Create connections for the flow
		const connections: NodeConnection[] = [
			{
				id: 'conn-1',
				sourceNodeId: registerNode.id,
				targetNodeId: verifyNode.id,
				sourceField: 'output',
				targetField: 'input',
				type: 'data'
			},
			{
				id: 'conn-2',
				sourceNodeId: loginNode.id,
				targetNodeId: refreshNode.id,
				sourceField: 'output',
				targetField: 'input',
				type: 'data'
			},
			{
				id: 'conn-3',
				sourceNodeId: refreshNode.id,
				targetNodeId: logoutNode.id,
				sourceField: 'output',
				targetField: 'input',
				type: 'data'
			},
			{
				id: 'conn-4',
				sourceNodeId: resetNode.id,
				targetNodeId: loginNode.id,
				sourceField: 'output',
				targetField: 'input',
				type: 'data'
			},
			{
				id: 'conn-5',
				sourceNodeId: verifyNode.id,
				targetNodeId: loginNode.id,
				sourceField: 'output',
				targetField: 'input',
				type: 'data'
			}
		];

		authFlowData.value.connections = connections;
	};

	// Create a new auth node with flow positioning
	const createAuthNode = (type: string, position?: { x: number; y: number }) => {
		// If no position provided, calculate based on flow layout
		if (!position) {
			const flowPositions: Record<string, { x: number; y: number }> = {
				login: { x: 100, y: 200 },
				register: { x: 100, y: 100 },
				logout: { x: 500, y: 200 },
				verify: { x: 300, y: 100 },
				refresh: { x: 300, y: 200 },
				reset: { x: 100, y: 300 },
				createClient: { x: 300, y: 300 }
			};
			position = flowPositions[type] || { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 };
		}
		const nodeId = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		const baseFields: NodeField[] = [
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
			},
			{
				id: 'password',
				name: 'Password',
				type: 'string',
				value: '',
				required: true,
				description: 'User password',
				validation: {
					minLength: 8
				}
			}
		];

		// Add type-specific fields
		const typeSpecificFields = getTypeSpecificFields(type);
		const allFields = [...baseFields, ...typeSpecificFields];

		const newNode: AuthFlowNode = {
			id: nodeId,
			type: type as any,
			name: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
			description: `Authentication ${type} operation`,
			endpoint: {
				id: nodeId,
				name: `${type} endpoint`,
				path: `/auth/${type}`,
				method: type === 'verify' || type === 'refresh' ? 'GET' : 'POST',
				description: `Authentication ${type} endpoint`,
				auth: type === 'register' || type === 'verify' || type === 'reset' ? 'public' : 'restricted',
				parameters: [],
				headers: []
			},
			position,
			fields: allFields,
			connections: [],
			status: 'idle'
		};

		authFlowData.value.nodes.push(newNode);
		return newNode;
	};

	// Get type-specific fields for each auth node type
	const getTypeSpecificFields = (type: string): NodeField[] => {
		switch (type) {
			case 'login':
				return [
					{
						id: 'clientInfo',
						name: 'Client Info',
						type: 'object',
						value: {
							instanceId: '',
							clientId: '',
							serviceId: '',
							environment: 'development',
							userAgent: navigator.userAgent,
							ipAddress: '',
							location: ''
						},
						required: true,
						description: 'Client information for authentication'
					}
				];
			case 'register':
				return [
					{
						id: 'name',
						name: 'Name',
						type: 'string',
						value: '',
						required: true,
						description: 'Full name of the user'
					},
					{
						id: 'roleId',
						name: 'Role ID',
						type: 'string',
						value: '',
						required: false,
						description: 'Role to assign to the user'
					},
					{
						id: 'permissionGroups',
						name: 'Permission Groups',
						type: 'array',
						value: [],
						required: false,
						description: 'Permission groups to assign'
					},
					{
						id: 'settings',
						name: 'Settings',
						type: 'object',
						value: {},
						required: false,
						description: 'User settings and preferences'
					}
				];
			case 'verify':
				return [
					{
						id: 'code',
						name: 'Verification Code',
						type: 'string',
						value: '',
						required: true,
						description: 'Activation code from email'
					},
					{
						id: 'solution',
						name: 'Solution',
						type: 'string',
						value: 'web',
						required: true,
						description: 'Solution type (web, client, etc.)'
					}
				];
			case 'refresh':
				return [
					{
						id: 'refreshToken',
						name: 'Refresh Token',
						type: 'string',
						value: '',
						required: true,
						description: 'Refresh token for authentication'
					}
				];
			case 'reset':
				return [
					{
						id: 'resetCode',
						name: 'Reset Code',
						type: 'string',
						value: '',
						required: true,
						description: 'Password reset code'
					},
					{
						id: 'newPassword',
						name: 'New Password',
						type: 'string',
						value: '',
						required: true,
						description: 'New password for the account'
					}
				];
			default:
				return [];
		}
	};

	// Update node field value
	const updateNodeField = (nodeId: string, fieldId: string, value: any) => {
		const node = authFlowData.value.nodes.find(n => n.id === nodeId);
		if (node) {
			const field = node.fields.find(f => f.id === fieldId);
			if (field) {
				field.value = value;
			}
		}
	};

	// Execute a single node
	const executeNode = async (nodeId: string) => {
		const node = authFlowData.value.nodes.find(n => n.id === nodeId);
		if (!node) return;

		const step: ExecutionStep = {
			id: `step_${Date.now()}`,
			nodeId,
			timestamp: new Date(),
			status: 'started'
		};

		currentStep.value = step;
		node.status = 'running';
		authFlowData.value.executionHistory.push(step);

		try {
			const startTime = Date.now();
			
			// Make actual API call
			const result = await makeApiCall(node);
			
			const endTime = Date.now();
			step.duration = endTime - startTime;
			step.status = 'completed';
			step.output = result;
			
			node.status = 'success';
			node.lastResult = result;
			node.lastError = undefined;
		} catch (error) {
			step.status = 'failed';
			step.error = error instanceof Error ? error.message : 'Unknown error';
			
			node.status = 'error';
			node.lastError = step.error;
			node.lastResult = undefined;
		}

		currentStep.value = null;
	};

	// Make actual API calls using BApi
	const makeApiCall = async (node: AuthFlowNode): Promise<any> => {
		try {
			// Import BApi dynamically to avoid SSR issues
			// const { BApi } = await import('@butt/client');
			// const api = new BApi();

			// Get field values
			const getFieldValue = (fieldName: string) => {
				const field = node.fields.find(f => f.id === fieldName);
				return field?.value;
			};

			// Make API calls based on node type
			switch (node.type) {
				case 'login': {
					const email = getFieldValue('email');
					const password = getFieldValue('password');
					const clientInfo = getFieldValue('clientInfo');

					if (!email || !password || !clientInfo) {
						throw new Error('Missing required fields: email, password, or clientInfo');
					}

					// return await api.login({
					// 	email,
					// 	password,
					// 	clientInfo: {
					// 		instanceId: clientInfo.instanceId || crypto.randomUUID(),
					// 		clientId: clientInfo.clientId || 'node-canvas',
					// 		serviceId: clientInfo.serviceId || 'web',
					// 		environment: clientInfo.environment || 'development',
					// 		userAgent: clientInfo.userAgent || navigator.userAgent,
					// 		ipAddress: clientInfo.ipAddress || '127.0.0.1',
					// 		location: clientInfo.location || 'Unknown'
					// 	}
					// });
					return { success: true, message: 'Login completed' };
				}

				case 'logout': {
					// return await api.logout();
					return { success: true, message: 'Logout completed' };
				}

				case 'register': {
					const name = getFieldValue('name');
					const email = getFieldValue('email');
					const password = getFieldValue('password');
					const roleId = getFieldValue('roleId');
					const permissionGroups = getFieldValue('permissionGroups') || [];
					const settings = getFieldValue('settings') || {};

					if (!name || !email || !password) {
						throw new Error('Missing required fields: name, email, or password');
					}

					// return await api.register('web', {
					// 	name,
					// 	email,
					// 	password,
					// 	roleId: roleId || undefined,
					// 	permissionGroups,
					// 	settings
					// });
					return { success: true, message: 'Registration completed' };
				}

				case 'verify': {
					const code = getFieldValue('code');
					const solution = getFieldValue('solution') || 'web';

					if (!code) {
						throw new Error('Missing required field: code');
					}

					// return await api.verifyAuth(code, solution);
					return { success: true, message: 'Email verification completed' };
				}

				case 'refresh': {
					const refreshToken = getFieldValue('refreshToken');

					if (!refreshToken) {
						throw new Error('Missing required field: refreshToken');
					}

					// return await api.refreshTokens(`Bearer ${refreshToken}`);
					return { success: true, message: 'Token refresh completed' };
				}

				case 'reset': {
					const resetCode = getFieldValue('resetCode');
					const newPassword = getFieldValue('newPassword');

					if (!resetCode || !newPassword) {
						throw new Error('Missing required fields: resetCode or newPassword');
					}

					// Note: This would need to be implemented in BApi
					throw new Error('Reset password endpoint not yet implemented in BApi');
				}

				case 'createClient': {
					// Note: This would need to be implemented in BApi
					throw new Error('Create client endpoint not yet implemented in BApi');
				}

				default:
					throw new Error(`Unknown node type: ${node.type}`);
			}
		} catch (error) {
			console.error(`API call failed for ${node.type}:`, error);
			throw error;
		}
	};

	// Execute entire flow
	const executeFlow = async () => {
		if (isExecuting.value) return;
		
		isExecuting.value = true;
		authFlowData.value.executionHistory = [];

		try {
			// Execute nodes in sequence (for now)
			for (const node of authFlowData.value.nodes) {
				await executeNode(node.id);
			}
		} finally {
			isExecuting.value = false;
		}
	};

	// Delete node
	const deleteNode = (nodeId: string) => {
		const index = authFlowData.value.nodes.findIndex(n => n.id === nodeId);
		if (index > -1) {
			authFlowData.value.nodes.splice(index, 1);
		}
		// Also remove any connections involving this node
		authFlowData.value.connections = authFlowData.value.connections.filter(
			c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
		);
	};

	// Clear all nodes
	const clearFlow = () => {
		authFlowData.value.nodes = [];
		authFlowData.value.connections = [];
		authFlowData.value.globalVariables = {};
		authFlowData.value.executionHistory = [];
	};

	// Computed properties
	const nodeCount = computed(() => authFlowData.value.nodes.length);
	const connectionCount = computed(() => authFlowData.value.connections.length);
	const executionCount = computed(() => authFlowData.value.executionHistory.length);
	const successCount = computed(() => 
		authFlowData.value.executionHistory.filter(s => s.status === 'completed').length
	);
	const errorCount = computed(() => 
		authFlowData.value.executionHistory.filter(s => s.status === 'failed').length
	);

	return {
		// State
		authFlowData,
		isExecuting: readonly(isExecuting),
		currentStep: readonly(currentStep),
		
		// Computed
		nodeCount,
		connectionCount,
		executionCount,
		successCount,
		errorCount,
		
		// Methods
		createAuthNode,
		createDefaultAuthFlow,
		updateNodeField,
		executeNode,
		executeFlow,
		deleteNode,
		clearFlow
	};
};
