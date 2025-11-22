import { ref } from "vue";
import { buttClient } from "~/utils/buttClient";

export const useGitHubIntegration = () => {
	const githubRepositories = ref<any[]>([]);
	const loadingGitHubRepositories = ref(false);
	const githubError = ref<string | null>(null);

	const loadGitHubRepositories = async (projectId?: string) => {
		if (!projectId)
			return;

		loadingGitHubRepositories.value = true;
		githubError.value = null;

		try {
			const linkedConnections = await buttClient.linkedConnections(projectId);
			const githubConnections = linkedConnections.filter((connection: any) => {
				return (
					connection.integrationConnection?.type === "GITHUB"
					|| connection.meta?.integration?.type === "GITHUB"
					|| connection.integration?.type === "GITHUB"
				);
			});

			githubRepositories.value = githubConnections;
		}
		catch (err: any) {
			console.error("❌ Failed to load GitHub repositories:", err);
			githubError.value = err?.message || "Failed to load GitHub repositories";
			githubRepositories.value = [];
		}
		finally {
			loadingGitHubRepositories.value = false;
		}
	};

	const getRepositoryNodeData = (repo: any) => ({
		repositoryName: repo.meta?.repository?.name || repo.name || "GitHub Repository",
		repositoryUrl: repo.meta?.repository?.html_url || null,
		repositoryDescription: repo.meta?.repository?.description || "No description",
		language: repo.meta?.repository?.language || null,
		isPrivate: repo.meta?.repository?.private || false,
		stars: repo.meta?.repository?.stargazers_count || 0,
		forks: repo.meta?.repository?.forks_count || 0,
		lastUpdated: repo.meta?.repository?.updated_at || null,
		isGhosted: false,
		repositoryId: repo.id,
		repositoryData: repo,
	});

	const getGhostedNodeData = () => ({
		repositoryName: "No Repository Linked",
		repositoryUrl: null,
		repositoryDescription: "Connect a GitHub repository to this node",
		language: null,
		isPrivate: false,
		stars: 0,
		forks: 0,
		lastUpdated: null,
		isGhosted: true,
		repositoryId: null,
		repositoryData: null,
	});

	const openGitHubRepository = async (repositoryUrl: string | null) => {
		if (!repositoryUrl) {
			console.warn("No repository URL available");
			return;
		}

		try {
			const { open } = await import("@tauri-apps/plugin-shell");
			await open(repositoryUrl);
		}
		catch (error) {
			console.error("❌ Failed to open repository:", error);
			window.open(repositoryUrl, "_blank");
		}
	};

	return {
		githubRepositories,
		loadingGitHubRepositories,
		githubError,
		loadGitHubRepositories,
		getRepositoryNodeData,
		getGhostedNodeData,
		openGitHubRepository,
	};
};

