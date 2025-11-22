<template>
	<!-- Panel Layout - Matches NodeCanvasRightPanel styling -->
	<div class="h-full flex flex-col relative oscar-panel-newui">
		<!-- Messages Area - Takes all available space -->
		<div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden oscar-messages-container">
			<OscarMessages
				:compact="false"
				:selected-project="selectedProject"
			/>
		</div>

		<!-- Input Area - Fixed at bottom -->
		<div class="oscar-input-area">
			<OscarInput :compact="false" :show-debug="false" />
		</div>
	</div>
</template>

<script setup lang="ts">
	import OscarInput from "../core/OscarInput.vue";
	import OscarMessages from "../core/OscarMessages.vue";

	interface Props {
		selectedProject?: any
		selectedProjectId?: string
		organization?: any
		projects?: any[]
		organizations?: any[]
		selectedOrganisationId?: string | null
	}

	const props = defineProps<Props>();

	// Debug: Log what props we're receiving
	console.log("🎯 OscarPanel Props:", {
		selectedProject: props.selectedProject,
		selectedProjectId: props.selectedProjectId,
		organization: props.organization,
		projects: props.projects,
		organizations: props.organizations,
		selectedOrganisationId: props.selectedOrganisationId
	});

</script>

<style scoped>
/* Oscar Panel - Match NodeCanvasRightPanel NewUI System */
.oscar-panel-newui {
	background: transparent;
	overflow: hidden; /* Contain all content */
	position: relative;
	z-index: auto; /* Don't interfere with parent z-index */
}

.oscar-messages-container {
	padding: 0;
	background: rgba(0, 0, 0, 0.08);
	overflow-x: hidden; /* Prevent horizontal scroll */
	position: relative;
	z-index: 1; /* Below input/header */
}

.oscar-messages-container::-webkit-scrollbar {
	width: 5px;
}

.oscar-messages-container::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.15);
}

.oscar-messages-container::-webkit-scrollbar-thumb {
	background: rgba(var(--color-primary-rgb), 0.25);
	border-radius: 3px;
	transition: background 0.2s;
}

.oscar-messages-container::-webkit-scrollbar-thumb:hover {
	background: rgba(var(--color-primary-rgb), 0.4);
}

.oscar-panel-newui {
	/* Ensure Oscar panel doesn't create blocking overlays */
	overflow: hidden;
	position: relative;
	isolation: isolate; /* Create isolated stacking context */
}

.oscar-messages-container {
	/* Messages area proper containment */
	overflow-x: hidden;
	position: relative;
	z-index: 1;
	pointer-events: auto; /* Allow scrolling and interaction */
}

.oscar-input-area {
	padding: 10px 12px;
	background: rgba(0, 0, 0, 0.2);
	border-top: 1px solid rgba(255, 255, 255, 0.06);
	position: relative;
	z-index: 2; /* Above messages */
	flex-shrink: 0;
}
</style>

