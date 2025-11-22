<template>
	<Teleport to="body">
		<div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4" @click.stop>
			<!-- Backdrop -->
			<div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="handleClose" />
			
			<!-- Modal Content -->
			<div class="relative w-full max-w-3xl max-h-[80vh] overflow-hidden" @click.stop>
				<div class="ide-template-modal">
				<!-- Header -->
				<div class="modal-header">
					<div class="header-content">
						<UIcon name="i-lucide-code-2" class="size-6 text-purple-400" />
						<div class="header-text">
							<h2 class="modal-title">{{ ideName }} Templates</h2>
							<p v-if="existingTemplates.length > 0" class="header-subtitle">
								{{ existingTemplates.length }} template{{ existingTemplates.length > 1 ? 's' : '' }} already linked
							</p>
						</div>
					</div>
					<button
						class="close-button"
						@click="handleClose"
					>
						<UIcon name="i-lucide-x" class="size-5" />
					</button>
				</div>

				<!-- Loading State -->
				<div v-if="isLoading" class="loading-state">
					<UIcon name="i-lucide-loader-2" class="size-8 text-purple-400 animate-spin" />
					<p class="loading-text">Searching for {{ ideName }} templates...</p>
				</div>

				<!-- Template Configuration Form -->
				<div v-else-if="showForm && selectedTemplate" class="form-container">
					<div class="form-header">
						<button class="back-button" @click="handleBackToList">
							<UIcon name="i-lucide-arrow-left" class="size-4" />
							<span>Back to Templates</span>
						</button>
						<p class="form-subtitle">Configure your copy of <strong>{{ selectedTemplate.name }}</strong></p>
					</div>

					<div class="form-content">
						<!-- Name Field -->
						<div class="form-group">
							<label class="form-label">
								<UIcon name="i-lucide-tag" class="size-4" />
								Template Name *
							</label>
							<input
								v-model="formData.name"
								type="text"
								class="form-input"
								placeholder="Enter template name"
								required
							/>
						</div>

						<!-- Description Field -->
						<div class="form-group">
							<label class="form-label">
								<UIcon name="i-lucide-file-text" class="size-4" />
								Description
							</label>
							<textarea
								v-model="formData.description"
								class="form-textarea"
								placeholder="Enter template description (optional)"
								rows="3"
							/>
						</div>

						<!-- Author Field (Dropdown) -->
						<div class="form-group">
							<label class="form-label">
								<UIcon name="i-lucide-user" class="size-4" />
								Author *
							</label>
							<select
								v-model="formData.author"
								class="form-select"
								required
							>
								<option value="" disabled>Select author</option>
								<option
									v-for="user in availableUsers"
									:key="user.id || user.email"
									:value="user.email"
								>
									{{ getUserDisplayName(user) }}
								</option>
							</select>
						</div>

						<!-- Submit Button -->
						<div class="form-actions">
							<button
								class="submit-button"
								:disabled="!isFormValid || isSubmitting"
								@click="handleSubmitForm"
							>
								<UIcon
									:name="isSubmitting ? 'i-lucide-loader-2' : 'i-lucide-check'"
									class="size-4"
									:class="{ 'animate-spin': isSubmitting }"
								/>
								<span>{{ isSubmitting ? 'Creating...' : 'Create & Link Template' }}</span>
							</button>
						</div>
					</div>
				</div>

				<!-- Templates List -->
				<div v-else-if="templates.length > 0" class="templates-list">
					<section class="oscar-guidance">
						<div class="oscar-guidance__avatar">
							<img :src="oscarMini" alt="Oscar advisor" />
						</div>
						<div class="oscar-guidance__content">
							<h3>Oscar's Advice</h3>
							<p>
								Please select a BuildIt template that best matches your application.
								Templates contain predefined automations and configurations to enhance your workflows. Selected templates will
								be copied from a BuildIt default template and linked to your project. This copy can then be customised by
								your team after the setup.
							</p>
						</div>
					</section>
						<div
							v-for="template in availableTemplates"
							:key="template.id"
							class="template-card"
							:class="{ 'template-linked': template.isLinked }"
						>
							<!-- Template Info -->
							<div class="template-info">
								<div class="template-header">
									<h3 class="template-name">{{ template.name }}</h3>
									<span v-if="template.version" class="template-version-badge">
										v{{ template.version }}
									</span>
									<span v-if="template.isLinked" class="linked-badge">
										<UIcon name="i-lucide-check-circle" class="size-3" />
										Linked
									</span>
								</div>
								
								<p v-if="template.description" class="template-description">
									{{ template.description }}
								</p>

								<!-- Version Range -->
								<div v-if="template.minimumVersion || template.maximumVersion" class="version-range">
									<UIcon name="i-lucide-git-branch" class="size-3 text-gray-400" />
									<span class="version-range-text">
										{{ template.minimumVersion || '0.0.0' }} - {{ template.maximumVersion || 'latest' }}
									</span>
								</div>
							</div>

							<!-- Add Button or Linked Status -->
							<button
								v-if="!template.isLinked"
								class="add-button"
								type="button"
								aria-label="Select template"
								@click="handleAddTemplate(template)"
							>
								<UIcon name="i-lucide-plus" class="size-5" />
							</button>
							<div v-else class="linked-indicator">
								<UIcon name="i-lucide-link" class="size-5 text-green-400" />
							</div>
						</div>
					</div>

					<!-- Empty State -->
					<div v-else class="empty-state">
						<UIcon name="i-lucide-package-search" class="size-12 text-white/20" />
						<p class="empty-title">No templates found</p>
						<p class="empty-description">
							No templates available for {{ ideName }}
						</p>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
	import { ref, watch, computed } from "vue";
	import oscarMini from "@/assets/oscarMini.png";
	import { buttClient } from "@utils/buttClient";
	import { useTemplateCopy } from "@canvas/composables/useTemplateCopy";

	interface Props {
		open: boolean
		ideName: string
		projectId?: string
		organizationUsers?: any[]
		existingTemplates?: any[]
	}

	const props = withDefaults(defineProps<Props>(), {
		organizationUsers: () => [],
		existingTemplates: () => []
	});

	const emit = defineEmits<{
		"update:open": [value: boolean]
		templateSelected: [template: any]
	}>();

	const isOpen = ref(props.open);
	const templates = ref<any[]>([]);
	const isLoading = ref(false);
	const selectedTemplate = ref<any>(null);
	const showForm = ref(false);

	// Form state
	const formData = ref({
		name: "",
		description: "",
		author: ""
	});

	const isSubmitting = ref(false);

	// Use the template copy composable
	const { copyTemplate } = useTemplateCopy();

	// Get current user from localStorage
	const getCurrentUser = () => {
		try {
			const userStr = localStorage.getItem("USER_PROFILE") || localStorage.getItem("user");
			if (userStr) {
				const user = JSON.parse(userStr);
				return user.email || user.name || user.username || "";
			}
		} catch (error) {
			console.warn("Failed to get user from localStorage:", error);
		}
		return "";
	};

	// Compute available users with current user first
	const availableUsers = computed(() => {
		const users = props.organizationUsers || [];
		const currentUserEmail = getCurrentUser();
		
		console.log("📋 Available users for author selection:", users.length);
		console.log("👤 Current user email:", currentUserEmail);
		
		// Sort users with current user first
		const sortedUsers = [...users].sort((a, b) => {
			if (a.email === currentUserEmail) return -1;
			if (b.email === currentUserEmail) return 1;
			return 0;
		});
		
		return sortedUsers;
	});

	// Get display name for user
	function getUserDisplayName(user: any): string {
		if (user.name && user.email) {
			return `${user.name} (${user.email})`;
		}
		return user.email || user.name || "Unknown User";
	}

	// Computed existing templates reference
	const existingTemplates = computed(() => props.existingTemplates || []);

	// Check if a template type is already linked
	function isTemplateAlreadyLinked(template: any): boolean {
		// Check if this base template (by templateId) is already linked
		const baseTemplateId = template.id;
		const isLinked = existingTemplates.value.some((existing: any) => {
			const existingTemplateId = existing.templateId || existing.template?.templateId || existing.id;
			return existingTemplateId === baseTemplateId;
		});
		
		if (isLinked) {
			console.log("⚠️ Template already linked:", template.name);
		}
		
		return isLinked;
	}

	// Filter templates to show availability
	const availableTemplates = computed(() => {
		return templates.value.map(template => ({
			...template,
			isLinked: isTemplateAlreadyLinked(template)
		}));
	});

	// Watch for open prop changes
	watch(() => props.open, (newValue) => {
		isOpen.value = newValue;
		if (newValue) {
			searchTemplates();
			showForm.value = false;
			selectedTemplate.value = null;
		}
	});

	// Watch for isOpen changes (to emit back to parent)
	watch(isOpen, (newValue) => {
		emit("update:open", newValue);
	});

	// Search for templates
	const searchTemplates = async () => {
		console.log("🔍 Searching for templates with tag:", props.ideName);
		isLoading.value = true;
		templates.value = [];

		try {
			// Use buttClient.search - pass IDE name as search term
			const results: any = await buttClient.searchPublic(props.ideName);

			console.log("✅ Template search results:", results);
			
			// Handle different response formats
			if (Array.isArray(results)) {
				templates.value = results;
			} else if (results.templates && Array.isArray(results.templates)) {
				templates.value = results.templates;
			} else if (results.results && Array.isArray(results.results)) {
				templates.value = results.results;
			} else if (results.data && Array.isArray(results.data)) {
				templates.value = results.data;
			}

			console.log(`✅ Found ${templates.value.length} templates for ${props.ideName}`);
		} catch (error) {
			console.error("❌ Failed to search templates:", error);
			templates.value = [];
		} finally {
			isLoading.value = false;
		}
	};

	const handleAddTemplate = (template: any) => {
		// Prevent adding if already linked
		if (template.isLinked) {
			console.warn("⚠️ Template is already linked, cannot add again");
			return;
		}
		
		console.log("➕ Template selected:", template.name);
		console.log("📋 Organization users available:", props.organizationUsers?.length || 0);
		selectedTemplate.value = template;
		
		// Pre-fill form with template data
		const currentUser = getCurrentUser();
		formData.value = {
			name: `${template.name} (Copy)`,
			description: template.description || "",
			author: currentUser || (availableUsers.value[0]?.email) || ""
		};

		console.log("✅ Form pre-filled with author:", formData.value.author);
		showForm.value = true;
	};

	const handleBackToList = () => {
		showForm.value = false;
		selectedTemplate.value = null;
		formData.value = {
			name: "",
			description: "",
			author: ""
		};
	};

	const handleSubmitForm = async () => {
		if (!selectedTemplate.value || !formData.value.name.trim()) {
			console.warn("Missing required fields");
			return;
		}

		isSubmitting.value = true;

		try {
			console.log("🔄 Copying and linking template...");

			// Step 1: Copy the template
			const copyResult = await copyTemplate({
				templateId: selectedTemplate.value.id,
				name: formData.value.name,
				description: formData.value.description,
				author: formData.value.author,
				projectId: props.projectId
			});

			if (!copyResult.success || !copyResult.copiedTemplate) {
				throw new Error("Failed to copy template");
			}

			console.log("✅ Template copied successfully");

			// Emit the copied template
			emit("templateSelected", copyResult.copiedTemplate);

			// Close modal
			handleClose();
		} catch (error) {
			console.error("❌ Failed to copy and link template:", error);
		} finally {
			isSubmitting.value = false;
		}
	};

	const handleClose = () => {
		console.log("🚪 Closing IDE Template Modal");
		isOpen.value = false;
		showForm.value = false;
		selectedTemplate.value = null;
		
		// Reset form data
		formData.value = {
			name: "",
			description: "",
			author: ""
		};
	};

	// Form validation
	const isFormValid = computed(() => {
		return formData.value.name.trim().length > 0 && formData.value.author.trim().length > 0;
	});
