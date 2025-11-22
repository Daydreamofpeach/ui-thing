<template>
	<div class="project-install-node-container node-container">
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />

		<div class="node-icon-wrapper">
			<UIcon name="i-lucide-rocket" class="size-8" />
		</div>

		<NodeHeader
			title="PROJECT INSTALL"
			title-color="rgba(34, 197, 94, 1)"
			theme-color="rgba(34, 197, 94, 1)"
			:transparent-background="true"
			:show-close-button="false"
		/>

		<NodePanel
			panel-class="project-install-panel"
			scrollbar-color="rgba(34, 197, 94, 0.6)"
		>
			<!-- Confetti Layer -->
			<div class="confetti-layer">
				<Confetti
					ref="builditConfettiRef"
					class="confetti-canvas"
					:manualstart="true"
				/>
			</div>

			<div class="install-section">
				<div class="section-header">
					<UIcon name="i-lucide-server-cog" class="size-5" />
					<div class="section-title">
						<span class="title-text">Install Ready</span>
						<span class="subtitle-text">
							{{ projectName || "Unnamed Project" }}
						</span>
					</div>
				</div>

				<p v-if="isLoadingState" class="status-description">
					Checking install status...
				</p>
				<p v-else-if="isReadyToInstall" class="status-description ready">
					This project is ready to install. Launch the automated install flow below.
				</p>
				<p v-else class="status-description">
					{{ statusMessage }}
				</p>

				<button
					ref="builditButtonRef"
					class="buildit-button"
					:disabled="installButtonDisabled"
					@click="handleBuilditClick"
				>
					<UIcon
						:name="(isInstalling || isLinkingEnv) ? 'i-lucide-loader-2' : 'i-lucide-zap'"
						class="size-5"
						:class="{ 'animate-spin': isInstalling || isLinkingEnv }"
					/>
					<span>BUILDIT</span>
				</button>

				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">Project ID</span>
						<span class="info-value">{{ projectId || "N/A" }}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Saved Env</span>
						<span class="info-value">{{ environmentName }}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Active Env</span>
						<span
							class="info-value"
							:class="{ 'text-warning': environmentMismatch }"
						>
							{{ activeEnvironmentName }}
						</span>
					</div>
					<div class="info-item">
						<span class="info-label">IDE</span>
						<span class="info-value">{{ ideName }}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Repositories</span>
						<span class="info-value">{{ repositoryCount }}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Templates</span>
						<span class="info-value">{{ templateCount }}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Last Saved</span>
						<span class="info-value">{{ savedAtLabel }}</span>
					</div>
				</div>

				<div v-if="environmentInfo || currentEnvironmentId" class="environment-summary">
					<div class="environment-header">
						<UIcon name="i-lucide-monitor-smartphone" class="size-4" />
						<div>
							<div class="environment-name">
								{{ environmentName }}
							</div>
							<div class="environment-tags">
								<span class="env-tag">{{ environmentTypeLabel }}</span>
								<span v-if="environmentMachineId" class="env-tag subtle">Machine {{ environmentMachineId }}</span>
								<span v-if="activeEnvironmentType" class="env-tag subtle">Active {{ activeEnvironmentType }}</span>
								<span v-if="activeEnvironmentMachineId" class="env-tag subtle">This Machine {{ activeEnvironmentMachineId }}</span>
							</div>
						</div>
					</div>
					<p v-if="environmentMismatch" class="environment-warning">
						Active environment "{{ activeEnvironmentName }}" is not linked yet. Click Install to link it automatically.
					</p>
					<p v-else-if="environmentInfo?.description" class="environment-description">
						{{ environmentInfo.description }}
					</p>
				</div>
			</div>

			<div class="templates-section">
				<div class="section-header">
					<UIcon name="i-lucide-package" class="size-5" />
					<div class="section-title">
						<span class="title-text">Templates to Install</span>
						<span class="subtitle-text">
							{{ templateCount }} {{ templateCount === 1 ? "app" : "apps" }} selected
						</span>
					</div>
				</div>

				<div v-if="templateItems.length > 0" class="template-list">
					<div
						v-for="template in templateItems"
						:key="template.id"
						class="template-card"
					>
						<div class="template-card-header">
							<span class="template-name">{{ template.name }}</span>
							<span v-if="template.version" class="template-version">v{{ template.version }}</span>
						</div>
						<p v-if="template.description" class="template-description">
							{{ template.description }}
						</p>
						<div class="template-meta">
							<span v-if="template.provider">{{ template.provider }}</span>
							<span v-if="template.type" class="template-type">{{ template.type }}</span>
						</div>
					</div>
				</div>
				<p v-else class="empty-templates">
					No templates selected yet. Save environment configuration to populate this list.
				</p>
			</div>
		</NodePanel>
	</div>
