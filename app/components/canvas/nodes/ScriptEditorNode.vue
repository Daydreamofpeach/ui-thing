<template>
	<div class="script-editor-node">
		<CustomNodeResizer
			:min-width="500"
			:min-height="400"
			:max-width="Infinity"
			:max-height="Infinity"
			@resize="handleResize"
		/>

		<!-- Connection Handles -->
		<Handle
			v-if="!isOscarPreview"
			type="target"
			:position="Position.Left"
			class="w-3 h-3 bg-purple-400"
		/>
		<Handle
			v-if="!isOscarPreview"
			type="source"
			:position="Position.Right"
			class="w-3 h-3 bg-purple-500"
		/>

		<div class="node-content-wrapper">
		<!-- Header -->
		<div class="node-header">
			<div class="header-left">
				<UIcon name="i-lucide-terminal" class="w-5 h-5 text-purple-400" />
				<span class="node-title">{{ scriptData.name || 'Script Editor' }}</span>
			</div>
			<div class="header-right">
				<div class="script-badge">
					<UIcon name="i-lucide-code" class="w-3 h-3" />
					<span>Script</span>
				</div>
				<button
					class="close-button"
					title="Close editor"
					@click="closeNode"
				>
					<UIcon name="i-lucide-x" class="w-4 h-4" />
				</button>
			</div>
		</div>

			<!-- Script Metadata -->
			<div class="metadata-section">
				<div class="metadata-header">
					<UIcon name="i-lucide-info" class="w-4 h-4 text-blue-400" />
					<span class="section-title">Script Details</span>
				</div>

				<!-- Name (Read-only) -->
				<div class="field-group">
					<label class="field-label">
						<UIcon name="i-lucide-tag" class="w-3 h-3" />
						Name
					</label>
					<div class="readonly-field">
						{{ scriptData.name }}
					</div>
				</div>

				<!-- Description (Editable) -->
				<div class="field-group">
					<label class="field-label">
						<UIcon name="i-lucide-file-text" class="w-3 h-3" />
						Description
					</label>
					<textarea
						v-model="localDescription"
						class="field-input textarea"
						placeholder="Describe what this script does..."
						rows="3"
						@blur="handleDescriptionChange"
					/>
				</div>

				<!-- Order (Editable) -->
				<div class="field-group">
					<label class="field-label">
						<UIcon name="i-lucide-list-ordered" class="w-3 h-3" />
						Execution Order
					</label>
					<input
						v-model="localOrder"
						type="text"
						inputmode="numeric"
						pattern="[0-9]*"
						class="field-input"
						placeholder="0"
						@input="handleOrderInput"
						@blur="handleOrderChange"
					>
					<span class="field-hint">Lower numbers run first (0, 1, 2...)</span>
				</div>
			</div>

			<!-- OS Variants -->
			<div class="os-variants-section">
				<div class="variants-header">
					<UIcon name="i-lucide-monitor" class="w-4 h-4 text-green-400" />
					<span class="section-title">OS Commands</span>
				</div>

				<div class="variants-list">
					<!-- Windows -->
					<div class="variant-item">
						<div class="variant-label">
							<UIcon name="i-lucide-monitor-smartphone" class="w-4 h-4 text-blue-400" />
							<span>Windows</span>
						</div>
						<input
							v-model="localCommands.windows"
							type="text"
							class="variant-input"
							:placeholder="scriptData.command || 'npm run dev'"
							@blur="handleCommandChange('windows')"
						>
					</div>

					<!-- Linux -->
					<div class="variant-item">
						<div class="variant-label">
							<UIcon name="i-lucide-hard-drive" class="w-4 h-4 text-orange-400" />
							<span>Linux</span>
						</div>
						<input
							v-model="localCommands.linux"
							type="text"
							class="variant-input"
							:placeholder="scriptData.command || 'npm run dev'"
							@blur="handleCommandChange('linux')"
						>
					</div>

					<!-- Mac -->
					<div class="variant-item">
						<div class="variant-label">
							<UIcon name="i-lucide-apple" class="w-4 h-4 text-purple-400" />
							<span>Mac</span>
						</div>
						<input
							v-model="localCommands.mac"
							type="text"
							class="variant-input"
							:placeholder="scriptData.command || 'npm run dev'"
							@blur="handleCommandChange('mac')"
						>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="actions-section">
				<button
					class="action-button save"
					:disabled="!hasChanges || isSaving"
					@click="saveChanges"
				>
					<UIcon :name="isSaving ? 'i-lucide-loader-2' : 'i-lucide-save'" :class="{ 'animate-spin': isSaving }" class="w-4 h-4" />
					<span>{{ isSaving ? 'Saving...' : 'Save to b.json' }}</span>
				</button>
				<button
					class="action-button secondary"
					:disabled="!hasChanges"
					@click="resetChanges"
				>
					<UIcon name="i-lucide-undo" class="w-4 h-4" />
					<span>Reset</span>
				</button>
			</div>

			<!-- Save Status -->
			<div v-if="saveStatus" class="save-status" :class="`status-${saveStatus}`">
				<UIcon
					:name="saveStatus === 'success' ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'"
					class="w-4 h-4"
				/>
				<span>{{ saveMessage }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { Handle, Position } from "@vue-flow/core";
	import { computed, ref, watch } from "vue";
	import { useScriptMetadataEditor } from "../composables/useScriptMetadataEditor";
	import CustomNodeResizer from "../shared/CustomNodeResizer.vue";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
		isOscarPreview?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		isOscarPreview: false
	});

	const emit = defineEmits<{
		"script-updated": [scriptName: string, updates: any]
		"close-node": [nodeId: string]
	}>();

	// Script data from node props
	const scriptData = computed(() => props.customNodeProps.data?.scriptData || {
		name: "",
		command: "",
		description: "",
		order: 0,
		projectPath: ""
	});

	// Local state for editing
	const localDescription = ref(scriptData.value.description || "");
	const localOrder = ref(scriptData.value.order || 0);
	const localCommands = ref({
		windows: scriptData.value.windowsCommand || scriptData.value.command || "",
		linux: scriptData.value.linuxCommand || scriptData.value.command || "",
		mac: scriptData.value.macCommand || scriptData.value.command || ""
	});

	const isSaving = ref(false);
	const saveStatus = ref<"success" | "error" | null>(null);
	const saveMessage = ref("");

	// Watch for prop changes
	watch(() => scriptData.value, (newData) => {
		localDescription.value = newData.description || "";
		localOrder.value = newData.order || 0;
		localCommands.value = {
			windows: newData.windowsCommand || newData.command || "",
			linux: newData.linuxCommand || newData.command || "",
			mac: newData.macCommand || newData.command || ""
		};
	}, { deep: true });

	// Use the metadata editor composable
	const {
		saveScriptMetadata,
		hasUnsavedChanges
	} = useScriptMetadataEditor();

	// Check if there are changes
	const hasChanges = computed(() => {
		const original = scriptData.value;
		return localDescription.value !== (original.description || "")
			|| localOrder.value !== (original.order || 0)
			|| localCommands.value.windows !== (original.windowsCommand || original.command || "")
			|| localCommands.value.linux !== (original.linuxCommand || original.command || "")
			|| localCommands.value.mac !== (original.macCommand || original.command || "");
	});

	// Handle description change
	const handleDescriptionChange = () => {
		props.updateNodeData(props.customNodeProps.id, "description", localDescription.value);
	};

	// Handle order input - only allow numeric values
	const handleOrderInput = (event: Event) => {
		const input = event.target as HTMLInputElement;
		const value = input.value.replace(/[^0-9]/g, ""); // Only digits
		localOrder.value = value as any; // Keep as string during editing
	};

	// Handle order change
	const handleOrderChange = () => {
		const orderNum = typeof localOrder.value === "string" ? Number.parseInt(localOrder.value, 10) : localOrder.value;
		localOrder.value = isNaN(orderNum) ? 0 : orderNum;
		props.updateNodeData(props.customNodeProps.id, "order", localOrder.value);
	};

	// Handle command change
	const handleCommandChange = (os: "windows" | "linux" | "mac") => {
		props.updateNodeData(props.customNodeProps.id, `${os}Command`, localCommands.value[os]);
	};

	// Save changes to b.json using the same pattern as BFolderSetupNode
	const saveChanges = async () => {
		console.log("═══════════════════════════════════════════");
		console.log("💾 SAVE CHANGES TRIGGERED");
		console.log("Script Data:", scriptData.value);
		console.log("Project Path:", scriptData.value.projectPath);
		console.log("Script Name:", scriptData.value.name);
		console.log("═══════════════════════════════════════════");

		if (!scriptData.value.projectPath || !scriptData.value.name) {
			console.error("❌ Missing project path or script name");
			saveStatus.value = "error";
			saveMessage.value = "Cannot save: Missing project path or script name";
			return;
		}

		isSaving.value = true;
		saveStatus.value = null;
		saveMessage.value = "";

		try {
			const updates = {
				description: localDescription.value,
				order: Number(localOrder.value) || 0, // Ensure it's a number
				commands: {
					windows: localCommands.value.windows || scriptData.value.command,
					linux: localCommands.value.linux || scriptData.value.command,
					mac: localCommands.value.mac || scriptData.value.command
				}
			};

			console.log("📦 Updates to save:", updates);
			console.log("📂 Project path:", scriptData.value.projectPath);
			console.log("📝 Script name:", scriptData.value.name);

			// Update the script data in the node
			const updatedScriptData = {
				...scriptData.value,
				description: localDescription.value,
				order: Number(localOrder.value) || 0,
				windowsCommand: localCommands.value.windows,
				linuxCommand: localCommands.value.linux,
				macCommand: localCommands.value.mac
			};

			// Update node data - this will trigger the BFolderSetupNode to update b.json
			props.updateNodeData(props.customNodeProps.id, "scriptData", updatedScriptData);

			// Emit update event to parent
			console.log("📤 Emitting script-updated event:");
			console.log("   Script Name:", scriptData.value.name);
			console.log("   Updates:", updates);
			emit("script-updated", scriptData.value.name, updates);

			saveStatus.value = "success";
			saveMessage.value = "✅ Changes saved! Will update b.json on next save.";
			console.log("✅ Save complete! Changes will be written to b.json when BFolderSetupNode updates.");
			console.log("═══════════════════════════════════════════");

			// Auto-hide success message
			setTimeout(() => {
				saveStatus.value = null;
				saveMessage.value = "";
			}, 3000);
		} catch (error: any) {
			console.error("❌ Error saving script metadata:", error);
			console.error("❌ Error stack:", error?.stack);
			saveStatus.value = "error";
			saveMessage.value = `Failed: ${error?.message || "Unknown error"}`;
		} finally {
			isSaving.value = false;
		}
	};

	// Reset changes
	const resetChanges = () => {
		localDescription.value = scriptData.value.description || "";
		localOrder.value = scriptData.value.order || 0;
		localCommands.value = {
			windows: scriptData.value.windowsCommand || scriptData.value.command || "",
			linux: scriptData.value.linuxCommand || scriptData.value.command || "",
			mac: scriptData.value.macCommand || scriptData.value.command || ""
		};
	};

	// Handle resize
	const handleResize = (width: number, height: number) => {
		props.updateNodeData(props.customNodeProps.id, "width", width);
		props.updateNodeData(props.customNodeProps.id, "height", height);
	};

	// Close node
	const closeNode = () => {
		emit("close-node", props.customNodeProps.id);
	};
