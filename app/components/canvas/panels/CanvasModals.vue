<template>
	<div>
		<!-- Events Modal -->
		<EventsModal
			:open="eventsModalOpen"
			:current-event="selectedNodeForEvent"
			@close="$emit('close-events-modal')"
			@select="$emit('event-selected', $event)"
		/>

		<!-- Commands Modal -->
		<CommandsModal
			:open="commandsModalOpen"
			:commands="commands"
			:loading="commandsLoading"
			:error="commandsError"
			:current-command="selectedNodeForCommand"
			@close="$emit('close-commands-modal')"
			@select="$emit('command-selected', $event)"
		/>

		<!-- Views Modal -->
		<ViewsModal
			:open="viewsModalOpen"
			:current-view="selectedNodeForView"
			@close="$emit('close-views-modal')"
			@select="$emit('view-selected', $event)"
		/>

		<!-- Git Actions Modal -->
		<GitActionsModal
			:open="gitActionsModalOpen"
			:current-command="selectedNodeForGitAction"
			@close="$emit('close-git-actions-modal')"
			@select="$emit('git-action-selected', $event)"
		/>

		<!-- Hook Modal -->
		<HookModal
			:is-open="showHookModal"
			:organisation-id="projectId"
			@close="$emit('close-hook-modal')"
			@created="$emit('hook-created', $event)"
		/>

		<!-- Transport Modal -->
		<TransportModal
			:is-open="showTransportModal"
			:transport="selectedTransport"
			@close="$emit('close-transport-modal')"
			@created="$emit('transport-created', $event)"
		/>

		<!-- Template Modal -->
		<TemplateModal
			:is-open="showTemplateCreationModal"
			:node-id="selectedNodeForTemplate || undefined"
			:project-id="projectId"
			:canvas-data="canvasData"
			@close="$emit('close-template-modal')"
			@created="$emit('template-created', $event)"
			@updated="$emit('template-updated', $event)"
		/>

		<!-- JSON Editor Modal -->
		<JsonEditorModal
			v-if="showJsonView"
			:open="showJsonView"
			:json-data="formattedJsonOutput"
			@close="$emit('close-json-view')"
			@copy="$emit('copy-json')"
			@download="$emit('download-json')"
		/>
	</div>
</template>

<script lang="ts" setup>
	import CommandsModal from "../modals/CommandsModal.vue";
	import EventsModal from "../modals/EventsModal.vue";
	import GitActionsModal from "../modals/GitActionsModal.vue";
	import ViewsModal from "../modals/ViewsModal.vue";
	import HookModal from "~/components/modals/HookModal.vue";
	import JsonEditorModal from "~/components/modals/JsonEditorModal.vue";
	import TemplateModal from "~/components/modals/TemplateModal.vue";
	import TransportModal from "~/components/modals/TransportModal.vue";

	interface Props {
		eventsModalOpen: boolean
		commandsModalOpen: boolean
		viewsModalOpen: boolean
		gitActionsModalOpen: boolean
		showHookModal: boolean
		showTransportModal: boolean
		showTemplateCreationModal: boolean
		showJsonView: boolean
		selectedNodeForEvent: string | null
		selectedNodeForCommand: string | null
		selectedNodeForView: string | null
		selectedNodeForGitAction: string | null
		selectedNodeForTemplate: string | null
		selectedTransport: any
		projectId?: string
		commands: any[]
		commandsLoading: boolean
		commandsError: string | null
		formattedJsonOutput: string
		canvasData: { nodes: any[], edges: any[] }
	}

	defineProps<Props>();

	defineEmits<{
		"close-events-modal": []
		"event-selected": [event: any]
		"close-commands-modal": []
		"command-selected": [command: any]
		"close-views-modal": []
		"view-selected": [view: any]
		"close-git-actions-modal": []
		"git-action-selected": [action: any]
		"close-hook-modal": []
		"hook-created": [hook: any]
		"close-transport-modal": []
		"transport-created": [transport: any]
		"close-template-modal": []
		"template-created": [template: any]
		"template-updated": [nodeId: string, templateData: any]
		"close-json-view": []
		"copy-json": []
		"download-json": []
	}>();
</script>
