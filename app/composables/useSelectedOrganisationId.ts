import { ref, watch } from "vue";

const ORG_ID_KEY = "ORG_ID";
const selectedOrganisationId = ref<string | null>(localStorage.getItem(ORG_ID_KEY));

watch(selectedOrganisationId, (newId) => {
	if (newId) {
		localStorage.setItem(ORG_ID_KEY, newId);
	} else {
		localStorage.removeItem(ORG_ID_KEY);
	}
});

export function useSelectedOrganisationId() {
	return selectedOrganisationId;
}
