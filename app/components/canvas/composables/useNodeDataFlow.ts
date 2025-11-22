import { ref, computed, watch, readonly } from 'vue';

export interface ConnectedData {
	sourceType: string;
	sourceNodeId: string;
	data: any;
	timestamp: string;
}

export interface NodeConnection {
	sourceNodeId: string;
	targetNodeId: string;
	connectionType: string;
}

export function useNodeDataFlow() {
	// Store connected data for each node
	const nodeData = ref<Map<string, ConnectedData>>(new Map());
	
	// Store connections between nodes
	const connections = ref<NodeConnection[]>([]);

	// Get connected data for a specific node
	const getConnectedData = (nodeId: string): ConnectedData | null => {
		return nodeData.value.get(nodeId) || null;
	};

	// Set connected data for a node
	const setConnectedData = (nodeId: string, data: ConnectedData) => {
		nodeData.value.set(nodeId, data);
	};

	// Clear connected data for a node
	const clearConnectedData = (nodeId: string) => {
		nodeData.value.delete(nodeId);
	};

	// Add a connection between nodes
	const addConnection = (sourceNodeId: string, targetNodeId: string, connectionType: string = 'data-flow') => {
		const connection: NodeConnection = {
			sourceNodeId,
			targetNodeId,
			connectionType
		};
		
		// Remove existing connection if it exists
		removeConnection(sourceNodeId, targetNodeId);
		
		connections.value.push(connection);
	};

	// Remove a connection between nodes
	const removeConnection = (sourceNodeId: string, targetNodeId: string) => {
		const index = connections.value.findIndex(
			conn => conn.sourceNodeId === sourceNodeId && conn.targetNodeId === targetNodeId
		);
		
		if (index > -1) {
			connections.value.splice(index, 1);
		}
	};

	// Get all connections for a specific node
	const getNodeConnections = (nodeId: string): NodeConnection[] => {
		return connections.value.filter(
			conn => conn.sourceNodeId === nodeId || conn.targetNodeId === nodeId
		);
	};

	// Get source nodes connected to a target node
	const getSourceNodes = (targetNodeId: string): string[] => {
		return connections.value
			.filter(conn => conn.targetNodeId === targetNodeId)
			.map(conn => conn.sourceNodeId);
	};

	// Get target nodes connected from a source node
	const getTargetNodes = (sourceNodeId: string): string[] => {
		return connections.value
			.filter(conn => conn.sourceNodeId === sourceNodeId)
			.map(conn => conn.targetNodeId);
	};

	// Process data flow from source to target nodes
	const processDataFlow = (sourceNodeId: string, data: any, sourceType: string) => {
		// Update source node data
		setConnectedData(sourceNodeId, {
			sourceType,
			sourceNodeId,
			data,
			timestamp: new Date().toISOString()
		});

		// Find all target nodes connected to this source
		const targetNodes = getTargetNodes(sourceNodeId);
		
		// Process each target node
		targetNodes.forEach(targetNodeId => {
			// Transform data based on target node type and connection
			const transformedData = transformDataForTarget(data, sourceType, targetNodeId);
			
			// Set the transformed data for the target node
			setConnectedData(targetNodeId, {
				sourceType,
				sourceNodeId,
				data: transformedData,
				timestamp: new Date().toISOString()
			});
		});
	};

	// Transform data based on target node type
	const transformDataForTarget = (data: any, sourceType: string, targetNodeId: string): any => {
		// This is where we can add specific transformation logic
		// based on the source and target node types
		
		// For now, return the data as-is
		// In the future, we can add specific transformations like:
		// - GitHub repo data -> JSON format for view nodes
		// - Command output -> structured data
		// - Event data -> formatted display data
		
		return data;
	};

	// Get GitHub repository data in a format suitable for view nodes
	const getGitHubRepoData = (repoData: any) => {
		return {
			repository: {
				name: repoData.repositoryName || 'Unknown',
				description: repoData.repositoryDescription || '',
				language: repoData.language || 'Unknown',
				stars: repoData.stars || 0,
				forks: repoData.forks || 0,
				visibility: repoData.isPrivate ? 'Private' : 'Public',
				url: repoData.url || '',
				createdAt: repoData.createdAt || '',
				updatedAt: repoData.updatedAt || ''
			},
			metadata: {
				sourceType: 'github',
				timestamp: new Date().toISOString(),
				nodeId: repoData.id || ''
			}
		};
	};

	// Clear all data and connections
	const clearAll = () => {
		nodeData.value.clear();
		connections.value = [];
	};

	return {
		// State
		nodeData: readonly(nodeData),
		connections: readonly(connections),
		
		// Methods
		getConnectedData,
		setConnectedData,
		clearConnectedData,
		addConnection,
		removeConnection,
		getNodeConnections,
		getSourceNodes,
		getTargetNodes,
		processDataFlow,
		getGitHubRepoData,
		clearAll
	};
}
