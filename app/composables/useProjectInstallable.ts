import { ref } from "vue";
import { buttClient } from "@utils/buttClient";

export function useProjectInstallable() {
	const isChecking = ref(false);
	const isSetting = ref(false);
	const error = ref<Error | null>(null);

	async function checkInstallable(projectId: string): Promise<boolean> {
		if (!projectId) {
			throw new Error("projectId is required to check installable status");
		}

		isChecking.value = true;
		error.value = null;

		try {
			const result = await buttClient.isInstallable(projectId);
			return !!result?.installable || result === true;
		} catch (err: unknown) {
			const normalized = err instanceof Error ? err : new Error("Failed to check installable status");
			error.value = normalized;
			throw normalized;
		} finally {
			isChecking.value = false;
		}
	}

	async function setInstallable(projectId: string): Promise<any> {
		if (!projectId) {
			throw new Error("projectId is required to set installable status");
		}

		isSetting.value = true;
		error.value = null;

		try {
			return await buttClient.setInstallable(projectId);
		} catch (err: unknown) {
			const normalized = err instanceof Error ? err : new Error("Failed to set project as installable");
			error.value = normalized;
			throw normalized;
		} finally {
			isSetting.value = false;
		}
	}

	async function setNotInstallable(projectId: string): Promise<any> {
		if (!projectId) {
			throw new Error("projectId is required to unset installable status");
		}

		isSetting.value = true;
		error.value = null;

		try {
			return await buttClient.setNotInstallable(projectId);
		} catch (err: unknown) {
			const normalized = err instanceof Error ? err : new Error("Failed to set project as not installable");
			error.value = normalized;
			throw normalized;
		} finally {
			isSetting.value = false;
		}
	}

	return {
		// state
		isChecking,
		isSetting,
		error,

		// methods
		checkInstallable,
		setInstallable,
		setNotInstallable
	};
}

