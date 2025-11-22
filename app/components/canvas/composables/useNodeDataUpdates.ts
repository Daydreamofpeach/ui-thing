export function useNodeDataUpdates(
	allArrays: any[],
	getGitHubRepoData: any,
	processDataFlow: any
) {
	const updateNodeData = (nodeId: string, key: string, value: any) => {
		console.log(`updateNodeData: Updating node ${nodeId} ${key} to:`, value);

		let nodeFound = false;
		for (const { array, name } of allArrays) {
			const node = array.value.find((n: any) => n.id === nodeId);
			if (node) {
				node.data[key] = value;
				console.log(`✅ Updated node ${nodeId} ${key} to:`, value, 'in array:', name);
				nodeFound = true;

				if (isDataProducingNode(node)) {
					processNodeDataFlow(node);
				}
				break;
			}
		}

		if (!nodeFound) {
			console.warn(`❌ updateNodeData: Node ${nodeId} not found in any array`);
			console.log('🔍 Available arrays:', allArrays.map(({ name, array }) => ({ name, count: array.value.length })));
		}
	};

	const isDataProducingNode = (node: any): boolean => {
		const dataProducingTypes = ["githubNode", "commandNode", "eventNode", "apiNode"];
		return dataProducingTypes.includes(node.type);
	};

	const processNodeDataFlow = (node: any) => {
		if (!isDataProducingNode(node)) return;

		let dataToProcess = null;
		const sourceType = node.type;

		switch (node.type) {
		case "githubNode":
			if (node.data && !node.data.isGhosted) {
				dataToProcess = getGitHubRepoData(node.data);
			}
			break;
		case "commandNode":
			if (node.data && node.data.commandName) {
				dataToProcess = {
					command: {
						name: node.data.commandName,
						type: node.data.commandType || "PowerShell",
						status: node.data.status || "Inactive",
						category: getCommandCategory(node.data.commandName)
					},
					metadata: {
						sourceType: "command",
						timestamp: new Date().toISOString(),
						nodeId: node.id
					}
				};
			}
			break;
		case "eventNode":
			if (node.data && node.data.eventName) {
				dataToProcess = {
					event: {
						name: node.data.eventName,
						trigger: node.data.trigger || "Manual",
						status: node.data.status || "Inactive",
						category: getEventCategory(node.data.eventName)
					},
					metadata: {
						sourceType: "event",
						timestamp: new Date().toISOString(),
						nodeId: node.id
					}
				};
			}
			break;
		}

		if (dataToProcess) {
			processDataFlow(node.id, dataToProcess, sourceType);
		}
	};

	const getCommandCategory = (commandName?: string): string => {
		if (!commandName) return "None";
		if (commandName.startsWith("Get-")) return "Get Commands";
		if (commandName.startsWith("Set-")) return "Set Commands";
		if (commandName.startsWith("New-")) return "New Commands";
		return "Miscellaneous";
	};

	const getEventCategory = (eventName?: string): string => {
		if (!eventName) return "None";
		if (eventName.startsWith("github:")) return "GitHub";
		if (eventName.startsWith("jira:")) return "Jira";
		return "Miscellaneous";
	};

	const refreshViewData = (nodeId: string) => {
		// Note: allNodes is not directly available in this composable
		// We need to search through allArrays instead
		for (const { array } of allArrays) {
			const node = array.value.find((n: any) => n.id === nodeId);
			if (node) {
				if (isDataProducingNode(node)) {
					processNodeDataFlow(node);
				}
				break;
			}
		}
	};

	return {
		updateNodeData,
		isDataProducingNode,
		processNodeDataFlow,
		refreshViewData
	};
}

