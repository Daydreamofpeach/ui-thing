<template>
	<Teleport to="body">
		<div v-if="props.showModal" class="fixed inset-0 z-50 flex items-center justify-center">
			<!-- Backdrop -->
			<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal" />

			<!-- Modal Content -->
			<div class="relative w-full max-w-4xl mx-4">
				<div class="github-link-modal glassmorphic-panel p-6 border border-primary/20 border-bottom-3-outset">
					<!-- Modal Header -->
					<div class="flex items-center justify-between mb-6">
						<div class="flex items-center gap-3">
							<div class="github-icon-container w-12 h-12 flex items-center justify-center bg-primary/20 border border-primary/30 overflow-hidden">
								<Icon name="i-logos-github" class="size-6 text-primary" />
							</div>
							<div>
								<h3 class="text-xl font-semibold text-white/90">
									Link GitHub Repository to Project
								</h3>
								<p class="text-sm text-white/60">
									Select a GitHub repository to link to {{ project?.name }}
								</p>
							</div>
						</div>
						<button
							class="modal-close-button glassmorphic-button p-2 transition-all duration-300 hover:scale-110 text-white/60 hover:text-white border border-primary/20"
							@click="closeModal"
						>
							<Icon name="lucide:x" class="size-4" />
						</button>
					</div>

					<!-- Loading State -->
					<div v-if="isLoading" class="text-center py-8">
						<Icon name="lucide:loader-2" class="size-8 text-white/40 mb-3 mx-auto animate-spin" />
						<p class="text-sm text-white/60">
							Loading GitHub repositories...
						</p>
					</div>

					<!-- Error State -->
					<div v-else-if="error" class="text-center py-8">
						<Icon name="lucide:alert-circle" class="size-8 text-red-400 mb-3 mx-auto" />
						<h4 class="text-base font-medium text-red-400 mb-2">
							Error Loading GitHub Repositories
						</h4>
						<p class="text-sm text-red-400/60 mb-4">
							{{ error }}
						</p>
						<button
							class="modal-retry-button glassmorphic-button bg-primary/20 hover:bg-primary/30 text-white px-4 py-2 transition-all duration-300 border border-primary/30"
							@click="loadGitHubRepositories"
						>
							<Icon name="lucide:refresh-cw" class="size-4 mr-2" />
							Retry
						</button>
					</div>

					<!-- GitHub Repositories Selection -->
					<div v-else-if="gitHubRepositories.length > 0" class="space-y-6">
						<!-- Search and Filters -->
						<div class="flex flex-col md:flex-row gap-4">
							<!-- Search Input -->
							<div class="relative flex-1">
								<input
									v-model="searchQuery"
									type="text"
									placeholder="Search repositories..."
									class="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 pl-10 text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
								>
								<div class="absolute inset-y-0 left-0 flex items-center pl-3">
									<Icon name="lucide:search" class="size-4 text-neutral-400" />
								</div>
							</div>

							<!-- Language Filter -->
							<select
								v-model="selectedLanguage"
								class="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
							>
								<option value="">
									All Languages
								</option>
								<option v-for="language in availableLanguages" :key="language" :value="language">
									{{ language }}
								</option>
							</select>

							<!-- Repository Type Filter -->
							<select
								v-model="selectedType"
								class="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
							>
								<option value="">
									All Types
								</option>
								<option value="source">
									Source
								</option>
								<option value="fork">
									Forks
								</option>
								<option value="private">
									Private
								</option>
								<option value="public">
									Public
								</option>
							</select>
						</div>

						<!-- Repositories List -->
						<div class="space-y-4">
							<h4 class="text-lg font-medium text-white/80 mb-4 flex items-center gap-2">
								<Icon name="lucide:git-branch" class="size-5 text-primary" />
								Available GitHub Repositories
								<span class="text-sm text-white/60">({{ filteredRepositories.length }} found)</span>
							</h4>
							<div class="grid gap-3 max-h-96 overflow-y-auto">
								<div
									v-for="repo in filteredRepositories"
									:key="repo.id"
									class="github-repo-card glassmorphic-panel p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 border-2 border-gray-600 hover:border-primary"
									:class="selectedRepository?.id === repo.id ? 'border-primary bg-primary/10' : ''"
									@click="selectedRepository = repo"
								>
									<div class="flex items-start justify-between">
										<div class="flex items-start gap-3 flex-1 min-w-0">
											<div class="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
												<Icon name="i-logos-github" class="size-5 text-white" />
											</div>
											<div class="flex-1 min-w-0">
												<div class="flex items-center space-x-2 mb-1">
													<h5 class="font-bold text-white truncate">
														{{ repo.name }}
													</h5>
													<span v-if="repo.private" class="px-2 py-1 bg-orange-600 text-white text-xs rounded-full flex-shrink-0">
														Private
													</span>
													<span v-if="repo.fork" class="px-2 py-1 bg-blue-600 text-white text-xs rounded-full flex-shrink-0">
														Fork
													</span>
												</div>
												<p v-if="repo.description" class="text-sm text-gray-400 mb-2 line-clamp-2">
													{{ repo.description }}
												</p>
												<div class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
													<span v-if="repo.language" class="flex items-center space-x-1">
														<div
															class="w-3 h-3 rounded-full"
															:style="{ backgroundColor: getLanguageColor(repo.language) }"
														/>
														<span>{{ repo.language }}</span>
													</span>
													<span class="flex items-center space-x-1">
														<Icon name="lucide:star" class="size-3" />
														<span>{{ repo.stargazers_count }}</span>
													</span>
													<span class="flex items-center space-x-1">
														<Icon name="lucide:git-fork" class="size-3" />
														<span>{{ repo.forks_count }}</span>
													</span>
													<span>Updated {{ formatDate(repo.updated_at) }}</span>
												</div>
											</div>
										</div>
										<Icon
											v-if="selectedRepository?.id === repo.id"
											name="lucide:check-circle"
											class="text-primary size-5 flex-shrink-0"
										/>
									</div>
								</div>
							</div>
						</div>

						<!-- Action Buttons -->
						<div class="flex justify-end gap-3 pt-4 border-t border-white/10">
							<UiButton
								variant="ghost"
								@click="closeModal"
							>
								Cancel
							</UiButton>
							<UiButton
								variant="default"
								:disabled="!selectedRepository || isLinking"
								@click="linkGitHubToProject"
							>
								<Icon name="lucide:link" class="size-4 mr-2" />
								Link Repository to Project
							</UiButton>
						</div>
					</div>

					<!-- No Repositories State -->
					<div v-else class="text-center py-8">
						<Icon name="i-logos-github" class="size-8 text-white/40 mb-3 mx-auto" />
						<h4 class="text-lg font-medium text-white/60 mb-2">
							No GitHub Repositories Found
						</h4>
						<p class="text-sm text-white/40 mb-4">
							No GitHub repositories were found for this integration.
						</p>
						<button
							class="modal-retry-button glassmorphic-button bg-primary/20 hover:bg-primary/30 text-white px-4 py-2 transition-all duration-300 border border-primary/30"
							@click="loadGitHubRepositories"
						>
							<Icon name="lucide:refresh-cw" class="size-4 mr-2" />
							Refresh
						</button>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import { buttClient } from "~/utils/buttClient";
	import UiButton from "~/components/Ui/Button.vue";

	// Props
	const props = defineProps<{
		showModal: boolean
		project: any
		integration: any
	}>();

	// Emits
	const emit = defineEmits([
		"close",
		"linked"
	]);

	const { useToast } = await import("#ui/composables/useToast");
	const toast = useToast();

	// Reactive state
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const gitHubRepositories = ref<any[]>([]);
	const selectedRepository = ref<any | null>(null);
	const isLinking = ref(false);
	const searchQuery = ref("");
	const selectedLanguage = ref("");
	const selectedType = ref("");

	// Language colors mapping
	const languageColors: Record<string, string> = {
		JavaScript: "#f1e05a",
		TypeScript: "#2b7489",
		Python: "#3572A5",
		Java: "#b07219",
		C: "#555555",
		"C++": "#f34b7d",
		CSharp: "#239120",
		PHP: "#4F5D95",
		Ruby: "#701516",
		Go: "#00ADD8",
		Rust: "#dea584",
		Swift: "#ffac45",
		Kotlin: "#F18E33",
		Dart: "#00B4AB",
		HTML: "#e34c26",
		CSS: "#1572B6",
		Vue: "#4FC08D",
		React: "#61DAFB",
		Shell: "#89e051",
		Dockerfile: "#384d54",
		default: "#586069"
	};

	// Computed
	const availableLanguages = computed(() => {
		const languages = [...new Set(gitHubRepositories.value.map((repo) => repo.language).filter(Boolean))];
		return languages.sort();
	});

	const filteredRepositories = computed(() => {
		let filtered = gitHubRepositories.value;

		// Apply search filter
		if (searchQuery.value) {
			const query = searchQuery.value.toLowerCase();
			filtered = filtered.filter((repo) =>
				repo.name.toLowerCase().includes(query)
				|| (repo.description && repo.description.toLowerCase().includes(query))
				|| (repo.language && repo.language.toLowerCase().includes(query))
			);
		}

		// Apply language filter
		if (selectedLanguage.value) {
			filtered = filtered.filter((repo) => repo.language === selectedLanguage.value);
		}

		// Apply type filter
		if (selectedType.value) {
			switch (selectedType.value) {
			case "source":
				filtered = filtered.filter((repo) => !repo.fork);
				break;
			case "fork":
				filtered = filtered.filter((repo) => repo.fork);
				break;
			case "private":
				filtered = filtered.filter((repo) => repo.private);
				break;
			case "public":
				filtered = filtered.filter((repo) => !repo.private);
				break;
			}
		}

		return filtered;
	});

	// Methods
	const loadGitHubRepositories = async () => {
		if (!props.integration?.id) return;

		isLoading.value = true;
		error.value = null;

		try {
			// Fetch GitHub repositories using the existing API client
			const repositories = await buttClient.repositoriesGithub();

			if (repositories && repositories.length > 0) {
				gitHubRepositories.value = repositories;
			} else {
				gitHubRepositories.value = [];
			}
		} catch (err: any) {
			console.error("Error loading GitHub repositories:", err);
			error.value = err?.message || "Failed to load GitHub repositories.";
			gitHubRepositories.value = [];
		} finally {
			isLoading.value = false;
		}
	};

	const linkGitHubToProject = async () => {
		if (!selectedRepository.value || !props.project?.id || !props.integration?.id) return;

		isLinking.value = true;
		try {
			// Get connections for this integration
			const connections = await buttClient.getConnectionsByIntegrationId(props.integration.id);
			const connection = connections[0];

			if (!connection) {
				throw new Error("No connection found for this integration");
			}

			// Link the connection to the project with repository metadata
			const linkResult = await buttClient.linkService(props.project.id, connection.id, {
				meta: {
					repository: selectedRepository.value,
					repositoryName: selectedRepository.value.name,
					repositoryUrl: selectedRepository.value.html_url,
					repositoryId: selectedRepository.value.id,
					repositoryFullName: selectedRepository.value.full_name,
					linkedAt: new Date().toISOString()
				}
			});

			console.log("GitHub repository linked successfully:", linkResult);

			// Emit success event
			emit("linked", {
				project: props.project,
				integration: props.integration,
				selectedRepository: selectedRepository.value,
				linkData: {
					repository: selectedRepository.value,
					repositoryName: selectedRepository.value.name,
					repositoryUrl: selectedRepository.value.html_url,
					repositoryId: selectedRepository.value.id,
					repositoryFullName: selectedRepository.value.full_name,
					repositoryDescription: selectedRepository.value.description,
					repositoryLanguage: selectedRepository.value.language,
					repositoryPrivate: selectedRepository.value.private,
					repositoryFork: selectedRepository.value.fork
				},
				linkResult
			});

			// Close modal
			closeModal();
		} catch (err: any) {
			console.error("Error linking GitHub repository to project:", err);
			error.value = err?.message || "Failed to link GitHub repository to project.";
			toast.add({
				title: "Link Failed",
				description: err?.message || "Failed to link GitHub repository to project.",
				color: "error"
			});
		} finally {
			isLinking.value = false;
		}
	};

	const closeModal = () => {
		emit("close");
	};

	const getLanguageColor = (language: string) => {
		return languageColors[language] || languageColors.default;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric"
		});
	};

	// Watch for modal open/close
	watch(() => props.showModal, (isOpen) => {
		if (isOpen && props.integration) {
			loadGitHubRepositories();
		} else {
			// Reset state when modal closes
			gitHubRepositories.value = [];
			selectedRepository.value = null;
			error.value = null;
			searchQuery.value = "";
			selectedLanguage.value = "";
			selectedType.value = "";
		}
	});
