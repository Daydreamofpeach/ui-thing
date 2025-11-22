/**
 * Component Metadata System
 *
 * Provides metadata for canvas components (templates, hooks, transports, solutions).
 * Used by NodeCanvasRightPanel for dynamic rendering.
 *
 * Parallel to useNodeMetadata but for BAPI-loaded components instead of node types.
 */

export type ComponentType = "template" | "hook" | "transport" | "solution";

export interface ComponentCategory {
	id: ComponentType
	name: string
	icon: string
	description: string
	pluralName: string
}

// Component categories
const COMPONENT_CATEGORIES: ComponentCategory[] = [
	{
		id: "template",
		name: "Template",
		pluralName: "Templates",
		icon: "i-lucide-layout-template",
		description: "Reusable canvas templates and workflows"
	},
	{
		id: "hook",
		name: "Hook",
		pluralName: "Hooks",
		icon: "i-lucide-webhook",
		description: "Webhook hooks for event triggers"
	},
	{
		id: "transport",
		name: "Transport",
		pluralName: "Transports",
		icon: "i-lucide-send",
		description: "Transport delivery methods (EMAIL, SLACK, etc.)"
	},
	{
		id: "solution",
		name: "Solution",
		pluralName: "Solutions",
		icon: "i-lucide-puzzle",
		description: "Complete solution packages"
	}
];

// Template type metadata (for filtering)
export interface TemplateTypeMetadata {
	id: string
	displayName: string
	icon: string
	cssClass: string
}

const TEMPLATE_TYPES: Record<string, TemplateTypeMetadata> = {
	FORM_AUTOMATION_CHAIN: {
		id: "FORM_AUTOMATION_CHAIN",
		displayName: "Form Automation",
		icon: "i-lucide-file-text",
		cssClass: "template-form"
	},
	SOLUTION_TEMPLATE: {
		id: "SOLUTION_TEMPLATE",
		displayName: "Solution",
		icon: "i-lucide-puzzle",
		cssClass: "template-solution"
	},
	AUTOMATION_WORKFLOW: {
		id: "AUTOMATION_WORKFLOW",
		displayName: "Automation",
		icon: "i-lucide-zap",
		cssClass: "template-automation"
	},
	PAGE_TEMPLATE: {
		id: "PAGE_TEMPLATE",
		displayName: "Page",
		icon: "i-lucide-layout",
		cssClass: "template-page"
	},
	COMPONENT_TEMPLATE: {
		id: "COMPONENT_TEMPLATE",
		displayName: "Component",
		icon: "i-lucide-grid-3x3",
		cssClass: "template-component"
	}
};

export function useComponentMetadata() {
	/**
	 * Get all component categories
	 */
	const getComponentCategories = (): ComponentCategory[] => {
		return COMPONENT_CATEGORIES;
	};

	/**
	 * Get category by ID
	 */
	const getComponentCategory = (categoryId: ComponentType): ComponentCategory | null => {
		return COMPONENT_CATEGORIES.find((cat) => cat.id === categoryId) || null;
	};

	/**
	 * Get template type metadata
	 */
	const getTemplateTypeMetadata = (type: string): TemplateTypeMetadata => {
		return TEMPLATE_TYPES[type] || {
			id: type,
			displayName: type,
			icon: "i-lucide-layout-template",
			cssClass: "template-default"
		};
	};

	/**
	 * Get template type icon
	 */
	const getTemplateTypeIcon = (type?: string): string => {
		if (!type) return "i-lucide-layout-template";
		const metadata = getTemplateTypeMetadata(type);
		return metadata.icon;
	};

	/**
	 * Get template type CSS class
	 */
	const getTemplateTypeClass = (type?: string): string => {
		if (!type) return "template-default";
		const metadata = getTemplateTypeMetadata(type);
		return metadata.cssClass;
	};

	/**
	 * Get display name for template type
	 */
	const getTemplateTypeDisplayName = (type?: string): string => {
		if (!type) return "";
		const metadata = getTemplateTypeMetadata(type);
		return metadata.displayName;
	};

	/**
	 * Get all available template types from a list of templates
	 */
	const getAvailableTemplateTypes = (templates: any[]): string[] => {
		const types = new Set<string>();
		templates.forEach((template: any) => {
			if (template.template?.type) {
				types.add(template.template.type);
			}
		});
		return Array.from(types).sort();
	};

	/**
	 * Register new template type dynamically
	 */
	const registerTemplateType = (metadata: TemplateTypeMetadata) => {
		TEMPLATE_TYPES[metadata.id] = metadata;
		console.log(`✅ Registered template type: ${metadata.id}`);
	};

	/**
	 * Get component icon based on type
	 */
	const getComponentIcon = (component: any, type: ComponentType): string => {
		switch (type) {
			case "template":
				return getTemplateTypeIcon(component.template?.type);
			case "hook":
				return "i-lucide-webhook";
			case "transport":
				return "i-lucide-send";
			case "solution":
				return "i-lucide-puzzle";
			default:
				return "i-lucide-box";
		}
	};

	/**
	 * Get component display name
	 */
	const getComponentDisplayName = (component: any, type: ComponentType): string => {
		if (component.name) return component.name;

		switch (type) {
			case "template":
				return "Unnamed Template";
			case "hook":
				return component.type || "Unnamed Hook";
			case "transport":
				return component.type || "Unnamed Transport";
			case "solution":
				return "Unnamed Solution";
			default:
				return "Unnamed Component";
		}
	};

	return {
		// Categories
		getComponentCategories,
		getComponentCategory,

		// Template types
		getTemplateTypeMetadata,
		getTemplateTypeIcon,
		getTemplateTypeClass,
		getTemplateTypeDisplayName,
		getAvailableTemplateTypes,
		registerTemplateType,

		// Component helpers
		getComponentIcon,
		getComponentDisplayName
	};
}
