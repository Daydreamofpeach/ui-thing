<template>
	<BaseNodeTemplate
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
		node-class="template-configured-node"
		:min-width="650"
		:min-height="400"
		:show-default-header="true"
		:show-close-button="false"
		:collapsible="false"
		:default-collapsed="false"
		:theme-color="themeColor"
		icon="lucide:package-check"
		:title="customNodeProps.data?.templateName || 'CONFIGURED TEMPLATE'"
		status-label="Configured"
		status-color="hsl(var(--success))"
	>
		<template #header-actions>
			<UiBadge variant="default" size="sm" class="bg-success/20 text-success border-success/30">
				<Icon name="lucide:check-circle" class="w-3 h-3 mr-1" />
				Configured
			</UiBadge>
		</template>

		<NodePanel class="p-4 space-y-3">

			<!-- Quick Execute - Main Feature -->
			<UiCard class="bg-warning/5 border-warning/20">
				<UiCardContent class="p-4">
					<div class="flex items-center gap-2 mb-3 pb-3 border-b border-warning/20">
						<Icon name="lucide:zap" class="w-5 h-5 text-warning" />
						<span class="text-lg font-bold text-foreground">Quick Execute</span>
						<UiBadge variant="outline" size="sm" class="ml-auto bg-warning/20 text-warning border-warning/30">
							{{ customNodeProps.data?.scriptCount || 0 }} scripts
						</UiBadge>
					</div>
					<TemplateExec
						v-if="customNodeProps.data?.projectPath"
						:project-path="customNodeProps.data.projectPath"
						:template-id="customNodeProps.data?.templateId || ''"
						:configured-node-id="customNodeProps.id"
						@create-browser-node="handleCreateBrowserNode"
					/>
				</UiCardContent>
			</UiCard>

			<!-- Form Generator - Automated Form Creation -->
			<UiButton
				variant="outline"
				class="w-full h-auto p-4 bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30"
				:class="{ 'bg-primary/10 border-primary/30': customNodeProps.data?.formsPanelOpened }"
				@click.stop="handleOpenFormGenerator"
			>
				<div class="flex items-center gap-3 w-full">
					<div class="w-12 h-12 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
						<Icon name="lucide:wand-2" class="w-6 h-6 text-primary" />
					</div>
					<div class="flex flex-col gap-1 flex-1 text-left">
						<div class="flex items-center gap-2">
							<span class="font-bold text-foreground">Automated Form Generator</span>
							<UiBadge v-if="customNodeProps.data?.formsPanelOpened" variant="default" size="sm" class="bg-primary/20 text-primary border-primary/30">
								<Icon name="lucide:circle" class="w-2 h-2 fill-current mr-1" />
								Active
							</UiBadge>
						</div>
						<span class="text-sm text-muted-foreground">
							{{ customNodeProps.data?.formsPanelOpened ? 'Forms panel connected' : 'Create intelligent forms automatically' }}
						</span>
					</div>
					<Icon
						:name="customNodeProps.data?.formsPanelOpened ? 'lucide:eye' : 'lucide:arrow-right'"
						class="w-5 h-5 flex-shrink-0"
						:class="customNodeProps.data?.formsPanelOpened ? 'text-primary' : 'text-muted-foreground'"
					/>
				</div>
			</UiButton>

			<!-- Configured Forms - Show saved form automation chains -->
			<UiCard v-if="configuredForms.length > 0" class="bg-primary/5 border-primary/20">
				<UiCardContent class="p-4">
					<div class="flex items-center gap-2 mb-3">
						<Icon name="lucide:check-square" class="w-4 h-4 text-primary" />
						<span class="text-sm font-bold text-foreground uppercase tracking-wide">Configured Forms</span>
						<UiBadge variant="outline" size="sm" class="ml-auto bg-primary/20 text-primary border-primary/30">
							{{ configuredForms.length }}
						</UiBadge>
					</div>
					<div class="flex flex-col gap-2">
						<UiButton
							v-for="(form, index) in configuredForms"
							:key="index"
							variant="ghost"
							class="w-full justify-start h-auto p-3 hover:bg-primary/10"
							@click.stop="handleRestoreFormChain(form)"
						>
							<Icon name="lucide:file-check" class="w-4 h-4 text-primary mr-3 flex-shrink-0" />
							<div class="flex flex-col gap-1 flex-1 text-left">
								<span class="text-sm font-semibold text-foreground">{{ form.formTitle }}</span>
								<span class="text-xs text-muted-foreground">{{ formatTimestamp(form.timestamp) }}</span>
							</div>
							<Icon name="lucide:chevron-right" class="w-4 h-4 text-muted-foreground flex-shrink-0" />
						</UiButton>
					</div>
				</UiCardContent>
			</UiCard>

			<!-- Collapsible Sections -->
			<CollapsibleSection title="Template Info" icon="i-lucide-info" :default-collapsed="true">
				<div class="grid grid-cols-2 gap-2">
					<UiCard class="bg-muted/30 border-border">
						<UiCardContent class="p-3 flex items-center gap-2">
							<Icon name="lucide:layers" class="w-4 h-4 text-primary" />
							<div class="flex flex-col gap-0.5">
								<span class="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Nodes</span>
								<span class="text-base font-bold text-foreground">{{ customNodeProps.data?.chainNodeCount || 0 }}</span>
							</div>
						</UiCardContent>
					</UiCard>
					<UiCard class="bg-muted/30 border-border">
						<UiCardContent class="p-3 flex items-center gap-2">
							<Icon name="lucide:git-branch" class="w-4 h-4 text-primary" />
							<div class="flex flex-col gap-0.5">
								<span class="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Connections</span>
								<span class="text-base font-bold text-foreground">{{ customNodeProps.data?.edgeCount || 0 }}</span>
							</div>
						</UiCardContent>
					</UiCard>
					<UiCard class="bg-muted/30 border-border">
						<UiCardContent class="p-3 flex items-center gap-2">
							<Icon name="lucide:terminal" class="w-4 h-4 text-primary" />
							<div class="flex flex-col gap-0.5">
								<span class="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Scripts</span>
								<span class="text-base font-bold text-foreground">{{ customNodeProps.data?.scriptCount || 0 }}</span>
							</div>
						</UiCardContent>
					</UiCard>
					<UiCard class="bg-muted/30 border-border">
						<UiCardContent class="p-3 flex items-center gap-2">
							<Icon name="lucide:cpu" class="w-4 h-4 text-primary" />
							<div class="flex flex-col gap-0.5">
								<span class="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Environment</span>
								<span class="text-base font-bold text-foreground">{{ customNodeProps.data?.toolCount || 0 }} tools</span>
							</div>
						</UiCardContent>
					</UiCard>
				</div>
			</CollapsibleSection>

			<!-- Chain Control Buttons -->
			<CollapsibleSection title="Chain Nodes" icon="i-lucide-layers" :default-collapsed="true">
				<div class="flex flex-col gap-2">
					<UiBadge variant="outline" class="w-full justify-center bg-success/10 text-success border-success/20">
						{{ activeNodesCount }}/{{ chainControls.length }} Visible
					</UiBadge>
					<div class="flex flex-col gap-2">
						<UiButton
							v-for="control in chainControls"
							:key="control.id"
							variant="ghost"
							class="w-full justify-start h-auto p-3"
							:class="control.visible ? 'bg-success/10 hover:bg-success/20 border border-success/20' : 'hover:bg-muted/30'"
							:title="control.visible ? `Hide ${control.label}` : `Show ${control.label}`"
							@click.stop="toggleNodeVisibility(control.id)"
						>
							<Icon :name="control.icon.replace('i-lucide-', 'lucide:')" class="w-4 h-4 mr-2 flex-shrink-0" />
							<span class="flex-1 text-left">{{ control.label }}</span>
							<Icon
								:name="control.visible ? 'lucide:eye' : 'lucide:eye-off'"
								class="w-4 h-4 flex-shrink-0"
								:class="control.visible ? 'text-success' : 'text-muted-foreground'"
							/>
						</UiButton>
					</div>
				</div>
			</CollapsibleSection>

			<!-- Configuration Details -->
			<CollapsibleSection title="Configuration Files" icon="i-lucide-file-json" :default-collapsed="true">
				<UiCard class="bg-muted/30 border-border">
					<UiCardContent class="p-3 flex flex-col gap-2">
						<div class="flex items-center gap-2 text-sm text-foreground">
							<Icon name="lucide:check-circle" class="w-3 h-3 text-success" />
							<span>b.json (Setup Scripts)</span>
						</div>
						<div class="flex items-center gap-2 text-sm text-foreground">
							<Icon name="lucide:check-circle" class="w-3 h-3 text-success" />
							<span>bl.json (Environment)</span>
						</div>
						<div class="flex items-center gap-2 text-sm text-foreground">
							<Icon name="lucide:check-circle" class="w-3 h-3 text-success" />
							<span>Node Positions Locked</span>
						</div>
					</UiCardContent>
				</UiCard>
			</CollapsibleSection>

			<!-- Actions -->
			<div class="flex flex-wrap gap-2">
				<UiButton
					variant="default"
					size="sm"
					class="flex-1 min-w-[150px] bg-success/20 text-success border-success/30 hover:bg-success/30 hover:border-success/50"
					@click.stop="showAllNodes"
				>
					<Icon name="lucide:maximize-2" class="w-4 h-4 mr-2" />
					Show Full Chain
				</UiButton>
				<UiButton
					variant="destructive"
					size="sm"
					class="flex-1 min-w-[150px]"
					@click.stop="hideAllNodes"
				>
					<Icon name="lucide:minimize-2" class="w-4 h-4 mr-2" />
					Hide All
				</UiButton>
				<UiButton
					variant="outline"
					size="sm"
					class="flex-1 min-w-[150px]"
					@click.stop="focusOnChain"
				>
					<Icon name="lucide:focus" class="w-4 h-4 mr-2" />
					Focus Chain
				</UiButton>
			</div>
		</NodePanel>
	</BaseNodeTemplate>
