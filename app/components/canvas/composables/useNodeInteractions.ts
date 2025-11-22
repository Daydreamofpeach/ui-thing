import { computed, onMounted, onUnmounted, ref } from "vue";

export function useNodeInteractions(
	allNodes: any,
	edges: any,
	emit: any,
	allArrays: any[],
	updateNodeData: any,
	eventsModalOpen: any,
	commandsModalOpen: any,
	viewsModalOpen: any,
	gitActionsModalOpen: any
) {
	// Event-related refs
	const selectedNodeForEvent = ref<string | null>(null);
	const selectedNodeForCommand = ref<string | null>(null);
	const selectedNodeForView = ref<string | null>(null);
	const selectedNodeForGitAction = ref<string | null>(null);

	const openEventSelector = (nodeId: string) => {
		selectedNodeForEvent.value = nodeId;
		eventsModalOpen.value = true;
	};

	const handleEventSelect = (eventName: string) => {
		if (selectedNodeForEvent.value) {
			updateNodeData(selectedNodeForEvent.value, "eventName", eventName);
			updateNodeData(selectedNodeForEvent.value, "status", "active");
		}
		eventsModalOpen.value = false;
		selectedNodeForEvent.value = null;
	};

	const openCommandSelector = (nodeId: string) => {
		selectedNodeForCommand.value = nodeId;
		commandsModalOpen.value = true;
	};

	const handleCommandSelect = (commandName: string) => {
		if (selectedNodeForCommand.value) {
			updateNodeData(selectedNodeForCommand.value, "commandName", commandName);
			updateNodeData(selectedNodeForCommand.value, "status", "active");
		}
		commandsModalOpen.value = false;
		selectedNodeForCommand.value = null;
	};

	const handleCommandGoogle = (commandName: string) => {
		const url = `https://www.google.com/search?q=PowerShell+${encodeURIComponent(commandName)}`;
		window.open(url, "_blank");
	};

	const openViewSelector = (nodeId: string) => {
		selectedNodeForView.value = nodeId;
		viewsModalOpen.value = true;
	};

	const handleViewSelect = (viewType: string) => {
		if (selectedNodeForView.value) {
			updateNodeData(selectedNodeForView.value, "viewType", viewType);
			updateNodeData(selectedNodeForView.value, "status", "active");
		}
		viewsModalOpen.value = false;
		selectedNodeForView.value = null;
	};

	const openGitActionSelector = (nodeId: string) => {
		selectedNodeForGitAction.value = nodeId;
		gitActionsModalOpen.value = true;
	};

	const handleGitActionSelect = (gitCommand: string) => {
		if (selectedNodeForGitAction.value) {
			updateNodeData(selectedNodeForGitAction.value, "gitCommand", gitCommand);
			updateNodeData(selectedNodeForGitAction.value, "status", "active");
		}
		gitActionsModalOpen.value = false;
		selectedNodeForGitAction.value = null;
	};

	const testEvent = (nodeId: string) => {
		const node = allNodes.value.find((n: any) => n.id === nodeId);
		if (node?.data?.eventName) {
			console.log("Testing event:", node.data.eventName);
		}
	};

	const testCommand = (nodeId: string) => {
		const node = allNodes.value.find((n: any) => n.id === nodeId);
		if (node?.data?.commandName) {
			console.log("Testing command:", node.data.commandName);
		}
	};

	const testView = (nodeId: string) => {
		const node = allNodes.value.find((n: any) => n.id === nodeId);
		if (node?.data?.viewType) {
			console.log("Testing view:", node.data.viewType);
		}
	};

	const testGitAction = (nodeId: string) => {
		const node = allNodes.value.find((n: any) => n.id === nodeId);
		if (node?.data?.gitCommand) {
			console.log("Testing git action:", node.data.gitCommand);
		}
	};

	const getEventCategory = (eventName?: string): string => {
		if (!eventName) return "None";
		if (eventName.startsWith("github:")) return "GitHub";
		if (eventName.startsWith("jira:")) return "Jira";
		if (eventName.startsWith("bitbucket:")) return "Bitbucket";
		if (eventName.startsWith("ci:")) return "CI/CD";
		if (eventName.startsWith("on")) return "User Events";
		if (eventName.includes("Template")) return "Templating";
		return "Miscellaneous";
	};

	const getStatusClass = (status?: string): string => {
		switch (status) {
		case "active":
			return "text-green-400";
		case "error":
			return "text-red-400";
		case "inactive":
		default:
			return "text-gray-400";
		}
	};

	const getCommandCategory = (commandName?: string): string => {
		if (!commandName) return "None";
		if (commandName.startsWith("Get-")) return "Get Commands";
		if (commandName.startsWith("Set-")) return "Set Commands";
		if (commandName.startsWith("New-")) return "New Commands";
		if (commandName.startsWith("Remove-")) return "Remove Commands";
		if (commandName.startsWith("Start-")) return "Start Commands";
		if (commandName.startsWith("Stop-")) return "Stop Commands";
		if (commandName.includes("Process")) return "Process Management";
		if (commandName.includes("Service")) return "Service Management";
		if (commandName.includes("File") || commandName.includes("Item")) return "File System";
		return "Miscellaneous";
	};

	const getViewCategory = (viewType?: string): string => {
		if (!viewType) return "None";
		const type = viewType.toLowerCase();
		if (["pdf", "docx", "txt", "rtf", "odt"].includes(type)) return "Documents";
		if (["html", "xml", "json", "yaml", "css", "js", "ts"].includes(type)) return "Web & Code";
		if (["png", "jpg", "gif", "svg", "bmp", "tiff", "webp"].includes(type)) return "Images";
		if (["mp4", "mp3"].includes(type)) return "Media";
		if (["csv", "xlsx", "ods", "tsv"].includes(type)) return "Spreadsheets";
		if (["zip", "tar", "exe", "bin"].includes(type)) return "Archives & Executables";
		return "Other Formats";
	};

	const getGitActionCategory = (gitCommand?: string): string => {
		if (!gitCommand) return "None";
		if (["add", "commit", "push", "pull"].includes(gitCommand)) return "Basic Operations";
		if (["branch", "checkout", "merge", "rebase"].includes(gitCommand)) return "Branching";
		if (["status", "log", "diff", "show"].includes(gitCommand)) return "Information";
		if (["clone", "fetch", "remote"].includes(gitCommand)) return "Remote Operations";
		if (["reset", "revert", "cherry-pick"].includes(gitCommand)) return "History Manipulation";
		if (["stash", "tag", "archive"].includes(gitCommand)) return "Utilities";
		if (["config", "init", "help"].includes(gitCommand)) return "Configuration";
		return "Advanced";
	};

	const getNodeColor = (nodeType: string) => {
		const colors: Record<string, string> = {
			arrowRight: "#f97316",
			arrowLeft: "#f97316",
			arrowUp: "#f97316",
			arrowDown: "#f97316",
			database: "#3b82f6",
			api: "#10b981",
			server: "#8b5cf6",
			cloud: "#06b6d4",
			eventNode: "#f97316",
			commandNode: "#3b82f6",
			viewNode: "#22c55e",
			gitActionNode: "#a855f7",
			hookNode: "#eab308",
			transportNode: "#06b6d4",
			templateNode: "#6366f1",
			githubNode: "#24292e"
		};
		return colors[nodeType] || "#6b7280";
	};

	const deleteSelectedNodes = () => {
		const selectedNodes = allNodes.value.filter((node: any) => node.selected);

		selectedNodes.forEach((node: any) => {
			for (const { array } of allArrays) {
				const index = array.value.findIndex((n: any) => n.id === node.id);
				if (index !== -1) {
					array.value.splice(index, 1);
					console.log(`Deleted node ${node.id} from array`);
					emit("nodeDeleted", node.id);
					break;
				}
			}

			edges.value = edges.value.filter((edge: any) =>
				edge.source !== node.id && edge.target !== node.id
			);
		});

		console.log(`Deleted ${selectedNodes.length} selected nodes`);
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		// Only handle delete key if we're not in an input field
		if (event.key === "Delete" && !isTypingInInput(event.target)) {
			event.preventDefault();
			deleteSelectedNodes();
		}
	};

	const isTypingInInput = (target: EventTarget | null): boolean => {
		if (!target) return false;
		const element = target as HTMLElement;
		const tagName = element.tagName?.toLowerCase();
		const isInput = tagName === 'input' || tagName === 'textarea';
		const isContentEditable = element.contentEditable === 'true';
		return isInput || isContentEditable;
	};

	onMounted(() => {
		document.addEventListener("keydown", handleKeyDown);
	});

	onUnmounted(() => {
		document.removeEventListener("keydown", handleKeyDown);
	});

	return {
		selectedNodeForEvent,
		selectedNodeForCommand,
		selectedNodeForView,
		selectedNodeForGitAction,
		openEventSelector,
		handleEventSelect,
		openCommandSelector,
		handleCommandSelect,
		handleCommandGoogle,
		openViewSelector,
		handleViewSelect,
		openGitActionSelector,
		handleGitActionSelect,
		testEvent,
		testCommand,
		testView,
		testGitAction,
		getEventCategory,
		getStatusClass,
		getCommandCategory,
		getViewCategory,
		getGitActionCategory,
		getNodeColor,
		deleteSelectedNodes
	};
}

