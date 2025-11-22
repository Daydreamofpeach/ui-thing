<template>
	<div class="project-tools-setup-node node-container">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />

		<!-- Icon -->
		<div class="node-icon-wrapper" :style="{ borderColor: themeColor }">
			<UIcon name="i-lucide-wrench" class="size-8" :style="{ color: themeColor }" />
		</div>

		<!-- Header -->
		<NodeHeader
			title="TOOLS SETUP"
			:title-color="themeColor"
			:theme-color="themeColor"
			:transparent-background="true"
			:show-edit-button="false"
			:show-close-button="true"
			close-button-label="Delete tools setup node"
			@close="handleClose"
		/>

		<NodePanel
			panel-class="project-tools-setup-panel"
			:scrollbar-color="`rgba(${themeColorRgb}, 0.45)`"
		>
			<div class="step-navigation-block tools-block">
				<StepNavigation
					:current-step="1"
					:total-steps="3"
					:theme-color="themeColor"
					next-button-label="Continue to Integrations"
					:can-progress="true"
					@next="handleContinueToIntegrations"
				/>
			</div>

			<section class="oscar-hero tools-block">
				<div class="oscar-hero__figure">
					<img :src="oscarMini" alt="Oscar's avatar" class="oscar-hero__image" />
				</div>
				<div class="oscar-hero__content">
					<h4 class="oscar-hero__title">Oscar's Advice</h4>
					<p class="oscar-hero__body">
						Start by confirming your primary IDE and making sure critical tooling are available. Once everything looks good, continue to integration setup to link repositories.
					</p>
				</div>
			</section>

			<section class="tools-summary-card tools-block">
				<header class="tools-summary-header">
					<UIcon name="i-lucide-rocket" class="size-5" :style="{ color: themeColor }" />
					<div class="tools-summary-header__text">
						<h3>Prepare your workspace</h3>
						<p>
							Link your IDE and confirm developer tooling before moving to repository integrations.
						</p>
					</div>
				</header>

				<div class="summary-metrics">
					<div class="metric-card">
						<UIcon name="i-lucide-monitor" class="size-5" />
						<div class="metric-card__body">
							<span class="metric-card__label">Primary IDE</span>
							<span class="metric-card__value">
								{{ primaryIde?.name || "Not selected" }}
							</span>
						</div>
					</div>
					<div class="metric-card">
						<UIcon name="i-lucide-plug" class="size-5" />
						<div class="metric-card__body">
							<span class="metric-card__label">Linked Tools</span>
							<span class="metric-card__value">
								{{ linkedToolCount }}
							</span>
						</div>
					</div>
					<div class="metric-card">
						<UIcon name="i-lucide-shield-check" class="size-5" />
						<div class="metric-card__body">
							<span class="metric-card__label">Configured IDEs</span>
							<span class="metric-card__value">
								{{ connectedIDEs.length }}
							</span>
						</div>
					</div>
				</div>
			</section>

			<section class="connected-ide-section tools-block">
				<header class="section-header">
					<UIcon name="i-lucide-code-2" class="size-5" :style="{ color: themeColor }" />
					<div class="section-header__text">
						<h4>Connected IDE</h4>
						<p>Select or launch the primary IDE for this project.</p>
					</div>
					<button
						v-if="primaryIde"
						class="ghost-button"
						@click="handleOpenIde(primaryIde)"
					>
						<UIcon name="i-lucide-external-link" class="size-4" />
						<span>Open</span>
					</button>
				</header>

				<IdeDisplay
					:ide="primaryIde"
					:theme-color="themeColor"
					empty-message="Link an IDE from the project node's tools tab first."
				/>

				<div v-if="connectedIDEs.length > 1" class="connected-ide-selector">
					<span>Other linked IDEs</span>
					<div class="connected-ide-pills">
						<button
							v-for="ide in connectedIDEs"
							:key="ide.id || ide.name"
							:class="['ide-pill', { active: primaryIde?.id === ide.id || primaryIde?.name === ide.name }]"
							@click="selectPrimaryIde(ide)"
						>
							{{ ide.name }}
						</button>
					</div>
				</div>
			</section>

			<section class="tools-section tools-block">
				<header class="tools-grid-header">
					<div class="tools-grid-header__main">
						<UIcon name="i-lucide-briefcase" class="size-5" :style="{ color: themeColor }" />
						<div class="tools-grid-header__text">
							<span class="tools-grid-title">Editors & Developer Tools</span>
							<span class="tools-grid-subtitle">
								Detect installed tools and link them to this project.
							</span>
						</div>
					</div>
					<button class="ghost-button" @click="checkToolStatuses">
						<UIcon :name="isCheckingTools ? 'i-lucide-loader-2' : 'i-lucide-refresh-cw'" :class="{ 'animate-spin': isCheckingTools }" class="size-4" />
						<span>{{ isCheckingTools ? "Checking..." : "Re-check Tools" }}</span>
					</button>
				</header>

				<div v-if="ideToolItems.length" class="tool-circle-section">
					<div class="tool-circle-section-header">
						<span class="tool-circle-section-title">Code Editors & IDEs</span>
						<span class="tool-circle-section-subtitle">
							Select a primary IDE or open installed editors instantly.
						</span>
					</div>
					<div class="tool-circle-grid">
						<div
							v-for="tool in ideToolItems"
							:key="tool.id"
							class="tool-circle-card"
						>
							<button
								class="tool-circle-button"
								:class="{
									'tool-circle-button--linked': tool.isLinked,
									'tool-circle-button--install': !tool.isInstalled,
									'tool-circle-button--selected': primaryIde?.name === tool.name
								}"
								:title="toolTooltip(tool)"
								@click="selectPrimaryIde(tool.linkedIde || tool.source)"
							>
								<div class="tool-circle-content">
									<UIcon :name="tool.icon" class="tool-circle-icon" />
								</div>
								<div class="tool-circle-hover-icon">
									<UIcon :name="toolHoverIcon(tool)" class="size-5" />
								</div>
							</button>

							<button
								v-if="tool.canOpen"
								class="tool-open-button"
								:title="`Open ${tool.name}`"
								@click.stop="handleOpenIdeCircle(tool)"
							>
								<UIcon name="i-lucide-external-link" class="size-4" />
							</button>

							<div class="tool-circle-label">
								<span class="tool-circle-name">{{ tool.name }}</span>
								<span
									class="tool-circle-status"
									:class="{
										'tool-circle-status--linked': tool.isLinked,
										'tool-circle-status--install': !tool.isInstalled
									}"
								>
									{{ toolStatusLabel(tool) }}
								</span>
							</div>
						</div>
					</div>
				</div>

				<div v-if="developerToolItems.length" class="tool-circle-section">
					<div class="tool-circle-section-header">
						<span class="tool-circle-section-title">Developer Tooling</span>
						<span class="tool-circle-section-subtitle">
							Key build tools detected on your machine.
						</span>
					</div>
					<div class="tool-circle-grid developer-tools">
						<div
							v-for="tool in developerToolItems"
							:key="tool.id"
							class="tool-circle-card"
						>
							<button
								class="tool-circle-button"
								:class="{
									'tool-circle-button--linked': tool.isInstalled,
									'tool-circle-button--install': !tool.isInstalled
								}"
								:title="toolTooltip(tool)"
							>
								<div class="tool-circle-content">
									<UIcon :name="tool.icon" class="tool-circle-icon" />
								</div>
							</button>
							<div class="tool-circle-label">
								<span class="tool-circle-name">{{ tool.name }}</span>
								<span
									class="tool-circle-status"
									:class="{
										'tool-circle-status--linked': tool.isInstalled,
										'tool-circle-status--install': !tool.isInstalled
									}"
								>
									{{ toolStatusLabel(tool) }}
								</span>
							</div>
						</div>
					</div>
				</div>

				<div v-if="ideToolItems.length === 0 && developerToolItems.length === 0" class="empty-state">
					<UIcon name="i-lucide-alert-circle" class="size-10 text-white/30" />
					<p>No developer tools detected yet.</p>
					<button class="ghost-button" @click="checkToolStatuses">
						Re-run detection
					</button>
				</div>
			</section>

			<section class="next-step-card tools-block">
				<div class="next-step-card__content">
					<UIcon name="i-lucide-puzzle" class="size-5" />
					<div>
						<h4>Next: Repository Integrations</h4>
						<p>Link GitHub or Bitbucket repositories to complete integration setup.</p>
					</div>
				</div>
				<button class="primary-button" @click="handleContinueToIntegrations">
					Continue to Integrations
					<UIcon name="i-lucide-arrow-right" class="size-4" />
				</button>
			</section>
		</NodePanel>
	</div>
