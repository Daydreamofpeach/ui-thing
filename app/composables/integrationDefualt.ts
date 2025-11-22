import { ref } from "vue";
import { buttClient } from "~/utils/buttClient";

export interface DefaultIntegration {
	id?: string
	key?: string
	name?: string
	description?: string
	logo?: string
	url?: string // possible connect/display URL from API
	connectUrl?: string // alternative property name if provided
	[key: string]: any
}

export function useIntegrationDefualt() {
	const defaultIntegrations = ref<DefaultIntegration[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);

	async function fetchDefaultIntegrations(): Promise<DefaultIntegration[]> {
		loading.value = true;
		error.value = null;
		try {
			const data = await buttClient.findAllIntegration();
			defaultIntegrations.value = Array.isArray(data) ? data : [];
			return defaultIntegrations.value;
		} catch (e: any) {
			const message = e?.message || String(e);
			error.value = message;
			defaultIntegrations.value = [];
			return [];
		} finally {
			loading.value = false;
		}
	}

	return {
		defaultIntegrations,
		loading,
		error,
		fetchDefaultIntegrations
	};
}
