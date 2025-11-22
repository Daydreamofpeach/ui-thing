<template>
	<div v-if="isActive" class="chain-creation-process">
		<!-- Process Overlay -->
		<div class="process-overlay" @click.self="cancelProcess">
			<div class="process-modal">
				<div class="modal-header">
					<div class="header-content">
						<UIcon name="i-lucide-git-branch" class="header-icon" />
						<div class="header-text">
							<h3 class="modal-title">
								Create Chain Template
							</h3>
							<p class="modal-subtitle">
								Build a reusable node chain workflow
							</p>
						</div>
					</div>
					<button class="close-btn" @click="cancelProcess">
						<UIcon name="i-lucide-x" class="size-4" />
					</button>
				</div>

				<div class="modal-content">
					<!-- Step Indicator -->
					<div class="step-indicator">
						<div
							v-for="(step, index) in steps"
							:key="step.id"
							class="step-item"
							:class="{ active: currentStep === index, completed: index < currentStep }"
						>
							<div class="step-number">
								<UIcon v-if="index < currentStep" name="i-lucide-check" class="size-3" />
								<span v-else>{{ index + 1 }}</span>
							</div>
							<span class="step-label">{{ step.label }}</span>
						</div>
					</div>

					<!-- Step Content -->
					<div class="step-content">
						<!-- Step 1: Chain Setup -->
						<div v-if="currentStep === 0" class="step-pane">
							<div class="form-section">
								<div class="form-group">
									<label class="form-label">
										<UIcon name="i-lucide-tag" class="size-3" />
										Chain Name
									</label>
									<input
										v-model="chainData.name"
										type="text"
										class="form-input"
										placeholder="Enter chain name..."
									>
								</div>
								<div class="form-group">
									<label class="form-label">
										<UIcon name="i-lucide-file-text" class="size-3" />
										Description
									</label>
									<textarea
										v-model="chainData.description"
										class="form-textarea"
										placeholder="Describe what this chain does..."
										rows="3"
									/>
								</div>
								<div class="form-group">
									<label class="form-label">
										<UIcon name="i-lucide-layers" class="size-3" />
										Category
									</label>
									<select v-model="chainData.category" class="form-select">
										<option value="automation">
											Automation
										</option>
										<option value="form-processing">
											Form Processing
										</option>
										<option value="data-flow">
											Data Flow
										</option>
										<option value="api-integration">
											API Integration
										</option>
										<option value="custom">
											Custom
										</option>
									</select>
								</div>
							</div>
						</div>

						<!-- Step 2: Node Selection -->
						<div v-if="currentStep === 1" class="step-pane">
							<div class="nodes-section">
								<div class="section-header">
									<h4 class="section-title">
										Select Nodes for Chain
									</h4>
									<p class="section-description">
										Choose which nodes will be part of this chain template
									</p>
								</div>
								<div class="nodes-grid">
									<div
										v-for="node in availableNodes"
										:key="node.id"
										class="node-selector"
										:class="{ selected: selectedNodes.includes(node.id) }"
										@click="toggleNodeSelection(node.id)"
									>
										<div class="node-icon">
											<UIcon :name="getNodeIcon(node.type)" class="size-4" />
										</div>
										<div class="node-info">
											<span class="node-name">{{ node.data?.label || node.type }}</span>
											<span class="node-type">{{ node.type }}</span>
										</div>
										<div class="selection-indicator">
											<UIcon name="i-lucide-check" class="size-3" />
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Step 3: Connection Style -->
						<div v-if="currentStep === 2" class="step-pane">
							<div class="style-section">
								<div class="section-header">
									<h4 class="section-title">
										Connection Style
									</h4>
									<p class="section-description">
										Customize how connections look and behave
									</p>
								</div>
								
								<ConnectionStyleConfig v-model="connectionStyle" />
								
								<!-- Live Preview -->
								<div class="style-preview">
									<div class="preview-header">
										<UIcon name="i-lucide-eye" class="size-3" />
										<span>Preview</span>
									</div>
									<div class="preview-connections">
										<div 
											class="preview-connection-line"
											:style="{
												background: connectionStyle.color,
												height: `${connectionStyle.strokeWidth}px`,
												opacity: connectionStyle.animated ? '0.8' : '1'
											}"
										>
											<div v-if="connectionStyle.animated" class="preview-animation" />
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Step 4: Node Layout -->
						<div v-if="currentStep === 3" class="step-pane">
							<div class="layout-section">
								<div class="section-header">
									<h4 class="section-title">
										Node Layout
									</h4>
									<p class="section-description">
										Choose how nodes are arranged on the canvas
									</p>
								</div>
								
								<NodeLayoutConfig v-model="layoutConfig" />
							</div>
						</div>

						<!-- Step 5: Preview & Save -->
						<div v-if="currentStep === 4" class="step-pane">
							<div class="preview-section">
								<div class="section-header">
									<h4 class="section-title">
										Chain Preview
									</h4>
									<p class="section-description">
										Review your chain template before saving
									</p>
								</div>

								<div class="preview-card">
									<div class="preview-header">
										<div class="preview-icon">
											<UIcon name="i-lucide-git-branch" class="size-4" />
										</div>
										<div class="preview-info">
											<h5 class="preview-name">
												{{ chainData.name }}
											</h5>
											<p class="preview-description">
												{{ chainData.description }}
											</p>
										</div>
									</div>

									<div class="preview-stats">
										<div class="stat-item">
											<span class="stat-label">Nodes:</span>
											<span class="stat-value">{{ selectedNodes.length }}</span>
										</div>
										<div class="stat-item">
											<span class="stat-label">Category:</span>
											<span class="stat-value">{{ chainData.category }}</span>
										</div>
										<div class="stat-item">
											<span class="stat-label">Connections:</span>
											<span class="stat-value">{{ selectedNodes.length - 1 }}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Modal Actions -->
					<div class="modal-actions">
						<button class="action-btn secondary-btn" @click="cancelProcess">
							Cancel
						</button>

						<div class="primary-actions">
							<button
								v-if="currentStep > 0"
								class="action-btn secondary-btn"
								@click="previousStep"
							>
								<UIcon name="i-lucide-chevron-left" class="size-3" />
								Previous
							</button>

							<button
								v-if="currentStep < steps.length - 1"
								class="action-btn primary-btn"
								:disabled="!canProceedToNext"
								@click="nextStep"
							>
								Next
								<UIcon name="i-lucide-chevron-right" class="size-3" />
							</button>

							<button
								v-if="currentStep === steps.length - 1"
								class="action-btn primary-btn"
								:disabled="!canSaveChain"
								@click="saveChain"
							>
								<UIcon name="i-lucide-save" class="size-3" />
								Save Chain Template
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import ConnectionStyleConfig from "./ConnectionStyleConfig.vue";
	import NodeLayoutConfig from "./NodeLayoutConfig.vue";

	interface Props {
		nodes?: any[]
		edges?: any[]
		isActive?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		nodes: () => [],
		edges: () => [],
		isActive: false
	});

	const emit = defineEmits<{
		saveChain: [chainData: any]
		cancel: []
	}>();

	const currentStep = ref(0);
	const selectedNodes = ref<string[]>([]);
	const chainData = ref({
		name: "",
		description: "",
		category: "automation",
		defaultConnectionType: "smoothstep"
	});

	const connectionStyle = ref({
		color: "#8b5cf6",
		animationType: "flow",
		animationSpeed: "normal",
		strokeWidth: 2,
		type: "smoothstep",
		animated: true
	});

	const layoutConfig = ref({
		layout: "horizontal",
		spacing: 200
	});

	const steps = [
		{ id: "setup", label: "Setup" },
		{ id: "nodes", label: "Nodes" },
		{ id: "style", label: "Style" },
		{ id: "layout", label: "Layout" },
		{ id: "preview", label: "Preview" }
	];

	const availableNodes = computed(() =>
		props.nodes.filter((node) => node.type !== "viewport")
	);

	const canProceedToNext = computed(() => {
		switch (currentStep.value) {
		case 0:
			return chainData.value.name.trim().length > 0;
		case 1:
			return selectedNodes.value.length >= 2;
		case 2:
			return true;
		default:
			return true;
		}
	});

	const canSaveChain = computed(() => {
		return chainData.value.name.trim().length > 0
			&& selectedNodes.value.length >= 2
			&& chainData.value.description.trim().length > 0;
	});

	const getNodeById = (nodeId: string) => {
		return props.nodes.find((n) => n.id === nodeId);
	};

	const getNodeIcon = (nodeType?: string) => {
		const iconMap: Record<string, string> = {
			templateNode: "i-lucide-layout-template",
			browserNode: "i-lucide-globe",
			formsPanelNode: "i-lucide-file-text",
			transportNode: "i-lucide-send",
			hookNode: "i-lucide-webhook",
			viewportNode: "i-lucide-monitor"
		};
		return iconMap[nodeType || ""] || "i-lucide-circle";
	};

	const toggleNodeSelection = (nodeId: string) => {
		const index = selectedNodes.value.indexOf(nodeId);
		if (index > -1) {
			selectedNodes.value.splice(index, 1);
		} else {
			selectedNodes.value.push(nodeId);
		}
	};

	const nextStep = () => {
		if (canProceedToNext.value && currentStep.value < steps.length - 1) {
			currentStep.value++;
		}
	};

	const previousStep = () => {
		if (currentStep.value > 0) {
			currentStep.value--;
		}
	};

	const saveChain = () => {
		if (!canSaveChain.value) return;

		const chainTemplate = {
			name: chainData.value.name,
			description: chainData.value.description,
			category: chainData.value.category,
			defaultConnectionType: chainData.value.defaultConnectionType,
			nodes: selectedNodes.value.map((nodeId) => getNodeById(nodeId)).filter(Boolean),
			connections: generateChainConnections(),
			connectionStyle: connectionStyle.value,
			layoutConfig: layoutConfig.value,
			createdAt: new Date().toISOString(),
			type: "canvasChainTemplate"
		};

		emit("saveChain", chainTemplate);
		resetProcess();
	};

	const generateChainConnections = () => {
		const connections = [];
		for (let i = 0; i < selectedNodes.value.length - 1; i++) {
			const sourceId = selectedNodes.value[i];
			const targetId = selectedNodes.value[i + 1];

			connections.push({
				source: sourceId as string,
				target: targetId as string,
				sourceHandle: "right", // Match the actual VueFlow handle IDs
				targetHandle: "left", // Match the actual VueFlow handle IDs
				type: connectionStyle.value.type,
				animated: connectionStyle.value.animated,
				animationType: connectionStyle.value.animationType,
				animationSpeed: connectionStyle.value.animationSpeed,
				style: {
					stroke: connectionStyle.value.color,
					strokeWidth: connectionStyle.value.strokeWidth
				},
				markerEnd: {
					type: "arrowclosed",
					color: connectionStyle.value.color
				}
			});
		}
		return connections;
	};

	const cancelProcess = () => {
		resetProcess();
		emit("cancel");
	};

	const resetProcess = () => {
		currentStep.value = 0;
		selectedNodes.value = [];
		chainData.value = {
			name: "",
			description: "",
			category: "automation",
			defaultConnectionType: "smoothstep"
		};
		connectionStyle.value = {
			color: "#8b5cf6",
			animationType: "flow",
			animationSpeed: "normal",
			strokeWidth: 2,
			type: "smoothstep",
			animated: true
		};
		layoutConfig.value = {
			layout: "horizontal",
			spacing: 200
		};
	};

	// Watch for prop changes
	watch(() => props.isActive, (newValue) => {
		if (newValue) {
			resetProcess();
		}
	});