</template>

<script setup lang="ts">
import IdeDisplay from "@canvas/shared/IdeDisplay.vue";
import NodeHeader from "@canvas/shared/NodeHeader.vue";
import NodePanel from "@canvas/shared/NodePanel.vue";
import StepNavigation from "@canvas/shared/StepNavigation.vue";
import { Handle, Position } from "@vue-flow/core";
import { useInjectCanvasState } from "@canvas/composables/useCanvasState";
import { useTauriShellCommand } from "#imports";
import oscarMini from "@/assets/oscarMini.png";
import { computed, onMounted, ref, watch } from "vue";

interface Props {
	customNodeProps: any
	updateNodeData: (nodeId: string, key: string, value: any) => void
	organisationId?: string
	projectId?: string
	projectName?: string
	createChildSetupProjectNode?: (parentNodeId: string, projectData: any) => void
}

const props = withDefaults(defineProps<Props>(), {
	organisationId: "",
	projectId: "",
	projectName: "",
	createChildSetupProjectNode: undefined
});

const emit = defineEmits<{
	closeNode: [nodeId: string]
}>();

const canvasState = useInjectCanvasState();

const resolvedProjectId = computed(() => {
	return props.projectId
		|| props.customNodeProps?.data?.projectId
		|| props.customNodeProps?.data?.selectedProjectId
		|| null;
});

