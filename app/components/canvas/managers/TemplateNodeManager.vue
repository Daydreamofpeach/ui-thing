<template>
	<div class="template-node-manager">
		<!-- Template Node Creation Panel -->
		<div v-if="showCreationPanel" class="creation-panel">
			<div class="panel-header">
				<h3 class="text-sm font-semibold">Template Workflow Nodes</h3>
				<button 
					class="close-button"
					@click="closeCreationPanel"
				>
					<Icon name="lucide:x" class="w-4 h-4" />
				</button>
			</div>
			
			<div class="nodes-grid">
				<!-- Project Type Selector -->
				<div class="node-card" @click="createProjectTypeSelector">
					<div class="node-icon">
						<Icon name="lucide:folder-open" class="w-5 h-5" />
					</div>
					<div class="node-info">
						<div class="node-title">Project Type</div>
						<div class="node-description">Select project type</div>
					</div>
				</div>

				<!-- Folder Browser -->
				<div class="node-card" @click="createFolderBrowser">
					<div class="node-icon">
						<Icon name="lucide:folder" class="w-5 h-5" />
					</div>
					<div class="node-info">
						<div class="node-title">Folder Browser</div>
						<div class="node-description">Browse and analyze folders</div>
					</div>
				</div>

				<!-- Intent Analysis -->
				<div class="node-card" @click="createIntentAnalysis">
					<div class="node-icon">
						<Icon name="lucide:lightbulb" class="w-5 h-5" />
					</div>
					<div class="node-info">
						<div class="node-title">Intent Analysis</div>
						<div class="node-description">Analyze project intent</div>
					</div>
				</div>

				<!-- Technology Stack -->
				<div class="node-card" @click="createTechnologyStack">
					<div class="node-icon">
						<Icon name="lucide:layers" class="w-5 h-5" />
					</div>
					<div class="node-info">
						<div class="node-title">Tech Stack</div>
						<div class="node-description">Select technology stack</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Floating Action Button -->
		<button 
			v-if="!showCreationPanel"
			class="fab-button"
			@click="showCreationPanel = true"
			title="Add Template Nodes"
		>
			<Icon name="lucide:plus" class="w-5 h-5" />
		</button>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
	onCreateNode: (node: any) => void;
	onCreateEdge: (edge: any) => void;
}

const props = defineProps<Props>();

const showCreationPanel = ref(false);

const closeCreationPanel = () => {
	showCreationPanel.value = false;
};

const createProjectTypeSelector = () => {
	const nodeId = `projectTypeSelector_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	const node = {
		id: nodeId,
		type: 'projectTypeSelector',
		position: { x: 100, y: 100 },
		data: {
			label: 'Project Type Selector',
			selectedType: null
		}
	};
	props.onCreateNode(node);
	closeCreationPanel();
};

const createFolderBrowser = () => {
	const nodeId = `folderBrowser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	const node = {
		id: nodeId,
		type: 'folderBrowser',
		position: { x: 400, y: 100 },
		data: {
			label: 'Folder Browser',
			selectedPath: null,
			analysisResults: null
		}
	};
	props.onCreateNode(node);
	closeCreationPanel();
};

const createIntentAnalysis = () => {
	const nodeId = `intentAnalysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	const node = {
		id: nodeId,
		type: 'intentAnalysis',
		position: { x: 700, y: 100 },
		data: {
			label: 'Intent Analysis',
			intentDescription: '',
			analysisResults: null,
			selectedStack: null
		}
	};
	props.onCreateNode(node);
	closeCreationPanel();
};

const createTechnologyStack = () => {
	const nodeId = `technologyStack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	const node = {
		id: nodeId,
		type: 'technologyStack',
		position: { x: 1000, y: 100 },
		data: {
			label: 'Technology Stack',
			selectedStack: null,
			configOptions: {
				typescript: false,
				testing: false,
				database: 'none'
			}
		}
	};
	props.onCreateNode(node);
	closeCreationPanel();
};
</script>

<style scoped>
.template-node-manager {
	position: relative;
}

.creation-panel {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background: #1f2937;
	border: 1px solid #374151;
	border-radius: 0.75rem;
	padding: 1.5rem;
	min-width: 500px;
	max-width: 600px;
	z-index: 1000;
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 1.5rem;
	padding-bottom: 1rem;
	border-bottom: 1px solid #374151;
}

.panel-header h3 {
	color: #d1d5db;
	font-size: 1rem;
}

.close-button {
	background: none;
	border: none;
	color: #9ca3af;
	cursor: pointer;
	padding: 0.25rem;
	border-radius: 0.25rem;
	transition: all 0.2s;
}

.close-button:hover {
	background: rgba(55, 65, 81, 0.5);
	color: #d1d5db;
}

.nodes-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 1rem;
}

.node-card {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 1rem;
	background: rgba(55, 65, 81, 0.3);
	border: 1px solid #374151;
	border-radius: 0.5rem;
	cursor: pointer;
	transition: all 0.2s;
}

.node-card:hover {
	background: rgba(55, 65, 81, 0.5);
	border-color: #4b5563;
	transform: translateY(-1px);
}

.node-icon {
	width: 2.5rem;
	height: 2.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(55, 65, 81, 0.5);
	border-radius: 0.5rem;
	border: 1px solid #374151;
}

.node-icon svg {
	color: #3b82f6;
}

.node-info {
	flex: 1;
}

.node-title {
	font-size: 0.875rem;
	font-weight: 500;
	color: #d1d5db;
	margin-bottom: 0.25rem;
}

.node-description {
	font-size: 0.75rem;
	color: #9ca3af;
}

.fab-button {
	position: fixed;
	bottom: 2rem;
	right: 2rem;
	width: 3rem;
	height: 3rem;
	background: #3b82f6;
	border: none;
	border-radius: 50%;
	color: white;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	transition: all 0.2s;
	z-index: 100;
}

.fab-button:hover {
	background: #2563eb;
	transform: scale(1.05);
	box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}
</style>