</template>

<script setup lang="ts">
	import { useInjectCanvasState } from "@canvas/composables/useCanvasState";
	import NodeHeader from "@canvas/shared/NodeHeader.vue";
	import NodePanel from "@canvas/shared/NodePanel.vue";
	import { useEnvironmentLink } from "@composables/useEnvironmentLink";
	import { useEnvironmentStore } from "@composables/useEnvironmentStore";
	import { useProjectInstallable } from "@composables/useProjectInstallable";
	import { Handle, Position } from "@vue-flow/core";
	import { computed, onMounted, ref, watch } from "vue";

	interface Props {
		customNodeProps: any
		createChildProjectEnvironmentNode?: (nodeId: string, environmentData: Record<string, any>) => void
		updateNodeData?: (nodeId: string, key: string, value: any) => void
	}

	const props = defineProps<Props>();

	const canvasState = useInjectCanvasState();
	const { activeEnvironment, loadCurrentEnvironment, isLoading: isLoadingEnvironment } = useEnvironmentStore();

	const {
		isChecking: isCheckingInstallable,
		isSetting: isUpdatingInstallable,
		checkInstallable,
		setNotInstallable: markProjectNotInstallable
	} = useProjectInstallable();

	const {
		linkEnvironment,
		isLinking: isLinkingEnvironment,
		getLinkedEnvironments,
		isEnvironmentLinkedToProject
	} = useEnvironmentLink();

	const isProjectInstallable = ref(false);
	const isInstalling = ref(false);

	// Confetti and Buildit button refs
	const builditConfettiRef = ref<any>(null);
	const builditButtonRef = ref<HTMLButtonElement | null>(null);

	const projectId = computed(() =>
		props.customNodeProps.data?.projectId
		|| props.customNodeProps.data?.selectedProjectId
		|| canvasState?.getProjectContext()?.projectId
		|| ""
	);

	const projectName = computed(() =>
		props.customNodeProps.data?.projectName
		|| canvasState?.getProjectContext()?.projectName
		|| ""
	);

	const setupData = computed(() => props.customNodeProps.data?.savedEnvironmentSetup || null);
	const hasSetupData = computed(() => !!setupData.value);

	function formatTimestamp(timestamp?: string | null) {
		if (!timestamp) {
			return "Not saved";
		}

		try {
			const date = new Date(timestamp);
			if (Number.isNaN(date.getTime())) {
				return timestamp;
			}

			return new Intl.DateTimeFormat(undefined, {
				dateStyle: "medium",
				timeStyle: "short"
			}).format(date);
		} catch (error) {
			console.warn("⚠️ Failed to format timestamp", error);
			return timestamp ?? "Not saved";
		}
	}

	const environmentInfo = computed(() => {
		const setup = setupData.value;
		if (!setup) return null;

		if (setup.environment) {
			return setup.environment;
		}

		if (setup.environmentId) {
			return {
				id: setup.environmentId,
				name: setup.environmentName || "Linked Environment",
				description: setup.environmentDescription || null,
				type: setup.environmentType || null,
				machineId: setup.environmentMachineId || null
			};
		}

		return null;
	});

	const environmentName = computed(() => environmentInfo.value?.name || activeEnvironment.value?.name || "Not linked");
	const environmentTypeLabel = computed(() => environmentInfo.value?.type || activeEnvironment.value?.type || "LOCAL");
	const environmentMachineId = computed(() => environmentInfo.value?.machineId || (activeEnvironment.value as any)?.machineId || null);

	function normalizeTemplate(template: any, index: number) {
		const baseTemplate = template?.template || template;
		return {
			id: template?.id
				|| template?.templateId
				|| baseTemplate?.id
				|| baseTemplate?._id
				|| `template-${index}`,
			name: template?.name || baseTemplate?.name || `Template ${index + 1}`,
			description: template?.description || baseTemplate?.description || "",
			version: template?.version || baseTemplate?.version || null,
			provider: template?.provider || baseTemplate?.author || baseTemplate?.owner || null,
			type: template?.type || baseTemplate?.type || null
		};
	}

	const linkedEnvironments = ref<any[]>([]);
	const isLoadingLinkedEnvironments = ref(false);

	const isActiveEnvironmentLinked = ref(false);
	const isCheckingLinkStatus = ref(false);
	const lastLinkStatusCheck = ref<string | null>(null);

	const templateItems = computed(() => {
		const templates = setupData.value?.installTemplates || setupData.value?.linkedTemplates || [];
		if (!Array.isArray(templates)) {
			return [];
		}
		return templates.map((template: any, index: number) => normalizeTemplate(template, index));
	});

	interface ToastOptions {
		title: string
		description: string
		color: string
	}

	const templateCount = computed(() => templateItems.value.length);
	const repositoryCount = computed(() => Array.isArray(setupData.value?.repositories) ? setupData.value.repositories.length : 0);
	const ideName = computed(() => setupData.value?.connectedIde?.name || "Not selected");
	const savedAtLabel = computed(() => formatTimestamp(setupData.value?.savedAt));
	const isLinkingEnv = computed(() => isLinkingEnvironment.value);
	const savedEnvironmentId = computed(() => setupData.value?.environmentId || null);
	const currentEnvironmentId = computed(() => activeEnvironment.value?.id || null);
	const activeEnvironmentName = computed(() => activeEnvironment.value?.name || "Not detected");
	const activeEnvironmentType = computed(() => activeEnvironment.value?.type || null);
	const activeEnvironmentMachineId = computed(() => (activeEnvironment.value as any)?.machineId || null);

	const doesActiveEnvironmentMatch = computed(() => isActiveEnvironmentLinked.value);

	const environmentMismatch = computed(() => {
		if (!currentEnvironmentId.value) {
			return false;
		}
		if (!doesActiveEnvironmentMatch.value) {
			return true;
		}
		if (!savedEnvironmentId.value) {
			return false;
		}
		return savedEnvironmentId.value !== currentEnvironmentId.value;
	});

	const checkActiveEnvironmentLink = async (): Promise<boolean> => {
		const project = projectId.value;
		const environment = currentEnvironmentId.value;

		if (!project || !environment) {
			isActiveEnvironmentLinked.value = false;
			lastLinkStatusCheck.value = null;
			return false;
		}

		isCheckingLinkStatus.value = true;

		try {
			const linked = await isEnvironmentLinkedToProject(project, environment);
			isActiveEnvironmentLinked.value = linked;
			lastLinkStatusCheck.value = new Date().toISOString();
			return linked;
		} catch (error) {
			console.error("❌ Failed to check environment link status:", error);
			isActiveEnvironmentLinked.value = false;
			return false;
		} finally {
			isCheckingLinkStatus.value = false;
		}
	};

	const isLoadingState = computed(() =>
		isCheckingInstallable.value
		|| isLoadingEnvironment.value
		|| isLoadingLinkedEnvironments.value
		|| isCheckingLinkStatus.value
	);

	const isReadyToInstall = computed(() =>
		isProjectInstallable.value
		&& doesActiveEnvironmentMatch.value
		&& !!currentEnvironmentId.value
	);

	const statusMessage = computed(() => {
		if (!hasSetupData.value) {
			return "Save the environment setup before installing.";
		}

		if (isLoadingState.value) {
			return "Checking install status...";
		}

		if (!currentEnvironmentId.value) {
			return "Activate your environment on this machine to continue.";
		}

		if (isLinkingEnv.value) {
			return "Linking environment and preparing install flow…";
		}

		if (!doesActiveEnvironmentMatch.value) {
			return `This project is not linked to ${activeEnvironmentName.value}. Click Install to link it automatically.`;
		}

		if (!isProjectInstallable.value) {
			return "Waiting for the project to be marked installable. Try refreshing the environment setup.";
		}

		return "This project is ready to install. Launch the automated install flow below.";
	});

	// Kept for reference but using static "BUILDIT" text instead
	// const installButtonLabel = computed(() => {
	// 	if (isInstalling.value || isLinkingEnv.value) {
	// 		return "Preparing...";
	// 	}
	// 	if (!hasSetupData.value) {
	// 		return "Awaiting Setup";
	// 	}
	// 	if (!currentEnvironmentId.value) {
	// 		return "Activate Environment";
	// 	}
	// 	if (!doesActiveEnvironmentMatch.value) {
	// 		return "Link Environment & Install";
	// 	}
	// 	if (!isProjectInstallable.value) {
	// 		return "Install Project";
	// 	}
	// 	return "Install Project";
	// });

	const installButtonDisabled = computed(() =>
		!hasSetupData.value
		|| !currentEnvironmentId.value
		|| isInstalling.value
		|| isUpdatingInstallable.value
		|| isLinkingEnv.value
		|| isLoadingState.value
	);

	const refreshLinkedEnvironments = async () => {
		if (!projectId.value) {
			linkedEnvironments.value = [];
			return;
		}

		isLoadingLinkedEnvironments.value = true;
		try {
			const result = await getLinkedEnvironments(projectId.value);
			linkedEnvironments.value = Array.isArray(result) ? result : [];
		} catch (error) {
			console.error("❌ Failed to fetch linked environments for install node:", error);
			linkedEnvironments.value = [];
		} finally {
			isLoadingLinkedEnvironments.value = false;
		}
	};

	const refreshInstallableStatus = async () => {
		if (!projectId.value) {
			isProjectInstallable.value = false;
			return;
		}

		await refreshLinkedEnvironments();
		const matches = await checkActiveEnvironmentLink();

		try {
			const status = await checkInstallable(projectId.value);
			const finalStatus = status && matches;
			isProjectInstallable.value = finalStatus;
			props.updateNodeData?.(props.customNodeProps.id, "environmentInstallable", finalStatus);
		} catch (error) {
			console.error("❌ Failed to verify installable status:", error);
			isProjectInstallable.value = false;
		}
	};

	async function showToast(options: ToastOptions) {
		// @ts-expect-error Nuxt UI runtime composable provided at build time
		const { useToast } = await import("#ui/composables/useToast");
		useToast().add(options);
	}

	// Trigger confetti from button click position
	const triggerBuilditConfetti = () => {
		if (builditButtonRef.value && builditConfettiRef.value) {
			const rect = builditButtonRef.value.getBoundingClientRect();
			const x = (rect.left + rect.width / 2) / window.innerWidth;
			const y = (rect.top + rect.height / 2) / window.innerHeight;

			builditConfettiRef.value.fire({
				origin: { x, y },
				spread: 70,
				particleCount: 60
			});
		}
	};

	const handleBuilditClick = async (_event: MouseEvent) => {
		if (!projectId.value) {
			await showToast({
				title: "Project Missing",
				description: "Cannot install without a project selected.",
				color: "red"
			});
			return;
		}

		if (!hasSetupData.value) {
			await showToast({
				title: "Setup Required",
				description: "Save the environment setup before starting the install.",
				color: "yellow"
			});
			return;
		}

		if (isInstalling.value || isLinkingEnv.value) {
			return;
		}

		await loadCurrentEnvironment();
		await refreshLinkedEnvironments();
		await checkActiveEnvironmentLink();

		const activeEnv = activeEnvironment.value;
		if (!activeEnv?.id) {
			await showToast({
				title: "Environment Missing",
				description: "No active environment detected on this machine.",
				color: "yellow"
			});
			return;
		}

		isInstalling.value = true;

		try {
			// Link environment if needed
			if (!doesActiveEnvironmentMatch.value) {
				const linkResult = await linkEnvironment({
					projectId: projectId.value,
					environmentId: activeEnv.id,
					meta: {
						linkedFrom: "ProjectInstallNode",
						linkedAt: new Date().toISOString(),
						environmentName: activeEnv.name,
						environmentType: activeEnv.type,
						machineId: (activeEnv as any)?.machineId || null
					}
				});

				if (!linkResult.success) {
					throw linkResult.error || new Error("Failed to link environment to project");
				}

				await showToast({
					title: "Environment Linked",
					description: `Linked "${activeEnv.name}" to ${projectName.value || "project"}.`,
					color: "green"
				});

				await refreshLinkedEnvironments();
				await checkActiveEnvironmentLink();
			}

			if (!doesActiveEnvironmentMatch.value) {
				await showToast({
					title: "Install Blocked",
					description: "Project is not linked to this environment yet. Save the environment setup again if needed.",
					color: "yellow"
				});
				return;
			}

			// Verify installable status
			await refreshInstallableStatus();
			if (!isProjectInstallable.value) {
				await showToast({
					title: "Install Blocked",
					description: "Project is not marked installable yet. Refresh the environment setup and try again.",
					color: "yellow"
				});
				return;
			}

			// Trigger confetti on success
			triggerBuilditConfetti();

			const environmentData = {
				projectId: projectId.value,
				projectName: projectName.value,
				connectedIde: setupData.value?.connectedIde,
				repositories: setupData.value?.repositories || [],
				linkedTemplates: setupData.value?.linkedTemplates || [],
				autoInstall: true,
				environmentId: activeEnv.id,
				environmentName: activeEnv.name,
				sourceInstallNodeId: props.customNodeProps.id
			};

			props.createChildProjectEnvironmentNode?.(props.customNodeProps.id, environmentData);

			try {
				await markProjectNotInstallable(projectId.value);
			} catch (error) {
				console.warn("⚠️ Failed to mark project as not installable after launching install:", error);
			}

			isProjectInstallable.value = false;
			props.updateNodeData?.(props.customNodeProps.id, "environmentInstallable", false);
			props.updateNodeData?.(props.customNodeProps.id, "lastInstallTriggeredAt", new Date().toISOString());
		} catch (error) {
			console.error("❌ Failed to launch project install:", error);
			await showToast({
				title: "Install Failed",
				description: error instanceof Error ? error.message : "Unable to launch install flow.",
				color: "red"
			});
		} finally {
			isInstalling.value = false;
		}
	};

	onMounted(async () => {
		await loadCurrentEnvironment();
		await checkActiveEnvironmentLink();
		await refreshInstallableStatus();
	});

	watch(projectId, (newId, oldId) => {
		if (newId && newId !== oldId) {
			void refreshInstallableStatus();
		}
	});

	watch(currentEnvironmentId, (newId, oldId) => {
		if (newId && newId !== oldId && projectId.value) {
			void refreshInstallableStatus();
		}
	});

	watch(() => props.customNodeProps.data?.environmentInstallable, (newValue) => {
		if (typeof newValue === "boolean") {
			isProjectInstallable.value = newValue;
		}
	});

	watch(() => setupData.value?.savedAt, () => {
		void refreshInstallableStatus();
	});
