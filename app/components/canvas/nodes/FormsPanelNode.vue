<template>
	<div v-if="customNodeProps" class="enhanced-node forms-panel-node">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />

		<!-- Resizer -->
		<NodeResizer v-if="customNodeProps.selected" :min-width="800" :min-height="700" />

		<!-- Node Header -->
		<div class="node-header">
			<div class="flex items-center gap-2">
				<Icon name="lucide:file-text" class="w-4 h-4 text-purple-600" />
				<h3 class="text-sm font-semibold text-purple-600">
					{{ customNodeProps.data?.label || 'Forms Panel' }}
				</h3>
			</div>
			<div class="flex items-center gap-1">
				<div class="w-2 h-2 rounded-full bg-purple-500" />
				<span class="text-xs text-purple-500/70">Active</span>
			</div>
		</div>

		<!-- Forms Panel Content Container -->
		<div class="forms-panel-container">
			<FormsPanel
				:forms="customNodeProps.data?.generatedForms || []"
				@refresh-forms="handleRefreshForms"
				@form-selected="handleFormSelected"
				@create-form="handleCreateForm"
				@attach-hook="handleAttachHook"
				@add-form-builder-node="handleAddFormBuilderNode"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { Handle, Position } from "@vue-flow/core";
	import { NodeResizer } from "@vue-flow/node-resizer";
	import { onMounted, ref, watch } from "vue";
	import { createFormPreviewUrl } from "~/utils/formPreviewGenerator";
	import { localhostHtmlServer } from "~/utils/localhostHtmlServer";
	import FormsPanel from "../../TemplatePanels/FormsPanel.vue";

	interface Props {
		customNodeProps: any
		updateNodeData?: (nodeId: string, key: string, value: any) => void
		onCreateBrowserNode?: (formData: any, sourceNodeId: string) => void
		onCreateHookNode?: (formData: any, sourceNodeId: string) => void
		onCreateEdge?: (sourceId: string, targetId: string, label?: string) => void
		onCreateFormBuilderNode?: () => void
	}

	const props = defineProps<Props>();

	// Debug logging
	onMounted(() => {
		console.log("🎯 FormsPanelNode mounted!");
		console.log("🎯 customNodeProps:", props.customNodeProps);
		console.log("🎯 generatedForms:", props.customNodeProps?.data?.generatedForms);
		console.log("🎯 onCreateBrowserNode available:", !!props.onCreateBrowserNode);
		console.log("🎯 onCreateEdge available:", !!props.onCreateEdge);
	});

	watch(() => props.customNodeProps?.data?.generatedForms, (newForms) => {
		console.log("🔄 Forms updated in FormsPanelNode:", newForms);
	}, { deep: true });

	// Track created preview nodes to avoid duplicates
	const createdPreviewNodes = ref<Map<string, string>>(new Map());

	// Event handlers
	const handleRefreshForms = () => {
		console.log("📝 Forms Panel Node: Refresh forms requested");
		// Load forms from localStorage
		try {
			const stored = localStorage.getItem("generatedForms");
			if (stored) {
				const forms = JSON.parse(stored);
				if (props.updateNodeData) {
					props.updateNodeData(props.customNodeProps.id, "generatedForms", forms);
				}
			}
		} catch (error) {
			console.error("Failed to load forms:", error);
		}
	};

	const createFormPreviewNode = async (form: any) => {
		try {
			console.log("🚀 Creating form preview node for:", form.title);

			// Check if we already have a preview node for this form
			const existingNodeId = createdPreviewNodes.value.get(form.id);
			if (existingNodeId) {
				console.log("📝 Preview node already exists for this form:", existingNodeId);
				return;
			}

		// Generate the actual HTML content (NOT blob URL!)
		const { generateFormPreviewHtml } = await import("~/utils/formPreviewGenerator");
		const htmlContent = generateFormPreviewHtml(form);
		console.log("📝 Generated HTML content, length:", htmlContent.length);

		// For production builds, serve HTML content through localhost
		// For development/iframes, use data URL (works in development)
		let finalUrl: string;
		if (typeof window !== "undefined" && (window as any).__TAURI__) {
			// Production: Use localhost server
			finalUrl = localhostHtmlServer.serveHtmlContent(htmlContent);
			console.log("📝 Created localhost URL for production build");
		} else {
			// Development: Use data URL for iframes
			finalUrl = `data:text/html;base64,${btoa(unescape(encodeURIComponent(htmlContent)))}`;
			console.log("📝 Created data URL for development iframe");
		}

		// Create browser node data - CRITICAL: Store actual HTML content!
		const browserNodeData = {
			id: `browser-preview-${form.id}-${Date.now()}`,
			label: `Preview: ${form.title}`,
			url: finalUrl,  // Use localhost URL for production, data URL for development
			htmlContent: htmlContent,  // CRITICAL: Store actual HTML for viewport spawning and saving
			formHtml: form.html || "",  // Store form HTML separately
			formCss: form.css || "",    // Store CSS separately
			formTitle: form.title || "",
			formId: form.id,
			status: "loaded",
			isFormPreview: true
		};

			// Call parent to create the browser node
			if (props.onCreateBrowserNode) {
				console.log("📝 Calling onCreateBrowserNode with data:", browserNodeData);
				props.onCreateBrowserNode(browserNodeData, props.customNodeProps.id);

				// Track the created node
				createdPreviewNodes.value.set(form.id, browserNodeData.id);
			} else {
				console.warn("⚠️ onCreateBrowserNode not provided to FormsPanelNode");
			}
		} catch (error) {
			console.error("❌ Error creating form preview node:", error);
		}
	};

	const handleFormSelected = async (form: any) => {
		console.log("✅✅✅ FormsPanelNode: handleFormSelected called!");
		console.log("📝 Forms Panel Node: Form selected:", form);
		console.log("📝 Props available:", {
			updateNodeData: !!props.updateNodeData,
			onCreateBrowserNode: !!props.onCreateBrowserNode,
			onCreateEdge: !!props.onCreateEdge,
			onCreateHookNode: !!props.onCreateHookNode,
			nodeId: props.customNodeProps?.id
		});

		// Update node data
		if (props.updateNodeData) {
			props.updateNodeData(props.customNodeProps.id, "selectedForm", form);
			props.updateNodeData(props.customNodeProps.id, "lastAction", "form_selected");
			console.log("📝 Updated node data");
		}

		// Create live preview in connected Browser Node
		console.log("📝 About to call createFormPreviewNode...");
		await createFormPreviewNode(form);
		console.log("📝 createFormPreviewNode completed");

		// Automatically create hook node for the submission chain
		console.log("🪝 Auto-creating hook node for submission chain...");
		setTimeout(() => {
			if (props.onCreateHookNode) {
				console.log("🪝 Calling onCreateHookNode handler...");
				props.onCreateHookNode(form, props.customNodeProps.id);
				console.log("✅ Hook node creation triggered");
			} else {
				console.warn("⚠️ No onCreateHookNode handler provided");
			}
		}, 300); // Small delay to ensure browser node is created first
	};

	const handleCreateForm = () => {
		console.log("📝 Forms Panel Node: Create form requested");
		if (props.updateNodeData) {
			props.updateNodeData(props.customNodeProps.id, "lastAction", "create_form");
		}
	};

	const handleAttachHook = (form: any) => {
		console.log("🪝 FormsPanelNode: Attach hook to form requested:", form);
		console.log("🪝 Form data:", { id: form.id, title: form.title });

		if (props.updateNodeData) {
			props.updateNodeData(props.customNodeProps.id, "lastAction", "attach_hook");
			props.updateNodeData(props.customNodeProps.id, "selectedFormForHook", form);
		}

		// Call the hook node creation handler passed from parent
		if (props.onCreateHookNode) {
			console.log("🪝 Calling onCreateHookNode handler...");
			props.onCreateHookNode(form, props.customNodeProps.id);
		} else {
			console.warn("⚠️ No onCreateHookNode handler provided");
		}
	};

	const handleAddFormBuilderNode = () => {
		console.log("➕ FormsPanelNode: Add form builder node requested");
		if (props.onCreateFormBuilderNode) {
			props.onCreateFormBuilderNode();
		} else {
			console.warn("⚠️ No onCreateFormBuilderNode handler provided");
		}
	};
