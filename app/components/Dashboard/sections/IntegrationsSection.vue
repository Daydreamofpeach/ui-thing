<template>
	<div class="integrations-section space-y-6">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-2xl font-semibold">Integrations</h2>
				<p class="text-sm text-muted-foreground mt-1">
					Connect external services to your organization and projects
				</p>
			</div>
		</div>

		<!-- Project Integrations Tab Component -->
		<ProjectIntegrationsTab />
	</div>
</template>

<script setup lang="ts">
import ProjectIntegrationsTab from "~/components/integrations/ProjectIntegrationsTab.vue";
</script>

<style scoped>
@reference "~/assets/css/tailwind.css";

.integrations-section {
	@apply p-4;
}
</style>