</script>

<style scoped>
.confetti-layer {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	z-index: 10;
}

.confetti-canvas {
	width: 100%;
	height: 100%;
	display: block;
}

.project-install-node-container {
	width: 560px;
	min-height: 420px;
	background: linear-gradient(135deg, rgba(6, 95, 70, 0.9), rgba(4, 120, 87, 0.95));
	border: 2px solid rgba(52, 211, 153, 0.3);
	border-radius: 14px;
	box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
	display: flex;
	flex-direction: column;
	position: relative;
	backdrop-filter: blur(10px);
	color: rgba(255, 255, 255, 0.9);
}

.node-icon-wrapper {
	position: absolute;
	top: -20px;
	left: 24px;
	width: 44px;
	height: 44px;
	border-radius: 12px;
	background: rgba(16, 185, 129, 0.15);
	border: 2px solid rgba(16, 185, 129, 0.4);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 12px 24px rgba(16, 185, 129, 0.35);
}

.connection-handle {
	width: 12px;
	height: 12px;
	background: rgba(16, 185, 129, 0.85);
	border: 2px solid rgba(110, 231, 183, 1);
	border-radius: 50%;
}

.connection-handle:hover {
	background: rgba(16, 185, 129, 1);
	transform: scale(1.2);
}

.project-install-panel {
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.install-section {
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
}

.section-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.section-header .size-5 {
	color: rgba(134, 239, 172, 1);
}

.section-title {
	display: flex;
	flex-direction: column;
	gap: 0.125rem;
}

.title-text {
	font-size: 0.9rem;
	font-weight: 600;
	letter-spacing: 0.04em;
	color: rgba(226, 252, 239, 0.95);
}

.subtitle-text {
	font-size: 0.75rem;
	color: rgba(209, 250, 229, 0.7);
}

.status-description {
	font-size: 0.78rem;
	line-height: 1.4;
	color: rgba(226, 252, 239, 0.75);
}

.status-description.ready {
	color: rgba(134, 239, 172, 0.9);
	font-weight: 500;
}

.buildit-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	padding: 1rem 2rem;
	border-radius: 999px;
	font-size: 1.25rem;
	font-weight: 900;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	background: linear-gradient(135deg, rgba(34, 197, 94, 1), rgba(16, 185, 129, 0.95));
	border: 2px solid rgba(16, 185, 129, 0.9);
	color: rgba(4, 47, 46, 1);
	cursor: pointer;
	transition: all 0.3s ease;
	box-shadow: 0 20px 40px rgba(34, 197, 94, 0.4);
	position: relative;
	overflow: hidden;
}

