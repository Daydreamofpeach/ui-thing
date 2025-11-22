export interface OscarMessage {
	id: string
	type: "user" | "assistant"
	role: "user" | "assistant"
	content: string
	timestamp: number
	actions?: OscarAction[]
	showScriptRunner?: boolean
	showFileTree?: boolean
	projectPath?: string
	showProjectDetails?: boolean
	projectData?: any
	terminal?: OscarTerminalConfig
	widget?: OscarWidget
	organisationId?: string
}

export interface OscarAction {
	id: string
	label: string
	icon?: string
	variant?: "primary" | "secondary" | "success" | "warning" | "danger"
	disabled?: boolean
}

export interface OscarProjectConfig {
	workDir?: string
	projectName?: string
	packageManager?: string
	framework?: string
	hasMonorepo?: boolean
}

export interface OscarEnvironmentStatus {
	node: { installed: boolean, version: string }
	npm: { installed: boolean, version: string }
	git: { installed: boolean, version: string } | null
	builditCli: { installed: boolean, version: string }
	packageManager: string
	ready: boolean
}

export interface OscarProjectScripts {
	packageManager: string
	scripts: OscarScript[]
	projectPath: string
	packageJsonPath: string
}

export interface OscarScript {
	label: string
	script: string
	dir: string
	tauriAction?: "dev" | "build"
	command?: string
}

export interface OscarState {
	isProcessing: boolean
	userInput: string
	messages: OscarMessage[]
	currentConfig: OscarProjectConfig
	environmentStatus: OscarEnvironmentStatus
	detectedProjectScripts: OscarProjectScripts | null
	scriptsLoading: boolean
}

export type OscarLayoutMode = "modal" | "panel";

export interface OscarLayoutProps {
	mode: OscarLayoutMode
	modelValue?: boolean
}

export interface OscarTerminalConfig {
	workDir: string
	command: string
	title?: string
	autoRun?: boolean
}

export interface OscarWidget {
	name: "GitClone" | "CloneRun" | "BuilditWizard" | "TemplateNew" | "CliBuildit" | "OscarTemplateWizardCard" | "OscarCliCard" | "OscarGitCloneCard" | "OscarCloneRunCard" | "TemplateComponentViewer" | "ProjectComponentViewer" | "OscarProjectInfoCard" | "OscarProjectsListCard" | "OscarCanvasContextCard" | "OscarDetectedChainsCard" | "OscarChainWalkthrough" | "OscarChainStepper" | "OscarNodePreview"
	props?: Record<string, any>
}

export interface OscarOrganization {
	id: string | number
	name: string
	butt?: string
}

export interface OscarProject {
	id: string | number
	name: string
	description?: string
	status?: string
	path?: string
	[key: string]: any
}

export interface OscarDashboardData {
	organizations: OscarOrganization[]
	currentOrganization: OscarOrganization | null
	projects: OscarProject[]
	filteredProjects: OscarProject[]
	selectedProject: OscarProject | null
	isLoadingOrganizations?: boolean
	isLoadingProjects?: boolean
}