const resolvedProjectName = computed(() => {
	return props.projectName
		|| props.customNodeProps?.data?.projectName
		|| props.customNodeProps?.data?.name
		|| "Unnamed Project";
});

const resolvedOrganisationId = computed(() => {
	return props.organisationId
		|| props.customNodeProps?.data?.organisationId
		|| props.customNodeProps?.data?.organizationId
		|| "";
});

const themeColor = computed(() => props.customNodeProps?.data?.themeColor || "#38bdf8");
const themeColorRgb = computed(() => hexToRgb(themeColor.value));

const connectedIDEs = computed(() => props.customNodeProps?.data?.connectedIDEs || []);

const primaryIde = ref<any>(props.customNodeProps?.data?.connectedIde || connectedIDEs.value[0] || null);

watch(connectedIDEs, (next) => {
	if (!primaryIde.value && next.length > 0) {
		primaryIde.value = next[0];
	}
});

const availableIDEs = ref<any[]>([
	{
		name: "VS Code",
		status: "checking",
		icon: "i-logos-visual-studio-code",
		openCommand: "code",
		checkCommand: "if (Get-Command code -ErrorAction SilentlyContinue) { 'found' } else { '' }",
		versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (code --version 2>$null | Select-Object -First 1); if ($version) { $version } else { 'Installed' }",
		downloadUrl: "https://code.visualstudio.com/download"
	},
	{
		name: "Cursor",
		status: "checking",
		icon: "i-lucide-code-2",
		openCommand: "cursor",
		checkCommand: "if (Get-Command cursor -ErrorAction SilentlyContinue) { 'found' } else { '' }",
		versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (cursor --version 2>$null | Select-Object -First 1); if ($version) { $version } else { 'Installed' }",
		downloadUrl: "https://www.cursor.so/"
	},
	{
		name: "Visual Studio",
		status: "checking",
		icon: "i-logos-visual-studio",
		openCommand: "devenv",
		checkCommand: "if (Test-Path 'C:\\Program Files\\Microsoft Visual Studio\\*\\*\\Common7\\IDE\\devenv.exe') { 'found' } else { '' }",
		versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $vsPath = Get-ChildItem 'C:\\Program Files\\Microsoft Visual Studio\\*\\*\\Common7\\IDE\\devenv.exe' -ErrorAction SilentlyContinue | Select-Object -First 1; if ($vsPath) { $vsPath.Directory.Parent.Parent.Name } else { 'Installed' }",
		downloadUrl: "https://visualstudio.microsoft.com/downloads/"
	}
]);