.buildit-button::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
	transition: left 0.5s ease;
}

.buildit-button:hover:not(:disabled) {
	transform: translateY(-3px) scale(1.05);
	box-shadow: 0 28px 56px rgba(34, 197, 94, 0.55);
}

.buildit-button:hover:not(:disabled)::before {
	left: 100%;
}

.buildit-button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
	filter: grayscale(30%);
	box-shadow: none;
	transform: scale(0.98);
}

.install-button {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.65rem 1.25rem;
	border-radius: 0.75rem;
	border: 1px solid rgba(134, 239, 172, 0.3);
	background: rgba(16, 185, 129, 0.25);
	color: rgba(226, 252, 239, 0.95);
	font-weight: 600;
	font-size: 0.85rem;
	transition: all 0.2s ease;
}

.install-button:hover:not(:disabled) {
	background: rgba(16, 185, 129, 0.35);
	box-shadow: 0 10px 28px rgba(16, 185, 129, 0.35);
	transform: translateY(-2px);
}

.install-button:disabled {
	opacity: 0.55;
	cursor: not-allowed;
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	gap: 0.85rem;
	padding-top: 0.5rem;
	border-top: 1px solid rgba(134, 239, 172, 0.12);
}

.info-item {
	display: flex;
	flex-direction: column;
	gap: 0.15rem;
	padding: 0.65rem;
	background: rgba(4, 47, 46, 0.35);
	border: 1px solid rgba(16, 185, 129, 0.18);
	border-radius: 0.65rem;
}

