<template>
	<div class="oscar-dashboard-integration h-full">
		<!-- Oscar Panel with real data -->
		<Oscar
			mode="panel"
			:selected-project="selectedProject"
			:organization="currentOrganization"
			:projects="filteredProjects"
			:organizations="organizations"
			:selected-organisation-id="selectedOrganisationId || undefined"
			:selected-project-id="selectedProjectId"
		/>
	</div>
</template>

<script setup lang="ts">
	import Oscar from "./Oscar.vue";

	interface Props {
		// Organization data
		organizations: Array<{ id: string | number; name: string; butt?: string }>;
		currentOrganization: { id: string | number; name: string; butt?: string } | null;
		selectedOrganisationId: string | null;
		
		// Project data
		projects: Array<any>;
		filteredProjects: Array<any>;
		selectedProject: any;
		selectedProjectId: string;
		
		// Loading states
		isLoadingOrganizations?: boolean;
		isLoadingProjects?: boolean;
	}

	const props = withDefaults(defineProps<Props>(), {
		isLoadingOrganizations: false,
		isLoadingProjects: false
	});

	// Debug: Log what data we're receiving from dashboard
	console.log("🔥 OscarDashboardIntegration Data:", {
		organizations: props.organizations,
		currentOrganization: props.currentOrganization,
		projects: props.projects,
		filteredProjects: props.filteredProjects,
		selectedProject: props.selectedProject,
		selectedProjectId: props.selectedProjectId,
		selectedOrganisationId: props.selectedOrganisationId
	});

	// Debug: Log the actual values
	console.log("🔥 OscarDashboardIntegration Values:", {
		organizationsCount: props.organizations?.length,
		currentOrganizationId: props.currentOrganization?.id,
		currentOrganizationName: props.currentOrganization?.name,
		projectsCount: props.projects?.length,
		filteredProjectsCount: props.filteredProjects?.length,
		selectedProjectId: props.selectedProjectId,
		selectedProjectName: props.selectedProject?.name,
		selectedOrganisationId: props.selectedOrganisationId
	});
</script>

<style scoped>
.oscar-dashboard-integration {
	height: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden; /* Prevent content from escaping */
	position: relative;
	z-index: 1; /* Below header */
}
</style>