</script>

<style scoped>
.ide-template-modal {
	display: flex;
	flex-direction: column;
	max-height: 80vh;
	background: linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98));
	border: 1px solid rgba(139, 92, 246, 0.3);
	border-radius: 0.75rem;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	overflow: hidden;
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1.5rem;
	border-bottom: 1px solid rgba(139, 92, 246, 0.3);
	background: rgba(139, 92, 246, 0.1);
}

.header-content {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	flex: 1;
}

.header-text {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.modal-title {
	font-size: 1.25rem;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.95);
	margin: 0;
}

.header-subtitle {
	font-size: 0.8125rem;
	color: rgba(134, 239, 172, 1);
	margin: 0;
	font-weight: 500;
}

.close-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 0.5rem;
	color: rgba(255, 255, 255, 0.7);
	cursor: pointer;
	transition: all 0.2s ease;
}

.close-button:hover {
	background: rgba(255, 255, 255, 0.15);
	color: rgba(255, 255, 255, 0.9);
	transform: scale(1.05);
}

/* Loading State */
.loading-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 4rem 2rem;
	gap: 1rem;
}

.loading-text {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.6);
	margin: 0;
}

/* Templates List */
.templates-list {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 1.5rem;
	max-height: calc(80vh - 120px);
	overflow-y: auto;
}