.info-label {
	font-size: 0.7rem;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: rgba(209, 250, 229, 0.55);
}

.info-value {
	font-size: 0.85rem;
	color: rgba(226, 252, 239, 0.92);
	font-weight: 600;
	word-break: break-word;
}

.text-warning {
	color: rgba(251, 191, 36, 0.85);
}

.environment-summary {
	background: rgba(4, 47, 46, 0.35);
	border: 1px solid rgba(16, 185, 129, 0.18);
	border-radius: 0.75rem;
	padding: 0.9rem 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.environment-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.environment-header .size-4 {
	color: rgba(134, 239, 172, 0.85);
}

.environment-name {
	font-size: 0.95rem;
	font-weight: 600;
	color: rgba(226, 252, 239, 0.95);
}

.environment-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.4rem;
	margin-top: 0.25rem;
}

.env-tag {
	font-size: 0.68rem;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	padding: 0.2rem 0.45rem;
	border-radius: 9999px;
	border: 1px solid rgba(134, 239, 172, 0.35);
	background: rgba(16, 185, 129, 0.15);
	color: rgba(226, 252, 239, 0.85);
}

.env-tag.subtle {
	border-color: rgba(134, 239, 172, 0.2);
	background: rgba(16, 185, 129, 0.08);
	color: rgba(226, 252, 239, 0.65);
}

