<template>
	<div class="advanced-connection-builder">
		<div class="builder-header">
			<UIcon name="i-lucide-git-merge" class="size-3 text-primary" />
			<span class="builder-title">Advanced Connection Builder</span>
		</div>

		<div class="builder-content">
			<!-- Connection Steps List -->
			<div class="connection-steps">
				<div
					v-for="(step, stepIndex) in connectionSteps"
					:key="stepIndex"
					class="connection-step"
				>
					<div class="step-header">
						<div class="step-number">{{ stepIndex + 1 }}</div>
						<div class="step-source">
							<span class="step-label">From:</span>
							<select
								v-model="step.source"
								class="node-select"
								@change="updateStep(stepIndex)"
							>
								<option value="">Select node...</option>
								<option v-for="node in availableNodes" :key="node.id" :value="node.id">
									{{ node.data?.label || node.type }}
								</option>
							</select>
						</div>
						<button
							class="remove-step-btn"
							@click="removeStep(stepIndex)"
						>
							<UIcon name="i-lucide-x" class="size-3" />
						</button>
					</div>

					<!-- Multiple Targets -->
					<div class="step-targets">
						<div
							v-for="(target, targetIndex) in step.targets"
							:key="targetIndex"
							class="target-row"
						>
							<UIcon name="i-lucide-corner-down-right" class="size-3 text-primary/60" />
							<span class="target-label">To:</span>
							<select
								v-model="step.targets[targetIndex]"
								class="node-select small"
								@change="updateStep(stepIndex)"
							>
								<option value="">Select target...</option>
								<option
									v-for="node in getAvailableTargets(step.source)"
									:key="node.id"
									:value="node.id"
								>
									{{ node.data?.label || node.type }}
								</option>
							</select>
							<button
								v-if="step.targets.length > 1"
								class="remove-target-btn"
								@click="removeTarget(stepIndex, targetIndex)"
							>
								<UIcon name="i-lucide-minus" class="size-2" />
							</button>
						</div>
						<button
							v-if="step.source"
							class="add-target-btn"
							@click="addTarget(stepIndex)"
						>
							<UIcon name="i-lucide-plus" class="size-2" />
							Add Branch
						</button>
					</div>
				</div>
			</div>

			<!-- Add Step Button -->
			<button class="add-step-btn" @click="addStep">
				<UIcon name="i-lucide-plus-circle" class="size-3" />
				Add Connection Step
			</button>
		</div>

		<!-- Connection Preview -->
		<div class="connection-preview">
			<div class="preview-header">
				<UIcon name="i-lucide-eye" class="size-3" />
				<span>Preview</span>
				<span class="connection-count">{{ getTotalConnections() }} connection(s)</span>
			</div>
			<div class="preview-list">
				<div
					v-for="(conn, index) in getAllConnections()"
					:key="index"
					class="preview-item"
				>
					<div class="preview-number">{{ index + 1 }}</div>
					<div class="preview-path">
						<span class="preview-node">{{ getNodeName(conn.source) }}</span>
						<UIcon name="i-lucide-arrow-right" class="size-2 text-primary" />
						<span class="preview-node">{{ getNodeName(conn.target) }}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="builder-actions">
			<button
				class="action-btn primary"
				:disabled="getTotalConnections() === 0"
				@click="createConnections"
			>
				<UIcon name="i-lucide-zap" class="size-3" />
				Create {{ getTotalConnections() }} Connection(s)
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed } from "vue";

	interface ConnectionStep {
		source: string;
		targets: string[];
	}

	interface Props {
		nodes: any[];
		edges: any[];
		connectionStyle: any;
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		createConnections: [connections: any[]];
	}>();

	const connectionSteps = ref<ConnectionStep[]>([
		{ source: "", targets: [""] }
	]);

	const availableNodes = computed(() =>
		props.nodes.filter((node: any) => node.type !== "viewport")
	);

	const getAvailableTargets = (sourceId: string) => {
		if (!sourceId) return availableNodes.value;
		return availableNodes.value.filter((node: any) => node.id !== sourceId);
	};

	const getNodeName = (nodeId: string) => {
		if (!nodeId) return "Unknown";
		const node = props.nodes.find((n: any) => n.id === nodeId);
		return node?.data?.label || node?.type || nodeId;
	};

	const addStep = () => {
		connectionSteps.value.push({ source: "", targets: [""] });
	};

	const removeStep = (stepIndex: number) => {
		connectionSteps.value.splice(stepIndex, 1);
		if (connectionSteps.value.length === 0) {
			addStep();
		}
	};

	const addTarget = (stepIndex: number) => {
		connectionSteps.value[stepIndex].targets.push("");
	};

	const removeTarget = (stepIndex: number, targetIndex: number) => {
		connectionSteps.value[stepIndex].targets.splice(targetIndex, 1);
	};

	const updateStep = (stepIndex: number) => {
		// Validation or auto-actions could go here
	};

	const getAllConnections = () => {
		const connections: Array<{ source: string; target: string }> = [];
		connectionSteps.value.forEach((step) => {
			if (step.source) {
				step.targets.forEach((target) => {
					if (target) {
						connections.push({ source: step.source, target });
					}
				});
			}
		});
		return connections;
	};

	const getTotalConnections = () => {
		return getAllConnections().length;
	};

	const createConnections = () => {
		const connections = getAllConnections();
		const edges = connections.map((conn, index) => ({
			id: `edge-${conn.source}-${conn.target}-${Date.now()}-${index}`,
			source: conn.source,
			target: conn.target,
			sourceHandle: "right",
			targetHandle: "left",
			type: props.connectionStyle.type,
			animated: props.connectionStyle.animated,
			animationType: props.connectionStyle.animationType,
			animationSpeed: props.connectionStyle.animationSpeed,
			style: {
				stroke: props.connectionStyle.color,
				strokeWidth: props.connectionStyle.strokeWidth
			},
			markerEnd: {
				type: "arrowclosed",
				color: props.connectionStyle.color
			}
		}));

		emit("createConnections", edges);
	};