.oscar-guidance {
	display: flex;
	gap: 0.85rem;
	align-items: center;
	padding: 1.25rem;
	background: rgba(139, 92, 246, 0.12);
	border: 1px solid rgba(139, 92, 246, 0.25);
	border-radius: 0.75rem;
}

.oscar-guidance__avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 3rem;
	height: 3rem;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.12);
	padding: 0.35rem;
	flex-shrink: 0;
}

.oscar-guidance__avatar img {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.oscar-guidance__content {
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
}

.oscar-guidance__content h3 {
	font-size: 0.95rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.95);
	margin: 0;
}

.oscar-guidance__content p {
	font-size: 0.8125rem;
	color: rgba(255, 255, 255, 0.7);
	margin: 0;
	line-height: 1.5;
}

/* Custom Scrollbar */
.templates-list::-webkit-scrollbar {
	width: 8px;
}

.templates-list::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 4px;
}

.templates-list::-webkit-scrollbar-thumb {
	background: rgba(139, 92, 246, 0.4);
	border-radius: 4px;
}

.templates-list::-webkit-scrollbar-thumb:hover {
	background: rgba(139, 92, 246, 0.6);
}

/* Template Card */
.template-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	padding: 1.25rem;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(139, 92, 246, 0.3);
	border-radius: 0.75rem;
	transition: all 0.2s ease;
}