</script>

<style scoped>
.script-editor-node {
	background-color: rgba(0, 0, 0, 0.8); /* Match ProjectScriptRunnerNode */
	border: 1px solid rgba(168, 85, 247, 0.3);
	border-radius: 0.5rem;
	min-width: 500px;
	width: 500px;
	min-height: 400px;
	height: auto;
	display: flex;
	flex-direction: column;
	box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
	position: relative;
	overflow: hidden;
	cursor: move;
	transition: all 0.2s ease;
}

.script-editor-node:hover {
	transform: scale(1.02);
	box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	border-color: rgba(168, 85, 247, 0.5);
}

.node-content-wrapper {
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 16px;
	height: 100%;
	overflow-y: auto;
	overflow-x: hidden;
}

/* Header */
.node-header {
	background-color: rgba(168, 85, 247, 0.1); /* Match ProjectScriptRunnerNode header style */
	border-bottom: 1px solid rgba(168, 85, 247, 0.2);
	padding: 0.75rem 1rem;
	border-radius: 0.5rem 0.5rem 0 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 8px;
}

.header-right {
	display: flex;
	align-items: center;
	gap: 8px;
}

.node-title {
	font-weight: 600;
	font-size: 0.875rem;
	color: rgba(168, 85, 247, 0.9);
}

