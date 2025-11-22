<template>
	<div v-if="customNodeProps" class="enhanced-node form-automation-node">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />

		<!-- Resizer -->
		<NodeResizer v-if="customNodeProps.selected" :min-width="600" :min-height="400" />

		<!-- Node Header -->
		<div class="node-header">
			<div class="flex items-center gap-2">
				<Icon name="lucide:play-circle" class="w-4 h-4 text-primary" />
				<h3 class="text-sm font-semibold text-primary">
					{{ customNodeProps.data?.label || 'Form Automation' }}
				</h3>
			</div>
			<div class="flex items-center gap-1">
				<div 
					class="w-2 h-2 rounded-full"
					:class="{
						'bg-green-500': automationState.status === 'running',
						'bg-yellow-500': automationState.status === 'paused',
						'bg-gray-500': automationState.status === 'idle' || automationState.status === 'completed',
						'bg-red-500': automationState.status === 'error'
					}"
				/>
				<span class="text-xs text-muted-foreground capitalize">{{ automationState.status }}</span>
			</div>
		</div>

		<!-- Automation Content -->
		<div class="automation-content">
			<!-- Template Info -->
			<div v-if="templateData" class="mb-4 p-4 rounded-lg bg-muted/30 border">
				<h4 class="font-semibold text-sm mb-2 flex items-center gap-2">
					<Icon name="lucide:file-text" class="w-4 h-4" />
					{{ templateData.title || 'Form Template' }}
				</h4>
				<p v-if="templateData.description" class="text-xs text-muted-foreground mb-2">
					{{ templateData.description }}
				</p>
				<div class="flex items-center gap-4 text-xs text-muted-foreground">
					<span>{{ templateData.fields?.length || 0 }} fields</span>
					<span>{{ automationSteps.length }} steps</span>
				</div>
			</div>

			<!-- Progress Bar -->
			<div v-if="automationState.totalSteps > 0" class="mb-4">
				<div class="flex items-center justify-between mb-2">
					<span class="text-xs font-medium">Progress</span>
					<span class="text-xs text-muted-foreground">
						{{ automationState.currentStep }} / {{ automationState.totalSteps }}
					</span>
				</div>
				<div class="w-full h-2 bg-muted rounded-full overflow-hidden">
					<div 
						class="h-full bg-primary transition-all duration-300"
						:style="{ width: `${automationState.progress}%` }"
					/>
				</div>
			</div>

			<!-- Current Step -->
			<div v-if="automationState.currentAction" class="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
				<p class="text-xs font-medium text-primary mb-1">Current Step</p>
				<p class="text-sm text-foreground">{{ automationState.currentAction }}</p>
			</div>

			<!-- Error Message -->
			<div v-if="automationState.status === 'error' && automationState.error" class="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
				<p class="text-xs font-medium text-destructive mb-1">Error</p>
				<p class="text-sm text-destructive">{{ automationState.error }}</p>
			</div>

			<!-- Controls -->
			<div class="flex items-center gap-2">
				<UiButton
					v-if="automationState.status === 'idle' || automationState.status === 'completed'"
					size="sm"
					@click="handleStart"
					:disabled="!templateData || automationSteps.length === 0"
					class="flex-1"
				>
					<Icon name="lucide:play" class="w-4 h-4 mr-2" />
					Start Automation
				</UiButton>
				<UiButton
					v-else-if="automationState.status === 'running'"
					variant="outline"
					size="sm"
					@click="handlePause"
					class="flex-1"
				>
					<Icon name="lucide:pause" class="w-4 h-4 mr-2" />
					Pause
				</UiButton>
				<UiButton
					v-else-if="automationState.status === 'paused'"
					size="sm"
					@click="handleResume"
					class="flex-1"
				>
					<Icon name="lucide:play" class="w-4 h-4 mr-2" />
					Resume
				</UiButton>
				<UiButton
					v-if="automationState.status === 'running' || automationState.status === 'paused'"
					variant="destructive"
					size="sm"
					@click="handleStop"
				>
					<Icon name="lucide:square" class="w-4 h-4" />
				</UiButton>
			</div>

			<!-- Steps List -->
			<div v-if="automationSteps.length > 0" class="mt-4">
				<p class="text-xs font-medium mb-2">Automation Steps</p>
				<div class="space-y-1 max-h-48 overflow-auto">
					<div
						v-for="(step, index) in automationSteps"
						:key="step.id"
						class="p-2 rounded text-xs"
						:class="{
							'bg-primary/20': index === automationState.currentStep,
							'bg-muted/50': index < automationState.currentStep,
							'bg-muted/20': index > automationState.currentStep
						}"
					>
						<div class="flex items-center gap-2">
							<Icon 
								:name="index < automationState.currentStep ? 'lucide:check-circle' : index === automationState.currentStep ? 'lucide:circle' : 'lucide:circle-dot'"
								class="w-3 h-3"
								:class="{
									'text-green-500': index < automationState.currentStep,
									'text-primary': index === automationState.currentStep,
									'text-muted-foreground': index > automationState.currentStep
								}"
							/>
							<span class="flex-1">{{ step.title }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { Handle, Position } from "@vue-flow/core";
import { NodeResizer } from "@vue-flow/node-resizer";
import Icon from "~/components/Ui/Icon.vue";
import UiButton from "~/components/Ui/Button.vue";
import { useFormBuilderAutomation } from "~/composables/useFormBuilderAutomation";
import type { AutomationStep } from "~/utils/formAutomationSteps";
import type { FormTemplate } from "~/composables/useFormTemplateManagement";

interface Props {
	customNodeProps: any;
	updateNodeData?: (nodeId: string, key: string, value: any) => void;
}

const props = defineProps<Props>();

// Get template data from node
const templateData = computed<FormTemplate | null>(() => {
	return props.customNodeProps?.data?.templateData || null;
});

// Get automation steps from template or node data
const automationSteps = computed<AutomationStep[]>(() => {
	if (templateData.value?.template?.automationSteps) {
		return templateData.value.template.automationSteps;
	}
	return props.customNodeProps?.data?.automationSteps || [];
});

// Initialize automation engine
const {
	state: automationState,
	setFormBuilderRef,
	start,
	pause,
	resume,
	stop,
	onStateChange,
	onComplete,
	onError
} = useFormBuilderAutomation();

// Watch for state changes to update node data
watch(automationState, (newState) => {
	if (props.updateNodeData) {
		props.updateNodeData(props.customNodeProps.id, "automationState", newState);
	}
}, { deep: true });

// Find form builder node to connect to
const findFormBuilderNode = () => {
	// This will be handled by the parent canvas component
	// For now, we'll try to find it in the DOM
	const formBuilderNode = document.querySelector('[data-node-type="formBuilderNode"]');
	if (formBuilderNode) {
		const nodeId = formBuilderNode.getAttribute("data-node-id");
		if (nodeId) {
			// Get the form builder component reference
			// This is a simplified approach - in production, you'd use a proper ref system
			setFormBuilderRef(null, nodeId);
		}
	}
};

const handleStart = async () => {
	if (automationSteps.value.length === 0) {
		console.warn("No automation steps available");
		return;
	}

	findFormBuilderNode();
	await start(automationSteps.value, {
		delayBetweenSteps: 800,
		showProgress: true,
		autoSave: true
	});
};

const handlePause = () => {
	pause();
};

const handleResume = async () => {
	// Resume would need the steps array, so we'll restart from current step
	// For now, we'll just call resume (implementation would need steps)
	resume();
};

const handleStop = () => {
	stop();
};

// Set up event handlers
onMounted(() => {
	onStateChange((state) => {
		console.log("Automation state changed:", state);
	});

	onComplete(() => {
		console.log("Automation completed");
	});

	onError((error) => {
		console.error("Automation error:", error);
	});

	// Try to find form builder node
	findFormBuilderNode();
});
</script>

<style scoped>
.form-automation-node {
	min-width: 600px;
	min-height: 400px;
	background: rgba(var(--color-neutral-rgb), 0.08);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(var(--color-primary-rgb), 0.3);
	border-radius: 12px;
	padding: 16px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	transition: all 0.2s ease;
	position: relative;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.form-automation-node:hover {
	background: rgba(var(--color-neutral-rgb), 0.12);
	border-color: rgba(var(--color-primary-rgb), 0.4);
	transform: translateY(-2px);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.node-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
	padding-bottom: 8px;
	border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.2);
}

.automation-content {
	flex: 1;
	overflow-y: auto;
}

.connection-handle {
	width: 8px;
	height: 8px;
	background: rgba(var(--color-primary-rgb), 0.8);
	border: 2px solid rgba(255, 255, 255, 0.9);
	border-radius: 50%;
	transition: all 0.2s ease;
}

.connection-handle:hover {
	background: rgba(var(--color-primary-rgb), 1);
	transform: scale(1.2);
}
</style>