.template-card:hover {
	background: rgba(139, 92, 246, 0.05);
	border-color: rgba(139, 92, 246, 0.5);
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.template-card.template-linked {
	background: rgba(16, 185, 129, 0.05);
	border-color: rgba(16, 185, 129, 0.3);
	opacity: 0.7;
}

.template-card.template-linked:hover {
	background: rgba(16, 185, 129, 0.08);
	border-color: rgba(16, 185, 129, 0.4);
	transform: translateY(-1px);
}

.template-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	min-width: 0;
}

.template-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	flex-wrap: wrap;
}

.template-name {
	font-size: 1rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.95);
	margin: 0;
}

.template-version-badge {
	padding: 0.25rem 0.625rem;
	background: rgba(139, 92, 246, 0.2);
	border: 1px solid rgba(139, 92, 246, 0.4);
	border-radius: 0.375rem;
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(196, 181, 253, 1);
}

.linked-badge {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	padding: 0.25rem 0.625rem;
	background: rgba(16, 185, 129, 0.2);
	border: 1px solid rgba(16, 185, 129, 0.4);
	border-radius: 0.375rem;
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(134, 239, 172, 1);
}

.linked-indicator {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
	height: 2.5rem;
	background: rgba(16, 185, 129, 0.1);
	border: 1px solid rgba(16, 185, 129, 0.3);
	border-radius: 0.5rem;
}