const availableDeveloperTools = ref<any[]>([
	{
		id: "git",
		name: "Git",
		icon: "i-simple-icons-git",
		status: "checking",
		checkCommand: "if (Get-Command git -ErrorAction SilentlyContinue) { 'found' } else { '' }"
	},
	{
		id: "npm",
		name: "npm",
		icon: "i-simple-icons-npm",
		status: "checking",
		checkCommand: "if (Get-Command npm -ErrorAction SilentlyContinue) { 'found' } else { '' }"
	},
	{
		id: "node",
		name: "Node.js",
		icon: "i-simple-icons-nodejs",
		status: "checking",
		checkCommand: "if (Get-Command node -ErrorAction SilentlyContinue) { 'found' } else { '' }"
	},
	{
		id: "pnpm",
		name: "pnpm",
		icon: "i-simple-icons-pnpm",
		status: "checking",
		checkCommand: "if (Get-Command pnpm -ErrorAction SilentlyContinue) { 'found' } else { '' }"
	},
	{
		id: "aws-cli",
		name: "AWS CLI",
		icon: "i-simple-icons-amazonaws",
		status: "checking",
		checkCommand: "if (Get-Command aws -ErrorAction SilentlyContinue) { 'found' } else { '' }"
	}
]);

const isCheckingTools = ref(false);

const ideToolItems = computed(() => {
	const baseItems = availableIDEs.value.map((ide) => {
		const linkedIde = connectedIDEs.value.find((connected: any) =>
			connected.name === ide.name
			|| connected.ideCommand === ide.openCommand
		);
		const isInstalled = ide.status === "installed";

		return {
			id: `ide-${ide.name}`,
			name: ide.name,
			icon: ide.icon || "i-lucide-code-2",
			status: ide.status,
			isLinked: Boolean(linkedIde),
			isInstalled,
			canOpen: isInstalled || Boolean(linkedIde),
			type: "ide",
			source: ide,
			linkedIde
		};
	});

	const unmatchedConnected = connectedIDEs.value.filter(
		(connected: any) => !baseItems.some((item) => item.name === connected.name)
	);

	for (const ide of unmatchedConnected) {
		baseItems.push({
			id: ide.id || `connected-${ide.name}`,
			name: ide.name,
			icon: ide.icon || "i-lucide-code-2",
			status: "installed",
			isLinked: true,
			isInstalled: true,
			canOpen: true,
			type: "ide",
			source: ide,
			linkedIde: ide
		});
	}

	return baseItems;
});

const developerToolItems = computed(() => {
	return availableDeveloperTools.value.map((tool) => ({
		id: `dev-${tool.name}`,
		name: tool.name,
		icon: tool.icon || "i-lucide-terminal",
		isInstalled: tool.status === "installed",
		isLinked: tool.status === "installed",
		status: tool.status,
		type: "developer",
		source: tool
	}));
});

const linkedToolCount = computed(() => {
	const ideCount = ideToolItems.value.filter((tool) => tool.isLinked || tool.isInstalled).length;
	const devCount = developerToolItems.value.filter((tool) => tool.isInstalled).length;
	return ideCount + devCount;
});

const toolStatusLabel = (tool: any): string => {
	if (tool.isLinked) return "Linked";
	if (tool.isInstalled) return "Installed";
	if (tool.status === "checking") return "Checking";
	return "Not installed";
};

const toolHoverIcon = (tool: any): string => {
	if (!tool.isInstalled) return "i-lucide-download";
	if (!tool.isLinked) return "i-lucide-link-2";
	return "i-lucide-check";
};