</script>

<style scoped>
/* Modal Styles */
.github-link-modal {
	background: rgba(var(--color-neutral-rgb), 0.15);
	backdrop-filter: blur(20px) saturate(1.5);
	border: 1px solid rgba(var(--color-primary-rgb), 0.2);
	border-bottom: 3px outset var(--color-primary);
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	animation: modalSlideIn 0.3s ease-out;
	max-height: 90vh;
	overflow-y: auto;
}

@keyframes modalSlideIn {
	from {
		opacity: 0;
		transform: scale(0.9) translateY(-20px);
	}
	to {
		opacity: 1;
		transform: scale(1) translateY(0);
	}
}

/* Glassmorphic Button */
.glassmorphic-button {
	background: rgba(var(--color-neutral-rgb), 0.10);
	backdrop-filter: blur(18px) saturate(1.3);
	border: 1.5px solid rgba(var(--color-neutral-rgb), 0.13);
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
}

.glassmorphic-button:hover:not(:disabled) {
	background: rgba(var(--color-primary-rgb), 0.15);
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.4);
	background: rgba(0, 0, 0, 0.486);
	border-left: 2px outset var(--color-primary);
}

/* Glassmorphic Panel */
.glassmorphic-panel {
	background: rgba(var(--color-neutral-rgb), 0.05);
	backdrop-filter: blur(15px) saturate(1.2);
	border: 1px solid rgba(var(--color-neutral-rgb), 0.08);
	transition: all 0.3s ease;
}

/* Icon Containers */
.github-icon-container {
	background: rgba(var(--color-primary-rgb), 0.2);
	border: 1px solid rgba(var(--color-primary-rgb), 0.3);
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
}

/* GitHub Repository Cards */
.github-repo-card {
	transition: all 0.3s ease;
	cursor: pointer;
}

.github-repo-card:hover {
	background: rgba(var(--color-primary-rgb), 0.1);
	border-color: var(--color-primary);
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.2);
}

/* Modal Close Button */
.modal-close-button:hover {
	background: rgba(var(--color-primary-rgb), 0.3);
	border-color: var(--color-primary);
}

/* Retry Button */
.modal-retry-button:hover {
	background: rgba(var(--color-primary-rgb), 0.4);
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.4);
}

/* Line clamp utilities */
.line-clamp-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 768px) {
	.github-link-modal {
		margin: 1rem;
		max-height: 95vh;
	}
}
</style>