</template>

<script setup lang="ts">
	import { computed, ref } from "vue";
	import BaseNodeTemplate from "./templates/BaseNodeTemplate.vue";
	import NodePanel from "~/components/canvas/shared/NodePanel.vue";
	import CollapsibleSection from "~/components/dashboard/CollapsibleSection.vue";
	import TemplateExec from "./TemplateExec.vue";
	import UiButton from "~/components/Ui/Button.vue";
	import UiBadge from "~/components/Ui/Badge.vue";
	import UiCard from "~/components/Ui/Card/Card.vue";
	import UiCardContent from "~/components/Ui/Card/Content.vue";
	import Icon from "~/components/Ui/Icon.vue";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
	}

	const props = defineProps<Props>();
	const emit = defineEmits<{
		"toggle-node-visibility": [nodeType: string, visible: boolean]
		"show-all-nodes": []
		"hide-all-nodes": []
		"focus-chain": []
		"create-browser-node": [url: string, sourceNodeId: string, scriptName: string]
		"open-form-generator": [sourceNodeId: string, projectPath: string, templateId: string]
		"restore-form-chain": [formData: any, templateConfiguredNodeId: string]
	}>();

	// Get configured forms from template meta or node data
	const configuredForms = computed(() => {
		return props.customNodeProps.data?.configuredForms || [];
	});

	// Handle browser node creation from TemplateExec
	const handleCreateBrowserNode = (url: string, sourceNodeId: string, scriptName: string) => {
		console.log("🌐 TemplateConfiguredNode: Creating browser node", { url, sourceNodeId, scriptName });
		emit("create-browser-node", url, sourceNodeId, scriptName);
	};

	// Handle form generator opening
	const handleOpenFormGenerator = () => {
		console.log("🎨 TemplateConfiguredNode: Opening form generator");

		if (!props.customNodeProps.data?.projectPath) {
			console.warn("⚠️ No project path available for form generator");
			return;
		}

		emit("open-form-generator", props.customNodeProps.id, props.customNodeProps.data?.projectPath || "", props.customNodeProps.data?.templateId || "");

		// Update node to track that forms panel was opened
		props.updateNodeData(props.customNodeProps.id, "formsPanelOpened", true);
	};

	// Chain controls for each node type in the chain
	const chainControls = ref([
		{ id: "intentSelection", label: "Intent Selection", icon: "i-lucide-target", visible: false, nodeType: "intentSelection" },
		{ id: "projectExplorer", label: "Project Explorer", icon: "i-lucide-folder-tree", visible: false, nodeType: "projectExplorer" },
		{ id: "projectScriptRunner", label: "Script Runner", icon: "i-lucide-terminal", visible: false, nodeType: "projectScriptRunnerNode" },
		{ id: "bFolderSetup", label: "B Folder Setup", icon: "i-lucide-package", visible: false, nodeType: "bFolderSetupNode" },
		{ id: "saveTemplate", label: "Save Template", icon: "i-lucide-save", visible: false, nodeType: "saveTemplateNode" }
	]);

	// Count how many nodes are currently visible
	const activeNodesCount = computed(() => chainControls.value.filter((c) => c.visible).length);

	// Toggle visibility of nodes in chain
	const toggleNodeVisibility = (controlId: string) => {
		const control = chainControls.value.find((c) => c.id === controlId);
		if (control) {
			control.visible = !control.visible;
			console.log(`👁️ Toggling ${control.nodeType} visibility to:`, control.visible);
			emit("toggle-node-visibility", control.nodeType, control.visible);
		}
	};

	// Show all nodes
	const showAllNodes = () => {
		chainControls.value.forEach((control) => {
			control.visible = true;
		});
		emit("show-all-nodes");
	};

	// Hide all nodes
	const hideAllNodes = () => {
		chainControls.value.forEach((control) => {
			control.visible = false;
		});
		emit("hide-all-nodes");
	};

	// Focus on chain
	const focusOnChain = () => {
		emit("focus-chain");
	};

	// Theme color using primary from theme
	const themeColor = computed(() => "var(--color-primary)");

	// Handle clicking on a configured form to restore its chain
	const handleRestoreFormChain = (formData: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("🔄 RESTORING CONFIGURED FORM CHAIN");
		console.log("  Form Title:", formData.formTitle);
		console.log("  Form Data:", formData);
		console.log("═══════════════════════════════════════════");

		emit("restore-form-chain", formData, props.customNodeProps.id);
	};

	// Format timestamp for display
	const formatTimestamp = (timestamp: string) => {
		if (!timestamp) return "";
		const date = new Date(timestamp);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	};
</script>

<style scoped>
/* Template Configured Node Styles */
.template-configured-node {
	position: relative;
	overflow: visible !important;
}

/* Ensure icon wrapper is visible and not cut off */
.template-configured-node :deep(.node-icon-wrapper) {
	overflow: visible !important;
	z-index: 20 !important;
}

/* Ensure parent container allows overflow */
.template-configured-node :deep(.base-node-template) {
	overflow: visible !important;
}
</style>
