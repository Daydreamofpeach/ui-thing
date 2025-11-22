import { ref, computed, provide, inject, type InjectionKey, type Ref } from "vue";

/**
 * Canvas State Management
 * 
 * Provides a centralized state management system for the canvas
 * that allows data to be shared across all nodes without prop drilling.
 * 
 * Usage:
 * - In CanvasPanel: call useCanvasState() and provide the state
 * - In child nodes: call useInjectCanvasState() to access the state
 */

export interface CanvasStateData {
	// Project context
	projectId?: string
	projectName?: string
	organizationId?: string

	// IDE context
	connectedIdes: any[]
	primaryIde?: any

	// Repository context
	linkedRepositories: any[]

	// Integration context
	connectedIntegrations: any[]

	// User context
	assignedUsers: any[]

	// Canvas metadata
	canvasId?: string
	createdAt?: string
	updatedAt?: string
}

export interface CanvasState {
	// State data
	state: Ref<CanvasStateData>

	// IDE management
	addConnectedIde: (ide: any) => void
	removeConnectedIde: (ideId: string) => void
	setPrimaryIde: (ide: any) => void
	getConnectedIdes: () => any[]
	getPrimaryIde: () => any | null

	// Repository management
	addRepository: (repo: any) => void
	removeRepository: (repoId: string) => void
	getRepositories: () => any[]

	// Integration management
	addIntegration: (integration: any) => void
	removeIntegration: (integrationId: string) => void

	// User management
	addUser: (user: any) => void
	removeUser: (userId: string) => void

	// Project context
	setProjectContext: (projectId: string, projectName: string, organizationId: string) => void
	getProjectContext: () => { projectId?: string, projectName?: string, organizationId?: string }

	// Utility
	clearState: () => void
	exportState: () => CanvasStateData
	importState: (data: CanvasStateData) => void
}

const CANVAS_STATE_KEY: InjectionKey<CanvasState> = Symbol("canvasState");

export function useCanvasState() {
	const state = ref<CanvasStateData>({
		connectedIdes: [],
		linkedRepositories: [],
		connectedIntegrations: [],
		assignedUsers: [],
		createdAt: new Date().toISOString()
	});

	// IDE Management
	const addConnectedIde = (ide: any) => {
		console.log("🔗 Canvas State: Adding connected IDE:", ide.name);
		
		// Check if already exists
		const exists = state.value.connectedIdes.some(i => i.name === ide.name);
		if (exists) {
			console.warn("⚠️ IDE already in canvas state:", ide.name);
			return;
		}

		state.value.connectedIdes.push(ide);
		
		// Set as primary if first IDE
		if (state.value.connectedIdes.length === 1) {
			state.value.primaryIde = ide;
			console.log("✅ Set as primary IDE:", ide.name);
		}

		console.log("✅ Canvas State: IDE added. Total:", state.value.connectedIdes.length);
	};

	const removeConnectedIde = (ideId: string) => {
		const before = state.value.connectedIdes.length;
		state.value.connectedIdes = state.value.connectedIdes.filter(ide => ide.id !== ideId);
		const after = state.value.connectedIdes.length;

		// Update primary if needed
		if (state.value.primaryIde?.id === ideId) {
			state.value.primaryIde = state.value.connectedIdes[0] || null;
		}

		console.log(`🗑️ Canvas State: IDE removed. ${before} → ${after}`);
	};

	const setPrimaryIde = (ide: any) => {
		state.value.primaryIde = ide;
		console.log("⭐ Canvas State: Primary IDE set:", ide.name);
	};

	const getConnectedIdes = () => {
		return state.value.connectedIdes;
	};

	const getPrimaryIde = () => {
		return state.value.primaryIde || null;
	};

	// Repository Management
	const addRepository = (repo: any) => {
		console.log("📂 Canvas State: Adding repository:", repo.name);
		
		const exists = state.value.linkedRepositories.some(r => r.id === repo.id);
		if (exists) {
			console.warn("⚠️ Repository already in canvas state:", repo.name);
			return;
		}

		state.value.linkedRepositories.push(repo);
		console.log("✅ Canvas State: Repository added. Total:", state.value.linkedRepositories.length);
	};

	const removeRepository = (repoId: string) => {
		const before = state.value.linkedRepositories.length;
		state.value.linkedRepositories = state.value.linkedRepositories.filter(r => r.id !== repoId);
		const after = state.value.linkedRepositories.length;
		console.log(`🗑️ Canvas State: Repository removed. ${before} → ${after}`);
	};

	const getRepositories = () => {
		return state.value.linkedRepositories;
	};

	// Integration Management
	const addIntegration = (integration: any) => {
		console.log("🔌 Canvas State: Adding integration:", integration.name);
		state.value.connectedIntegrations.push(integration);
	};

	const removeIntegration = (integrationId: string) => {
		state.value.connectedIntegrations = state.value.connectedIntegrations.filter(
			i => i.id !== integrationId
		);
	};

	// User Management
	const addUser = (user: any) => {
		const exists = state.value.assignedUsers.some(u => u.id === user.id);
		if (!exists) {
			state.value.assignedUsers.push(user);
		}
	};

	const removeUser = (userId: string) => {
		state.value.assignedUsers = state.value.assignedUsers.filter(u => u.id !== userId);
	};

	// Project Context
	const setProjectContext = (projectId: string, projectName: string, organizationId: string) => {
		console.log("📋 Canvas State: Setting project context:", { projectId, projectName, organizationId });
		state.value.projectId = projectId;
		state.value.projectName = projectName;
		state.value.organizationId = organizationId;
		state.value.updatedAt = new Date().toISOString();
	};

	const getProjectContext = () => {
		return {
			projectId: state.value.projectId,
			projectName: state.value.projectName,
			organizationId: state.value.organizationId
		};
	};

	// Utility
	const clearState = () => {
		console.log("🧹 Canvas State: Clearing all state");
		state.value = {
			connectedIdes: [],
			linkedRepositories: [],
			connectedIntegrations: [],
			assignedUsers: [],
			createdAt: new Date().toISOString()
		};
	};

	const exportState = () => {
		return { ...state.value };
	};

	const importState = (data: CanvasStateData) => {
		console.log("📥 Canvas State: Importing state:", data);
		state.value = { ...data };
	};

	const canvasState: CanvasState = {
		state,
		addConnectedIde,
		removeConnectedIde,
		setPrimaryIde,
		getConnectedIdes,
		getPrimaryIde,
		addRepository,
		removeRepository,
		getRepositories,
		addIntegration,
		removeIntegration,
		addUser,
		removeUser,
		setProjectContext,
		getProjectContext,
		clearState,
		exportState,
		importState
	};

	// Provide to child components
	provide(CANVAS_STATE_KEY, canvasState);

	return canvasState;
}

/**
 * Inject canvas state in child components
 */
export function useInjectCanvasState(): CanvasState | null {
	return inject(CANVAS_STATE_KEY, null);
}

