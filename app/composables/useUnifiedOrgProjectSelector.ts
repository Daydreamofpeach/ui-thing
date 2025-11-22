import { computed, watch } from "vue";
import { useOrganisations } from "~/composables/useOrganisations";
import { useSelectedOrganisationId } from "~/composables/useSelectedOrganisationId";
import { useProjectSelection } from "~/composables/useProjectSelection";

export function useUnifiedOrgProjectSelector() {
	const {
		organisations,
		isLoadingOrganisations,
		refreshOrganisations,
		apiCreate,
		apiUpdate,
		apiDelete
	} = useOrganisations();

	const selectedOrganisationId = useSelectedOrganisationId();

	const {
		projects,
		isLoadingProjects,
		loadProjectsForOrganization,
		setSelectedProject,
		selectedProject,
		selectedProjectId,
		clearProjectSelection
	} = useProjectSelection();

	// Keep projects in sync with organisation selection
	watch(selectedOrganisationId, (newOrgId) => {
		if (newOrgId) {
			loadProjectsForOrganization(newOrgId);
		} else {
			clearProjectSelection();
		}
	}, { immediate: true });

	const hasOrganisation = computed(() => !!selectedOrganisationId.value);

	function selectOrganisation(id: string) {
		selectedOrganisationId.value = id;
	}

	return {
		// Org
		organisations,
		isLoadingOrganisations,
		refreshOrganisations,
		selectOrganisation,
		selectedOrganisationId,
		apiCreate,
		apiUpdate,
		apiDelete,

		// Projects
		projects,
		isLoadingProjects,
		loadProjectsForOrganization,
		setSelectedProject,
		selectedProject,
		selectedProjectId,
		clearProjectSelection,

		// Derived
		hasOrganisation
	};
}


