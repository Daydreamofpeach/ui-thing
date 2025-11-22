import { ref } from "vue";

export function useEventHandlers() {
	const eventsModalOpen = ref(false);
	const selectedNodeForEvent = ref<string | null>(null);
	const commandsModalOpen = ref(false);
	const selectedNodeForCommand = ref<string | null>(null);
	const viewsModalOpen = ref(false);
	const selectedNodeForView = ref<string | null>(null);
	const gitActionsModalOpen = ref(false);
	const selectedNodeForGitAction = ref<string | null>(null);

	const openEventModal = (nodeId: string) => {
		selectedNodeForEvent.value = nodeId;
		eventsModalOpen.value = true;
	};

	const closeEventModal = () => {
		eventsModalOpen.value = false;
		selectedNodeForEvent.value = null;
	};

	const handleEventSelected = (event: any, updateNodeData: (nodeId: string, key: string, value: any) => void) => {
		if (selectedNodeForEvent.value) {
			updateNodeData(selectedNodeForEvent.value, "eventName", event.name);
			updateNodeData(selectedNodeForEvent.value, "trigger", event.trigger);
			updateNodeData(selectedNodeForEvent.value, "status", "active");
		}
		closeEventModal();
	};

	const openCommandModal = (nodeId: string) => {
		selectedNodeForCommand.value = nodeId;
		commandsModalOpen.value = true;
	};

	const closeCommandModal = () => {
		commandsModalOpen.value = false;
		selectedNodeForCommand.value = null;
	};

	const handleCommandSelected = (command: any, updateNodeData: (nodeId: string, key: string, value: any) => void) => {
		if (selectedNodeForCommand.value) {
			updateNodeData(selectedNodeForCommand.value, "commandName", command.name);
			updateNodeData(selectedNodeForCommand.value, "commandType", command.type);
			updateNodeData(selectedNodeForCommand.value, "status", "active");
		}
		closeCommandModal();
	};

	const openViewModal = (nodeId: string) => {
		selectedNodeForView.value = nodeId;
		viewsModalOpen.value = true;
	};

	const closeViewModal = () => {
		viewsModalOpen.value = false;
		selectedNodeForView.value = null;
	};

	const handleViewSelected = (view: any, updateNodeData: (nodeId: string, key: string, value: any) => void) => {
		if (selectedNodeForView.value) {
			updateNodeData(selectedNodeForView.value, "viewType", view.type);
			updateNodeData(selectedNodeForView.value, "format", view.format);
			updateNodeData(selectedNodeForView.value, "status", "active");
		}
		closeViewModal();
	};

	const openGitActionModal = (nodeId: string) => {
		selectedNodeForGitAction.value = nodeId;
		gitActionsModalOpen.value = true;
	};

	const closeGitActionModal = () => {
		gitActionsModalOpen.value = false;
		selectedNodeForGitAction.value = null;
	};

	const handleGitActionSelected = (action: any, updateNodeData: (nodeId: string, key: string, value: any) => void) => {
		if (selectedNodeForGitAction.value) {
			updateNodeData(selectedNodeForGitAction.value, "gitCommand", action.command);
			updateNodeData(selectedNodeForGitAction.value, "repository", action.repository);
			updateNodeData(selectedNodeForGitAction.value, "status", "active");
		}
		closeGitActionModal();
	};

	return {
		eventsModalOpen,
		selectedNodeForEvent,
		commandsModalOpen,
		selectedNodeForCommand,
		viewsModalOpen,
		selectedNodeForView,
		gitActionsModalOpen,
		selectedNodeForGitAction,
		openEventModal,
		closeEventModal,
		handleEventSelected,
		openCommandModal,
		closeCommandModal,
		handleCommandSelected,
		openViewModal,
		closeViewModal,
		handleViewSelected,
		openGitActionModal,
		closeGitActionModal,
		handleGitActionSelected
	};
}