const toolTooltip = (tool: any): string => {
	if (!tool.isInstalled) return `Install ${tool.name}`;
	if (!tool.isLinked) return `Link ${tool.name}`;
	return `${tool.name} ready`;
};

const selectPrimaryIde = (ide: any) => {
	if (!ide) return;
	primaryIde.value = ide;
	if (canvasState) {
		canvasState.setPrimaryIde(ide);
	}
};

const handleOpenIdeCircle = (tool: any) => {
	const ide = tool.linkedIde || tool.source;
	handleOpenIde(ide);
};

const handleOpenIde = async (ide: any) => {
	if (!ide) return;

	const ideCommand = ide.command || ide.ideCommand || ide.openCommand;
	if (!ideCommand) {
		console.error("❌ No command for IDE:", ide);
		console.error("  Checked properties: command, ideCommand, openCommand");
		return;
	}

	console.log(`✅ Found IDE command: ${ideCommand}`);

	const openFromPaths = async (paths: string[]): Promise<boolean> => {
		if (!paths.length) {
			return false;
		}

		const { openPath } = await import("@tauri-apps/plugin-opener");
		for (const rawPath of paths) {
			try {
				const usernameResult = await useTauriShellCommand.create("exec-pwsh", ["-Command", "$env:USERNAME"]).execute();
				const expandedPath = rawPath.replace("%USERNAME%", usernameResult.stdout.trim());
				await openPath(expandedPath);
				console.log(`✅ IDE opened successfully via path: ${expandedPath}`);
				return true;
			} catch (pathError) {
				console.warn(`  Failed to open IDE at ${rawPath}:`, pathError);
			}
		}

		return false;
	};

	try {
		try {
			const { openPath } = await import("@tauri-apps/plugin-opener");

			if (ide.name === "VS Code") {
				const opened = await openFromPaths([
					"C:/Users/%USERNAME%/AppData/Local/Programs/Microsoft VS Code/Code.exe",
					"C:/Program Files/Microsoft VS Code/Code.exe",
					"C:/Program Files (x86)/Microsoft VS Code/Code.exe"
				]);
				if (opened) return;
			}

			if (ide.name === "Cursor") {
				const opened = await openFromPaths([
					"C:/Users/%USERNAME%/AppData/Local/Programs/Cursor/Cursor.exe",
					"C:/Program Files/Cursor/Cursor.exe",
					"C:/Program Files (x86)/Cursor/Cursor.exe"
				]);
				if (opened) return;
			}

			await openPath(ideCommand);
			console.log(`✅ ${ide.name} opened successfully`);
			return;
		} catch (openerError) {
			console.warn("Opener plugin failed, trying shell command:", openerError);
		}

		await useTauriShellCommand.create("exec-pwsh", ["-Command", ideCommand]).execute();
		console.log(`✅ ${ide.name} opened successfully (via shell)`);
	} catch (error) {
		console.error(`❌ Failed to open ${ide.name}:`, error);
	}
};

const hexToRgb = (hex: string): string => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return "59, 130, 246";
	const r = Number.parseInt(result[1] || "3b", 16);
	const g = Number.parseInt(result[2] || "82", 16);
	const b = Number.parseInt(result[3] || "f6", 16);
	return `${r}, ${g}, ${b}`;
};

const checkToolStatuses = async () => {
	if (isCheckingTools.value) return;
	isCheckingTools.value = true;

	try {
		for (const ide of availableIDEs.value) {
			try {
				const result = await useTauriShellCommand.create("exec-pwsh", ["-Command", ide.checkCommand]).execute();
				const stdout = (result.stdout || "").toLowerCase();
				ide.status = (result.code === 0 && stdout.includes("found")) ? "installed" : "not-installed";
			} catch (error) {
				console.error(`Error checking ${ide.name}:`, error);
				ide.status = "not-installed";
			}
		}

		for (const tool of availableDeveloperTools.value) {
			try {
				const result = await useTauriShellCommand.create("exec-pwsh", ["-Command", tool.checkCommand]).execute();
				const stdout = (result.stdout || "").toLowerCase();
				tool.status = (result.code === 0 && stdout.includes("found")) ? "installed" : "not-installed";
			} catch (error) {
				console.error(`Error checking ${tool.name}:`, error);
				tool.status = "not-installed";
			}
		}
	} finally {
		isCheckingTools.value = false;
	}
};

