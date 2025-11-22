<template>
	<div class="advanced-sidebar" :class="{ 'minimized': isMinimized }">
		<!-- Toggle Button -->
		<div class="sidebar-toggle" @click="toggleMinimized">
			<Icon 
				:name="isMinimized ? 'lucide:chevron-right' : 'lucide:chevron-left'" 
				class="toggle-icon" 
			/>
		</div>

		<!-- Minimized View - Icon Only -->
		<div v-if="isMinimized" class="minimized-view">
			<div class="minimized-header">
				<button class="sidebar-toggle" @click="toggleMinimized">
					<Icon name="lucide:chevron-right" class="toggle-icon" />
				</button>
			</div>
			
			<!-- Minimized Tab Navigation -->
			<div class="minimized-tabs">
				<button 
					class="minimized-tab-button" 
					:class="{ active: activeTab === 'nodes' }"
					@click="activeTab = 'nodes'"
					title="Node Library"
				>
					<Icon name="lucide:shapes" class="tab-icon" />
				</button>
				<button 
					class="minimized-tab-button" 
					:class="{ active: activeTab === 'canvas' }"
					@click="activeTab = 'canvas'"
					title="Canvas Management"
				>
					<Icon name="lucide:layers" class="tab-icon" />
				</button>
			</div>

			<!-- Node Library Tab Content -->
			<div v-if="activeTab === 'nodes'">

			<div class="minimized-section">
				<div class="minimized-title">Tech</div>
				<div class="icon-grid">
					<button 
						v-for="tech in programmingIcons" 
						:key="tech.type"
						class="icon-button tech"
						:title="tech.name"
						@click="emit('addNode', tech.type)"
					>
						<Icon :name="tech.icon" class="white-icon" />
					</button>
				</div>
			</div>

			<div class="minimized-section">
				<div class="minimized-title">Actions</div>
				<div class="icon-grid">
					<button 
						v-for="action in actionNodes" 
						:key="action.type"
						class="icon-button actions"
						:title="action.name"
						@click="emit('addNode', action.type)"
					>
						<Icon :name="action.icon" class="white-icon" />
					</button>
				</div>
			</div>

			<div class="minimized-section">
				<div class="minimized-title">Tools</div>
				<div class="icon-grid">
					<button 
						v-for="tool in toolNodes" 
						:key="tool.type"
						class="icon-button tools"
						:title="tool.name"
						@click="emit('addNode', tool.type)"
					>
						<Icon :name="tool.icon" class="white-icon" />
					</button>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="minimized-actions">
				<button class="action-icon-button" title="Clear All" @click="emit('clearAll')">
					<Icon name="lucide:trash-2" class="white-icon" />
				</button>
				<button class="action-icon-button" title="Fit View" @click="emit('fitView')">
					<Icon name="lucide:maximize" class="white-icon" />
				</button>
			</div>
			</div>

			<!-- Canvas Management Tab Content -->
			<div v-if="activeTab === 'canvas'" class="minimized-canvas-section">
				<div class="minimized-section">
					<div class="minimized-title">Canvas</div>
					<div class="icon-grid">
						<button class="icon-button canvas" title="New Canvas" @click="createNewCanvas">
							<Icon name="lucide:plus" class="white-icon" />
						</button>
					</div>
				</div>
				
				<div class="minimized-section">
					<div class="minimized-title">Saved</div>
					<div class="minimized-saved-list">
						<div v-for="canvas in savedCanvases.slice(0, 3)" :key="canvas.id" class="minimized-canvas-item">
							<button 
								class="minimized-canvas-button"
								:title="`Load: ${canvas.name}`"
								@click="loadSavedCanvas(canvas.id)"
							>
								<Icon name="lucide:file-text" class="white-icon" />
							</button>
						</div>
						<div v-if="savedCanvases.length > 3" class="minimized-canvas-item">
							<button class="minimized-canvas-button" title="More canvases">
								<Icon name="lucide:more-horizontal" class="white-icon" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Expanded View - Full Sidebar -->
		<div v-else class="expanded-view">
			<div class="sidebar-header">
				<div class="header-content">
					<h3 class="sidebar-title">Node Canvas</h3>
					<p class="sidebar-subtitle">Drag nodes to canvas to create</p>
				</div>
				<button class="sidebar-toggle" @click="toggleMinimized">
					<Icon name="lucide:chevron-left" class="toggle-icon" />
				</button>
			</div>
			
			<!-- Tab Navigation -->
			<div class="tab-navigation">
				<button 
					class="tab-button" 
					:class="{ active: activeTab === 'nodes' }"
					@click="activeTab = 'nodes'"
				>
					<Icon name="lucide:shapes" class="tab-icon" />
					<span>Nodes</span>
				</button>
				<button 
					class="tab-button" 
					:class="{ active: activeTab === 'canvas' }"
					@click="activeTab = 'canvas'"
				>
					<Icon name="lucide:layers" class="tab-icon" />
					<span>Canvas</span>
				</button>
			</div>

			<!-- Tab Content -->
			<div class="tab-content">
				<!-- Canvas Management Tab -->
				<div v-if="activeTab === 'canvas'" class="canvas-management-section">
				<div class="canvas-name-section">
					<div class="canvas-name-header">
						<Icon name="lucide:file-text" class="section-icon" />
						<span class="section-title">Current Canvas</span>
					</div>
					<div class="canvas-name-input">
						<input
							v-model="canvasName"
							type="text"
							class="canvas-name-field"
							@blur="updateCanvasName"
							@keyup.enter="updateCanvasName"
						/>
					</div>
				</div>

				<!-- Saved Canvases List -->
				<div v-if="savedCanvases.length > 0" class="saved-canvases-section">
					<div class="saved-canvases-header">
						<Icon name="lucide:folder" class="section-icon" />
						<span class="section-title">Saved Canvases</span>
					</div>
					<div class="saved-canvases-list">
						<div
							v-for="canvas in savedCanvases"
							:key="canvas.id"
							class="saved-canvas-item"
							:class="{ 'active': canvas.id === currentCanvasId }"
							@click="loadSavedCanvas(canvas.id)"
						>
							<div class="canvas-item-info">
								<span class="canvas-item-name">{{ canvas.name }}</span>
								<span class="canvas-item-date">{{ formatDate(canvas.updatedAt) }}</span>
							</div>
							<div class="canvas-item-actions">
								<button
									class="canvas-action-btn rename-btn"
									@click.stop="startRenameCanvas(canvas.id, canvas.name)"
									title="Rename canvas"
								>
									<Icon name="lucide:edit-2" class="w-3 h-3" />
								</button>
								<button
									class="canvas-action-btn delete-btn"
									@click.stop="deleteSavedCanvas(canvas.id)"
									title="Delete canvas"
								>
									<Icon name="lucide:trash-2" class="w-3 h-3" />
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- Canvas Actions -->
				<div class="canvas-actions-section">
					<button class="canvas-action-button new-canvas-button" @click="createNewCanvas">
						<Icon name="lucide:plus" class="action-icon" />
						<span>New Canvas</span>
					</button>
				</div>
				</div>

				<!-- Node Library Tab -->
				<div v-if="activeTab === 'nodes'" class="sidebar-content">

				<!-- Programming & Tech Section -->
				<div class="node-section">
					<div class="section-header">
						<Icon name="lucide:code" class="section-icon" />
						<span class="section-title">Technology</span>
					</div>
					<div class="node-grid">
						<button 
							v-for="tech in programmingIcons" 
							:key="tech.type"
							class="node-button tech"
							:title="tech.name"
							@click="emit('addNode', tech.type)"
						>
							<Icon :name="tech.icon" class="node-icon" />
						</button>
					</div>
				</div>

				<!-- Action Nodes Section -->
				<div class="node-section">
					<div class="section-header">
						<Icon name="lucide:zap" class="section-icon" />
						<span class="section-title">Actions & Events</span>
					</div>
					<div class="node-grid">
						<button 
							v-for="action in actionNodes" 
							:key="action.type"
							class="node-button actions"
							:title="action.name"
							@click="emit('addNode', action.type)"
						>
							<Icon :name="action.icon" class="node-icon" />
						</button>
					</div>
				</div>

				<!-- Development Tools Section -->
				<div class="node-section">
					<div class="section-header">
						<Icon name="lucide:settings" class="section-icon" />
						<span class="section-title">Development Tools</span>
					</div>
					<div class="node-grid">
						<button 
							v-for="tool in toolNodes" 
							:key="tool.type"
							class="node-button tools"
							:title="tool.name"
							@click="emit('addNode', tool.type)"
						>
							<Icon :name="tool.icon" class="node-icon" />
						</button>
					</div>
				</div>

				<!-- GitHub Integration -->
				<div v-if="githubRepositories.length > 0" class="node-section">
					<div class="section-header">
						<Icon name="simple-icons:github" class="section-icon" />
						<span class="section-title">GitHub</span>
						<span class="repo-count">{{ githubRepositories.length }}</span>
					</div>
					<div class="node-grid">
						<button 
							class="node-button github-button"
							title="GitHub Repository"
							@click="emit('addNode', 'github')"
						>
							<Icon name="simple-icons:github" class="node-icon" />
						</button>
					</div>
				</div>

				<!-- Canvas Actions -->
				<div class="actions-section">
					<button class="canvas-action-button clear-button" @click="emit('clearAll')">
						<Icon name="lucide:trash-2" class="action-icon" />
						<span>Clear Canvas</span>
					</button>
					<button class="canvas-action-button fit-button" @click="emit('fitView')">
						<Icon name="lucide:maximize" class="action-icon" />
						<span>Fit to View</span>
					</button>
				</div>
				</div>
			</div>
		</div>
	</div>

	<!-- New Canvas Modal -->
	<div v-if="showNewCanvasModal" class="fixed inset-0 z-[9999] flex items-center justify-center">
		<!-- Backdrop -->
		<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cancelCreateNewCanvas" />
		
		<!-- Modal Content -->
		<div class="relative w-full max-w-md mx-4">
			<div class="glassmorphic-panel p-6 border border-primary/20 rounded-xl">
				<!-- Modal Header -->
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-3">
						<Icon name="lucide:plus-circle" class="size-5 text-primary" />
						<h3 class="text-lg font-semibold text-white">
							Create New Canvas
						</h3>
					</div>
					<button
						class="text-white/60 hover:text-white transition-colors"
						@click="cancelCreateNewCanvas"
					>
						<Icon name="lucide:x" class="size-4" />
					</button>
				</div>

				<!-- Form -->
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-white/80 mb-2">
							Canvas Name
						</label>
						<input
							v-model="newCanvasName"
							type="text"
							placeholder="Enter canvas name"
							class="glassmorphic-input w-full px-3 py-2 rounded-lg border border-primary/30 bg-black/20 text-white placeholder-white/50 focus:border-primary/60 focus:outline-none"
							@keyup.enter="confirmCreateNewCanvas"
						>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
					<button
						type="button"
						class="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
						@click="cancelCreateNewCanvas"
					>
						Cancel
					</button>
					<button
						type="button"
						class="px-4 py-2 bg-primary hover:bg-primary/80 text-white text-sm font-medium rounded-lg transition-colors"
						@click="confirmCreateNewCanvas"
					>
						Create Canvas
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, watch } from "vue";
	import { useCanvasPersistence } from "../composables/useCanvasPersistence";

	interface Props {
		githubRepositories: any[]
		nodes?: any[]
		edges?: any[]
		viewport?: { x: number; y: number; zoom: number }
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		addNode: [nodeType: string]
		clearAll: []
		fitView: []
		loadCanvas: [canvasData: any]
		createNewCanvas: []
		canvasNameChanged: [name: string]
		autosave: [canvasData: any]
	}>();

	const isMinimized = ref(false);
	const activeTab = ref<'nodes' | 'canvas'>('nodes');
	const renamingCanvasId = ref<string | null>(null);
	const renamingCanvasName = ref<string>('');

	// Canvas persistence
	const {
		savedCanvases,
		currentCanvasId,
		currentCanvasName,
		createNewCanvas: createNewCanvasPersistence,
		saveCanvas: saveCanvasPersistence,
		loadCanvas: loadCanvasPersistence,
		deleteCanvas: deleteCanvasPersistence,
		renameCanvas: renameCanvasPersistence,
		setCurrentCanvasName
	} = useCanvasPersistence();

	const canvasName = computed({
		get: () => currentCanvasName.value,
		set: (value: string) => setCurrentCanvasName(value)
	});

	const toggleMinimized = () => {
		isMinimized.value = !isMinimized.value;
	};

	// Canvas management methods
	const updateCanvasName = () => {
		emit('canvasNameChanged', canvasName.value);
		// Trigger autosave when name changes
		autosaveCanvas();
	};

	// Autosave when canvas data changes (with debouncing)
	let autosaveTimeout: NodeJS.Timeout | null = null;
	
	watch([() => props.nodes, () => props.edges, () => props.viewport], () => {
		if (props.nodes && props.edges && props.viewport) {
			// Clear existing timeout
			if (autosaveTimeout) {
				clearTimeout(autosaveTimeout);
			}
			// Debounce autosave
			autosaveTimeout = setTimeout(() => {
				autosaveCanvas();
			}, 2000); // 2 second debounce
		}
	}, { deep: true });

	const autosaveCanvas = async () => {
		try {
			// Only autosave if we have actual content
			if (!props.nodes || props.nodes.length === 0) {
				return;
			}
			
			const canvasData = await saveCanvasPersistence(
				props.nodes || [],
				props.edges || [],
				props.viewport || { x: 0, y: 0, zoom: 1 },
				true // isAutosave
			);
			emit('autosave', canvasData);
		} catch (error) {
			console.error('Failed to autosave canvas:', error);
			// Don't show error toasts for autosave failures
		}
	};

	const loadSavedCanvas = async (canvasId: string) => {
		try {
			const canvasData = await loadCanvasPersistence(canvasId);
			emit('loadCanvas', canvasData);
		} catch (error) {
			console.error('Failed to load canvas:', error);
		}
	};

	const showNewCanvasModal = ref(false);
	const newCanvasName = ref('');

	const createNewCanvas = () => {
		showNewCanvasModal.value = true;
		newCanvasName.value = `Canvas ${savedCanvases.value.length + 1}`;
	};

	const confirmCreateNewCanvas = async () => {
		try {
			const newCanvas = createNewCanvasPersistence(newCanvasName.value);
			emit('createNewCanvas');
			emit('loadCanvas', newCanvas);
			showNewCanvasModal.value = false;
			newCanvasName.value = '';
		} catch (error) {
			console.error('Failed to create new canvas:', error);
		}
	};

	const cancelCreateNewCanvas = () => {
		showNewCanvasModal.value = false;
		newCanvasName.value = '';
	};

	const deleteSavedCanvas = async (canvasId: string) => {
		if (confirm('Are you sure you want to delete this canvas? This action cannot be undone.')) {
			await deleteCanvasPersistence(canvasId);
		}
	};

	const startRenameCanvas = (canvasId: string, currentName: string) => {
		renamingCanvasId.value = canvasId;
		renamingCanvasName.value = currentName;
	};

	const confirmRenameCanvas = async () => {
		if (renamingCanvasId.value && renamingCanvasName.value.trim()) {
			await renameCanvasPersistence(renamingCanvasId.value, renamingCanvasName.value.trim());
			renamingCanvasId.value = null;
			renamingCanvasName.value = '';
			// Trigger autosave after rename
			autosaveCanvas();
		}
	};

	const cancelRenameCanvas = () => {
		renamingCanvasId.value = null;
		renamingCanvasName.value = '';
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	// Node definitions with clean white icons
	const basicShapes = [
	];

	const programmingIcons = [
		{ type: 'database', name: 'Database', icon: 'lucide:database' },
		{ type: 'api', name: 'API', icon: 'lucide:plug' },
		{ type: 'server', name: 'Server', icon: 'lucide:server' },
		{ type: 'cloud', name: 'Cloud', icon: 'lucide:cloud' }
	];

	const actionNodes = [
		{ type: 'eventNode', name: 'Event', icon: 'lucide:zap' },
		{ type: 'commandNode', name: 'Command', icon: 'lucide:terminal' },
		{ type: 'viewNode', name: 'View', icon: 'lucide:layout-grid' },
		{ type: 'gitActionNode', name: 'Git Action', icon: 'lucide:git-branch' }
	];

	const toolNodes = [
		{ type: 'hookNode', name: 'Hook', icon: 'lucide:webhook' },
		{ type: 'transportNode', name: 'Transport', icon: 'lucide:truck' },
		{ type: 'templateNode', name: 'Template', icon: 'lucide:file-text' },
		{ type: 'environmentNode', name: 'Environment', icon: 'lucide:settings' },
		{ type: 'buildit-cli', name: 'CLI Check', icon: 'lucide:terminal' },
		{ type: 'rustCheckNode', name: 'Rust Check', icon: 'lucide:wrench' }
	];
</script>

<style scoped>
.advanced-sidebar {
	position: relative;
	background: rgba(var(--color-neutral-rgb), 0.12);
	backdrop-filter: blur(24px) saturate(1.8);
	border-right: 1px solid rgba(var(--color-primary-rgb), 0.25);
	box-shadow: 
		0 0 0 1px rgba(var(--color-primary-rgb), 0.1),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	height: 100%;
	display: flex;
	flex-direction: column;
}

.advanced-sidebar.minimized {
	width: 80px;
}

.advanced-sidebar:not(.minimized) {
	width: 320px;
}

/* Toggle Button */
.sidebar-toggle {
	position: absolute;
	top: 20px;
	right: -12px;
	width: 28px;
	height: 28px;
	background: rgba(var(--color-neutral-rgb), 0.15);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(var(--color-primary-rgb), 0.3);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	z-index: 10;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 
		0 4px 12px rgba(0, 0, 0, 0.15),
		0 0 0 1px rgba(var(--color-primary-rgb), 0.1),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.sidebar-toggle:hover {
	background: rgba(var(--color-primary-rgb), 0.15);
	border-color: rgba(var(--color-primary-rgb), 0.5);
	transform: scale(1.15);
	box-shadow: 
		0 6px 20px rgba(0, 0, 0, 0.2),
		0 0 0 1px rgba(var(--color-primary-rgb), 0.2),
		inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.toggle-icon {
	color: rgba(255, 255, 255, 0.8);
	width: 14px;
	height: 14px;
	transition: all 0.3s ease;
	filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.sidebar-toggle:hover .toggle-icon {
	color: white;
	transform: scale(1.1);
	filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

	/* Minimized View */
.minimized-view {
	padding: 20px 12px;
	display: flex;
	flex-direction: column;
	gap: 20px;
	height: 100%;
	overflow-y: auto;
}

.minimized-section {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.minimized-title {
	font-size: 9px;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.4);
	text-transform: uppercase;
	letter-spacing: 0.8px;
	text-align: center;
	margin-bottom: 6px;
	position: relative;
}

.minimized-title::after {
	content: '';
	position: absolute;
	bottom: -3px;
	left: 50%;
	transform: translateX(-50%);
	width: 12px;
	height: 1px;
	background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
	opacity: 0.6;
}

.icon-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 6px;
}

.icon-button {
	width: 32px;
	height: 32px;
	background: rgba(var(--color-neutral-rgb), 0.08);
	backdrop-filter: blur(8px);
	border: 1px solid rgba(255, 255, 255, 0.06);
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;
}

.icon-button::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.1), transparent);
	opacity: 0;
	transition: opacity 0.3s ease;
}

.icon-button:hover {
	background: rgba(var(--color-neutral-rgb), 0.15);
	border-color: rgba(var(--color-primary-rgb), 0.3);
	transform: translateY(-2px) scale(1.05);
	box-shadow: 
		0 8px 25px rgba(0, 0, 0, 0.15),
		0 0 0 1px rgba(var(--color-primary-rgb), 0.1),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.icon-button:hover::before {
	opacity: 1;
}

/* Color-coded icon styles */
.icon-button.shapes {
	background: rgba(99, 102, 241, 0.1);
	border-color: rgba(99, 102, 241, 0.2);
}

.icon-button.shapes:hover {
	border-color: rgba(99, 102, 241, 0.4);
	box-shadow: 
		0 8px 25px rgba(99, 102, 241, 0.15),
		0 0 0 1px rgba(99, 102, 241, 0.1);
}

.icon-button.flow {
	background: rgba(6, 182, 212, 0.1);
	border-color: rgba(6, 182, 212, 0.2);
}

.icon-button.flow:hover {
	border-color: rgba(6, 182, 212, 0.4);
	box-shadow: 
		0 8px 25px rgba(6, 182, 212, 0.15),
		0 0 0 1px rgba(6, 182, 212, 0.1);
}

.icon-button.tech {
	background: rgba(34, 197, 94, 0.1);
	border-color: rgba(34, 197, 94, 0.2);
}

.icon-button.tech:hover {
	border-color: rgba(34, 197, 94, 0.4);
	box-shadow: 
		0 8px 25px rgba(34, 197, 94, 0.15),
		0 0 0 1px rgba(34, 197, 94, 0.1);
}

.icon-button.actions {
	background: rgba(245, 158, 11, 0.1);
	border-color: rgba(245, 158, 11, 0.2);
}

.icon-button.actions:hover {
	border-color: rgba(245, 158, 11, 0.4);
	box-shadow: 
		0 8px 25px rgba(245, 158, 11, 0.15),
		0 0 0 1px rgba(245, 158, 11, 0.1);
}

.icon-button.tools {
	background: rgba(239, 68, 68, 0.1);
	border-color: rgba(239, 68, 68, 0.2);
}

.icon-button.tools:hover {
	border-color: rgba(239, 68, 68, 0.4);
	box-shadow: 
		0 8px 25px rgba(239, 68, 68, 0.15),
		0 0 0 1px rgba(239, 68, 68, 0.1);
}

.white-icon {
	color: rgba(255, 255, 255, 0.7);
	width: 16px;
	height: 16px;
	transition: all 0.3s ease;
	filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.icon-button:hover .white-icon {
	color: rgba(255, 255, 255, 0.95);
	transform: scale(1.1);
	filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.minimized-actions {
	margin-top: auto;
	padding-top: 16px;
	border-top: 1px solid rgba(75, 85, 99, 0.2);
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.action-icon-button {
	width: 28px;
	height: 28px;
	background: rgba(239, 68, 68, 0.1);
	border: 1px solid rgba(239, 68, 68, 0.3);
	border-radius: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
	margin: 0 auto;
}

.action-icon-button:hover {
	background: rgba(239, 68, 68, 0.2);
	border-color: rgba(239, 68, 68, 0.5);
	transform: translateY(-1px);
}

/* Expanded View */
.expanded-view {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.sidebar-header {
	padding: 24px 20px 20px;
	background: linear-gradient(
		135deg,
		rgba(var(--color-primary-rgb), 0.08) 0%,
		rgba(var(--color-neutral-rgb), 0.04) 100%
	);
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	position: relative;
}

.header-content {
	flex: 1;
}

.sidebar-header::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 20px;
	right: 20px;
	height: 2px;
	background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
	opacity: 0.6;
}

/* Tab Navigation */
.tab-navigation {
	display: flex;
	background: rgba(17, 24, 39, 0.6);
	border-radius: 8px;
	padding: 4px;
	margin: 0 20px 16px;
	gap: 4px;
}

.tab-button {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	padding: 8px 12px;
	background: transparent;
	border: none;
	border-radius: 6px;
	color: rgba(255, 255, 255, 0.6);
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.tab-button:hover {
	color: rgba(255, 255, 255, 0.8);
	background: rgba(59, 130, 246, 0.1);
}

.tab-button.active {
	color: white;
	background: rgba(59, 130, 246, 0.2);
	box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
}

.tab-icon {
	width: 14px;
	height: 14px;
}

/* Minimized Tab Navigation */
.minimized-tabs {
	display: flex;
	background: rgba(17, 24, 39, 0.6);
	border-radius: 6px;
	padding: 2px;
	margin: 0 12px 16px;
	gap: 2px;
}

.minimized-tab-button {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 6px;
	background: transparent;
	border: none;
	border-radius: 4px;
	color: rgba(255, 255, 255, 0.6);
	cursor: pointer;
	transition: all 0.2s ease;
}

.minimized-tab-button:hover {
	color: rgba(255, 255, 255, 0.8);
	background: rgba(59, 130, 246, 0.1);
}

.minimized-tab-button.active {
	color: white;
	background: rgba(59, 130, 246, 0.2);
}

/* Minimized Canvas Section */
.minimized-canvas-section {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.minimized-saved-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.minimized-canvas-item {
	display: flex;
	justify-content: center;
}

.minimized-canvas-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	background: rgba(59, 130, 246, 0.1);
	border: 1px solid rgba(59, 130, 246, 0.2);
	border-radius: 6px;
	color: rgba(255, 255, 255, 0.8);
	cursor: pointer;
	transition: all 0.2s ease;
}

.minimized-canvas-button:hover {
	background: rgba(59, 130, 246, 0.2);
	border-color: rgba(59, 130, 246, 0.4);
	color: white;
	transform: scale(1.05);
}

/* Minimized Header */
.minimized-header {
	display: flex;
	justify-content: center;
	padding: 16px 0 8px;
	border-bottom: 1px solid rgba(75, 85, 99, 0.2);
	margin-bottom: 16px;
}

.sidebar-title {
	font-size: 20px;
	font-weight: 800;
	color: white;
	margin: 0 0 6px 0;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.7));
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.sidebar-subtitle {
	font-size: 14px;
	color: rgba(255, 255, 255, 0.6);
	margin: 0;
	font-weight: 500;
}

.sidebar-content {
	flex: 1;
	padding: 12px 20px;
	display: flex;
	flex-direction: column;
	gap: 12px;
	overflow-y: auto;
	max-height: calc(100vh - 180px);
}

/* Node Sections */
.node-section {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.section-header {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 6px;
	padding: 6px 12px;
	background: rgba(var(--color-neutral-rgb), 0.05);
	border: 1px solid rgba(255, 255, 255, 0.06);
	border-radius: 8px;
	position: relative;
}

.section-header::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.03), transparent);
	border-radius: 8px;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.section-header:hover::before {
	opacity: 1;
}

.section-icon {
	color: var(--color-primary);
	width: 18px;
	height: 18px;
	filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
	transition: all 0.3s ease;
}

.section-header:hover .section-icon {
	transform: scale(1.1);
	filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.section-title {
	font-size: 12px;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.9);
	letter-spacing: 0.3px;
	transition: color 0.3s ease;
}

.section-header:hover .section-title {
	color: white;
}

.repo-count {
	font-size: 11px;
	color: rgba(59, 130, 246, 0.8);
	background: rgba(59, 130, 246, 0.1);
	padding: 2px 6px;
	border-radius: 10px;
	margin-left: auto;
}

.node-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 6px;
}

.node-button {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 10px;
	background: rgba(var(--color-neutral-rgb), 0.08);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(255, 255, 255, 0.06);
	border-radius: 10px;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	text-decoration: none;
	position: relative;
	overflow: hidden;
	aspect-ratio: 1;
}

.node-button::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.05), transparent);
	opacity: 0;
	transition: opacity 0.3s ease;
}

