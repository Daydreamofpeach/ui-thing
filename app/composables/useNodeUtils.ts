import { ref, computed } from 'vue';

export function useNodeUtils() {
	// Helper function to get event category
	const getEventCategory = (eventName?: string): string => {
		if (!eventName) return 'None';
		
		if (eventName.startsWith('github:')) return 'GitHub';
		if (eventName.startsWith('system:')) return 'System';
		if (eventName.startsWith('file:')) return 'File System';
		if (eventName.startsWith('network:')) return 'Network';
		if (eventName.startsWith('user:')) return 'User Actions';
		if (eventName.startsWith('timer:')) return 'Scheduled';
		
		return 'Custom';
	};

	// Helper function to get command category
	const getCommandCategory = (commandName?: string): string => {
		if (!commandName) return 'None';
		
		// Basic categorization based on common PowerShell command patterns
		if (commandName.startsWith('Get-')) return 'Get Commands';
		if (commandName.startsWith('Set-')) return 'Set Commands';
		if (commandName.startsWith('New-')) return 'New Commands';
		if (commandName.startsWith('Remove-')) return 'Remove Commands';
		if (commandName.startsWith('Start-')) return 'Start Commands';
		if (commandName.includes('Process')) return 'Process Management';
		if (commandName.includes('Service')) return 'Service Management';
		if (commandName.includes('File') || commandName.includes('Item')) return 'File System';
		
		return 'Miscellaneous';
	};

	// Helper function to get view category
	const getViewCategory = (viewType?: string): string => {
		if (!viewType) return 'None';
		
		const type = viewType.toLowerCase();
		if (['pdf', 'docx', 'txt', 'rtf', 'odt'].includes(type)) return 'Documents';
		if (['html', 'xml', 'json', 'yaml', 'css', 'js', 'ts'].includes(type)) return 'Web & Code';
		if (['png', 'jpg', 'gif', 'svg', 'bmp', 'tiff', 'webp'].includes(type)) return 'Images';
		if (['mp4', 'mp3'].includes(type)) return 'Media';
		if (['csv', 'xlsx', 'ods', 'tsv'].includes(type)) return 'Spreadsheets';
		if (['zip', 'tar', 'exe', 'bin'].includes(type)) return 'Archives & Executables';
		
		return 'Other Formats';
	};

	// Helper function to get git action category
	const getGitActionCategory = (gitCommand?: string): string => {
		if (!gitCommand) return 'None';
		
		// Basic categorization based on common git command patterns
		if (['add', 'commit', 'push', 'pull'].includes(gitCommand)) return 'Basic Operations';
		if (['branch', 'checkout', 'merge', 'rebase'].includes(gitCommand)) return 'Branching';
		if (['status', 'log', 'diff', 'show'].includes(gitCommand)) return 'Information';
		if (['clone', 'fetch', 'remote'].includes(gitCommand)) return 'Remote Operations';
		if (['reset', 'revert', 'cherry-pick'].includes(gitCommand)) return 'History Manipulation';
		if (['stash', 'tag', 'archive'].includes(gitCommand)) return 'Utilities';
		if (['config', 'init', 'help'].includes(gitCommand)) return 'Configuration';
		
		return 'Advanced';
	};

	// Helper function to get status class
	const getStatusClass = (status?: string): string => {
		switch (status) {
			case 'active':
				return 'text-green-500';
			case 'error':
				return 'text-red-500';
			case 'warning':
				return 'text-yellow-500';
			case 'inactive':
			default:
				return 'text-gray-500';
		}
	};

	// Helper function to get node color
	const getNodeColor = (nodeType: string): string => {
		const colors: Record<string, string> = {
			rectangle: "#f97316",
			circle: "#f97316",
			diamond: "#f97316",
			triangle: "#f97316",
			hexagon: "#f97316",
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

	// Helper function to create a node with default properties
	const createNode = (type: string, data: any = {}) => {
		const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		return {
			id,
			type,
			position: { x: Math.random() * 500, y: Math.random() * 300, z: 0 },
			data: {
				label: data.label || `${type} Node`,
				text: data.text || '',
				...data
			},
			draggable: true,
			selectable: true,
			resizable: true,
			selected: false,
			style: {} as any
		};
	};

	// Helper function to update node data
	const updateNodeInArray = (nodeArrays: any[], nodeId: string, key: string, value: any) => {
		for (const nodeArray of nodeArrays) {
			const node = nodeArray.value.find((n: any) => n.id === nodeId);
			if (node) {
				if (node.data) {
					node.data[key] = value;
				} else {
					node.data = { [key]: value };
				}
				return true;
			}
		}
		return false;
	};

	return {
		getEventCategory,
		getCommandCategory,
		getViewCategory,
		getGitActionCategory,
		getStatusClass,
		getNodeColor,
		createNode,
		updateNodeInArray
	};
}