const handleContinueToIntegrations = () => {
	if (!props.createChildSetupProjectNode) {
		console.warn("⚠️ No createChildSetupProjectNode handler provided");
		return;
	}

	const context = {
		projectId: resolvedProjectId.value,
		projectName: resolvedProjectName.value,
		organisationId: resolvedOrganisationId.value,
		connectedIde: primaryIde.value,
		connectedIDEs: connectedIDEs.value
	};

	if (canvasState && resolvedProjectId.value) {
		canvasState.setProjectContext(
			resolvedProjectId.value,
			resolvedProjectName.value,
			resolvedOrganisationId.value
		);

		if (primaryIde.value) {
			canvasState.setPrimaryIde(primaryIde.value);
		}
	}

	props.createChildSetupProjectNode(props.customNodeProps.id, context);
};

const handleClose = () => {
	emit("closeNode", props.customNodeProps.id);
};

onMounted(() => {
	console.log("🎬 ProjectToolsSetupNode mounted", {
		projectId: resolvedProjectId.value,
		projectName: resolvedProjectName.value,
		organisationId: resolvedOrganisationId.value,
		connectedIDEs: connectedIDEs.value.length
	});

	checkToolStatuses();
});
</script>

<style scoped>
.project-tools-setup-node {
	width: 720px;
	height: 780px;
	min-width: 720px;
	min-height: 750px;
	max-height: 780px;
	border: 2px solid rgba(56, 189, 248, 0.6);
}

.connection-handle {
	width: 0.75rem;
	height: 0.75rem;
	border: 2px solid rgba(56, 189, 248, 0.55);
	background-color: rgba(56, 189, 248, 0.25);
	border-radius: 50%;
	transition: all 0.2s ease;
}

.connection-handle:hover {
	transform: scale(1.2);
	filter: brightness(1.2);
}

.project-tools-setup-panel {
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
	padding: 0 1.25rem 1.5rem;
}

.tools-block {
	width: 100%;
}

.step-navigation-block {
	display: flex;
}

.oscar-hero {
	display: flex;
	align-items: center;
	gap: 1.25rem;
	padding: 1.1rem 1.25rem;
	border-radius: 0.85rem;
	background: linear-gradient(135deg, rgba(14, 165, 233, 0.22), rgba(14, 116, 233, 0.08));
	border: 1px solid rgba(56, 189, 248, 0.28);
	box-shadow: 0 18px 40px rgba(13, 148, 136, 0.25);
}

