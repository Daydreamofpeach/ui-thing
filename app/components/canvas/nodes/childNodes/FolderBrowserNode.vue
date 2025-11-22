<template>
	<div class="folder-browser-node">
		<div class="node-header">
			<div class="flex items-center gap-2">
				<Icon name="lucide:folder" class="w-4 h-4" />
				<h3 class="text-sm font-semibold">
					{{ customNodeProps.data?.label || 'Folder Browser' }}
				</h3>
			</div>
			<div class="flex items-center gap-1">
				<div class="w-2 h-2 rounded-full" :class="isConfigured ? 'bg-success' : 'bg-neutral'"></div>
				<span class="text-xs" :class="isConfigured ? 'text-success' : 'text-neutral'">
					{{ isConfigured ? 'Folder Selected' : 'No Folder' }}
				</span>
			</div>
		</div>

		<div class="node-content">
			<!-- Current Path Display -->
			<div class="path-display">
				<div class="path-label">
					<Icon name="lucide:folder-open" class="w-3 h-3" />
					<span class="text-xs font-medium">Selected Path:</span>
				</div>
				<div class="path-value">
					{{ selectedPath || 'No folder selected' }}
				</div>
			</div>

			<!-- Folder Selection Actions -->
			<div class="folder-actions">
				<button
					class="action-button primary-button"
					@click="openFolderDialog"
				>
					<Icon name="lucide:folder-plus" class="w-3 h-3" />
					Browse Folder
				</button>
				<button
					v-if="selectedPath"
					class="action-button secondary-button"
					@click="analyzeFolder"
				>
					<Icon name="lucide:search" class="w-3 h-3" />
					Analyze
				</button>
			</div>

			<!-- Analysis Results -->
			<div v-if="analysisResults" class="analysis-results">
				<div class="analysis-header">
					<Icon name="lucide:check-circle" class="w-4 h-4" />
					<span class="text-xs font-medium">Analysis Complete</span>
				</div>
				<div class="analysis-content">
					<div class="analysis-item">
						<span class="analysis-label">Project Type:</span>
						<span class="analysis-value">{{ analysisResults.projectType || 'Unknown' }}</span>
					</div>
					<div class="analysis-item">
						<span class="analysis-label">Framework:</span>
						<span class="analysis-value">{{ analysisResults.framework || 'Not detected' }}</span>
					</div>
					<div class="analysis-item">
						<span class="analysis-label">Package Manager:</span>
						<span class="analysis-value">{{ analysisResults.packageManager || 'Not detected' }}</span>
					</div>
				</div>
			</div>

			<!-- Quick Templates -->
			<div v-if="!selectedPath" class="quick-templates">
				<div class="templates-header">
					<span class="text-xs font-medium">Quick Start Templates:</span>
				</div>
				<div class="templates-grid">
					<div 
						v-for="template in quickTemplates" 
						:key="template.id"
						class="template-card"
						@click="selectTemplate(template)"
					>
						<div class="template-icon">
							<Icon :name="template.icon" class="w-3 h-3" />
						</div>
						<div class="template-name">{{ template.name }}</div>
					</div>
				</div>
			</div>
		</div>

		<div class="node-actions">
			<button
				v-if="isConfigured"
				class="action-button primary-button"
				@click="proceedToNext"
			>
				<Icon name="lucide:arrow-right" class="w-3 h-3" />
				Continue
			</button>
			<button
				v-if="selectedPath"
				class="action-button secondary-button"
				@click="resetSelection"
			>
				<Icon name="lucide:refresh-cw" class="w-3 h-3" />
				Reset
			</button>
		</div>

		<!-- Handles for connections -->
		<Handle
			type="target"
			position="left"
			class="w-3 h-3 bg-gray-400"
		/>
		<Handle
			type="source"
			position="right"
			class="w-3 h-3 bg-orange-500"
			:class="{ 'bg-green-500': isConfigured }"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Handle } from '@vue-flow/core';

interface Props {
	customNodeProps: any;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	'folder-selected': [path: string];
	'analysis-complete': [results: any];
	'proceed-to-next': [data: any];
	'node-updated': [nodeId: string, data: any];
}>();

const selectedPath = ref<string | null>(props.customNodeProps?.data?.selectedPath || null);
const analysisResults = ref<any>(props.customNodeProps?.data?.analysisResults || null);

const isConfigured = computed(() => !!selectedPath.value && !!analysisResults.value);

const quickTemplates = ref([
	{ id: 'react', name: 'React', icon: 'lucide:atom' },
	{ id: 'vue', name: 'Vue', icon: 'lucide:layers' },
	{ id: 'angular', name: 'Angular', icon: 'lucide:hexagon' },
	{ id: 'nextjs', name: 'Next.js', icon: 'lucide:zap' },
	{ id: 'nuxt', name: 'Nuxt', icon: 'lucide:nuxt' },
	{ id: 'svelte', name: 'Svelte', icon: 'lucide:circle' }
]);

