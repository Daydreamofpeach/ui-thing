<template>
	<BaseNodeTemplate
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
		node-class="project-environment-node"
		:min-width="650"
		:min-height="750"
		:show-default-header="true"
		:show-resizer="true"
		:show-close-button="true"
		:collapsible="false"
		:default-collapsed="false"
		:theme-color="themeColor"
		icon="lucide:git-branch"
		title="PROJECT ENVIRONMENT"
		@close="handleClose"
	>
		<NodePanel class="p-4 space-y-4">
			<!-- Step Navigation -->
			<div class="p-3 bg-muted/30 rounded-lg border border-border">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<UiBadge variant="outline" size="sm">Step 3 of 3</UiBadge>
					</div>
					<div
						v-if="linkedTemplates.length > 0"
						class="flex items-center gap-2"
					>
						<UiButton
							v-if="!isEnvironmentSetupSaved"
							variant="default"
							size="sm"
							:disabled="isSaving"
							@click="handleSaveEnvironmentSetup($event)"
						>
							<Icon
								:name="isSaving ? 'lucide:loader-2' : 'lucide:save'"
								class="w-3.5 h-3.5"
								:class="{ 'animate-spin': isSaving }"
							/>
							<span>{{ isSaving ? 'Saving...' : 'Save' }}</span>
						</UiButton>
						<UiBadge
							v-else
							variant="default"
							size="sm"
						>
							Saved
						</UiBadge>
					</div>
				</div>
			</div>

			<section class="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border">
				<div class="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
					<img :src="oscarHero.image" alt="Oscar's avatar" class="w-full h-full object-cover">
				</div>
				<div class="flex-1 min-w-0">
					<h4 class="text-sm font-bold text-foreground uppercase mb-1">{{ oscarHero.title }}</h4>
					<p class="text-xs text-muted-foreground leading-relaxed">
						{{ oscarHero.body }}
					</p>
				</div>
			</section>

			<!-- Environment Section -->
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Icon name="lucide:server" class="w-4 h-4 text-primary" />
						<span class="text-sm font-semibold text-foreground uppercase">Active Environment</span>
					</div>
					<UiButton
						v-if="!isLoadingEnvironment"
						variant="ghost"
						size="icon-sm"
						@click="loadCurrentEnvironment"
					>
						<Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" />
					</UiButton>
				</div>
				<EnvironmentDisplay
					:environment="activeEnvironment"
					:theme-color="themeColor"
					:show-link-button="!isEnvironmentLinked"
					:is-linking="isLinking"
					link-button-text="Link to Project"
					empty-message="No active environment"
					empty-sub-message="Activate an environment from the Environment Manager"
					@link="handleLinkEnvironment"
				/>

				<!-- Linked Status Badge with Unlink Button -->
				<div v-if="activeEnvironment && isEnvironmentLinked" class="flex items-center gap-2 mt-3">
					<UiBadge variant="default" size="sm" class="flex-1">
						<Icon name="lucide:link" class="w-3 h-3 mr-1" />
						<span>Linked</span>
					</UiBadge>
					<UiButton
						variant="destructive"
						size="sm"
						:disabled="isUnlinking"
						:title="`Unlink ${activeEnvironment.name} from this project`"
						@click="handleUnlinkActiveEnvironment"
					>
						<Icon :name="isUnlinking ? 'lucide:loader-2' : 'lucide:unlink'" class="w-3.5 h-3.5" :class="{ 'animate-spin': isUnlinking }" />
						<span>Unlink</span>
					</UiButton>
				</div>
			</div>

			<!-- Linked Environments Section -->
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Icon name="lucide:link" class="w-4 h-4 text-primary" />
						<span class="text-sm font-semibold text-foreground uppercase">Linked Environments</span>
						<UiBadge v-if="linkedEnvironments.length > 0" variant="secondary" size="sm">
							{{ linkedEnvironments.length }}
						</UiBadge>
					</div>
					<UiButton
						variant="ghost"
						size="icon-sm"
						:disabled="isLoadingLinkedEnvironments"
						@click="fetchLinkedEnvironments"
					>
						<Icon
							name="lucide:refresh-cw"
							class="w-3.5 h-3.5"
							:class="{ 'animate-spin': isLoadingLinkedEnvironments }"
						/>
					</UiButton>
				</div>

				<!-- Loading State -->
				<div v-if="isLoadingLinkedEnvironments" class="flex flex-col items-center justify-center p-6 text-center">
					<Icon name="lucide:loader-2" class="w-8 h-8 text-muted-foreground/40 animate-spin" />
					<p class="text-xs text-muted-foreground mt-2">
						Loading linked environments...
					</p>
				</div>

				<!-- Linked Environments List -->
				<div v-else-if="linkedEnvironments.length > 0" class="space-y-2">
					<div
						v-for="linkedEnv in linkedEnvironments"
						:key="linkedEnv.id"
						class="flex items-center justify-between gap-3 p-3 bg-card rounded-lg border border-border"
					>
						<div class="flex items-center gap-3 flex-1 min-w-0">
							<div class="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
								<Icon :name="getEnvironmentIcon(linkedEnv)" class="w-4 h-4 text-primary" />
							</div>
							<div class="flex-1 min-w-0">
								<div class="text-sm font-semibold text-foreground truncate">{{ getEnvironmentName(linkedEnv) }}</div>
								<div class="flex items-center gap-2 mt-1">
									<UiBadge :variant="getEnvironmentType(linkedEnv) === 'LOCAL' ? 'secondary' : 'outline'" size="sm">
										{{ getEnvironmentType(linkedEnv) }}
									</UiBadge>
									<span v-if="getLinkedDate(linkedEnv)" class="text-xs text-muted-foreground flex items-center gap-1">
										<Icon name="lucide:calendar" class="w-3 h-3" />
										Linked {{ getLinkedDate(linkedEnv) }}
									</span>
								</div>
							</div>
						</div>
						<UiButton
							variant="destructive"
							size="icon-sm"
							:disabled="isUnlinking"
							:title="`Unlink ${getEnvironmentName(linkedEnv)}`"
							@click="handleUnlinkEnvironment(linkedEnv)"
						>
							<Icon name="lucide:unlink" class="w-4 h-4" />
						</UiButton>
					</div>
				</div>

				<!-- Empty State -->
				<div v-else class="flex flex-col items-center justify-center p-6 text-center">
					<Icon name="lucide:link-2-off" class="w-8 h-8 text-muted-foreground/20" />
					<p class="text-xs text-muted-foreground mt-2">
						No environments linked yet
					</p>
					<p class="text-xs text-muted-foreground/60 mt-1">
						Link your active environment to get started
					</p>
				</div>
			</div>

			<!-- IDE Section -->
			<div class="space-y-3">
				<div class="flex items-center gap-2">
					<Icon name="lucide:code-2" class="w-4 h-4 text-primary" />
					<span class="text-sm font-semibold text-foreground uppercase">Connected IDE</span>
				</div>
				<IdeDisplay
					:ide="connectedIde"
					:theme-color="themeColor"
					:show-open-button="true"
					empty-message="No IDE connected"
					@open="openIde"
				/>
			</div>

			<!-- Repositories Section -->
			<div class="space-y-3">
				<div class="flex items-center gap-2">
					<Icon name="lucide:git-branch" class="w-4 h-4 text-primary" />
					<span class="text-sm font-semibold text-foreground uppercase">Linked Repositories</span>
					<UiBadge v-if="repositories.length > 0" variant="secondary" size="sm">
						{{ repositories.length }}
					</UiBadge>
				</div>

				<!-- Repository List -->
				<div v-if="repositories.length > 0" class="space-y-2">
					<div
						v-for="(repo, index) in repositories"
						:key="index"
						class="flex items-center justify-between gap-3 p-3 bg-card rounded-lg border border-border"
					>
						<div class="flex items-center gap-3 flex-1 min-w-0">
							<div class="w-10 h-10 rounded-lg bg-success/20 border border-success/30 flex items-center justify-center flex-shrink-0">
								<Icon :name="getRepoIcon(repo)" class="w-5 h-5 text-success" />
							</div>
							<div class="flex-1 min-w-0">
								<div class="text-sm font-semibold text-foreground truncate">{{ repo.name || repo.repository }}</div>
								<div v-if="repo.url" class="text-xs text-muted-foreground truncate font-mono">{{ repo.url }}</div>
								<div v-if="repo.branch" class="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
									<Icon name="lucide:git-branch" class="w-3 h-3" />
									{{ repo.branch }}
								</div>
							</div>
						</div>
						<UiButton
							variant="outline"
							size="sm"
							@click="openRepository(repo)"
						>
							<Icon name="lucide:external-link" class="w-4 h-4" />
							<span>View</span>
						</UiButton>
					</div>
				</div>

				<!-- Empty State -->
				<div v-else class="flex flex-col items-center justify-center p-6 text-center">
					<Icon name="lucide:git-branch" class="w-12 h-12 text-muted-foreground/20" />
					<p class="text-sm text-muted-foreground mt-2">
						No repositories linked yet
					</p>
					<p class="text-xs text-muted-foreground/60 mt-1">
						Link repositories from the Setup Project flow
					</p>
				</div>
			</div>

			<!-- Linked Templates Section -->
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Icon name="lucide:layers" class="w-4 h-4 text-primary" />
						<span class="text-sm font-semibold text-foreground uppercase">Linked Templates</span>
						<UiBadge v-if="linkedTemplates.length > 0" variant="secondary" size="sm">
							{{ linkedTemplates.length }}
						</UiBadge>
					</div>
					<UiButton
						variant="ghost"
						size="icon-sm"
						:disabled="isLoadingTemplates"
						@click="handleTemplatesRefresh"
					>
						<Icon
							name="lucide:refresh-cw"
							class="w-3.5 h-3.5"
							:class="{ 'animate-spin': isLoadingTemplates }"
						/>
					</UiButton>
				</div>

				<div v-if="linkedTemplates.length > 0" class="p-2 bg-muted/20 rounded border border-border">
					<span v-if="isCheckingInstallable" class="text-xs text-muted-foreground">
						Checking install readiness...
					</span>
					<span v-else-if="isProjectInstallable" class="text-xs text-success">
						Project is marked as installable.
					</span>
					<span v-else class="text-xs text-muted-foreground">
						Save the environment setup to enable installation.
					</span>
				</div>

				<!-- Debug Info -->
				<div v-if="!projectId" class="flex items-center gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
					<Icon name="lucide:alert-triangle" class="w-4 h-4 text-warning" />
					<span class="text-xs text-warning">No project ID available. Project ID: "{{ projectId }}"</span>
				</div>

				<!-- Loading State -->
				<div v-if="isLoadingTemplates" class="flex flex-col items-center justify-center p-6 text-center">
					<Icon name="lucide:loader-2" class="w-8 h-8 text-muted-foreground/40 animate-spin" />
					<p class="text-xs text-muted-foreground mt-2">
						Loading templates...
					</p>
				</div>

				<!-- Template List -->
				<div v-else-if="linkedTemplates.length > 0" class="space-y-2">
					<div
						v-for="templateLink in linkedTemplates"
						:key="templateLink.id"
						class="p-3 bg-card rounded-lg border border-border"
						:class="getTemplateCardClass(templateLink)"
					>
						<div class="flex items-start gap-3">
							<div class="w-10 h-10 rounded-lg bg-success/20 border border-success/30 flex items-center justify-center flex-shrink-0">
								<Icon name="lucide:layers" class="w-5 h-5 text-success" />
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 flex-wrap mb-1">
									<span class="text-sm font-semibold text-foreground">
										{{ getTemplateName(templateLink) }}
									</span>
									<!-- Installation Status Badge -->
									<UiBadge
										v-if="getTemplateInstallStatus(templateLink)"
										:variant="getInstallStatusBadgeVariant(templateLink)"
										size="sm"
									>
										<Icon :name="getInstallStatusIcon(templateLink)" class="w-3 h-3 mr-1" :class="{ 'animate-spin': getTemplateInstallStatus(templateLink)?.status === 'installing' }" />
										{{ getInstallStatusLabel(templateLink) }}
									</UiBadge>
								</div>
								<p v-if="getTemplateDescription(templateLink)" class="text-xs text-muted-foreground mb-2">
									{{ getTemplateDescription(templateLink) }}
								</p>
								<div class="flex items-center gap-2 flex-wrap">
									<UiBadge v-if="getTemplateVersion(templateLink)" variant="outline" size="sm">
										<Icon name="lucide:tag" class="w-3 h-3 mr-1" />
										v{{ getTemplateVersion(templateLink) }}
									</UiBadge>
									<UiBadge v-if="getTemplateAuthor(templateLink)" variant="outline" size="sm">
										<Icon name="lucide:user" class="w-3 h-3 mr-1" />
										{{ getTemplateAuthor(templateLink) }}
									</UiBadge>
								</div>
								<p v-if="getTemplateInstallStatus(templateLink)?.message" class="text-xs text-muted-foreground italic mt-2">
									{{ getTemplateInstallStatus(templateLink)?.message }}
								</p>
							</div>
							<UiButton
								variant="destructive"
								size="icon-sm"
								:disabled="isInstalling"
								title="Unlink template from project"
								@click="handleUnlinkTemplate(templateLink)"
							>
								<Icon name="lucide:unlink" class="w-4 h-4" />
							</UiButton>
						</div>
					</div>
				</div>

				<!-- Empty State -->
				<div v-else class="flex flex-col items-center justify-center p-6 text-center">
					<Icon name="lucide:layers" class="w-8 h-8 text-muted-foreground/20" />
					<p class="text-xs text-muted-foreground mt-2">
						No templates linked yet
					</p>
				</div>
			</div>

			<!-- Environment Info -->
			<div class="space-y-3">
				<div class="flex items-center gap-2">
					<Icon name="lucide:info" class="w-4 h-4 text-primary" />
					<span class="text-sm font-semibold text-foreground uppercase">Environment Details</span>
				</div>
				<div class="grid grid-cols-2 gap-2">
					<div class="p-3 bg-card rounded-lg border border-border">
						<span class="text-xs font-medium text-muted-foreground uppercase">Project Name</span>
						<div class="text-sm font-semibold text-foreground mt-1">{{ projectName || 'N/A' }}</div>
					</div>
					<div v-if="connectedIde" class="p-3 bg-card rounded-lg border border-border">
						<span class="text-xs font-medium text-muted-foreground uppercase">IDE</span>
						<div class="text-sm font-semibold text-foreground mt-1">{{ connectedIde.name }}</div>
					</div>
					<div class="p-3 bg-card rounded-lg border border-border">
						<span class="text-xs font-medium text-muted-foreground uppercase">Repositories</span>
						<div class="text-sm font-semibold text-foreground mt-1">{{ repositories.length }}</div>
					</div>
					<div class="p-3 bg-card rounded-lg border border-border">
						<span class="text-xs font-medium text-muted-foreground uppercase">Templates</span>
						<div class="text-sm font-semibold text-foreground mt-1">{{ linkedTemplates.length }}</div>
					</div>
					<div v-if="customNodeProps.data?.createdAt" class="p-3 bg-card rounded-lg border border-border col-span-2">
						<span class="text-xs font-medium text-muted-foreground uppercase">Created</span>
						<div class="text-sm font-semibold text-foreground mt-1">{{ formatDate(customNodeProps.data.createdAt) }}</div>
					</div>
				</div>
			</div>
		</NodePanel>
	</BaseNodeTemplate>