.oscar-hero__figure {
	flex-shrink: 0;
	width: 72px;
	height: 72px;
	border-radius: 50%;
	background: rgba(14, 116, 233, 0.2);
	border: 1px solid rgba(56, 189, 248, 0.4);
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.oscar-hero__image {
	width: 64px;
	height: 64px;
	object-fit: contain;
}

.oscar-hero__content {
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
	color: rgba(240, 249, 255, 0.92);
}

.oscar-hero__title {
	font-size: 0.95rem;
	font-weight: 600;
}

.oscar-hero__body {
	font-size: 0.82rem;
	color: rgba(226, 232, 240, 0.85);
	line-height: 1.4;
}

.tools-summary-card {
	position: relative;
	padding: 1.25rem;
	border-radius: 0.85rem;
	background: rgba(2, 6, 23, 0.75);
	border: 1px solid rgba(56, 189, 248, 0.25);
	box-shadow: 0 24px 60px rgba(15, 23, 42, 0.3);
	display: flex;
	flex-direction: column;
	gap: 1.1rem;
}

.tools-summary-header {
	display: flex;
	gap: 1rem;
	align-items: center;
}

.tools-summary-header__text h3 {
	font-size: 1.05rem;
	font-weight: 600;
	color: rgba(240, 249, 255, 0.95);
}

.tools-summary-header__text p {
	color: rgba(148, 163, 184, 0.75);
	font-size: 0.85rem;
}

.summary-metrics {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 0.75rem;
}

.metric-card {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.85rem 1rem;
	border-radius: 0.75rem;
	background: rgba(15, 23, 42, 0.65);
	border: 1px solid rgba(56, 189, 248, 0.18);
	color: rgba(240, 249, 255, 0.95);
}

.metric-card__label {
	display: block;
	color: rgba(148, 163, 184, 0.75);
	font-size: 0.75rem;
}

.metric-card__value {
	font-weight: 600;
}

.connected-ide-section {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	padding: 1.25rem;
	border-radius: 0.85rem;
	background: rgba(2, 6, 23, 0.6);
	border: 1px solid rgba(56, 189, 248, 0.18);
}

.section-header {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.section-header__text h4 {
	font-size: 0.95rem;
	font-weight: 600;
	color: rgba(240, 249, 255, 0.9);
}

.section-header__text p {
	font-size: 0.8rem;
	color: rgba(148, 163, 184, 0.8);
}

.ghost-button {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.55rem 0.9rem;
	border-radius: 0.65rem;
	border: 1px solid rgba(148, 163, 184, 0.22);
	background: rgba(15, 23, 42, 0.55);
	color: rgba(226, 232, 240, 0.85);
	font-size: 0.8rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.ghost-button:hover {
	border-color: rgba(56, 189, 248, 0.45);
	color: rgba(240, 249, 255, 0.95);
	transform: translateY(-1px);
}

.ghost-button:active {
	transform: translateY(0);
}

.connected-ide-selector {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	font-size: 0.78rem;
	color: rgba(148, 163, 184, 0.8);
}

.connected-ide-pills {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.ide-pill {
	padding: 0.4rem 0.85rem;
	border-radius: 999px;
	font-size: 0.75rem;
	background: rgba(148, 163, 184, 0.15);
	border: 1px solid transparent;
	color: rgba(226, 232, 240, 0.8);
	cursor: pointer;
	transition: all 0.2s ease;
}

.ide-pill.active {
	background: rgba(56, 189, 248, 0.2);
	border-color: rgba(56, 189, 248, 0.45);
	color: rgba(240, 249, 255, 0.95);
}

.tools-section {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.tools-grid-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	padding: 1rem;
	border-radius: 0.85rem;
	background: rgba(2, 6, 23, 0.55);
	border: 1px solid rgba(56, 189, 248, 0.18);
}

.tools-grid-header__main {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.tools-grid-header__text {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.tools-grid-title {
	font-size: 1rem;
	font-weight: 600;
	color: rgba(240, 249, 255, 0.95);
}

.tools-grid-subtitle {
	font-size: 0.8rem;
	color: rgba(148, 163, 184, 0.75);
}

.tool-circle-section {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	padding: 1rem;
	border-radius: 0.85rem;
	background: rgba(2, 6, 23, 0.5);
	border: 1px solid rgba(56, 189, 248, 0.16);
}

.tool-circle-section-header {
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
}

.tool-circle-section-title {
	font-size: 0.9rem;
	font-weight: 600;
	color: rgba(240, 249, 255, 0.88);
}

.tool-circle-section-subtitle {
	font-size: 0.78rem;
	color: rgba(148, 163, 184, 0.75);
}

.tool-circle-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
	gap: 1.25rem;
}

.tool-circle-grid.developer-tools {
	grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
}

.tool-circle-card {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.6rem;
	padding-top: 0.5rem;
}

.tool-circle-button {
	position: relative;
	width: 6rem;
	height: 6rem;
	border-radius: 999px;
	border: 1.5px solid rgba(148, 163, 184, 0.35);
	background: rgba(15, 23, 42, 0.55);
	display: grid;
	place-items: center;
	color: rgba(226, 232, 240, 0.9);
	transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
	cursor: pointer;
	overflow: hidden;
}

.tool-circle-button:hover {
	transform: translateY(-2px);
	border-color: rgba(56, 189, 248, 0.5);
	box-shadow: 0 12px 24px rgba(15, 23, 42, 0.35);
}

.tool-circle-button--linked {
	border-color: rgba(56, 189, 248, 0.75);
	background: linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(56, 189, 248, 0.35));
	box-shadow: 0 16px 28px rgba(56, 189, 248, 0.28);
}

.tool-circle-button--install {
	opacity: 0.85;
	border-color: rgba(229, 231, 235, 0.2);
	background: rgba(15, 23, 42, 0.35);
}

.tool-circle-button--selected {
	border-color: rgba(96, 165, 250, 0.8);
	box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
}

.tool-circle-content {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 3rem;
	height: 3rem;
}

.tool-circle-icon {
	width: 2.5rem;
	height: 2.5rem;
}

.tool-circle-hover-icon {
	position: absolute;
	inset: 0;
	display: grid;
	place-items: center;
	background: linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.85) 100%);
	color: rgba(240, 249, 255, 0.95);
	opacity: 0;
	transition: opacity 0.2s ease;
}

.tool-circle-button:hover .tool-circle-hover-icon {
	opacity: 1;
}

.tool-open-button {
	position: absolute;
	top: 0.5rem;
	right: 0.5rem;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 1.8rem;
	height: 1.8rem;
	border-radius: 999px;
	background: rgba(56, 189, 248, 0.25);
	border: 1px solid rgba(56, 189, 248, 0.6);
	color: rgba(240, 249, 255, 0.95);
	cursor: pointer;
	transition: all 0.2s ease;
}

.tool-open-button:hover {
	transform: translateY(-1px);
	filter: brightness(1.05);
}

.tool-circle-label {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	align-items: center;
	text-align: center;
}

.tool-circle-name {
	font-size: 0.85rem;
	font-weight: 600;
	color: rgba(240, 249, 255, 0.9);
}

.tool-circle-status {
	font-size: 0.75rem;
	padding: 0.25rem 0.5rem;
	border-radius: 999px;
	background: rgba(148, 163, 184, 0.15);
	color: rgba(226, 232, 240, 0.8);
}

.tool-circle-status--linked {
	background: rgba(34, 197, 94, 0.18);
	color: rgba(214, 249, 220, 0.95);
}

.tool-circle-status--install {
	background: rgba(239, 68, 68, 0.2);
	color: rgba(254, 226, 226, 0.95);
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	padding: 2rem 1rem;
	border-radius: 0.85rem;
	background: rgba(2, 6, 23, 0.5);
	border: 1px dashed rgba(148, 163, 184, 0.25);
	text-align: center;
	color: rgba(148, 163, 184, 0.8);
}

.next-step-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	padding: 1.15rem 1.25rem;
	border-radius: 0.85rem;
	background: rgba(2, 6, 23, 0.7);
	border: 1px solid rgba(56, 189, 248, 0.2);
}

.next-step-card__content {
	display: flex;
	align-items: center;
	gap: 0.9rem;
	color: rgba(226, 232, 240, 0.9);
}

.next-step-card__content h4 {
	font-size: 0.95rem;
	font-weight: 600;
}

.next-step-card__content p {
	font-size: 0.8rem;
	color: rgba(148, 163, 184, 0.75);
	margin-top: 0.15rem;
}

.primary-button {
	display: inline-flex;
	align-items: center;
	gap: 0.6rem;
	padding: 0.7rem 1.2rem;
	border-radius: 0.75rem;
	background: rgba(56, 189, 248, 0.9);
	border: 1px solid rgba(56, 189, 248, 0.95);
	color: rgba(15, 23, 42, 0.95);
	font-weight: 600;
	font-size: 0.85rem;
	cursor: pointer;
	box-shadow: 0 14px 30px rgba(56, 189, 248, 0.35);
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary-button:hover {
	transform: translateY(-1px);
	box-shadow: 0 18px 36px rgba(56, 189, 248, 0.45);
}

.primary-button:active {
	transform: translateY(0);
}

@media (max-width: 1200px) {
	.summary-metrics {
		grid-template-columns: repeat(1, minmax(0, 1fr));
	}

	.tools-grid-header {
		flex-direction: column;
		align-items: flex-start;
	}

	.next-step-card {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>

