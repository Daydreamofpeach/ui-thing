<template>
	<div class="node-chain-manager">
		<!-- This component manages the chain of nodes but doesn't render anything visible -->
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
	allNodes: any[];
	edges: any[];
	templateNodes: any[];
	intentSelectionNodes: any[];
	projectExplorerNodes: any[];
	onCreateProjectExplorerNode: (intentNode: any) => any;
	onCreateEdge: (sourceId: string, targetId: string) => any;
	onUpdateNode: (nodeId: string, data: any) => void;
}

const props = defineProps<Props>();

// Track which nodes have been created in the chain
const createdChainNodes = ref<Set<string>>(new Set());

// Watch for template node updates to trigger chain progression
watch(() => props.templateNodes, (newTemplateNodes) => {
	newTemplateNodes.forEach(node => {
		handleNodeUpdate(node);
	});
}, { deep: true });

// Watch for intent selection node updates
watch(() => props.intentSelectionNodes, (newIntentNodes) => {
	console.log('NodeChainManager: intentSelectionNodes watcher triggered');
	console.log('New intent nodes:', newIntentNodes);
	newIntentNodes.forEach(node => {
		handleIntentNodeUpdate(node);
	});
}, { deep: true });

// Watch for project explorer node updates
watch(() => props.projectExplorerNodes, (newProjectExplorerNodes) => {
	newProjectExplorerNodes.forEach(node => {
		handleProjectExplorerNodeUpdate(node);
	});
}, { deep: true });

const handleNodeUpdate = (node: any) => {
	// NodeChainManager should NOT handle template node updates
	// The template node chain logic in CanvasPanel handles this
	// This prevents conflicts between the two systems
	console.log('NodeChainManager: handleNodeUpdate called for template node - delegating to template chain logic');
};

const handleIntentNodeUpdate = (node: any) => {
	console.log('NodeChainManager: handleIntentNodeUpdate called with:', node);
	console.log('Node type:', node.type);
	console.log('Node data:', node.data);
	console.log('Selected project type:', node.data?.selectedProjectType);
	console.log('Selected folder path:', node.data?.selectedFolderPath);
	console.log('Folder analysis:', node.data?.folderAnalysis);
	
	// Check if we've already created the next node for this intent node
	const chainKey = `intent_${node.id}`;
	if (createdChainNodes.value.has(chainKey)) {
		console.log('NodeChainManager: Next node already created for this intent node');
		return;
	}
	
	// Check if this is an intent selection node that just got configured
	if (node.type === 'intentSelection' && node.data?.selectedProjectType) {
		
		// For 'existing' projects, WAIT for folder selection before creating ProjectExplorerNode
		if (node.data.selectedProjectType === 'existing') {
			// Only create ProjectExplorerNode if we have the folder path
			if (node.data.selectedFolderPath) {
				console.log('NodeChainManager: Creating project explorer node for existing project');
				console.log('NodeChainManager: Folder path for project explorer:', node.data.selectedFolderPath);
				createProjectExplorerNode(node);
				// Mark as created only after successful creation
				createdChainNodes.value.add(chainKey);
				console.log('NodeChainManager: Marked chain key as created:', chainKey);
			} else {
				console.log('NodeChainManager: Waiting for folder selection before creating project explorer node');
			}
		} else {
			// For 'new' or 'template', create framework selection immediately
			console.log('NodeChainManager: Creating framework selection node for new/template project');
			createFrameworkSelectionNode(node);
			// Mark as created only after successful creation
			createdChainNodes.value.add(chainKey);
			console.log('NodeChainManager: Marked chain key as created:', chainKey);
		}
	} else {
		console.log('NodeChainManager: Intent node not ready for chain progression');
		console.log('NodeChainManager: Reason - type:', node.type, 'selectedProjectType:', node.data?.selectedProjectType);
	}
};

const handleProjectExplorerNodeUpdate = (node: any) => {
	// Check if this is a project explorer node that just got configured
	if (node.type === 'projectExplorer' && 
		node.data?.analysis && 
		!createdChainNodes.value.has('frameworkSelection')) {
		createFrameworkSelectionNode(node);
	}
};

// Note: createIntentSelectionNode is now handled by the template node chain logic in CanvasPanel
// This prevents conflicts between the two systems

const createProjectExplorerNode = (intentNode: any) => {
	console.log('NodeChainManager: Creating project explorer node for intent:', intentNode);
	console.log('NodeChainManager: Intent node data:', intentNode.data);
	
	// Validate input
	if (!intentNode || !intentNode.data) {
		console.error('NodeChainManager: Invalid intent node provided:', intentNode);
		return;
	}
	
	// Create the project explorer node
	const node = props.onCreateProjectExplorerNode(intentNode);
	console.log('NodeChainManager: Created project explorer node:', node);
	
	// Validate the created node
	if (!node) {
		console.error('NodeChainManager: Failed to create project explorer node');
		return;
	}
	
	console.log('NodeChainManager: Created node data:', node.data);
	console.log('NodeChainManager: Created node projectPath:', node.data?.projectPath);
	console.log('NodeChainManager: Created node selectedFolderPath:', node.data?.selectedFolderPath);
	
	// Wait for the node to be processed by VueFlow before creating the edge
	setTimeout(() => {
		console.log('NodeChainManager: Creating edge between:', intentNode.id, 'and', node.id);
		props.onCreateEdge(intentNode.id, node.id);
	}, 200);
	console.log('NodeChainManager: Added projectExplorer to created chain nodes');
};

const createFrameworkSelectionNode = (intentNode: any) => {
	// For now, just log that we would create a framework selection node
	console.log('Would create framework selection node for intent:', intentNode);
	createdChainNodes.value.add('frameworkSelection');
};

// Reset chain when template node is reset
const resetChain = () => {
	createdChainNodes.value.clear();
};
</script>

<style scoped>
.node-chain-manager {
	display: none;
}
</style>