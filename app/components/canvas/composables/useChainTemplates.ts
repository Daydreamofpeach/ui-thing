import { ref, computed } from "vue";
import { buttClient } from "~/utils/buttClient";

export interface ChainTemplate {
	id?: string;
	name: string;
	description: string;
	category: string;
	defaultConnectionType: string;
	nodes: any[];
	connections: any[];
	connectionStyle?: {
		color: string;
		animationType: string;
		animationSpeed: string;
		strokeWidth: number;
		type: string;
		animated: boolean;
	};
	layoutConfig?: {
		layout: string;
		spacing: number;
	};
	createdAt: string;
	type: string;
	organizationId?: string;
	projectId?: string;
}

export function useChainTemplates(organizationId?: string, projectId?: string) {
	const chainTemplates = ref<ChainTemplate[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// Load chain templates from API
	const loadChainTemplates = async () => {
		if (!organizationId) {
			console.warn("⚠️ useChainTemplates: No organization ID provided");
			return;
		}

		isLoading.value = true;
		error.value = null;

		try {
			console.log("🔧 Loading chain templates for organization:", organizationId);
			
			// For now, we'll manage chain templates locally
			// In the future, this could be an API call to a dedicated chain templates endpoint
			const templates = localStorage.getItem(`chain-templates-${organizationId}`);
			if (templates) {
				chainTemplates.value = JSON.parse(templates);
			} else {
				chainTemplates.value = [];
			}
			
			console.log(`✅ Loaded ${chainTemplates.value.length} chain templates`);
		} catch (err) {
			console.error("❌ Error loading chain templates:", err);
			error.value = err instanceof Error ? err.message : "Failed to load chain templates";
		} finally {
			isLoading.value = false;
		}
	};

	// Save a new chain template
	const saveChainTemplate = async (templateData: Omit<ChainTemplate, 'id' | 'createdAt'>) => {
		if (!organizationId) {
			throw new Error("Organization ID is required");
		}

		isLoading.value = true;
		error.value = null;

		try {
			const newTemplate: ChainTemplate = {
				...templateData,
				id: generateTemplateId(),
				createdAt: new Date().toISOString(),
				organizationId,
				projectId
			};

			console.log("🔧 Saving chain template:", newTemplate.name);

			// Add to local storage (replace with API call later)
			chainTemplates.value.push(newTemplate);
			localStorage.setItem(
				`chain-templates-${organizationId}`, 
				JSON.stringify(chainTemplates.value)
			);

			console.log("✅ Chain template saved successfully");
			return newTemplate;
		} catch (err) {
			console.error("❌ Error saving chain template:", err);
			error.value = err instanceof Error ? err.message : "Failed to save chain template";
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	// Update an existing chain template
	const updateChainTemplate = async (templateId: string, updates: Partial<ChainTemplate>) => {
		if (!organizationId) {
			throw new Error("Organization ID is required");
		}

		isLoading.value = true;
		error.value = null;

		try {
			const templateIndex = chainTemplates.value.findIndex(t => t.id === templateId);
			if (templateIndex === -1) {
				throw new Error("Chain template not found");
			}

			console.log("🔧 Updating chain template:", templateId);

			const existingTemplate = chainTemplates.value[templateIndex];
			if (existingTemplate) {
				chainTemplates.value[templateIndex] = {
					...existingTemplate,
					...updates,
					id: existingTemplate.id,
					name: updates.name ?? existingTemplate.name,
					description: updates.description ?? existingTemplate.description,
					category: updates.category ?? existingTemplate.category,
					defaultConnectionType: updates.defaultConnectionType ?? existingTemplate.defaultConnectionType,
					nodes: updates.nodes ?? existingTemplate.nodes,
					connections: updates.connections ?? existingTemplate.connections,
					createdAt: existingTemplate.createdAt,
					type: existingTemplate.type
				};
			}

			localStorage.setItem(
				`chain-templates-${organizationId}`, 
				JSON.stringify(chainTemplates.value)
			);

			console.log("✅ Chain template updated successfully");
			return chainTemplates.value[templateIndex];
		} catch (err) {
			console.error("❌ Error updating chain template:", err);
			error.value = err instanceof Error ? err.message : "Failed to update chain template";
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	// Delete a chain template
	const deleteChainTemplate = async (templateId: string) => {
		if (!organizationId) {
			throw new Error("Organization ID is required");
		}

		isLoading.value = true;
		error.value = null;

		try {
			const templateIndex = chainTemplates.value.findIndex(t => t.id === templateId);
			if (templateIndex === -1) {
				throw new Error("Chain template not found");
			}

			const templateName = chainTemplates.value[templateIndex]?.name || "Unknown";
			console.log("🗑️ Deleting chain template:", templateName);

			chainTemplates.value.splice(templateIndex, 1);

			localStorage.setItem(
				`chain-templates-${organizationId}`, 
				JSON.stringify(chainTemplates.value)
			);

			console.log("✅ Chain template deleted successfully");
		} catch (err) {
			console.error("❌ Error deleting chain template:", err);
			error.value = err instanceof Error ? err.message : "Failed to delete chain template";
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	// Apply a chain template to the canvas
	const applyChainTemplate = (templateId: string, canvasNodes: any[], canvasEdges: any[]) => {
		const template = chainTemplates.value.find(t => t.id === templateId);
		if (!template) {
			throw new Error("Chain template not found");
		}

		console.log("🔧 Applying chain template:", template.name);

		// Calculate offset to avoid overlapping with existing nodes
		const maxX = canvasNodes.length > 0 
			? Math.max(...canvasNodes.map(n => n.position?.x || 0)) + 200
			: 100;
		const maxY = canvasNodes.length > 0 
			? Math.max(...canvasNodes.map(n => n.position?.y || 0))
			: 100;

		// Create new nodes with offset positions
		const newNodes = template.nodes.map((node, index) => ({
			...node,
			id: `${node.id}_${Date.now()}_${index}`, // Ensure unique IDs
			position: {
				x: maxX + (index % 3) * 250, // Arrange in a grid
				y: maxY + Math.floor(index / 3) * 150
			}
		}));

		// Create new edges based on template connections but with updated node IDs
		const nodeIdMap = new Map();
		template.nodes.forEach((originalNode, index) => {
			nodeIdMap.set(originalNode.id, newNodes[index].id);
		});

		const newEdges = template.connections.map((connection, index) => ({
			...connection,
			id: `edge_${Date.now()}_${index}`,
			source: nodeIdMap.get(connection.source) || connection.source,
			target: nodeIdMap.get(connection.target) || connection.target,
			type: connection.type || template.defaultConnectionType
		}));

		return {
			nodes: newNodes,
			edges: newEdges
		};
	};

	// Get templates by category
	const getTemplatesByCategory = computed(() => {
		return (category: string) => {
			if (category === 'all') return chainTemplates.value;
			return chainTemplates.value.filter(t => t.category === category);
		};
	});

	// Search templates
	const searchTemplates = computed(() => {
		return (query: string) => {
			if (!query.trim()) return chainTemplates.value;
			
			const lowercaseQuery = query.toLowerCase();
			return chainTemplates.value.filter(template => 
				template.name.toLowerCase().includes(lowercaseQuery) ||
				template.description.toLowerCase().includes(lowercaseQuery) ||
				template.category.toLowerCase().includes(lowercaseQuery)
			);
		};
	});

	// Available categories
	const availableCategories = computed(() => {
		const categories = new Set<string>();
		chainTemplates.value.forEach(template => {
			categories.add(template.category);
		});
		return Array.from(categories).sort();
	});

	// Helper function to generate unique template ID
	const generateTemplateId = () => {
		return `chain_template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	};

	return {
		chainTemplates,
		isLoading,
		error,
		loadChainTemplates,
		saveChainTemplate,
		updateChainTemplate,
		deleteChainTemplate,
		applyChainTemplate,
		getTemplatesByCategory,
		searchTemplates,
		availableCategories
	};
}
