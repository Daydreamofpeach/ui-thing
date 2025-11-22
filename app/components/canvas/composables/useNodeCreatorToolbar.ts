import { computed, ref } from 'vue';
import type { NodeTypeOption } from '@canvas/shared/NodeCreatorToolbar.vue';

/**
 * Composable for managing node creation toolbar and node creation logic
 * Handles Template, Hook, and Transport node creation with orbit integration
 */
export const useNodeCreatorToolbar = () => {
	const isToolbarOpen = ref(false);

	// Default node types available for creation
	const defaultNodeTypes: NodeTypeOption[] = [
		{
			id: 'template',
			type: 'templateNode',
			label: 'Template',
			icon: 'i-lucide-layers',
			color: 'rgba(16, 185, 129, 0.95)',
			description: 'Create a new template node'
		},
		{
			id: 'hook',
			type: 'hookNode',
			label: 'Hook',
			icon: 'i-lucide-cable',
			color: 'rgba(139, 92, 246, 0.95)',
			description: 'Create a new hook node'
		},
		{
			id: 'transport',
			type: 'transportNode',
			label: 'Transport',
			icon: 'i-lucide-send',
			color: 'rgba(59, 130, 246, 0.95)',
			description: 'Create a new transport node'
		}
	];

	const openToolbar = () => {
		isToolbarOpen.value = true;
	};

	const closeToolbar = () => {
		isToolbarOpen.value = false;
	};

	return {
		isToolbarOpen,
		defaultNodeTypes,
		openToolbar,
		closeToolbar
	};
};

/**
 * Interface for node creation payload
 */
export interface NodeCreationPayload {
	parentNodeId: string;
	nodeType: string;
	projectId: string;
	projectName: string;
	organizationId: string;
	connectedIde?: any;
	position?: { x: number; y: number };
	data?: Record<string, any>;
}

/**
 * Create unique node ID based on node type
 */
export const createNodeId = (nodeType: string): string => {
	return `${nodeType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get node color based on type
 */
export const getNodeColorByType = (nodeType: string): string => {
	const colorMap: Record<string, string> = {
		templateNode: 'rgba(16, 185, 129, 0.95)',
		hookNode: 'rgba(139, 92, 246, 0.95)',
		transportNode: 'rgba(59, 130, 246, 0.95)',
		transportTemplateNode: 'rgba(251, 191, 36, 0.95)'
	};
	return colorMap[nodeType] || 'rgba(59, 130, 246, 0.7)';
};

/**
 * Get node icon based on type
 */
export const getNodeIconByType = (nodeType: string): string => {
	const iconMap: Record<string, string> = {
		templateNode: 'i-lucide-layers',
		hookNode: 'i-lucide-cable',
		transportNode: 'i-lucide-send',
		transportTemplateNode: 'i-lucide-radio-tower'
	};
	return iconMap[nodeType] || 'i-lucide-cube';
};

/**
 * Get node label based on type
 */
export const getNodeLabelByType = (nodeType: string): string => {
	const labelMap: Record<string, string> = {
		templateNode: 'Template',
		hookNode: 'Hook',
		transportNode: 'Transport',
		transportTemplateNode: 'Transport Template'
	};
	return labelMap[nodeType] || 'Node';
};