</script>

<style scoped>
	.advanced-connection-builder {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.builder-header {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 6px;
	}

	.builder-title {
		font-size: 11px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.builder-content {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.connection-steps {
		display: flex;
		flex-direction: column;
		gap: 10px;
		max-height: 300px;
		overflow-y: auto;
	}

	.connection-step {
		padding: 12px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.step-header {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.step-number {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(var(--color-primary-rgb), 0.2);
		border: 2px solid rgba(var(--color-primary-rgb), 0.4);
		border-radius: 50%;
		font-size: 11px;
		font-weight: 800;
		color: var(--color-primary);
		flex-shrink: 0;
	}

	.step-source {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.step-label,
	.target-label {
		font-size: 10px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.node-select {
		flex: 1;
		padding: 6px 10px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 5px;
		color: white;
		font-size: 11px;
		font-weight: 500;
		cursor: pointer;
	}

	.node-select.small {
		font-size: 10px;
		padding: 5px 8px;
	}

	.remove-step-btn,
	.remove-target-btn {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(239, 68, 68, 0.12);
		border: 1px solid rgba(239, 68, 68, 0.25);
		border-radius: 4px;
		color: rgba(239, 68, 68, 1);
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.remove-step-btn:hover,
	.remove-target-btn:hover {
		background: rgba(239, 68, 68, 0.2);
		border-color: rgba(239, 68, 68, 0.4);
	}

	.step-targets {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding-left: 32px;
	}

	.target-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.add-target-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 5px 10px;
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px dashed rgba(var(--color-primary-rgb), 0.3);
		border-radius: 5px;
		color: rgba(var(--color-primary-rgb), 0.9);
		font-size: 10px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.add-target-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.15);
		border-color: rgba(var(--color-primary-rgb), 0.5);
		border-style: solid;
	}

	.add-step-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px 14px;
		background: rgba(var(--color-primary-rgb), 0.12);
		border: 1px dashed rgba(var(--color-primary-rgb), 0.3);
		border-radius: 8px;
		color: var(--color-primary);
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.add-step-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.5);
		border-style: solid;
	}

	.connection-preview {
		padding: 12px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
	}

	.preview-header {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 10px;
		font-size: 11px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.7);
	}

	.connection-count {
		margin-left: auto;
		padding: 2px 8px;
		background: rgba(var(--color-primary-rgb), 0.15);
		border-radius: 10px;
		color: var(--color-primary);
		font-size: 10px;
	}

	.preview-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
		max-height: 200px;
		overflow-y: auto;
	}

	.preview-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 4px;
	}

	.preview-number {
		width: 18px;
		height: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(var(--color-primary-rgb), 0.2);
		border-radius: 50%;
		font-size: 9px;
		font-weight: 700;
		color: var(--color-primary);
	}

	.preview-path {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.preview-node {
		font-size: 10px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
	}

	.builder-actions {
		display: flex;
		gap: 8px;
	}

	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px 16px;
		border-radius: 8px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid transparent;
	}

	.action-btn.primary {
		background: rgba(16, 185, 129, 0.15);
		border-color: rgba(16, 185, 129, 0.3);
		color: rgba(16, 185, 129, 1);
	}

	.action-btn.primary:hover:not(:disabled) {
		background: rgba(16, 185, 129, 0.25);
		border-color: rgba(16, 185, 129, 0.5);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>

