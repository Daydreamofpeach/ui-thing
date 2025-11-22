import { ref, reactive } from 'vue';

interface FlowConnection {
	id: string;
	sourceNodeId: string;
	targetNodeId: string;
	type: 'success' | 'error';
	status: 'active' | 'inactive';
}

interface LoginFlowState {
	loginNodeId: string | null;
	logoutNodeId: string | null;
	connection: FlowConnection | null;
	isFlowActive: boolean;
}

export const useLoginFlow = () => {
	const flowState = reactive<LoginFlowState>({
		loginNodeId: null,
		logoutNodeId: null,
		connection: null,
		isFlowActive: false
	});

	const createLogoutNode = (loginNodeId: string, userData: any) => {
		// Generate logout node ID
		const logoutNodeId = `logout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		// Create logout node
		const logoutNode = {
			id: logoutNodeId,
			type: 'logout' as const,
			name: 'Logout Node',
			description: 'Logout node triggered by successful login',
			endpoint: {
				id: logoutNodeId,
				name: 'logout endpoint',
				path: '/auth/logout',
				method: 'POST' as const,
				description: 'Logout endpoint',
				auth: 'secure' as const,
				parameters: [],
				headers: []
			},
			position: { 
				x: 400, // Position to the right of login node
				y: 100 
			},
			draggable: true,
			selectable: true,
			fields: [],
			connections: [],
			status: 'idle' as const,
			data: {
				id: logoutNodeId,
				type: 'logout',
				name: 'Logout Node',
				description: 'Logout node triggered by successful login',
				userData: userData,
				fields: []
			}
		};

		// Create connection from login to logout
		const connection: FlowConnection = {
			id: `conn_${Date.now()}`,
			sourceNodeId: loginNodeId,
			targetNodeId: logoutNodeId,
			type: 'success',
			status: 'active'
		};

		// Update flow state
		flowState.loginNodeId = loginNodeId;
		flowState.logoutNodeId = logoutNodeId;
		flowState.connection = connection;
		flowState.isFlowActive = true;

		return {
			logoutNode,
			connection
		};
	};

	const handleLoginSuccess = (loginNodeId: string, userData: any) => {
		console.log('🎯 Login success detected, creating logout node...', { loginNodeId, userData });
		
		const { logoutNode, connection } = createLogoutNode(loginNodeId, userData);
		
		return {
			logoutNode,
			connection
		};
	};

	const handleLogoutSuccess = (logoutNodeId: string) => {
		console.log('🎯 Logout success detected', { logoutNodeId });
		
		// Reset flow state
		flowState.isFlowActive = false;
		flowState.connection = null;
	};

	const resetFlow = () => {
		flowState.loginNodeId = null;
		flowState.logoutNodeId = null;
		flowState.connection = null;
		flowState.isFlowActive = false;
	};

	return {
		flowState,
		createLogoutNode,
		handleLoginSuccess,
		handleLogoutSuccess,
		resetFlow
	};
};