.environment-description {
	font-size: 0.8rem;
	line-height: 1.45;
	color: rgba(226, 252, 239, 0.78);
}

.environment-warning {
	font-size: 0.75rem;
	color: rgba(251, 191, 36, 0.85);
	font-weight: 500;
	margin-top: 0.5rem;
}

.templates-section {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.template-list {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.template-card {
	background: rgba(4, 47, 46, 0.35);
	border: 1px solid rgba(16, 185, 129, 0.15);
	border-radius: 0.75rem;
	padding: 0.85rem 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.template-card-header {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 0.5rem;
}

.template-name {
	font-size: 0.92rem;
	font-weight: 600;
	color: rgba(226, 252, 239, 0.95);
}

.template-version {
	font-size: 0.75rem;
	color: rgba(134, 239, 172, 0.8);
	font-weight: 500;
}

.template-description {
	font-size: 0.78rem;
	line-height: 1.45;
	color: rgba(226, 252, 239, 0.78);
}

.template-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 0.6rem;
	font-size: 0.72rem;
	color: rgba(209, 250, 229, 0.7);
}

.template-type {
	padding: 0.2rem 0.4rem;
	border-radius: 9999px;
	background: rgba(16, 185, 129, 0.12);
	border: 1px solid rgba(134, 239, 172, 0.2);
}

.empty-templates {
	font-size: 0.8rem;
	color: rgba(226, 252, 239, 0.6);
	font-style: italic;
}
</style>
