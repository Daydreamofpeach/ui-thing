<template>
	<div class="project-integrations-tab space-y-6">
		<!-- Project Selection -->
		<div v-if="!selectedProject" class="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
			<div class="flex items-center gap-2">
				<Icon name="lucide:alert-circle" class="size-5 text-yellow-400" />
				<span class="text-sm text-yellow-300">Please select a project to manage integrations</span>
			</div>
		</div>

		<!-- Integration Management (when project is selected) -->
		<div v-else>
			<!-- Link Service Component -->
			<LinkService
				:selected-project="selectedProject"
				@integrationLinked="handleIntegrationLinked"
			/>

			<!-- Project Linked Connections -->
			<ProjectLinkedConnections
				ref="projectLinkedConnectionsRef"
				:selected-project="selectedProject"
				@connectionUnlinked="handleConnectionUnlinked"
				@connectionsRefreshed="handleConnectionsRefreshed"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useOscarData } from "~/composables/useOscarData";
import LinkService from "./links/LinkService.vue";
import ProjectLinkedConnections from "./links/ProjectLinkedConnections.vue";

const { selectedProject } = useOscarData();
const projectLinkedConnectionsRef = ref<any>(null);

// Event handlers
function handleIntegrationLinked(linkData: any) {
	console.log("Integration linked:", linkData);

	// Handle GitHub repository links specifically
	if (linkData.selectedRepository && linkData.integration?.type === "GITHUB") {
		console.log("Processing GitHub repository link");
		if (projectLinkedConnectionsRef.value) {
			console.log("Calling addGitHubConnection...");
			projectLinkedConnectionsRef.value.addGitHubConnection(linkData.selectedRepository, linkData.integration);
			console.log("addGitHubConnection called successfully");
		}
	} else {
		console.log("Processing non-GitHub integration link");
		// For other integrations, refresh the linked connections component
		if (projectLinkedConnectionsRef.value) {
			setTimeout(() => {
				projectLinkedConnectionsRef.value.fetchLinkedConnections();
			}, 500);
		}
	}
}

function handleConnectionUnlinked(connection: any) {
	console.log("Connection unlinked:", connection);
}

function handleConnectionsRefreshed(connections: any[]) {
	console.log("Connections refreshed:", connections);
}
</script>

<style scoped>
@reference "~/assets/css/tailwind.css";

.project-integrations-tab {
	@apply p-4;
}
</style>