.close-button {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(239, 68, 68, 0.12);
	border: 1px solid rgba(239, 68, 68, 0.25);
	border-radius: 5px;
	color: rgba(239, 68, 68, 1);
	cursor: pointer;
	transition: all 0.2s ease;
}

.close-button:hover {
	background: rgba(239, 68, 68, 0.2);
	border-color: rgba(239, 68, 68, 0.4);
	transform: scale(1.1);
}

.script-badge {
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 3px 8px;
	background: rgba(168, 85, 247, 0.15);
	border: 1px solid rgba(168, 85, 247, 0.3);
	border-radius: 10px;
	font-size: 0.7rem;
	font-weight: 700;
	color: rgba(168, 85, 247, 1);
	letter-spacing: 0.3px;
}

/* Metadata Section */
.metadata-section {
	background: rgba(0, 0, 0, 0.3); /* Darker to match ProjectScriptRunnerNode */
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 6px;
	padding: 12px;
}

.metadata-header,
.variants-header {
	display: flex;
	align-items: center;
	gap: 6px;
	margin-bottom: 10px;
	padding-bottom: 6px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.section-title {
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.8);
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

/* Field Groups */
.field-group {
	margin-bottom: 12px;
}

.field-group:last-child {
	margin-bottom: 0;
}

.field-label {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 0.7rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.6);
	margin-bottom: 6px;
	text-transform: uppercase;
	letter-spacing: 0.3px;
}

