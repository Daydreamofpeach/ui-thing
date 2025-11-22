export function useNodeCreatorHandlers(nodeCreatorRef: any) {
	const handleFileGenerated = (fileName: string, filePath: string) => {
		console.log(`File generated: ${fileName} at ${filePath}`);
	};

	const handleCreateWebview = (htmlContent: string, fileName: string) => {
		if (nodeCreatorRef.value) {
			nodeCreatorRef.value.cleanupOldNodes();
			nodeCreatorRef.value.createWebviewNode(htmlContent, fileName);
		}
	};

	const handleCreateCodeEditor = (codeContent: string, fileName: string, fileType: string) => {
		if (nodeCreatorRef.value) {
			nodeCreatorRef.value.cleanupOldNodes();
			nodeCreatorRef.value.createCodeEditorNode(codeContent, fileName, fileType);
		}
	};

	const handleNodesUpdated = () => {
		console.log("Nodes updated");
	};

	const handleEdgesUpdated = () => {
		console.log("Edges updated");
	};

	return {
		handleFileGenerated,
		handleCreateWebview,
		handleCreateCodeEditor,
		handleNodesUpdated,
		handleEdgesUpdated
	};
}

