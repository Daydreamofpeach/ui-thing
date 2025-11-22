<template>
	<div class="min-h-screen bg-background">
		<!-- Header -->
		<div class="border-b bg-card sticky top-0 z-10">
			<div class="container mx-auto px-6 py-4">
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-2xl font-bold text-foreground">Node Icons Catalog</h1>
						<p class="text-sm text-muted-foreground mt-1">
							Complete reference of icons used across canvas nodes
						</p>
					</div>
					<UiButton variant="outline" size="sm" @click="copyAllIcons">
						<Icon name="lucide:copy" class="w-4 h-4 mr-2" />
						Copy All
					</UiButton>
				</div>
			</div>
		</div>

		<!-- Content -->
		<div class="container mx-auto px-6 py-8">
			<!-- Search and Filter -->
			<div class="mb-6 space-y-4">
				<UiInput
					v-model="searchQuery"
					placeholder="Search icons by name, category, or node type..."
					class="max-w-md"
				>
					<template #prefix>
						<Icon name="lucide:search" class="w-4 h-4 text-muted-foreground" />
					</template>
				</UiInput>
				<div class="flex flex-wrap gap-2">
					<UiButton
						v-for="category in categories"
						:key="category"
						:variant="selectedCategory === category ? 'default' : 'outline'"
						size="sm"
						@click="selectedCategory = selectedCategory === category ? null : category"
					>
						{{ category }}
					</UiButton>
				</div>
			</div>

			<!-- Icons Grid -->
			<div class="space-y-8">
				<div
					v-for="category in filteredCategories"
					:key="category"
					class="space-y-4"
				>
					<h2 class="text-xl font-semibold text-foreground flex items-center gap-2">
						<Icon name="lucide:folder" class="w-5 h-5" />
						{{ category }}
					</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						<UiCard
							v-for="iconData in getIconsByCategory(category)"
							:key="iconData.icon"
							class="hover:shadow-lg transition-shadow cursor-pointer"
							@click="selectIcon(iconData)"
						>
							<UiCardContent class="p-4">
								<div class="flex items-start gap-4">
									<!-- Icon Display -->
									<div
										class="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center"
										:style="{ borderColor: iconData.color }"
									>
										<Icon
											:name="iconData.icon"
											class="w-8 h-8"
											:style="{ color: iconData.color }"
										/>
									</div>

									<!-- Icon Info -->
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2 mb-1">
											<h3 class="font-semibold text-foreground truncate">
												{{ iconData.nodeType }}
											</h3>
											<UiBadge
												v-if="iconData.usageCount > 1"
												variant="secondary"
												size="sm"
											>
												{{ iconData.usageCount }}
											</UiBadge>
										</div>
										<p class="text-xs text-muted-foreground font-mono mb-2">
											{{ iconData.icon }}
										</p>
										<div class="flex flex-wrap gap-1">
											<UiBadge
												v-for="node in iconData.nodes"
												:key="node"
												variant="outline"
												size="sm"
												class="text-xs"
											>
												{{ node }}
											</UiBadge>
										</div>
									</div>
								</div>

								<!-- Origin Info -->
								<div class="mt-3 pt-3 border-t border-border">
									<div class="flex items-center justify-between text-xs">
										<span class="text-muted-foreground">Origin:</span>
										<UiBadge variant="secondary" size="sm">
											Lucide Icons
										</UiBadge>
									</div>
								</div>
							</UiCardContent>
						</UiCard>
					</div>
				</div>
			</div>

			<!-- Empty State -->
			<div
				v-if="filteredIcons.length === 0"
				class="flex flex-col items-center justify-center py-16 text-center"
			>
				<Icon name="lucide:search-x" class="w-16 h-16 text-muted-foreground/30 mb-4" />
				<h3 class="text-lg font-semibold text-foreground mb-2">No icons found</h3>
				<p class="text-sm text-muted-foreground">
					Try adjusting your search or filter criteria
				</p>
			</div>
		</div>

		<!-- Icon Detail Modal -->
		<UiDialog v-model:open="showDetailModal">
			<UiDialogContent v-if="selectedIcon" class="max-w-2xl">
				<UiDialogHeader>
					<UiDialogTitle>{{ selectedIcon.nodeType }}</UiDialogTitle>
					<UiDialogDescription>
						Icon details and usage information
					</UiDialogDescription>
				</UiDialogHeader>

				<div class="space-y-6 py-4">
					<!-- Icon Preview -->
					<div class="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
						<div
							class="w-32 h-32 rounded-full bg-primary/10 border-4 flex items-center justify-center"
							:style="{ borderColor: selectedIcon.color }"
						>
							<Icon
								:name="selectedIcon.icon"
								class="w-16 h-16"
								:style="{ color: selectedIcon.color }"
							/>
						</div>
					</div>

					<!-- Icon Information -->
					<div class="grid grid-cols-2 gap-4">
						<UiCard>
							<UiCardContent class="p-4">
								<div class="space-y-2">
									<label class="text-xs font-medium text-muted-foreground">Icon Name</label>
									<code class="block text-sm font-mono text-foreground">
										{{ selectedIcon.icon }}
									</code>
								</div>
							</UiCardContent>
						</UiCard>

						<UiCard>
							<UiCardContent class="p-4">
								<div class="space-y-2">
									<label class="text-xs font-medium text-muted-foreground">Category</label>
									<p class="text-sm text-foreground">{{ selectedIcon.category }}</p>
								</div>
							</UiCardContent>
						</UiCard>

						<UiCard>
							<UiCardContent class="p-4">
								<div class="space-y-2">
									<label class="text-xs font-medium text-muted-foreground">Origin</label>
									<UiBadge variant="secondary">Lucide Icons</UiBadge>
								</div>
							</UiCardContent>
						</UiCard>

						<UiCard>
							<UiCardContent class="p-4">
								<div class="space-y-2">
									<label class="text-xs font-medium text-muted-foreground">Usage Count</label>
									<p class="text-sm text-foreground font-semibold">
										{{ selectedIcon.usageCount }} node{{ selectedIcon.usageCount !== 1 ? 's' : '' }}
									</p>
								</div>
							</UiCardContent>
						</UiCard>
					</div>

					<!-- Used In Nodes -->
					<div>
						<label class="text-sm font-medium text-foreground mb-2 block">Used In Nodes</label>
						<div class="flex flex-wrap gap-2">
							<UiBadge
								v-for="node in selectedIcon.nodes"
								:key="node"
								variant="outline"
								size="sm"
							>
								{{ node }}
							</UiBadge>
						</div>
					</div>

					<!-- Code Example -->
					<div>
						<label class="text-sm font-medium text-foreground mb-2 block">Usage Example</label>
						<pre class="bg-muted p-4 rounded-lg text-xs font-mono overflow-x-auto"><code>&lt;Icon name="{{ selectedIcon.icon }}" class="w-6 h-6" /&gt;</code></pre>
					</div>
				</div>

				<UiDialogFooter>
					<UiButton variant="outline" @click="showDetailModal = false">
						Close
					</UiButton>
					<UiButton @click="copyIconCode(selectedIcon)">
						<Icon name="lucide:copy" class="w-4 h-4 mr-2" />
						Copy Code
					</UiButton>
				</UiDialogFooter>
			</UiDialogContent>
		</UiDialog>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref } from "vue";
	import Icon from "~/components/Ui/Icon.vue";
	import UiButton from "~/components/Ui/Button.vue";
	import UiInput from "~/components/Ui/Input.vue";
	import UiCard from "~/components/Ui/Card/Card.vue";
	import UiCardContent from "~/components/Ui/Card/Content.vue";
	import UiBadge from "~/components/Ui/Badge.vue";
	import UiDialog from "~/components/Ui/Dialog/Dialog.vue";
	import UiDialogContent from "~/components/Ui/Dialog/Content.vue";
	import UiDialogHeader from "~/components/Ui/Dialog/Header.vue";
	import UiDialogTitle from "~/components/Ui/Dialog/Title.vue";
	import UiDialogDescription from "~/components/Ui/Dialog/Description.vue";
	import UiDialogFooter from "~/components/Ui/Dialog/Footer.vue";

	// Icon mapping from BuilditNode
	const nodeIconMap: Record<string, string> = {
		// Project management
		projectNode: "i-lucide-folder-kanban",
		setupProjectNode: "i-lucide-project-arrows",
		projectEnvironmentNode: "i-lucide-git-branch",
		projectInstallNode: "i-lucide-rocket",
		projectToolsSetupNode: "i-lucide-wrench",
		projectConfiguredNode: "i-lucide-check-circle",
		// User/Team
		userManagementNode: "i-lucide-users",
		userNode: "i-lucide-user",
		adminUserNode: "i-lucide-user-cog",
		// Tasks & Work
		taskNode: "i-lucide-check-square",
		orbitCardNode: "i-lucide-orbit",
		// Development & Automation
		solutionNode: "i-lucide-puzzle",
		projectBuilditNode: "i-lucide-zap",
		builditNode: "i-lucide-zap",
		integrationNode: "i-lucide-plug",
		integrationConnectionNode: "i-lucide-plug",
		integrationDetailNode: "i-lucide-plug-2",
		// Version Control
		gitCloneRepositoryNode: "i-lucide-git-clone",
		gitActionNode: "i-lucide-git-commit",
		// Code & Templates
		templateNode: "i-lucide-layout-template",
		templateConfiguredNode: "i-lucide-layout-grid",
		solutionTemplateNode: "i-lucide-layers",
		// Development Tools
		hookNode: "i-lucide-webhook",
		transportNode: "i-lucide-wifi",
		transportTemplateNode: "i-lucide-wifi",
		browserNode: "i-lucide-globe",
		codeEditorNode: "i-lucide-code",
		scriptEditorNode: "i-lucide-code-2",
		fileCreatorNode: "i-lucide-file-plus",
		// System & Configuration
		intentSelectionNode: "i-lucide-target",
		intentSelection: "i-lucide-target",
		projectExplorerNode: "i-lucide-folder",
		projectExplorer: "i-lucide-folder",
		folderBrowserNode: "i-lucide-folder-open",
		ideStatusNode: "i-lucide-monitor",
		// Forms & UI
		formsPanelNode: "i-lucide-form",
		eventNode: "i-lucide-zap",
		commandNode: "i-lucide-terminal",
		viewNode: "i-lucide-eye",
		webviewNode: "i-lucide-globe",
		viewportNode: "i-lucide-maximize-2",
		// Data & Storage
		databaseNode: "i-lucide-database",
		environmentNode: "i-lucide-box",
		nodeCheckNode: "i-lucide-check",
		phpCheckNode: "i-lucide-code",
		rustCheckNode: "i-lucide-code",
		dotnetCheckNode: "i-lucide-code",
		pythonCheckNode: "i-lucide-code",
		javaCheckNode: "i-lucide-code",
		// Folders & Utilities
		bFolderSetupNode: "i-lucide-folder-plus",
		projectScriptRunnerNode: "i-lucide-play",
		saveTemplateNode: "i-lucide-save",
		// CLI
		builditCli: "i-lucide-terminal",
		"buildit-cli": "i-lucide-terminal",
		// Generic
		rectangle: "i-lucide-square",
		circle: "i-lucide-circle",
		diamond: "i-lucide-gem",
		triangle: "i-lucide-triangle",
		hexagon: "i-lucide-hexagon",
		cloud: "i-lucide-cloud",
		database: "i-lucide-database",
		api: "i-lucide-api",
		server: "i-lucide-server",
		githubNode: "i-lucide-github"
	};

	const nodeTypeLabelMap: Record<string, string> = {
		projectNode: "Project",
		setupProjectNode: "Setup Project",
		projectEnvironmentNode: "Environment",
		projectInstallNode: "Install",
		projectToolsSetupNode: "Tool Setup",
		projectConfiguredNode: "Configured",
		userManagementNode: "User Management",
		userNode: "User",
		adminUserNode: "Admin User",
		taskNode: "Task",
		orbitCardNode: "Orbit",
		solutionNode: "Solution",
		builditNode: "Buildit",
		integrationNode: "Integration",
		integrationConnectionNode: "Connection",
		integrationDetailNode: "Detail",
		gitCloneRepositoryNode: "Git Clone",
		gitActionNode: "Git Action",
		templateNode: "Template",
		templateConfiguredNode: "Template Config",
		hookNode: "Hook",
		transportNode: "Transport",
		browserNode: "Browser",
		codeEditorNode: "Code Editor",
		scriptEditorNode: "Script Editor",
		fileCreatorNode: "File Creator",
		intentSelectionNode: "Intent",
		projectExplorerNode: "Explorer",
		formsPanelNode: "Forms",
		eventNode: "Event",
		commandNode: "Command",
		viewNode: "View",
		webviewNode: "Webview",
		viewportNode: "Viewport",
		bFolderSetupNode: "Folder Setup",
		projectScriptRunnerNode: "Script Runner",
		saveTemplateNode: "Save Template",
		ideStatusNode: "IDE Status"
	};

	// Category mapping
	const categoryMap: Record<string, string> = {
		// Project management
		projectNode: "Project Management",
		setupProjectNode: "Project Management",
		projectEnvironmentNode: "Project Management",
		projectInstallNode: "Project Management",
		projectToolsSetupNode: "Project Management",
		projectConfiguredNode: "Project Management",
		// User/Team
		userManagementNode: "User & Team",
		userNode: "User & Team",
		adminUserNode: "User & Team",
		// Tasks & Work
		taskNode: "Tasks & Work",
		orbitCardNode: "Tasks & Work",
		// Development & Automation
		solutionNode: "Development & Automation",
		projectBuilditNode: "Development & Automation",
		builditNode: "Development & Automation",
		integrationNode: "Development & Automation",
		integrationConnectionNode: "Development & Automation",
		integrationDetailNode: "Development & Automation",
		// Version Control
		gitCloneRepositoryNode: "Version Control",
		gitActionNode: "Version Control",
		// Code & Templates
		templateNode: "Code & Templates",
		templateConfiguredNode: "Code & Templates",
		solutionTemplateNode: "Code & Templates",
		// Development Tools
		hookNode: "Development Tools",
		transportNode: "Development Tools",
		transportTemplateNode: "Development Tools",
		browserNode: "Development Tools",
		codeEditorNode: "Development Tools",
		scriptEditorNode: "Development Tools",
		fileCreatorNode: "Development Tools",
		// System & Configuration
		intentSelectionNode: "System & Configuration",
		intentSelection: "System & Configuration",
		projectExplorerNode: "System & Configuration",
		projectExplorer: "System & Configuration",
		folderBrowserNode: "System & Configuration",
		ideStatusNode: "System & Configuration",
		// Forms & UI
		formsPanelNode: "Forms & UI",
		eventNode: "Forms & UI",
		commandNode: "Forms & UI",
		viewNode: "Forms & UI",
		webviewNode: "Forms & UI",
		viewportNode: "Forms & UI",
		// Data & Storage
		databaseNode: "Data & Storage",
		environmentNode: "Data & Storage",
		nodeCheckNode: "Data & Storage",
		phpCheckNode: "Data & Storage",
		rustCheckNode: "Data & Storage",
		dotnetCheckNode: "Data & Storage",
		pythonCheckNode: "Data & Storage",
		javaCheckNode: "Data & Storage",
		// Folders & Utilities
		bFolderSetupNode: "Folders & Utilities",
		projectScriptRunnerNode: "Folders & Utilities",
		saveTemplateNode: "Folders & Utilities",
		// CLI
		builditCli: "CLI",
		"buildit-cli": "CLI",
		// Generic
		rectangle: "Generic",
		circle: "Generic",
		diamond: "Generic",
		triangle: "Generic",
		hexagon: "Generic",
		cloud: "Generic",
		database: "Generic",
		api: "Generic",
		server: "Generic",
		githubNode: "Generic"
	};

	// Color mapping (simplified)
	const nodeColorMap: Record<string, string> = {
		projectNode: "rgba(59, 130, 246, 0.95)",
		setupProjectNode: "rgba(59, 130, 246, 0.85)",
		projectEnvironmentNode: "rgba(248, 113, 113, 0.95)",
		projectInstallNode: "rgba(16, 185, 129, 0.95)",
		projectToolsSetupNode: "rgba(56, 189, 248, 0.95)",
		projectConfiguredNode: "rgba(34, 197, 94, 0.95)",
		userManagementNode: "rgba(192, 132, 252, 0.95)",
		userNode: "rgba(168, 85, 247, 0.90)",
		adminUserNode: "rgba(139, 92, 246, 0.95)",
		taskNode: "rgba(251, 191, 36, 0.95)",
		orbitCardNode: "rgba(251, 191, 36, 0.95)",
		solutionNode: "rgba(45, 212, 191, 0.95)",
		projectBuilditNode: "rgba(34, 197, 94, 0.95)",
		builditNode: "rgba(34, 197, 94, 0.95)",
		integrationNode: "rgba(249, 115, 22, 0.95)",
		integrationConnectionNode: "rgba(249, 115, 22, 0.95)",
		integrationDetailNode: "rgba(234, 88, 12, 0.90)",
		gitCloneRepositoryNode: "rgba(249, 115, 22, 0.95)",
		gitActionNode: "rgba(249, 115, 22, 0.90)",
		templateNode: "rgba(139, 92, 246, 0.95)",
		templateConfiguredNode: "rgba(168, 85, 247, 0.90)",
		solutionTemplateNode: "rgba(124, 58, 237, 0.90)",
		hookNode: "rgba(249, 115, 22, 0.85)",
		transportNode: "rgba(14, 165, 233, 0.90)",
		transportTemplateNode: "rgba(14, 165, 233, 0.85)",
		browserNode: "rgba(14, 165, 233, 0.95)",
		codeEditorNode: "rgba(139, 92, 246, 0.90)",
		scriptEditorNode: "rgba(124, 58, 237, 0.90)",
		fileCreatorNode: "rgba(34, 197, 94, 0.85)",
		intentSelectionNode: "rgba(249, 115, 22, 0.90)",
		intentSelection: "rgba(249, 115, 22, 0.90)",
		projectExplorerNode: "rgba(14, 165, 233, 0.85)",
		projectExplorer: "rgba(14, 165, 233, 0.85)",
		folderBrowserNode: "rgba(56, 189, 248, 0.90)",
		ideStatusNode: "rgba(45, 212, 191, 0.85)",
		formsPanelNode: "rgba(168, 85, 247, 0.90)",
		eventNode: "rgba(249, 115, 22, 0.85)",
		commandNode: "rgba(59, 130, 246, 0.85)",
		viewNode: "rgba(14, 165, 233, 0.85)",
		webviewNode: "rgba(14, 165, 233, 0.90)",
		viewportNode: "rgba(139, 92, 246, 0.85)",
		databaseNode: "rgba(59, 130, 246, 0.90)",
		environmentNode: "rgba(248, 113, 113, 0.85)",
		nodeCheckNode: "rgba(34, 197, 94, 0.85)",
		phpCheckNode: "rgba(249, 115, 22, 0.85)",
		rustCheckNode: "rgba(249, 115, 22, 0.90)",
		dotnetCheckNode: "rgba(59, 130, 246, 0.90)",
		pythonCheckNode: "rgba(249, 115, 22, 0.95)",
		javaCheckNode: "rgba(249, 115, 22, 0.85)",
		bFolderSetupNode: "rgba(56, 189, 248, 0.90)",
		projectScriptRunnerNode: "rgba(124, 58, 237, 0.90)",
		saveTemplateNode: "rgba(34, 197, 94, 0.90)",
		builditCli: "rgba(34, 197, 94, 0.85)",
		"buildit-cli": "rgba(34, 197, 94, 0.85)"
	};

	// Process icons data
	const iconsData = computed(() => {
		const iconMap = new Map<string, {
			icon: string
			category: string
			nodes: string[]
			usageCount: number
			nodeType: string
			color: string
		}>();

		Object.entries(nodeIconMap).forEach(([nodeType, icon]) => {
			const category = categoryMap[nodeType] || "Other";
			const label = nodeTypeLabelMap[nodeType] || nodeType;
			const color = nodeColorMap[nodeType] || "rgba(59, 130, 246, 0.7)";

			if (!iconMap.has(icon)) {
				iconMap.set(icon, {
					icon,
					category,
					nodes: [label],
					usageCount: 1,
					nodeType: label,
					color
				});
			} else {
				const existing = iconMap.get(icon)!;
				existing.nodes.push(label);
				existing.usageCount++;
			}
		});

		return Array.from(iconMap.values());
	});

	const categories = computed(() => {
		return Array.from(new Set(iconsData.value.map(i => i.category))).sort();
	});

	const searchQuery = ref("");
	const selectedCategory = ref<string | null>(null);
	const showDetailModal = ref(false);
	const selectedIcon = ref<typeof iconsData.value[0] | null>(null);

	const filteredIcons = computed(() => {
		let filtered = iconsData.value;

		if (searchQuery.value) {
			const query = searchQuery.value.toLowerCase();
			filtered = filtered.filter(iconData =>
				iconData.icon.toLowerCase().includes(query) ||
				iconData.nodeType.toLowerCase().includes(query) ||
				iconData.category.toLowerCase().includes(query) ||
				iconData.nodes.some(n => n.toLowerCase().includes(query))
			);
		}

		if (selectedCategory.value) {
			filtered = filtered.filter(iconData => iconData.category === selectedCategory.value);
		}

		return filtered;
	});

	const filteredCategories = computed(() => {
		const cats = new Set(filteredIcons.value.map(i => i.category));
		return Array.from(cats).sort();
	});

	const getIconsByCategory = (category: string) => {
		return filteredIcons.value.filter(i => i.category === category);
	};

	const selectIcon = (iconData: typeof iconsData.value[0]) => {
		selectedIcon.value = iconData;
		showDetailModal.value = true;
	};

	const copyIconCode = async (iconData: typeof iconsData.value[0]) => {
		const code = `<Icon name="${iconData.icon}" class="w-6 h-6" />`;
		await navigator.clipboard.writeText(code);
		// You could add a toast notification here
	};

	const copyAllIcons = async () => {
		const allIcons = iconsData.value.map(i => i.icon).join("\n");
		await navigator.clipboard.writeText(allIcons);
		// You could add a toast notification here
	};
</script>