const openFolderDialog = async () => {
	try {
		// Use Tauri's dialog API to open folder selection
		const { open } = await import('@tauri-apps/plugin-dialog');
		const selected = await open({
			directory: true,
			multiple: false,
			title: 'Select Project Folder'
		});

		if (selected) {
			selectedPath.value = selected as string;
			emit('folder-selected', selected as string);
			emit('node-updated', props.customNodeProps.id, { 
				selectedPath: selected as string,
				analysisResults: null 
			});
		}
	} catch (error) {
		console.error('Failed to open folder dialog:', error);
	}
};

const analyzeFolder = async () => {
	if (!selectedPath.value) return;

	try {
		// Simulate folder analysis
		const mockAnalysis = {
			projectType: 'Web Application',
			framework: 'React',
			packageManager: 'npm',
			hasGit: true,
			hasPackageJson: true,
			hasConfigFiles: true
		};

		analysisResults.value = mockAnalysis;
		emit('analysis-complete', mockAnalysis);
		emit('node-updated', props.customNodeProps.id, { 
			selectedPath: selectedPath.value,
			analysisResults: mockAnalysis 
		});
	} catch (error) {
		console.error('Failed to analyze folder:', error);
	}
};

const selectTemplate = (template: any) => {
	// Simulate template selection
	selectedPath.value = `/templates/${template.id}`;
	analysisResults.value = {
		projectType: 'Template',
		framework: template.name,
		packageManager: 'npm',
		hasGit: false,
		hasPackageJson: true,
		hasConfigFiles: true,
		isTemplate: true
	};

	emit('folder-selected', selectedPath.value);
	emit('analysis-complete', analysisResults.value);
	emit('node-updated', props.customNodeProps.id, { 
		selectedPath: selectedPath.value,
		analysisResults: analysisResults.value 
	});
};

const proceedToNext = () => {
	if (isConfigured.value) {
		emit('proceed-to-next', {
			path: selectedPath.value,
			analysis: analysisResults.value
		});
	}
};

const resetSelection = () => {
	selectedPath.value = null;
	analysisResults.value = null;
	emit('node-updated', props.customNodeProps.id, { 
		selectedPath: null,
		analysisResults: null 
	});
};
</script>

<style scoped>
.folder-browser-node {
	width: 320px;
	background: #1f2937;
	border: 1px solid #374151;
	border-radius: 0.5rem;
	padding: 0.75rem;
	position: relative;
}

.node-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 0.75rem;
	padding-bottom: 0.5rem;
	border-bottom: 1px solid #374151;
}

.node-header h3 {
	color: #f97316;
}

.node-content {
	margin-bottom: 0.75rem;
}

.path-display {
	margin-bottom: 0.75rem;
	padding: 0.5rem;
	background: rgba(55, 65, 81, 0.3);
	border-radius: 0.375rem;
	border: 1px solid #374151;
}

.path-label {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	margin-bottom: 0.25rem;
	color: #9ca3af;
}

.path-value {
	font-size: 0.625rem;
	color: #d1d5db;
	word-break: break-all;
}

.folder-actions {
	display: flex;
	gap: 0.5rem;
	margin-bottom: 0.75rem;
}

.analysis-results {
	background: rgba(34, 197, 94, 0.1);
	border: 1px solid rgba(34, 197, 94, 0.3);
	border-radius: 0.375rem;
	padding: 0.5rem;
	margin-bottom: 0.75rem;
}

.analysis-header {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	margin-bottom: 0.5rem;
}

.analysis-header svg {
	color: #22c55e;
}

.analysis-header span {
	color: #22c55e;
}

.analysis-content {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.analysis-item {
	display: flex;
	justify-content: space-between;
	font-size: 0.625rem;
}

.analysis-label {
	color: #9ca3af;
}

.analysis-value {
	color: #d1d5db;
	font-weight: 500;
}

.quick-templates {
	margin-bottom: 0.75rem;
}

.templates-header {
	margin-bottom: 0.5rem;
}

.templates-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 0.25rem;
}

.template-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.25rem;
	padding: 0.5rem;
	background: rgba(55, 65, 81, 0.3);
	border: 1px solid #374151;
	border-radius: 0.25rem;
	cursor: pointer;
	transition: all 0.2s;
}

.template-card:hover {
	background: rgba(55, 65, 81, 0.5);
	border-color: #4b5563;
}

.template-icon {
	width: 1.5rem;
	height: 1.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(55, 65, 81, 0.5);
	border-radius: 0.25rem;
}

.template-name {
	font-size: 0.625rem;
	color: #d1d5db;
	text-align: center;
}

.node-actions {
	display: flex;
	gap: 0.5rem;
	justify-content: flex-end;
}

.action-button {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0.25rem 0.5rem;
	font-size: 0.625rem;
	border-radius: 0.25rem;
	border: none;
	cursor: pointer;
	transition: all 0.2s;
}

.primary-button {
	background: #f97316;
	color: white;
}

.primary-button:hover {
	background: #ea580c;
}

.secondary-button {
	background: #6b7280;
	color: white;
}

.secondary-button:hover {
	background: #4b5563;
}
</style>