.field-input {
	width: 100%;
	padding: 0.5rem 0.75rem;
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 0.375rem;
	color: white;
	font-size: 0.875rem;
	transition: all 0.2s ease;
}

.field-input:focus {
	outline: none;
	border-color: rgba(168, 85, 247, 0.5);
	background: rgba(255, 255, 255, 0.15);
}

.field-input.textarea {
	resize: vertical;
	min-height: 60px;
	font-family: inherit;
}

.readonly-field {
	padding: 8px 12px;
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 6px;
	color: rgba(255, 255, 255, 0.6);
	font-size: 0.875rem;
	font-family: monospace;
}

.field-hint {
	display: block;
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.5);
	margin-top: 4px;
	font-style: italic;
}

/* OS Variants */
.os-variants-section {
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	padding: 12px;
}

.variants-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.variant-item {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.variant-label {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.8);
}

.variant-input {
	padding: 8px 12px;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: 6px;
	color: white;
	font-size: 0.8rem;
	font-family: monospace;
	transition: all 0.2s ease;
}

.variant-input:focus {
	outline: none;
	border-color: rgba(168, 85, 247, 0.5);
	background: rgba(0, 0, 0, 0.4);
	box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.1);
}

/* Actions */
.actions-section {
	display: flex;
	gap: 8px;
}

.action-button {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	padding: 10px 16px;
	border-radius: 8px;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	border: 1px solid;
}

.action-button.save {
	background: rgba(34, 197, 94, 0.15);
	border-color: rgba(34, 197, 94, 0.3);
	color: rgba(34, 197, 94, 1);
}

.action-button.save:hover:not(:disabled) {
	background: rgba(34, 197, 94, 0.25);
	border-color: rgba(34, 197, 94, 0.5);
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.action-button.secondary {
	background: rgba(107, 114, 128, 0.15);
	border-color: rgba(107, 114, 128, 0.3);
	color: rgba(255, 255, 255, 0.8);
}

.action-button.secondary:hover:not(:disabled) {
	background: rgba(107, 114, 128, 0.25);
	border-color: rgba(107, 114, 128, 0.5);
	transform: translateY(-2px);
}

.action-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* Save Status */
.save-status {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 12px;
	border-radius: 6px;
	font-size: 0.8rem;
	font-weight: 600;
	animation: slideIn 0.3s ease;
}

.save-status.status-success {
	background: rgba(34, 197, 94, 0.15);
	border: 1px solid rgba(34, 197, 94, 0.3);
	color: rgba(34, 197, 94, 1);
}

.save-status.status-error {
	background: rgba(239, 68, 68, 0.15);
	border: 1px solid rgba(239, 68, 68, 0.3);
	color: rgba(239, 68, 68, 1);
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* Scrollbar */
.node-content-wrapper::-webkit-scrollbar {
	width: 6px;
}

.node-content-wrapper::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 3px;
}

.node-content-wrapper::-webkit-scrollbar-thumb {
	background: rgba(168, 85, 247, 0.3);
	border-radius: 3px;
}

.node-content-wrapper::-webkit-scrollbar-thumb:hover {
	background: rgba(168, 85, 247, 0.5);
}
</style>