.template-description {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.7);
	line-height: 1.5;
	margin: 0;
}

.version-range {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0.75rem;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.5rem;
	width: fit-content;
}

.version-range-text {
	font-size: 0.75rem;
	color: rgba(156, 163, 175, 1);
	font-weight: 500;
	font-family: monospace;
}

/* Add Button */
.add-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 3.25rem;
	height: 3.25rem;
	padding: 0;
	background: rgba(139, 92, 246, 0.25);
	border: 2px solid rgba(139, 92, 246, 0.6);
	border-radius: 9999px;
	font-size: 1rem;
	font-weight: 700;
	color: rgba(224, 216, 255, 1);
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.add-button:hover {
	background: rgba(139, 92, 246, 0.35);
	border-color: rgba(139, 92, 246, 0.75);
	transform: translateY(-1px) scale(1.02);
	box-shadow: 0 6px 14px rgba(139, 92, 246, 0.35);
}

.add-button:active {
	transform: translateY(0) scale(0.99);
}

/* Empty State */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 4rem 2rem;
	gap: 0.75rem;
}

.empty-title {
	font-size: 1rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.8);
	margin: 0;
}

.empty-description {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.5);
	margin: 0;
}

/* Form Container */
.form-container {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	padding: 1.5rem;
	max-height: calc(80vh - 120px);
	overflow-y: auto;
}

.form-header {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.back-button {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.5rem;
	color: rgba(255, 255, 255, 0.8);
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	width: fit-content;
}

.back-button:hover {
	background: rgba(255, 255, 255, 0.1);
	border-color: rgba(139, 92, 246, 0.4);
	color: rgba(196, 181, 253, 1);
}

.form-subtitle {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.7);
	margin: 0;
}

.form-content {
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
}

.form-group {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.form-label {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
}

.form-input,
.form-textarea {
	padding: 0.75rem 1rem;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(139, 92, 246, 0.3);
	border-radius: 0.5rem;
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.9);
	font-family: inherit;
	transition: all 0.2s ease;
	width: 100%;
}

.form-input:focus,
.form-textarea:focus {
	outline: none;
	border-color: rgba(139, 92, 246, 0.6);
	background: rgba(0, 0, 0, 0.4);
	box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-input:disabled {
	opacity: 0.6;
	cursor: not-allowed;
	background: rgba(0, 0, 0, 0.2);
}

.form-select {
	padding: 0.75rem 1rem;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(139, 92, 246, 0.3);
	border-radius: 0.5rem;
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.9);
	font-family: inherit;
	transition: all 0.2s ease;
	width: 100%;
	cursor: pointer;
	appearance: none;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgba(139, 92, 246, 0.8)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-position: right 0.75rem center;
	background-size: 1rem;
	padding-right: 2.5rem;
}

.form-select:focus {
	outline: none;
	border-color: rgba(139, 92, 246, 0.6);
	background-color: rgba(0, 0, 0, 0.4);
	box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-select option {
	background: rgba(17, 24, 39, 0.98);
	color: rgba(255, 255, 255, 0.9);
	padding: 0.75rem;
}

.form-textarea {
	resize: vertical;
	min-height: 80px;
}

.form-actions {
	display: flex;
	gap: 0.75rem;
	padding-top: 0.5rem;
}

.submit-button {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.875rem 1.5rem;
	background: rgba(139, 92, 246, 0.3);
	border: 1px solid rgba(139, 92, 246, 0.5);
	border-radius: 0.5rem;
	font-size: 0.9375rem;
	font-weight: 600;
	color: rgba(196, 181, 253, 1);
	cursor: pointer;
	transition: all 0.2s ease;
}

.submit-button:hover:not(:disabled) {
	background: rgba(139, 92, 246, 0.4);
	border-color: rgba(139, 92, 246, 0.7);
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.submit-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	transform: none;
}

.animate-spin {
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>

