<template>
	<!-- Modal Layout -->
	<OscarModal
		v-if="mode === 'modal'"
		:model-value="modelValue"
		@update:model-value="$emit('update:modelValue', $event)"
	/>

	<!-- Panel Layout -->
	<OscarPanel
		v-else-if="mode === 'panel'"
		:selected-project="selectedProject"
		:selected-project-id="selectedProjectId"
		:organization="organization"
		:projects="projects"
		:organizations="organizations"
		:selected-organisation-id="selectedOrganisationId"
	/>
</template>

<script setup lang="ts">
	import type { OscarLayoutMode } from "./types/oscar.types";
	import OscarModal from "./layouts/OscarModal.vue";
	import OscarPanel from "./layouts/OscarPanel.vue";

	interface Props {
		mode?: OscarLayoutMode
		modelValue?: boolean
		selectedProject?: any
		selectedProjectId?: string
		organization?: any
		projects?: any[]
		organizations?: any[]
		selectedOrganisationId?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		mode: "modal",
		modelValue: false,
		selectedProject: undefined,
		selectedProjectId: undefined,
		organization: undefined,
		projects: undefined,
		organizations: undefined,
		selectedOrganisationId: undefined
	});

	defineEmits<{
		"update:modelValue": [value: boolean]
	}>();

	// Debug: Log what props we're receiving
	console.log("🎯 Oscar Props:", {
		mode: props.mode,
		selectedProject: props.selectedProject,
		selectedProjectId: props.selectedProjectId,
		organization: props.organization,
		projects: props.projects,
		organizations: props.organizations,
		selectedOrganisationId: props.selectedOrganisationId
	});
</script>

