<template>
	<UiCard class="p-0 overflow-hidden">
		<div class="border-b px-4 py-3 flex items-center justify-between">
			<span class="text-sm text-muted-foreground">Projects in selected organisation</span>
			<UiButton size="sm" variant="ghost" :disabled="isLoadingProjects" @click="reload">
				<Icon name="lucide:refresh-cw" class="size-4 mr-2" />
				Reload
			</UiButton>
		</div>
		<div v-if="!orgId" class="p-6 text-sm text-muted-foreground">
			Select an organisation to load projects.
		</div>
		<div v-else-if="isLoadingProjects" class="p-6 text-sm text-muted-foreground">Loading projects…</div>
		<div v-else>
			<div v-if="projects.length === 0" class="p-6 text-sm text-muted-foreground">
				No projects found in this organisation.
			</div>
			<ul v-else class="divide-y">
				<li
					v-for="p in projects"
					:key="p.id"
					class="px-4 py-3 flex items-center justify-between"
				>
					<div class="min-w-0">
						<div class="font-medium truncate">{{ p.name }}</div>
						<div class="text-xs text-muted-foreground truncate">{{ p.description || 'No description' }}</div>
					</div>
					<UiButton size="sm" variant="secondary" @click="setSelectedProject(p)">
						Select
					</UiButton>
				</li>
			</ul>
		</div>
	</UiCard>
</template>

<script setup lang="ts">
import UiCard from "~/components/Ui/Card/Card.vue";
import UiButton from "~/components/Ui/Button.vue";
import { useProjectSelection } from "~/composables/useProjectSelection";
import { useSelectedOrganisationId } from "~/composables/useSelectedOrganisationId";
import { computed } from "vue";

const { projects, isLoadingProjects, setSelectedProject, loadProjectsForOrganization } = useProjectSelection();
const orgIdRef = useSelectedOrganisationId();
const orgId = computed(() => orgIdRef.value);

function reload() {
	if (orgId.value) {
		loadProjectsForOrganization(orgId.value);
	}
}
</script>