</template>

<script setup lang="ts">
	import type { Options as ConfettiOptions } from "canvas-confetti";
	import { useInjectCanvasState } from "@canvas/composables/useCanvasState";
	import { useExternalUrl } from "@canvas/composables/useExternalUrl";
	import { useTemplateUnlink } from "@canvas/composables/useTemplateUnlink";
	import EnvironmentDisplay from "@canvas/shared/EnvironmentDisplay.vue";
	import IdeDisplay from "@canvas/shared/IdeDisplay.vue";
	import NodePanel from "@canvas/shared/NodePanel.vue";
	import BaseNodeTemplate from "./templates/BaseNodeTemplate.vue";
	import UiButton from "~/components/Ui/Button.vue";
	import UiBadge from "~/components/Ui/Badge.vue";
	import Icon from "~/components/Ui/Icon.vue";
	import oscarMini from "@/assets/oscarMini.png";
	import { useEnvironmentLink } from "@composables/useEnvironmentLink";
	import { useEnvironmentStore } from "@composables/useEnvironmentStore";
	import { useProjectInstallable } from "@composables/useProjectInstallable";
	import { buttClient } from "@utils/buttClient";
	import { computed, onMounted, reactive, ref, watch, watchEffect } from "vue";

	interface Props {
		customNodeProps: any
		updateNodeData?: (nodeId: string, key: string, value: any) => void
		onEnvironmentSetupSaved?: (envNodeId: string, setupData: any, savedToAPI: boolean) => void
		createChildProjectInstallNode?: (nodeId: string, installData: any) => void
		createChildBuilditNode?: (nodeId: string, builditData: any) => void
	}

	const props = defineProps<Props>();


	// Inject canvas state
	const canvasState = useInjectCanvasState();

	// External URL composable
	const { openExternalUrl } = useExternalUrl();

	// Template unlink composable
	const { unlinkTemplate } = useTemplateUnlink();

	// Environment composables
	const { activeEnvironment, loadCurrentEnvironment, isLoading: isLoadingEnvironment } = useEnvironmentStore();
	const { linkEnvironment, unlinkEnvironment, isLinking, isUnlinking, getLinkedEnvironments } = useEnvironmentLink();

	// Project installable composable
	const {
		isChecking: isCheckingInstallable,
		checkInstallable,
		setInstallable: markProjectInstallable,
		setNotInstallable: markProjectNotInstallable
	} = useProjectInstallable();

	function cloneSerializable<T>(value: T): T {
		if (value === undefined || value === null) {
			return value as T;
		}

		try {
			return JSON.parse(JSON.stringify(value)) as T;
		} catch (error) {
			console.warn("⚠️ Failed to clone value, returning original", error);
			return value as T;
		}
	}

	function mapTemplateForInstall(template: any) {
		const templateRecord = template?.template || template;
		const fallbackName = templateRecord?.name || template?.meta?.templateName || template?.meta?.name || "Untitled Template";

		return {
			id:
				template?.id
				|| template?.templateId
				|| templateRecord?.id
				|| templateRecord?._id
				|| template?._id
				|| null,
			name: fallbackName,
			description: templateRecord?.description || template?.meta?.description || "",
			version: templateRecord?.version || template?.meta?.version || null,
			provider: templateRecord?.author || templateRecord?.owner || template?.meta?.author || null,
			type: templateRecord?.type || template?.meta?.type || null,
			icon: templateRecord?.icon || null
		};
	}

	// Linked environments state
	const linkedEnvironments = ref<any[]>([]);
	const isLoadingLinkedEnvironments = ref(false);

	// Project install state
	const isProjectInstallable = ref(false);

	function updateEnvironmentInstallableFlag(value: boolean) {
		isProjectInstallable.value = value;
		try {
			props.updateNodeData?.(props.customNodeProps.id, "environmentInstallable", value);
		} catch (err) {
			console.warn("⚠️ Failed to persist environmentInstallable flag", err);
		}
	}

	// Theme colors - use theme primary color
	const themeColor = computed(() => "var(--color-primary)");

	const oscarHero = reactive({
		image: oscarMini,
		title: "Oscar's Advice",
		body: "Confirm your active environment, link the repositories you plan to work with, then save once the setup looks ready to install."
	});

	watchEffect(() => {
		const nodeId = props.customNodeProps?.id;
		const payload = {
			key: "project-environment",
			title: oscarHero.title,
			body: oscarHero.body,
			image: oscarHero.image,
			cta: "saveEnvironmentSetup",
			ctaLabel: "Save environment setup"
		};

		if (!props.updateNodeData || !nodeId) {
			return;
		}

		props.updateNodeData(nodeId, "oscarMiniCard", payload);
	});


	// Linked templates state
	const linkedTemplates = ref<any[]>([]);
	const isLoadingTemplates = ref(false);
	const isInstalling = ref(false);
	const isSaving = ref(false);
	const isEnvironmentSetupSaved = ref(false);
	const templateInstallStatuses = ref<Map<string, { status: "pending" | "installing" | "success" | "failed" | "skipped", message?: string }>>(new Map());

	const SAVE_CONFETTI_OPTIONS: Readonly<ConfettiOptions> = Object.freeze({
		particleCount: 140,
		spread: 70,
		startVelocity: 45,
		decay: 0.9,
		scalar: 0.9,
		ticks: 220
	});

	function triggerSaveCelebration(event?: MouseEvent) {
		const origin = (() => {
			if (event?.currentTarget instanceof HTMLElement) {
				const rect = event.currentTarget.getBoundingClientRect();
				return {
					x: (rect.left + rect.width / 2) / window.innerWidth,
					y: Math.max(0.05, (rect.top + rect.height / 2) / window.innerHeight)
				};
			}

			return { x: 0.5, y: 0.25 };
		})();

		useConfetti({
			...SAVE_CONFETTI_OPTIONS,
			origin
		});
	}

	// Computed data - Try canvas state first, then node data
	const connectedIde = computed(() => {
		console.log("🔍 ProjectEnvironmentNode: Computing connectedIde");

		// First try canvas state (global)
		const canvasIde = canvasState?.getPrimaryIde();
		if (canvasIde) {
			console.log("✅ Got IDE from canvas state:", {
				name: canvasIde.name,
				version: canvasIde.version,
				command: canvasIde.command,
				fullObject: canvasIde
			});
			return canvasIde;
		}

		// Fallback to node data
		const nodeIde = props.customNodeProps.data?.connectedIde || null;
		console.log("📊 Got IDE from node data:", {
			name: nodeIde?.name,
			version: nodeIde?.version,
			command: nodeIde?.command,
			fullObject: nodeIde
		});
		return nodeIde;
	});

	const repositories = computed(() => {
		console.log("🔍 ProjectEnvironmentNode: Computing repositories");

		// First try canvas state
		const canvasRepos = canvasState?.getRepositories() || [];
		if (canvasRepos.length > 0) {
			console.log("✅ Got repositories from canvas state:", canvasRepos.length);
			return canvasRepos;
		}

		// Fallback to node data
		const nodeRepos = props.customNodeProps.data?.repositories || [];
		console.log("📊 Got repositories from node data:", nodeRepos.length);
		return nodeRepos;
	});

	const projectName = computed(() => {
		const canvasProject = canvasState?.getProjectContext();
		return canvasProject?.projectName || props.customNodeProps.data?.projectName || "";
	});

	const projectId = computed(() => {
		const canvasProject = canvasState?.getProjectContext();
		return canvasProject?.projectId || props.customNodeProps.data?.projectId || "";
	});

	const refreshInstallableStatus = async () => {
		if (!projectId.value) {
			isProjectInstallable.value = false;
			return;
		}

		try {
			const status = await checkInstallable(projectId.value);
			updateEnvironmentInstallableFlag(status);
		} catch (err) {
			console.error("❌ Failed to check project installable status:", err);
			updateEnvironmentInstallableFlag(false);
		}
	};

	// Check if active environment is already linked
	const isEnvironmentLinked = computed(() => {
		if (!activeEnvironment.value) return false;
		return linkedEnvironments.value.some(
			(linked) =>
				linked.environmentId === activeEnvironment.value?.id
				|| linked.environment?.id === activeEnvironment.value?.id
		);
	});

	// Fetch linked templates from API
	const fetchLinkedTemplates = async (delayMs = 0) => {
		const currentProjectId = projectId.value;
		if (!currentProjectId) {
			console.warn("⚠️ No project ID available to fetch templates");
			return;
		}

		// Add small delay if specified (to allow API to process recent changes)
		if (delayMs > 0) {
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}

		isLoadingTemplates.value = true;
		try {
			console.log("🔍 Fetching linked templates for project:", currentProjectId);
			const templateLinks = await buttClient.linkedTemplates(currentProjectId);

			console.log("📦 Raw template links response:", templateLinks);
			console.log("📦 Template links count:", templateLinks?.length || 0);

			if (!Array.isArray(templateLinks) || templateLinks.length === 0) {
				linkedTemplates.value = [];
				console.log("ℹ️ No template links found");
				return;
			}

			// Fetch full template data for each link
			console.log("🔄 Fetching full template data for each link...");
			const templatesWithData = await Promise.all(
				templateLinks.map(async (link: any) => {
					try {
						console.log(`  Fetching template ${link.templateId}...`);
						const template = await buttClient.findByIdTemplate(link.templateId);
						console.log(`  ✅ Got template:`, {
							id: template.id,
							name: template.name,
							description: template.description,
							author: template.author,
							version: template.version
						});

						return {
							...link,
							template // Add the full template object to the link
						};
					} catch (error) {
						console.error(`  ❌ Failed to fetch template ${link.templateId}:`, error);
						return link; // Return link without template data
					}
				})
			);

			linkedTemplates.value = templatesWithData;
			console.log("✅ All templates loaded with full data:", linkedTemplates.value.length);
		} catch (error) {
			console.error("❌ Failed to fetch linked templates:", error);
			linkedTemplates.value = [];
		} finally {
			isLoadingTemplates.value = false;
		}
	};

	const handleTemplatesRefresh = async () => {
		await fetchLinkedTemplates(0);
		await refreshInstallableStatus();
	};

	const handleTemplatesRefreshWithDelay = async (delayMs = 0) => {
		await fetchLinkedTemplates(delayMs);
		await refreshInstallableStatus();
	};

	// Watch for project ID changes
	watch(projectId, (newId, oldId) => {
		if (newId && newId !== oldId) {
			console.log("🔄 Project ID changed, refetching templates");
			void handleTemplatesRefreshWithDelay(500);
		}
	});

	watch(() => props.customNodeProps.data?.environmentInstallable, (newValue) => {
		if (typeof newValue === "boolean") {
			updateEnvironmentInstallableFlag(newValue);
		}
	});


	// Helper functions
	function getRepoIcon(repo: any) {
		const type = repo.type?.toLowerCase() || "";
		if (type.includes("github")) return "simple-icons:github";
		if (type.includes("gitlab")) return "simple-icons:gitlab";
		if (type.includes("bitbucket")) return "simple-icons:bitbucket";
		return "lucide:git-branch";
	}

	function formatDate(dateString: string) {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString();
		} catch {
			return "N/A";
		}
	}

	// Template helper functions - handle both nested and direct structures
	function getTemplateName(templateLink: any): string {
		console.log("🔍 Getting template name from:", {
			hasTemplate: !!templateLink?.template,
			"template.name": templateLink?.template?.name,
			directName: templateLink?.name,
			fullObject: templateLink
		});

		const name = templateLink?.template?.name || templateLink?.name || "Unnamed Template";
		console.log("  → Final name:", name);
		return name;
	}

	function getTemplateDescription(templateLink: any): string {
		const desc = templateLink?.template?.description || templateLink?.description || "";
		console.log("🔍 Template description:", desc);
		return desc;
	}

	function getTemplateVersion(templateLink: any): string | number {
		const version = templateLink?.template?.version || templateLink?.version || "";
		return version;
	}

	function getTemplateAuthor(templateLink: any): string {
		const author = templateLink?.template?.author || templateLink?.author || "";
		return author;
	}

	function getTemplateId(templateLink: any): string {
		return templateLink.templateId || templateLink.template?.id || templateLink.id || "";
	}

	function getTemplateInstallStatus(templateLink: any) {
		const id = getTemplateId(templateLink);
		return templateInstallStatuses.value.get(id);
	}

	function getInstallStatusLabel(templateLink: any): string {
		const status = getTemplateInstallStatus(templateLink);
		if (!status) return "";

		switch (status.status) {
		case "installing": return "Installing...";
		case "success": return "Installed";
		case "failed": return "Failed";
		case "skipped": return "Already Installed";
		default: return "";
		}
	}

	function getInstallStatusIcon(templateLink: any): string {
		const status = getTemplateInstallStatus(templateLink);
		if (!status) return "";

		switch (status.status) {
		case "installing": return "lucide:loader-2";
		case "success": return "lucide:check-circle";
		case "failed": return "lucide:x-circle";
		case "skipped": return "lucide:check-circle-2";
		default: return "";
		}
	}

	function getInstallStatusBadgeVariant(templateLink: any): "default" | "secondary" | "destructive" | "outline" {
		const status = getTemplateInstallStatus(templateLink);
		if (!status) return "outline";

		switch (status.status) {
		case "installing": return "secondary";
		case "success": return "default";
		case "failed": return "destructive";
		case "skipped": return "outline";
		default: return "outline";
		}
	}

	function getTemplateCardClass(templateLink: any) {
		const status = getTemplateInstallStatus(templateLink);
		if (!status) return "";

		if (status.status === "installing") return "border-primary/50 bg-primary/5";
		if (status.status === "success" || status.status === "skipped") return "border-success/50 bg-success/5";
		if (status.status === "failed") return "border-destructive/50 bg-destructive/5";
		return "";
	}

	const openIde = async (ide?: any) => {
		const ideToOpen = ide || connectedIde.value;
		if (!ideToOpen?.command) {
			console.error("No IDE command available");
			return;
		}

		try {
			console.log("🚀 Opening IDE:", ideToOpen.name);
			const { openPath } = await import("@tauri-apps/plugin-opener");
			await openPath(ideToOpen.command);
		} catch (error) {
			console.error("Failed to open IDE:", error);
		}
	};

	const openRepository = async (repo: any) => {
		console.log("🌐 Opening repository:", repo.name, "→", repo.url);
		if (repo.url) {
			await openExternalUrl(repo.url);
		}
	};

	const handleLinkEnvironment = async () => {
		console.log("═══════════════════════════════════════════");
		console.log("🔗 LINKING ENVIRONMENT TO PROJECT");
		console.log("  Active Environment:", activeEnvironment.value?.name);
		console.log("  Project ID:", projectId.value);
		console.log("═══════════════════════════════════════════");

		if (!activeEnvironment.value) {
			console.warn("⚠️ No active environment to link");
			const { useToast } = await import("~/components/Ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "No Environment",
				description: "Please activate an environment first",
				color: "warning"
			});
			return;
		}

		if (!projectId.value) {
			console.error("❌ No project ID available");
			const { useToast } = await import("~/components/Ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Error",
				description: "Project ID not found",
				color: "error"
			});
			return;
		}

		try {
			const { useToast } = await import("~/components/Ui/composables/useToast");
			const toast = useToast();

			const result = await linkEnvironment({
				projectId: projectId.value,
				environmentId: activeEnvironment.value.id,
				meta: {
					linkedFrom: "ProjectEnvironmentNode",
					linkedAt: new Date().toISOString(),
					environmentName: activeEnvironment.value.name,
					environmentType: activeEnvironment.value.type
				}
			});

			if (result.success) {
				console.log("✅ Environment linked successfully:", result.data);
				toast.add({
					title: "Environment Linked",
					description: `"${activeEnvironment.value.name}" has been linked to the project`,
					color: "success"
				});

				// Refresh linked environments list
				await fetchLinkedEnvironments();
			} else {
				throw result.error;
			}
		} catch (error) {
			console.error("❌ Failed to link environment:", error);
			const { useToast } = await import("~/components/Ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Error",
				description: "Failed to link environment. The API endpoint may not be available yet.",
				color: "error"
			});
		}
	};

	const fetchLinkedEnvironments = async () => {
		if (!projectId.value) {
			console.warn("⚠️ No project ID available to fetch linked environments");
			return;
		}

		isLoadingLinkedEnvironments.value = true;
		try {
			console.log("═══════════════════════════════════════════");
			console.log("🔍 FETCHING LINKED ENVIRONMENTS");
			console.log("  Project ID:", projectId.value);
			console.log("═══════════════════════════════════════════");

			const environments = await getLinkedEnvironments(projectId.value);
			linkedEnvironments.value = environments;

			console.log("═══════════════════════════════════════════");
			console.log("✅ LINKED ENVIRONMENTS LOADED");
			console.log("  Count:", environments.length);
			console.log("  Raw data:", environments);
			console.log("═══════════════════════════════════════════");
		} catch (error) {
			console.error("❌ Failed to fetch linked environments:", error);
			linkedEnvironments.value = [];
		} finally {
			isLoadingLinkedEnvironments.value = false;
		}
	};

	const handleUnlinkActiveEnvironment = async () => {
		if (!activeEnvironment.value) {
			console.warn("⚠️ No active environment to unlink");
			return;
		}

		console.log("🔓 Unlinking active environment:", activeEnvironment.value.name);

		if (!projectId.value) {
			console.error("❌ No project ID available");
			return;
		}

		try {
			const { useToast } = await import("~/components/Ui/composables/useToast");
			const toast = useToast();

			const result = await unlinkEnvironment(projectId.value, activeEnvironment.value.id);

			if (result.success) {
				console.log("✅ Active environment unlinked successfully");
				toast.add({
					title: "Environment Unlinked",
					description: `"${activeEnvironment.value.name}" has been unlinked from the project`,
					color: "success"
				});

				// Refresh linked environments list
				await fetchLinkedEnvironments();
			} else {
				throw result.error;
			}
		} catch (error) {
			console.error("❌ Failed to unlink active environment:", error);
			const { useToast } = await import("~/components/Ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Error",
				description: "Failed to unlink environment. The API endpoint may not be available yet.",
				color: "error"
			});
		}
	};

	const handleUnlinkEnvironment = async (linkedEnv: any) => {
		const envName = getEnvironmentName(linkedEnv);
		console.log("🔓 Unlinking environment:", envName);

		if (!projectId.value) {
			console.error("❌ No project ID available");
			return;
		}

		try {
			const { useToast } = await import("~/components/Ui/composables/useToast");
			const toast = useToast();

			const environmentId = linkedEnv.environmentId || linkedEnv.environment?.id;
			if (!environmentId) {
				throw new Error("Environment ID not found");
			}

			const result = await unlinkEnvironment(projectId.value, environmentId);

			if (result.success) {
				console.log("✅ Environment unlinked successfully");
				toast.add({
					title: "Environment Unlinked",
					description: `"${envName}" has been unlinked from the project`,
					color: "success"
				});

				// Refresh linked environments list
				await fetchLinkedEnvironments();
			} else {
				throw result.error;
			}
		} catch (error) {
			console.error("❌ Failed to unlink environment:", error);
			const { useToast } = await import("~/components/Ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Error",
				description: "Failed to unlink environment. The API endpoint may not be available yet.",
				color: "error"
			});
		}
	};

	// Helper functions for linked environments
	function getEnvironmentName(linkedEnv: any): string {
		// Log the full structure to understand what we're getting
		console.log("🔍 Getting environment name from full object:", linkedEnv);

		// Try multiple possible locations for the environment name
		const name = linkedEnv.environment?.name
			|| linkedEnv.environmentName
			|| linkedEnv.meta?.environmentName
			|| linkedEnv.name
			|| "Unknown Environment";

		console.log("🔍 Environment name result:", {
			result: name,
			hasEnvironmentObject: !!linkedEnv.environment,
			"linkedEnv.environment?.name": linkedEnv.environment?.name,
			"linkedEnv.environmentName": linkedEnv.environmentName,
			"linkedEnv.meta?.environmentName": linkedEnv.meta?.environmentName,
			"linkedEnv.name": linkedEnv.name,
			"Object.keys(linkedEnv)": Object.keys(linkedEnv)
		});

		return name;
	}

	function getEnvironmentType(linkedEnv: any): string {
		// Try multiple possible locations for the environment type
		const type = linkedEnv.environment?.type
			|| linkedEnv.environmentType
			|| linkedEnv.meta?.environmentType
			|| linkedEnv.type
			|| "UNKNOWN";

		console.log("🔍 Getting environment type:", {
			result: type,
			"linkedEnv.environment?.type": linkedEnv.environment?.type,
			"linkedEnv.environmentType": linkedEnv.environmentType,
			"linkedEnv.meta?.environmentType": linkedEnv.meta?.environmentType,
			"linkedEnv.type": linkedEnv.type
		});

		return type;
	}

	function getEnvironmentIcon(linkedEnv: any): string {
		const type = getEnvironmentType(linkedEnv);
		return type === "LOCAL" ? "lucide:laptop" : "lucide:cloud";
	}


	function getLinkedDate(linkedEnv: any): string | null {
		const date = linkedEnv.createdAt || linkedEnv.linkedAt || linkedEnv.meta?.linkedAt;
		if (!date) return null;

		try {
			return new Date(date).toLocaleDateString();
		} catch {
			return null;
		}
	}

	const handleClose = () => {
		// Close is handled by BaseNodeTemplate
	};

	const handleUnlinkTemplate = async (templateLink: any) => {
		const templateId = templateLink.templateId || templateLink.template?.id;
		const templateName = getTemplateName(templateLink);

		console.log("🔓 Unlinking template:", {
			projectId: projectId.value,
			templateId,
			templateName
		});

		if (!projectId.value || !templateId) {
			console.error("Missing project ID or template ID");
			return;
		}

		try {
			const { useToast } = await import("~/components/Ui/composables/useToast");
			const toast = useToast();

			const result = await unlinkTemplate({
				projectId: projectId.value,
				templateId
			});

			if (result.success) {
				toast.add({
					title: "Template Unlinked",
					description: `"${templateName}" has been unlinked from the project`,
					color: "success"
				});

				// Refresh templates list
				await handleTemplatesRefresh();
			} else {
				throw result.error;
			}
		} catch (error) {
			console.error("Failed to unlink template:", error);
			const { useToast } = await import("~/components/Ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Error",
				description: "Failed to unlink template",
				color: "error"
			});
		}
	};

	const handleSaveEnvironmentSetup = async (event?: MouseEvent) => {
		console.log("═══════════════════════════════════════════");
		console.log("💾 SAVING ENVIRONMENT SETUP");
		console.log("  Project ID:", projectId.value);
		console.log("  Connected IDE:", connectedIde.value?.name);
		console.log("  Repositories:", repositories.value.length);
		console.log("  Templates:", linkedTemplates.value.length);
		console.log("═══════════════════════════════════════════");

		isSaving.value = true;

		try {
			const { useToast } = await import("~/components/Ui/composables/useToast");
			const toast = useToast();

			if (!projectId.value) {
				throw new Error("No project ID available");
			}

			// Prepare setup data
			const connectedIdeSnapshot = connectedIde.value ? cloneSerializable(connectedIde.value) : null;
			const repositoriesSnapshot = cloneSerializable(repositories.value || []);
			const rawTemplates = cloneSerializable(linkedTemplates.value || []);
			const templatesForInstall = Array.isArray(rawTemplates)
				? rawTemplates.map((template: any) => mapTemplateForInstall(template))
				: [];
			const environmentSnapshot = activeEnvironment.value
				? cloneSerializable({
					id: activeEnvironment.value.id,
					name: activeEnvironment.value.name,
					description: activeEnvironment.value.description,
					type: activeEnvironment.value.type,
					machineId: (activeEnvironment.value as any)?.machineId || null,
					butt: activeEnvironment.value.butt,
					meta: activeEnvironment.value.meta || null,
					machine: (activeEnvironment.value as any)?.machine || null
				})
				: null;

			const setupData = {
				projectId: projectId.value,
				projectName: projectName.value,
				connectedIde: connectedIdeSnapshot,
				repositories: repositoriesSnapshot,
				linkedTemplates: rawTemplates,
				installTemplates: templatesForInstall,
				environment: environmentSnapshot,
				environmentId: environmentSnapshot?.id || null,
				environmentName: environmentSnapshot?.name || null,
				environmentType: environmentSnapshot?.type || null,
				environmentMachineId: (environmentSnapshot as any)?.machineId || null,
				environmentDescription: environmentSnapshot?.description || null,
				savedAt: new Date().toISOString()
			};

			console.log("💾 Saving environment setup (node data only):");
			console.log("  Setup data:", setupData);

			// Save to node data (persisted in canvas)
			// Note: Not saving to Project API as updateProject doesn't support custom meta fields
			// The canvas data persistence handles saving this configuration

			// Mark project as installable via API
			try {
				if (projectId.value) {
					await markProjectInstallable(projectId.value);
					updateEnvironmentInstallableFlag(true);
					console.log("✅ Project marked as installable");
				}
			} catch (error) {
				console.warn("⚠️ Failed to mark project as installable:", error);
			}

			// Create BuilditNode directly
			if (props.createChildBuilditNode && projectId.value) {
				props.createChildBuilditNode(props.customNodeProps.id, {
					projectId: projectId.value,
					projectName: projectName.value,
					environmentInstallable: true,
					setupData
				});
			}

			// Also notify orchestrator for other state updates
			if (props.onEnvironmentSetupSaved) {
				props.onEnvironmentSetupSaved(props.customNodeProps.id, setupData, true);
			}

			isEnvironmentSetupSaved.value = true;

			toast.add({
				title: "Setup Saved",
				description: "Environment setup saved to project. Install button now active in Project Node.",
				color: "success"
			});

			triggerSaveCelebration(event);

			console.log("✅ Environment setup saved successfully");
		} catch (error) {
			console.error("❌ Failed to save environment setup:", error);
			const { useToast } = await import("~/components/Ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Save Failed",
				description: "Failed to save environment setup to project",
				color: "error"
			});
		} finally {
			isSaving.value = false;
		}
	};

	const handleInstallTemplates = async () => {
		await refreshInstallableStatus();
		console.log("═══════════════════════════════════════════");
		console.log("📦 INSTALLING TEMPLATES");
		console.log("  Templates to install:", linkedTemplates.value.length);
		console.log("  Auto-install mode:", !!props.customNodeProps.data?.autoInstall);
		console.log("═══════════════════════════════════════════");

		if (linkedTemplates.value.length === 0) {
			console.warn("⚠️ No templates to install");
			return;
		}

		const { useToast } = await import("~/components/Ui/composables/useToast");
		const toast = useToast();

		if (!projectId.value) {
			toast.add({
				title: "Missing Project",
				description: "Project ID is required to run installs.",
				color: "error"
			});
			return;
		}

		const requireInstallable = !props.customNodeProps.data?.autoInstall;

		if (requireInstallable && !isProjectInstallable.value) {
			toast.add({
				title: "Not Installable",
				description: "Save the environment setup before installing templates.",
				color: "warning"
			});
			return;
		}

		isInstalling.value = true;

		// Clear previous statuses
		templateInstallStatuses.value.clear();

		if (requireInstallable) {
			try {
				await markProjectNotInstallable(projectId.value);
				updateEnvironmentInstallableFlag(false);
			} catch (error) {
				console.warn("Failed to mark project as not installable before install:", error);
			}
		}

		// Hardcoded OS and version for now
		const currentOS = "windows";
		const currentVersion = "11";

		let successCount = 0;
		let failureCount = 0;
		let skippedCount = 0;

		try {
			for (const templateLink of linkedTemplates.value) {
				const template = templateLink.template;
				const templateName = getTemplateName(templateLink);
				const templateId = getTemplateId(templateLink);

				// Set status to installing
				templateInstallStatuses.value.set(templateId, {
					status: "installing",
					message: "Running installation commands..."
				});

				console.log(`\n🔍 Processing template: ${templateName}`);
				console.log("  Template object:", template);
				console.log("  Template.template:", template?.template);
				console.log("  Has hooks at template.hooks:", !!template?.hooks);
				console.log("  Has hooks at template.template.hooks:", !!template?.template?.hooks);

				// Check if template has install hooks (nested in template.template.hooks)
				const hooks = template?.template?.hooks || template?.hooks;
				if (!hooks || !hooks.install) {
					console.log(`  ⏭️ No install hooks found for ${templateName}`);
					console.log("  Hooks object:", hooks);
					continue;
				}

				console.log("  ✅ Install hooks found:", hooks.install);

				// Navigate to OS-specific hooks
				const osHooks = hooks.install[currentOS];
				if (!osHooks) {
					console.log(`  ⏭️ No ${currentOS} install hooks for ${templateName}`);
					continue;
				}

				console.log(`  ${currentOS} hooks:`, osHooks);

				// Navigate to version-specific hooks
				const versionHooks = osHooks[currentVersion];
				if (!versionHooks) {
					console.log(`  ⏭️ No version ${currentVersion} hooks for ${templateName}`);
					continue;
				}

				console.log(`  Version ${currentVersion} hooks:`, versionHooks);

				// Get actions
				const actions = versionHooks.actions;
				if (!Array.isArray(actions) || actions.length === 0) {
					console.log(`  ⏭️ No actions found for ${templateName}`);
					continue;
				}

				console.log(`  Found ${actions.length} action(s) to execute`);

				let templateSuccess = false;
				let templateSkipped = false;
				let templateErrorMessage = "";

				// Execute each action
				for (let i = 0; i < actions.length; i++) {
					const action = actions[i];
					console.log(`\n  📌 Action ${i + 1}/${actions.length}:`, action);

					const exe = action.exe || "powershell.exe";
					let command = action.command;
					const preCheckCommand = action.preCheck;

					if (!command) {
						console.warn(`    ⚠️ No command specified in action ${i + 1}`);
						continue;
					}

					// Quick fix: Replace {VERSION} with a known good VS Code version
					const vscodeVersion = "1.95.3"; // Known stable version
					const placeholders: Record<string, string> = {
						"{VERSION}": vscodeVersion,
						"{PROJECT_NAME}": projectName.value || "project",
						"{PROJECT_ID}": projectId.value || "",
						"{IDE_NAME}": connectedIde.value?.name || "",
						"{TEMPLATE_NAME}": templateName
					};

					// Replace all placeholders in command
					for (const [placeholder, value] of Object.entries(placeholders)) {
						command = command.replace(new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"), value);
					}

					console.log(`    📝 Original command: ${action.command}`);
					console.log(`    🔄 Processed command: ${command}`);

					try {
						const { useTauriShellCommand } = await import("#imports");

						// Update status message
						templateInstallStatuses.value.set(templateId, {
							status: "installing",
							message: `Running action ${i + 1}/${actions.length}...`
						});

						// Execute pre-check if available
						if (preCheckCommand) {
							console.log(`    🔍 Running pre-check: ${preCheckCommand}`);

							try {
								const preCheckResult = await useTauriShellCommand.create("exec-pwsh", [
									"-Command",
									preCheckCommand
								]).execute();

								console.log(`    📊 Pre-check result:`, {
									code: preCheckResult.code,
									output: preCheckResult.stdout.trim()
								});

								// If pre-check indicates already installed, skip
								if (preCheckResult.code === 0 && preCheckResult.stdout.toLowerCase().includes("found")) {
									console.log(`    ⏭️ Already installed, skipping`);
									templateSkipped = true;
									skippedCount++;
									templateInstallStatuses.value.set(templateId, {
										status: "skipped",
										message: "Already installed on this machine"
									});
									break; // Skip to next template
								}
							} catch (preCheckError) {
								console.warn(`    ⚠️ Pre-check failed, continuing with install:`, preCheckError);
							}
						}

						console.log(`    🚀 Executing install command...`);
						console.log(`    📍 Using exe: ${exe}`);

						const result = await useTauriShellCommand.create("exec-pwsh", [
							"-Command",
							command
						]).execute();

						console.log(`    ✅ Command executed`);
						console.log(`    📊 Exit code: ${result.code}`);

						// Check for success indicators in output
						const stdout = result.stdout.toLowerCase();
						const isAlreadyInstalled = stdout.includes("already installed")
							|| stdout.includes("no applicable update")
							|| stdout.includes("no newer package");

						const hasSuccessMessage = stdout.includes("successfully installed")
							|| stdout.includes("installation successful");

						if (result.code === 0 || isAlreadyInstalled || hasSuccessMessage) {
							console.log(`    ✅ Success! ${isAlreadyInstalled ? "(Already installed)" : ""}`);
							templateSuccess = true;

							if (isAlreadyInstalled) {
								templateSkipped = true;
							}
						} else {
							console.error(`    ❌ Command failed with exit code ${result.code}`);
							console.error(`    📄 Output preview:`, result.stdout.substring(0, 300));

							// Check for specific errors
							if (stdout.includes("no version found")) {
								templateErrorMessage = `Version not found in winget`;
								console.error(`    💡 Tip: The version "${vscodeVersion}" may not be available in winget`);
							} else {
								templateErrorMessage = `Exit code ${result.code}`;
							}
						}
					} catch (error) {
						console.error(`    ❌ Failed to execute action ${i + 1}:`, error);
						templateErrorMessage = error instanceof Error ? error.message : "Execution failed";
					}
				}

				// Update final status for this template
				if (templateSkipped) {
					templateInstallStatuses.value.set(templateId, {
						status: "skipped",
						message: "Already installed"
					});
					successCount++;
				} else if (templateSuccess) {
					templateInstallStatuses.value.set(templateId, {
						status: "success",
						message: "Installation completed"
					});
					successCount++;
				} else {
					templateInstallStatuses.value.set(templateId, {
						status: "failed",
						message: templateErrorMessage || "Installation failed"
					});
					failureCount++;
				}
			}

			console.log("\n═══════════════════════════════════════════");
			console.log("📊 INSTALLATION COMPLETE");
			console.log(`  ✅ Success: ${successCount}`);
			console.log(`  ⏭️ Skipped: ${skippedCount}`);
			console.log(`  ❌ Failures: ${failureCount}`);
			console.log(`  📋 Total templates: ${linkedTemplates.value.length}`);
			console.log("═══════════════════════════════════════════");

			if (successCount > 0 && failureCount === 0) {
				toast.add({
					title: "Installation Successful",
					description: `${successCount} template action(s) completed successfully`,
					color: "success"
				});
			} else if (successCount > 0 && failureCount > 0) {
				toast.add({
					title: "Partial Installation",
					description: `${successCount} succeeded, ${failureCount} failed. Check console for details.`,
					color: "warning"
				});
			} else if (failureCount > 0) {
				toast.add({
					title: "Installation Failed",
					description: `${failureCount} command(s) failed. Check console logs for details.`,
					color: "error"
				});
			} else {
				toast.add({
					title: "No Installation Needed",
					description: "No install hooks found for Windows 11",
					color: "info"
				});
			}
		} catch (error) {
			console.error("❌ Installation error:", error);
			toast.add({
				title: "Installation Error",
				description: "An error occurred during installation",
				color: "error"
			});
		} finally {
			isInstalling.value = false;
		}
	};

	// On mount, log canvas state, fetch templates, and load environments
	onMounted(async () => {
		console.log("═══════════════════════════════════════════");
		console.log("🌳 PROJECT ENVIRONMENT NODE MOUNTED");
		console.log("  Canvas State Available:", !!canvasState);

		const canvasIde = canvasState?.getPrimaryIde();
		console.log("  Canvas IDE:", {
			name: canvasIde?.name,
			version: canvasIde?.version,
			hasVersion: !!canvasIde?.version,
			fullIde: canvasIde
		});

		console.log("  Canvas Repositories:", canvasState?.getRepositories().length);

		const nodeIde = props.customNodeProps.data?.connectedIde;
		console.log("  Node IDE:", {
			name: nodeIde?.name,
			version: nodeIde?.version,
			hasVersion: !!nodeIde?.version,
			fullIde: nodeIde
		});

		console.log("  Node Repositories:", props.customNodeProps.data?.repositories?.length);
		console.log("  Connected IDE computed:", connectedIde.value);
		console.log("  Project ID from computed:", projectId.value);
		console.log("  Project ID from canvas state:", canvasState?.getProjectContext()?.projectId);
		console.log("  Project ID from node data:", props.customNodeProps.data?.projectId);
		console.log("═══════════════════════════════════════════");

		// Load current environment from store
		console.log("🚀 Loading current environment from store...");
		await loadCurrentEnvironment();
		console.log("  Active Environment:", activeEnvironment.value?.name || "None");

		// Fetch linked environments
		console.log("🚀 Fetching linked environments...");
		if (projectId.value) {
			await fetchLinkedEnvironments();
			console.log("  Linked Environments:", linkedEnvironments.value.length);
		}

		// Fetch linked templates immediately on mount
		console.log("🚀 Initiating template fetch on mount...");
		if (projectId.value) {
			await handleTemplatesRefresh();

			// Auto-install if flag is set (spawned from Install button)
			if (props.customNodeProps.data?.autoInstall && linkedTemplates.value.length > 0) {
				console.log("🚀 Auto-install mode enabled, starting installation...");
				setTimeout(() => {
					handleInstallTemplates();
				}, 1000); // Small delay to ensure UI is ready
			}
		} else {
			console.error("❌ Cannot fetch templates: No project ID available");
		}
	});

	// Expose refresh methods
	defineExpose({
		refreshTemplates: (delayMs = 0) => handleTemplatesRefreshWithDelay(delayMs),
		refreshLinkedEnvironments: fetchLinkedEnvironments
	});
</script>

<style scoped>
/* Project Environment Node Styles */
.project-environment-node {
	position: relative;
	overflow: visible !important;
}

/* Ensure icon wrapper is visible and not cut off */
.project-environment-node :deep(.node-icon-wrapper) {
	overflow: visible !important;
	z-index: 20 !important;
}

/* Ensure parent container allows overflow */
.project-environment-node :deep(.base-node-template) {
	overflow: visible !important;
}
</style>
