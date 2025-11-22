import { ref, computed, watch } from "vue";
import { useOrganisations } from "~/composables/useOrganisations";
import { useSelectedOrganisationId } from "~/composables/useSelectedOrganisationId";
import { buttClient } from "~/utils/buttClient";

// Global state for Oscar data
const projects = ref<any[]>([]);
const selectedProjectId = ref<string>("");
const isLoadingProjects = ref(false);

export const useOscarData = () => {
	// Use existing composables for organizations
	const { organisations, isLoadingOrganisations, refreshOrganisations } = useOrganisations();
	const selectedOrganisationId = useSelectedOrganisationId();

	// Computed properties
	const currentOrganization = computed(() => {
		if (!organisations.value || !selectedOrganisationId.value) return null;
		return organisations.value.find((org) => org.id?.toString() === selectedOrganisationId.value?.toString());
	});

	const selectedProject = computed(() => {
		const project = projects.value.find((p) => String(p.id) === String(selectedProjectId.value));
		console.log("🎯 useOscarData: selectedProject computed:", {
			selectedProjectId: selectedProjectId.value,
			projectsCount: projects.value.length,
			foundProject: project
		});
		return project;
	});

	const filteredProjects = computed(() => {
		if (!selectedOrganisationId.value) return [];
		// All projects in the array already belong to the selected organization
		return projects.value;
	});

	// Functions to load data
	const loadProjects = async (orgId?: string) => {
		const orgIdToUse = orgId || selectedOrganisationId.value;
		if (!orgIdToUse) {
			projects.value = [];
			return;
		}

		isLoadingProjects.value = true;
		try {
			console.log("🔄 Loading projects for organization:", orgIdToUse);
			const loadedProjects = await buttClient.findAllByOrg(orgIdToUse);
			projects.value = loadedProjects || [];
			console.log("✅ Loaded projects:", projects.value.length);
		} catch (error) {
			console.error("❌ Failed to load projects:", error);
			projects.value = [];
		} finally {
			isLoadingProjects.value = false;
		}
	};

	const selectProject = (projectId: string | number) => {
		console.log("🎯 useOscarData: selectProject called with:", projectId);
		selectedProjectId.value = String(projectId);
		console.log("🎯 useOscarData: selectedProjectId updated to:", selectedProjectId.value);
	};

	const selectOrganisation = (orgId: string | null) => {
		selectedOrganisationId.value = orgId;
		// Note: setCurrentOrganisationId method doesn't exist in buttClient
		// The organization ID is managed by the useSelectedOrganisationId composable
		console.log("🎯 useOscarData: Organization selected:", orgId);
	};

	const addProject = (project: any) => {
		console.log("🎯 useOscarData: Adding new project to projects array:", project);
		if (!projects.value.some((p) => String(p.id) === String(project.id))) {
			projects.value.push(project);
			console.log("✅ Project added successfully. Total projects:", projects.value.length);
		} else {
			console.log("⚠️ Project already exists in array, skipping add");
		}
	};

	const updateProject = (updatedProject: any) => {
		const index = projects.value.findIndex((p) => String(p.id) === String(updatedProject.id));
		if (index !== -1) {
			projects.value[index] = updatedProject;
		}
	};

	const removeProject = (projectId: string | number) => {
		const index = projects.value.findIndex((p) => String(p.id) === String(projectId));
		if (index !== -1) {
			projects.value.splice(index, 1);
		}
	};

	const refreshProjects = async () => {
		await loadProjects();
	};

	// Watch for organization changes and auto-load projects
	watch(selectedOrganisationId, async (newOrgId, oldOrgId) => {
		if (newOrgId !== oldOrgId) {
			selectedProjectId.value = "";
			if (newOrgId) {
				await loadProjects(newOrgId);
			} else {
				projects.value = [];
			}
		}
	}, { immediate: true });

	// Watch for projects changes and auto-select first project if none selected
	watch(projects, (newProjects, oldProjects) => {
		console.log("🎯 useOscarData: Projects watcher triggered");
		console.log("🎯 useOscarData: New projects count:", newProjects.length);
		console.log("🎯 useOscarData: Current selectedProjectId:", selectedProjectId.value);
		console.log("🎯 useOscarData: First project:", newProjects[0]);
		
		if (newProjects.length > 0 && !selectedProjectId.value) {
			// Auto-select the first project when projects are loaded
			const firstProject = newProjects[0];
			console.log("🎯 useOscarData: Auto-selecting first project:", firstProject);
			selectedProjectId.value = String(firstProject.id);
			console.log("🎯 useOscarData: selectedProjectId now set to:", selectedProjectId.value);
		}
	}, { immediate: true, deep: true });

	// Ensure a project is selected for Oscar
	const ensureProjectSelected = () => {
		console.log("🎯 useOscarData: ensureProjectSelected called");
		console.log("🎯 useOscarData: Current selectedProjectId:", selectedProjectId.value);
		console.log("🎯 useOscarData: Available projects:", projects.value.length);
		
		if (projects.value.length > 0 && !selectedProjectId.value) {
			const firstProject = projects.value[0];
			console.log("🎯 useOscarData: No project selected, selecting first:", firstProject);
			selectedProjectId.value = String(firstProject.id);
			return true;
		}
		return false;
	};

	// Oscar-specific data getter
	const getOscarData = () => {
		const data = {
			// Organizations
			organizations: organisations.value || [],
			currentOrganization: currentOrganization.value || null,
			selectedOrganisationId: selectedOrganisationId.value || null,
			isLoadingOrganizations: isLoadingOrganisations.value || false,
			
			// Projects
			projects: projects.value || [],
			filteredProjects: filteredProjects.value || [],
			selectedProject: selectedProject.value || null,
			selectedProjectId: selectedProjectId.value || "",
			isLoadingProjects: isLoadingProjects.value || false,
		};
		
		console.log("🎯 Oscar Data:", data);
		return data;
	};

	// Ensure projects are loaded for current organization
	const ensureProjectsLoaded = async () => {
		console.log("🎯 useOscarData: ensureProjectsLoaded called");
		console.log("🎯 useOscarData: selectedOrganisationId:", selectedOrganisationId.value);
		console.log("🎯 useOscarData: projects count:", projects.value.length);
		console.log("🎯 useOscarData: isLoadingProjects:", isLoadingProjects.value);
		
		if (selectedOrganisationId.value && projects.value.length === 0 && !isLoadingProjects.value) {
			console.log("🎯 useOscarData: Loading projects...");
			await loadProjects();
		} else if (selectedOrganisationId.value && projects.value.length > 0 && !selectedProjectId.value) {
			console.log("🎯 useOscarData: Projects loaded but none selected, auto-selecting first");
			// Auto-select first project if none selected
			const firstProject = projects.value[0];
			selectedProjectId.value = String(firstProject.id);
		}
	};

	return {
		// State
		projects,
		selectedProjectId,
		isLoadingProjects,
		
		// Computed
		currentOrganization,
		selectedProject,
		filteredProjects,
		
		// Organizations (with both names for compatibility)
		organisations,
		organizations: organisations,
		selectedOrganisationId,
		isLoadingOrganisations,
		isLoadingOrganizations: isLoadingOrganisations,
		
		// Functions
		loadProjects,
		refreshProjects,
		selectProject,
		selectOrganisation,
		addProject,
		updateProject,
		removeProject,
		refreshOrganisations,
		getOscarData,
		ensureProjectsLoaded,
		ensureProjectSelected,
	};
};
