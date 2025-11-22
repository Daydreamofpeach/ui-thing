export function useGitHubNodeHandlers(
	githubIntegration: any,
	githubNodes: any
) {
	const {
		githubRepositories,
		getRepositoryNodeData
	} = githubIntegration;

	const connectGitHubRepository = (nodeId: string) => {
		if (githubRepositories.value.length === 0) {
			console.warn("No GitHub repositories available to connect");
			return;
		}

		const repo = githubRepositories.value[0];
		const node = githubNodes.value.find((n: any) => n.id === nodeId);
		if (node) {
			node.data = { ...node.data, ...getRepositoryNodeData(repo) };
			console.log("✅ Connected GitHub repository to node:", nodeId, repo.meta?.repository?.name);
		}
	};

	return {
		connectGitHubRepository
	};
}