</script>

<style scoped>
	.chain-creation-process {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
		pointer-events: all;
	}

	.process-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}

	.process-modal {
		background: #000000;
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 16px;
		width: 100%;
		max-width: 600px;
		max-height: 80vh;
		overflow: hidden;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(var(--color-primary-rgb), 0.05);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.header-icon {
		color: rgba(var(--color-primary-rgb), 0.9);
	}

	.header-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.modal-title {
		font-size: 18px;
		font-weight: 800;
		color: rgba(255, 255, 255, 0.95);
		margin: 0;
		letter-spacing: 0.3px;
	}

	.modal-subtitle {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.6);
		margin: 0;
	}

	.close-btn {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.9);
	}

	.modal-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.step-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(0, 0, 0, 0.2);
	}

	.step-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		border-radius: 20px;
		transition: all 0.3s ease;
	}

	.step-item.completed {
		background: rgba(34, 197, 94, 0.1);
		color: rgba(34, 197, 94, 0.9);
	}

	.step-item.active {
		background: rgba(var(--color-primary-rgb), 0.1);
		color: rgba(var(--color-primary-rgb), 0.9);
	}

	.step-number {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: currentColor;
		color: white;
		border-radius: 50%;
		font-size: 11px;
		font-weight: 700;
	}

	.step-label {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.step-content {
		flex: 1;
		overflow-y: auto;
		padding: 24px;
	}

	.step-pane {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.form-section,
	.nodes-section,
	.connections-section,
	.preview-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.section-header {
		text-align: center;
		margin-bottom: 8px;
	}

	.section-title {
		font-size: 16px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		margin: 0 0 4px 0;
	}

	.section-description {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.6);
		margin: 0;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.form-input,
	.form-textarea,
	.form-select {
		padding: 10px 12px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: white;
		font-size: 13px;
		font-weight: 500;
		transition: all 0.3s ease;
	}

	.form-input:focus,
	.form-textarea:focus,
	.form-select:focus {
		outline: none;
		border-color: rgba(var(--color-primary-rgb), 0.4);
		background: rgba(0, 0, 0, 0.3);
		box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
	}

	.form-input::placeholder,
	.form-textarea::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.nodes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 8px;
		max-height: 300px;
		overflow-y: auto;
	}

	.node-selector {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.3s ease;
		position: relative;
	}

	.node-selector:hover {
		background: rgba(var(--color-primary-rgb), 0.05);
		border-color: rgba(var(--color-primary-rgb), 0.2);
	}

	.node-selector.selected {
		background: rgba(var(--color-primary-rgb), 0.1);
		border-color: rgba(var(--color-primary-rgb), 0.3);
	}

	.node-icon {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(var(--color-primary-rgb), 0.1);
		border-radius: 6px;
		color: rgba(var(--color-primary-rgb), 0.8);
	}

	.node-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.node-name {
		font-size: 12px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
	}

	.node-type {
		font-size: 10px;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.selection-indicator {
		position: absolute;
		top: 8px;
		right: 8px;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(var(--color-primary-rgb), 0.9);
		border-radius: 50%;
		color: white;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.node-selector.selected .selection-indicator {
		opacity: 1;
	}

	.flow-visualization {
		background: rgba(0, 0, 0, 0.3);
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 16px;
	}

	.flow-nodes {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 12px;
	}

	.flow-node {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.flow-node-content {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 8px;
		color: rgba(var(--color-primary-rgb), 0.9);
		font-size: 11px;
		font-weight: 600;
	}

	.flow-arrow {
		color: rgba(var(--color-primary-rgb), 0.6);
	}

	.preview-card {
		background: rgba(var(--color-neutral-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 12px;
		padding: 20px;
	}

	.preview-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
	}

	.preview-icon {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(var(--color-primary-rgb), 0.1);
		border-radius: 8px;
		color: rgba(var(--color-primary-rgb), 0.9);
	}

	.preview-info {
		flex: 1;
	}

	.preview-name {
		font-size: 16px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		margin: 0 0 4px 0;
	}

	.preview-description {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.6);
		margin: 0;
		line-height: 1.4;
	}

	.preview-stats {
		display: flex;
		gap: 16px;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.stat-label {
		font-size: 10px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-value {
		font-size: 14px;
		font-weight: 700;
		color: rgba(var(--color-primary-rgb), 0.9);
	}

	.modal-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(0, 0, 0, 0.2);
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: 8px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		border: 1px solid transparent;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.action-btn.secondary-btn {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.7);
	}

	.action-btn.secondary-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.9);
	}

	.action-btn.primary-btn {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.3);
		color: rgba(var(--color-primary-rgb), 0.9);
	}

	.action-btn.primary-btn:hover:not(:disabled) {
		background: rgba(var(--color-primary-rgb), 0.3);
		border-color: rgba(var(--color-primary-rgb), 0.5);
	}

	.action-btn.primary-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.primary-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	/* Style Section */
	.style-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.style-preview {
		padding: 16px;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.preview-header {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
		margin-bottom: 12px;
	}

	.preview-connections {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}

	.preview-connection-line {
		width: 200px;
		border-radius: 2px;
		position: relative;
		transition: all 0.3s ease;
	}

	.preview-animation {
		position: absolute;
		top: 0;
		left: 0;
		width: 20px;
		height: 100%;
		background: rgba(255, 255, 255, 0.6);
		border-radius: 2px;
		animation: slideAcross 2s infinite;
	}

	@keyframes slideAcross {
		0% {
			left: 0;
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
		100% {
			left: calc(100% - 20px);
			opacity: 0;
		}
	}

	/* Layout Section */
	.layout-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
</style>
