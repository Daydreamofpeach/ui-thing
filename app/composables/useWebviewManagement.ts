import { ref } from "vue";

export function useWebviewManagement() {
	const webviewNodes = ref<any[]>([]);
	const webviewContent = ref<Record<string, string>>({});

	const handleWebviewCodeChange = (nodeId: string, newContent: string) => {
		const node = webviewNodes.value.find(n => n.id === nodeId);
		if (node) {
			node.data.code = newContent;
			webviewContent.value[nodeId] = newContent;
			console.log("💾 Webview code updated for node:", nodeId);
		}
	};

	const handleWebviewRun = (nodeId: string) => {
		console.log("▶️ Running webview for node:", nodeId);
		const node = webviewNodes.value.find(n => n.id === nodeId);
		if (node) {
			node.data.isRunning = true;
		}
	};

	const handleWebviewStop = (nodeId: string) => {
		console.log("⏹️ Stopping webview for node:", nodeId);
		const node = webviewNodes.value.find(n => n.id === nodeId);
		if (node) {
			node.data.isRunning = false;
		}
	};

	return {
		webviewNodes,
		webviewContent,
		handleWebviewCodeChange,
		handleWebviewRun,
		handleWebviewStop
	};
}

