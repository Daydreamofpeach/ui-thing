import { ref, reactive } from 'vue';

interface LogitPanel {
	nodeId: string;
	endpointPath: string;
	nodeType: string;
	isOpen: boolean;
}

export const useLogitPanels = () => {
	const panels = reactive<Map<string, LogitPanel>>(new Map());
	const activePanels = ref<Set<string>>(new Set());

	const openPanel = (nodeId: string, endpointPath: string, nodeType: string) => {
		const panel: LogitPanel = {
			nodeId,
			endpointPath,
			nodeType,
			isOpen: true
		};
		
		panels.set(nodeId, panel);
		activePanels.value.add(nodeId);
	};

	const closePanel = (nodeId: string) => {
		const panel = panels.get(nodeId);
		if (panel) {
			panel.isOpen = false;
			activePanels.value.delete(nodeId);
		}
	};

	const togglePanel = (nodeId: string, endpointPath: string, nodeType: string) => {
		const panel = panels.get(nodeId);
		if (panel && panel.isOpen) {
			closePanel(nodeId);
		} else {
			openPanel(nodeId, endpointPath, nodeType);
		}
	};

	const isPanelOpen = (nodeId: string) => {
		return activePanels.value.has(nodeId);
	};

	const getPanel = (nodeId: string) => {
		return panels.get(nodeId);
	};

	const closeAllPanels = () => {
		panels.forEach(panel => {
			panel.isOpen = false;
		});
		activePanels.value.clear();
	};

	return {
		panels,
		activePanels,
		openPanel,
		closePanel,
		togglePanel,
		isPanelOpen,
		getPanel,
		closeAllPanels
	};
};