</script>

<style scoped>
.forms-panel-node {
	min-width: 800px;
	min-height: 700px;
	background: rgba(var(--color-neutral-rgb), 0.08);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(139, 92, 246, 0.3);
	border-radius: 12px;
	padding: 16px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	transition: all 0.2s ease;
	position: relative;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.forms-panel-node:hover {
	background: rgba(var(--color-neutral-rgb), 0.12);
	border-color: rgba(139, 92, 246, 0.4);
	transform: translateY(-2px);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.forms-panel-node.selected {
	border-color: rgba(139, 92, 246, 0.6);
	box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
}

.node-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
	padding-bottom: 8px;
	border-bottom: 1px solid rgba(139, 92, 246, 0.2);
}

.forms-panel-container {
	flex: 1;
	overflow-y: auto !important;
	overflow-x: hidden;
	min-height: 0;
	max-height: calc(100% - 60px);
	position: relative;
}

/* Override any nested padding that might interfere with scrolling */
.forms-panel-container :deep(.forms-panel-content) {
	padding: 0.5rem;
	height: auto;
	overflow: visible;
}

/* Custom scrollbar for the forms panel */
.forms-panel-container::-webkit-scrollbar {
	width: 10px;
}

.forms-panel-container::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.3);
	border-radius: 5px;
	margin: 4px 0;
}

.forms-panel-container::-webkit-scrollbar-thumb {
	background: rgba(139, 92, 246, 0.5);
	border-radius: 5px;
	border: 2px solid rgba(0, 0, 0, 0.3);
}

.forms-panel-container::-webkit-scrollbar-thumb:hover {
	background: rgba(139, 92, 246, 0.7);
}

.connection-handle {
	width: 8px;
	height: 8px;
	background: rgba(139, 92, 246, 0.8);
	border: 2px solid rgba(255, 255, 255, 0.9);
	border-radius: 50%;
	transition: all 0.2s ease;
}

.connection-handle:hover {
	background: rgba(139, 92, 246, 1);
	transform: scale(1.2);
}
</style>