.node-button:hover {
	background: rgba(var(--color-neutral-rgb), 0.15);
	border-color: rgba(var(--color-primary-rgb), 0.25);
	transform: translateY(-3px) scale(1.02);
	box-shadow: 
		0 12px 30px rgba(0, 0, 0, 0.15),
		0 0 0 1px rgba(var(--color-primary-rgb), 0.1),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.node-button:hover::before {
	opacity: 1;
}

/* Color-coded node buttons */
.node-button.shapes {
	background: rgba(99, 102, 241, 0.08);
	border-color: rgba(99, 102, 241, 0.15);
}

.node-button.shapes:hover {
	border-color: rgba(99, 102, 241, 0.3);
	box-shadow: 
		0 12px 30px rgba(99, 102, 241, 0.15),
		0 0 0 1px rgba(99, 102, 241, 0.1);
}

.node-button.flow {
	background: rgba(6, 182, 212, 0.08);
	border-color: rgba(6, 182, 212, 0.15);
}

.node-button.flow:hover {
	border-color: rgba(6, 182, 212, 0.3);
	box-shadow: 
		0 12px 30px rgba(6, 182, 212, 0.15),
		0 0 0 1px rgba(6, 182, 212, 0.1);
}

.node-button.tech {
	background: rgba(34, 197, 94, 0.08);
	border-color: rgba(34, 197, 94, 0.15);
}

.node-button.tech:hover {
	border-color: rgba(34, 197, 94, 0.3);
	box-shadow: 
		0 12px 30px rgba(34, 197, 94, 0.15),
		0 0 0 1px rgba(34, 197, 94, 0.1);
}

.node-button.actions {
	background: rgba(245, 158, 11, 0.08);
	border-color: rgba(245, 158, 11, 0.15);
}

.node-button.actions:hover {
	border-color: rgba(245, 158, 11, 0.3);
	box-shadow: 
		0 12px 30px rgba(245, 158, 11, 0.15),
		0 0 0 1px rgba(245, 158, 11, 0.1);
}

.node-button.tools {
	background: rgba(239, 68, 68, 0.08);
	border-color: rgba(239, 68, 68, 0.15);
}

.node-button.tools:hover {
	border-color: rgba(239, 68, 68, 0.3);
	box-shadow: 
		0 12px 30px rgba(239, 68, 68, 0.15),
		0 0 0 1px rgba(239, 68, 68, 0.1);
}

.node-icon {
	color: rgba(255, 255, 255, 0.6);
	width: 20px;
	height: 20px;
	transition: all 0.3s ease;
	filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.node-button:hover .node-icon {
	color: rgba(255, 255, 255, 0.9);
	transform: scale(1.1);
	filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.node-label {
	font-size: 10px;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.7);
	text-align: center;
	line-height: 1.1;
	transition: all 0.3s ease;
}

.node-button:hover .node-label {
	color: rgba(255, 255, 255, 0.95);
	transform: translateY(-1px);
}

/* Special Button Styles */
.github-button {
	background: rgba(87, 96, 106, 0.3);
	border-color: rgba(87, 96, 106, 0.4);
}

.github-button:hover {
	background: rgba(87, 96, 106, 0.5);
	border-color: rgba(87, 96, 106, 0.6);
}

/* Actions Section */
.actions-section {
	margin-top: auto;
	padding-top: 12px;
	border-top: 1px solid rgba(75, 85, 99, 0.2);
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.canvas-action-button {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 10px;
	background: rgba(239, 68, 68, 0.1);
	border: 1px solid rgba(239, 68, 68, 0.3);
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s ease;
	font-size: 13px;
	font-weight: 500;
	color: rgba(239, 68, 68, 0.9);
}

.canvas-action-button:hover {
	background: rgba(239, 68, 68, 0.2);
	border-color: rgba(239, 68, 68, 0.5);
	color: rgba(239, 68, 68, 1);
	transform: translateY(-1px);
}

.fit-button {
	background: rgba(34, 197, 94, 0.1);
	border-color: rgba(34, 197, 94, 0.3);
	color: rgba(34, 197, 94, 0.9);
}

.fit-button:hover {
	background: rgba(34, 197, 94, 0.2);
	border-color: rgba(34, 197, 94, 0.5);
	color: rgba(34, 197, 94, 1);
}

.action-icon {
	width: 14px;
	height: 14px;
}

/* Canvas Management Styles */
.canvas-management-section {
	padding: 16px 20px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	background: linear-gradient(
		135deg,
		rgba(var(--color-primary-rgb), 0.03) 0%,
		rgba(var(--color-neutral-rgb), 0.02) 100%
	);
}

.canvas-name-section {
	margin-bottom: 16px;
}

.canvas-name-header {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;
}

.canvas-name-field {
	width: 100%;
	padding: 8px 12px;
	background: rgba(var(--color-neutral-rgb), 0.08);
	border: 1px solid rgba(255, 255, 255, 0.06);
	border-radius: 6px;
	color: white;
	font-size: 14px;
	font-weight: 600;
	transition: all 0.3s ease;
}

.canvas-name-field:focus {
	outline: none;
	border-color: rgba(var(--color-primary-rgb), 0.4);
	background: rgba(var(--color-neutral-rgb), 0.12);
	box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.1);
}

.saved-canvases-section {
	margin-bottom: 16px;
}

.saved-canvases-header {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;
}

.saved-canvases-list {
	max-height: 200px;
	overflow-y: auto;
}

.saved-canvas-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 12px;
	margin-bottom: 4px;
	background: rgba(var(--color-neutral-rgb), 0.06);
	border: 1px solid rgba(255, 255, 255, 0.04);
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.3s ease;
}

.saved-canvas-item:hover {
	background: rgba(var(--color-neutral-rgb), 0.1);
	border-color: rgba(var(--color-primary-rgb), 0.2);
	transform: translateX(2px);
}

.saved-canvas-item.active {
	background: rgba(var(--color-primary-rgb), 0.1);
	border-color: rgba(var(--color-primary-rgb), 0.3);
}

.canvas-item-info {
	flex: 1;
	min-width: 0;
}

.canvas-item-name {
	display: block;
	font-size: 13px;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.canvas-item-date {
	display: block;
	font-size: 11px;
	color: rgba(255, 255, 255, 0.5);
	margin-top: 2px;
}

.canvas-item-actions {
	display: flex;
	gap: 4px;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.saved-canvas-item:hover .canvas-item-actions {
	opacity: 1;
}

.canvas-action-btn {
	width: 24px;
	height: 24px;
	background: rgba(var(--color-neutral-rgb), 0.1);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
}

.canvas-action-btn:hover {
	background: rgba(var(--color-neutral-rgb), 0.2);
	border-color: rgba(255, 255, 255, 0.2);
	transform: scale(1.1);
}

.rename-btn:hover {
	background: rgba(var(--color-warning-rgb), 0.2);
	border-color: rgba(var(--color-warning-rgb), 0.3);
}

.delete-btn:hover {
	background: rgba(var(--color-error-rgb), 0.2);
	border-color: rgba(var(--color-error-rgb), 0.3);
}

.canvas-actions-section {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.new-canvas-button {
	background: rgba(var(--color-success-rgb), 0.1);
	border-color: rgba(var(--color-success-rgb), 0.3);
	color: rgba(var(--color-success-rgb), 0.9);
}

.new-canvas-button:hover {
	background: rgba(var(--color-success-rgb), 0.2);
	border-color: rgba(var(--color-success-rgb), 0.5);
	color: var(--color-success);
}

.save-canvas-button {
	background: rgba(var(--color-primary-rgb), 0.1);
	border-color: rgba(var(--color-primary-rgb), 0.3);
	color: rgba(var(--color-primary-rgb), 0.9);
}

.save-canvas-button:hover {
	background: rgba(var(--color-primary-rgb), 0.2);
	border-color: rgba(var(--color-primary-rgb), 0.5);
	color: var(--color-primary);
}

.save-canvas-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	transform: none;
}

/* Scrollbar Styling */
.sidebar-content::-webkit-scrollbar,
.minimized-view::-webkit-scrollbar,
.saved-canvases-list::-webkit-scrollbar {
	width: 4px;
}

.sidebar-content::-webkit-scrollbar-track,
.minimized-view::-webkit-scrollbar-track,
.saved-canvases-list::-webkit-scrollbar-track {
	background: rgba(255, 255, 255, 0.05);
}

.sidebar-content::-webkit-scrollbar-thumb,
.minimized-view::-webkit-scrollbar-thumb,
.saved-canvases-list::-webkit-scrollbar-thumb {
	background: rgba(59, 130, 246, 0.3);
	border-radius: 2px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover,
.minimized-view::-webkit-scrollbar-thumb:hover,
.saved-canvases-list::-webkit-scrollbar-thumb:hover {
	background: rgba(59, 130, 246, 0.5);
}
</style>
