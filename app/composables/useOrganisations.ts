import { ref } from "vue";
import { fetchOrganisations, createOrganisation as apiCreate, updateOrganisation as apiUpdate, deleteOrganisation as apiDelete } from "~/services/organisations";

const organisations = ref<any[]>([]);
const isLoadingOrganisations = ref(false);

export async function refreshOrganisations() {
	isLoadingOrganisations.value = true;
	try {
		console.log("🔄 Refreshing organizations...");
		const loadedOrganisations = await fetchOrganisations();
		organisations.value = loadedOrganisations || [];
		console.log("✅ Organizations refreshed. Total count:", organisations.value.length);
	} catch (error) {
		console.error("❌ Failed to refresh organizations:", error);
		organisations.value = [];
	} finally {
		isLoadingOrganisations.value = false;
	}
}

export function addOrganisation(organisation: any) {
	console.log("🏢 useOrganisations: Adding new organization to organisations array:", organisation);
	if (!organisations.value.some((org) => String(org.id) === String(organisation.id))) {
		organisations.value.unshift(organisation); // Add to beginning of array
		console.log("✅ Organization added successfully. Total organizations:", organisations.value.length);
	} else {
		console.log("⚠️ Organization already exists in array, skipping add");
	}
}

export function updateOrganisation(updatedOrganisation: any) {
	const index = organisations.value.findIndex((org) => String(org.id) === String(updatedOrganisation.id));
	if (index !== -1) {
		organisations.value[index] = updatedOrganisation;
		console.log("✅ Organization updated successfully");
	}
}

export function removeOrganisation(organisationId: string | number) {
	const index = organisations.value.findIndex((org) => String(org.id) === String(organisationId));
	if (index !== -1) {
		organisations.value.splice(index, 1);
		console.log("✅ Organization removed successfully");
	}
}

export function useOrganisations() {
	return {
		organisations,
		isLoadingOrganisations,
		refreshOrganisations,
		addOrganisation,
		updateOrganisation,
		removeOrganisation,
		// API helpers
		apiCreate,
		apiUpdate,
		apiDelete,
	};
}
