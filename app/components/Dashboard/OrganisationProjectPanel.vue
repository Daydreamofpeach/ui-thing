<template>
	<div class="relative rounded-lg bg-muted">
		<div class="relative overflow-y-auto rounded-lg border bg-background">
			<div class="p-4 border-b">
				<h3 class="text-lg font-semibold tracking-tight">Workspace</h3>
				<p class="text-sm text-muted-foreground">Select an organisation and project to work with.</p>
			</div>

			<div class="p-4">
				<UiTabs v-model="tab" class="w-full">
					<UiTabsList>
						<UiTabsTrigger value="organisations">Organisations</UiTabsTrigger>
						<UiTabsTrigger value="projects" :disabled="!hasOrganisation">Projects</UiTabsTrigger>
						<UiTabsTrigger value="canvas">Canvas</UiTabsTrigger>
					</UiTabsList>

					<UiTabsContent value="organisations" class="mt-4 space-y-3">
						<div class="flex items-center justify-between">
							<div class="text-sm text-muted-foreground">
								{{ organisationsList.length }} organisations
							</div>
							<div class="flex items-center gap-2">
								<UiButton size="sm" variant="outline" @click="openCreate">
									<Icon name="lucide:plus" class="size-4 mr-2" />
									New
								</UiButton>
								<UiButton size="sm" variant="ghost" :disabled="isLoadingOrganisations" @click="refreshOrganisations">
									<Icon name="lucide:refresh-cw" class="size-4 mr-2" />
									Reload
								</UiButton>
							</div>
						</div>

						<UiCommand class="rounded-lg border shadow-sm">
							<UiCommandInput placeholder="Search organisations..." />
							<UiCommandList>
								<UiCommandEmpty>No organisations found.</UiCommandEmpty>
								<UiCommandGroup heading="Organisations">
									<UiCommandItem
										v-for="org in organisationsList"
										:key="org.id"
										:value="org.name"
										@click="handleSelectOrganisation(org)"
									>
										<Icon :name="selectedOrganisationId === String(org.id) ? 'lucide:check' : 'lucide:building-2'" class="mr-2 size-4" />
										<div class="min-w-0">
											<div class="font-medium truncate">{{ org.name }}</div>
											<div class="text-xs text-muted-foreground truncate">{{ org.description || 'No description' }}</div>
										</div>
									</UiCommandItem>
								</UiCommandGroup>
							</UiCommandList>
						</UiCommand>
					</UiTabsContent>

					<UiTabsContent value="projects" class="mt-4 space-y-3">
						<div class="flex items-center justify-between">
							<div class="text-sm text-muted-foreground">
								{{ projectsList.length }} projects in selected organisation
							</div>
							<div class="flex items-center gap-2">
								<UiButton size="sm" :disabled="!selectedProjectId" @click="openCanvasSelected">
									<Icon name="lucide:layout" class="size-4 mr-2" />
									Open Canvas
								</UiButton>
								<UiButton size="sm" variant="outline" :disabled="!hasOrganisation" @click="openProjectCreate">
									<Icon name="lucide:plus" class="size-4 mr-2" />
									New
								</UiButton>
								<UiButton size="sm" variant="ghost" :disabled="isLoadingProjects || !hasOrganisation" @click="reloadProjects">
									<Icon name="lucide:refresh-cw" class="size-4 mr-2" />
									Reload
								</UiButton>
							</div>
						</div>

						<UiCommand class="rounded-lg border shadow-sm">
							<UiCommandInput placeholder="Search projects..." />
							<UiCommandList>
								<UiCommandEmpty>No projects found.</UiCommandEmpty>
								<UiCommandGroup heading="Projects">
									<UiCommandItem
										v-for="p in projectsList"
										:key="p.id"
										:value="p.name"
										@click="handleSelectProject(p)"
									>
										<Icon :name="selectedProjectId === String(p.id) ? 'lucide:check' : 'lucide:folder'" class="mr-2 size-4" />
										<div class="min-w-0">
											<div class="font-medium truncate">{{ p.name }}</div>
											<div class="text-xs text-muted-foreground truncate">{{ p.description || 'No description' }}</div>
										</div>
										<div class="ml-auto flex items-center gap-1">
											<UiButton size="sm" variant="secondary" title="Open Canvas" @click.stop="openCanvas(p)">
												<Icon name="lucide:layout" class="size-4 mr-1" />
												Canvas
											</UiButton>
											<UiButton size="icon" variant="ghost" title="Edit" @click.stop="openProjectEdit(p)">
												<Icon name="lucide:pencil" class="size-4" />
											</UiButton>
											<UiButton size="icon" variant="ghost" title="Delete" @click.stop="openProjectDelete(p)">
												<Icon name="lucide:trash-2" class="size-4" />
											</UiButton>
										</div>
									</UiCommandItem>
								</UiCommandGroup>
							</UiCommandList>
						</UiCommand>
					</UiTabsContent>

					<UiTabsContent value="canvas" class="mt-6">
						<div v-if="!selectedProjectId" class="text-sm text-muted-foreground">
							Select a project to open the canvas.
						</div>
						<div v-else class="flex items-center justify-between rounded-lg border p-4 bg-card">
							<div class="text-sm text-muted-foreground">
								Open the full canvas page for the selected project.
							</div>
							<UiButton size="sm" @click="openCanvasSelected">
								<Icon name="lucide:layout" class="size-4 mr-2" />
								Open Canvas
							</UiButton>
						</div>
					</UiTabsContent>
				</UiTabs>
			</div>
		</div>

		<!-- Modals -->
		<OrganisationCreateModal
			v-model:open="isCreateOpen"
			:submitting="submittingCreate"
			@submit="onCreateSubmit"
		/>
		<OrganisationEditModal
			v-model:open="isEditOpen"
			:submitting="submittingEdit"
			:organisation="selectedOrg || undefined"
			@submit="onEditSubmit"
		/>
		<OrganisationDeleteModal
			v-model:open="isDeleteOpen"
			:submitting="submittingDelete"
			:organisation="selectedOrg || undefined"
			@confirm="onDeleteConfirm"
		/>

		<!-- Project Modals -->
		<ProjectCreateModal
			v-model:open="isProjectCreateOpen"
			:submitting="submittingCreate"
			@submit="onProjectCreateSubmit"
		/>
		<ProjectEditModal
			v-model:open="isProjectEditOpen"
			:submitting="submittingEdit"
			:project="selectedProject || undefined"
			@submit="onProjectEditSubmit"
		/>
		<ProjectDeleteModal
			v-model:open="isProjectDeleteOpen"
			:submitting="submittingDelete"
			:project="selectedProject || undefined"
			@confirm="onProjectDeleteConfirm"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import UiTabs from "~/components/Ui/Tabs/Tabs.vue";
import UiTabsList from "~/components/Ui/Tabs/List.vue";
import UiTabsTrigger from "~/components/Ui/Tabs/Trigger.vue";
import UiTabsContent from "~/components/Ui/Tabs/Content.vue";
import UiCommand from "~/components/Ui/Command/Command.vue";
import UiCommandInput from "~/components/Ui/Command/Input.vue";
import UiCommandList from "~/components/Ui/Command/List.vue";
import UiCommandGroup from "~/components/Ui/Command/Group.vue";
import UiCommandItem from "~/components/Ui/Command/Item.vue";
import UiButton from "~/components/Ui/Button.vue";
import OrganisationCreateModal from "~/components/dashboard/organisations/OrganisationCreateModal.vue";
import OrganisationEditModal from "~/components/dashboard/organisations/OrganisationEditModal.vue";
import OrganisationDeleteModal from "~/components/dashboard/organisations/OrganisationDeleteModal.vue";
import { useUnifiedOrgProjectSelector } from "~/composables/useUnifiedOrgProjectSelector";
import ProjectCreateModal from "~/components/dashboard/projects/ProjectCreateModal.vue";
import ProjectEditModal from "~/components/dashboard/projects/ProjectEditModal.vue";
import ProjectDeleteModal from "~/components/dashboard/projects/ProjectDeleteModal.vue";
import { useProjectSelection } from "~/composables/useProjectSelection";

const tab = ref<"organisations" | "projects" | "canvas" | "overview" | "settings">("organisations");

const {
	// org
	organisations,
	isLoadingOrganisations,
	refreshOrganisations,
	selectOrganisation,
	selectedOrganisationId,
	apiCreate,
	apiUpdate,
	apiDelete,
	// projects
	projects,
	isLoadingProjects,
	loadProjectsForOrganization,
	setSelectedProject,
	selectedProjectId,
	hasOrganisation
} = useUnifiedOrgProjectSelector();

const { createProject, updateProject, deleteProject } = useProjectSelection();

const organisationsList = computed(() => organisations.value || []);
const projectsList = computed(() => projects.value || []);

// Modals & selection
const isCreateOpen = ref(false);
const isEditOpen = ref(false);
const isDeleteOpen = ref(false);
const submittingCreate = ref(false);
const submittingEdit = ref(false);
const submittingDelete = ref(false);
const selectedOrg = ref<any | null>(null);
const isProjectCreateOpen = ref(false);
const isProjectEditOpen = ref(false);
const isProjectDeleteOpen = ref(false);
const selectedProject = ref<any | null>(null);

function openCreate() {
	isCreateOpen.value = true;
}

async function onCreateSubmit(payload: { name: string; description?: string; email?: string }) {
	try {
		submittingCreate.value = true;
		const created = await apiCreate(payload as any);
		if (created?.name) {
			useToast.success("Organisation created", { description: created.name });
		}
		isCreateOpen.value = false;
		refreshOrganisations();
	} catch (e: any) {
		useToast.error("Create failed", { description: e?.message || String(e) });
	} finally {
		submittingCreate.value = false;
	}
}

function handleSelectOrganisation(org: any) {
	selectOrganisation(String(org.id));
	// Removed toast - selection is visual feedback enough
	tab.value = "projects";
}

function handleSelectProject(p: any) {
	setSelectedProject(p);
	// Removed toast - selection is visual feedback enough
	// Open the Canvas tab in this panel instead of navigating away
	tab.value = "canvas";
}

function openCanvas(p: any) {
	// Ensure project is set for global state
	setSelectedProject(p);
	// Navigate to dedicated canvas page with projectId and organisationId
	navigateTo({
		path: "/canvas",
		query: {
			projectId: String(p.id),
			organisationId: String(selectedOrganisationId?.value || "")
		}
	});
}

function openCanvasSelected() {
	if (!selectedProjectId.value) return;
	navigateTo({
		path: "/canvas",
		query: {
			projectId: String(selectedProjectId.value),
			organisationId: String(selectedOrganisationId?.value || "")
		}
	});
}

function reloadProjects() {
	if (selectedOrganisationId?.value) {
		loadProjectsForOrganization(String(selectedOrganisationId.value));
	}
}

function openEdit(org: any) {
	selectedOrg.value = org;
	isEditOpen.value = true;
}

async function onEditSubmit(payload: { id: string | number; name: string; description?: string; email?: string }) {
	try {
		submittingEdit.value = true;
		await apiUpdate(payload.id, { name: payload.name, description: payload.description, email: payload.email });
		if (payload.name) {
		useToast.success("Organisation updated", { description: payload.name });
		}
		isEditOpen.value = false;
		selectedOrg.value = null;
		refreshOrganisations();
	} catch (e: any) {
		useToast.error("Update failed", { description: e?.message || String(e) });
	} finally {
		submittingEdit.value = false;
	}
}

async function onDeleteConfirm() {
	if (!selectedOrg.value) return;
	try {
		submittingDelete.value = true;
		await apiDelete(selectedOrg.value.id);
		useToast.success("Organisation deleted");
		isDeleteOpen.value = false;
		if (String(selectedOrganisationId?.value || "") === String(selectedOrg.value.id)) {
			selectOrganisation("");
		}
		selectedOrg.value = null;
		refreshOrganisations();
	} catch (e: any) {
		useToast.error("Delete failed", { description: e?.message || String(e) });
	} finally {
		submittingDelete.value = false;
	}
}

function openProjectCreate() {
	isProjectCreateOpen.value = true;
}

function openProjectEdit(p: any) {
	selectedProject.value = p;
	isProjectEditOpen.value = true;
}

function openProjectDelete(p: any) {
	selectedProject.value = p;
	isProjectDeleteOpen.value = true;
}

async function onProjectCreateSubmit(payload: { name: string; description?: string }) {
	try {
		if (!selectedOrganisationId?.value) {
			useToast.error("No organisation selected");
			return;
		}
		submittingCreate.value = true;
		const created = await createProject({
			name: payload.name,
			description: payload.description,
			organisationId: selectedOrganisationId.value
		});
		if (created?.name) {
			useToast.success("Project created", { description: created.name });
		}
		isProjectCreateOpen.value = false;
		reloadProjects();
	} catch (e: any) {
		useToast.error("Create failed", { description: e?.message || String(e) });
	} finally {
		submittingCreate.value = false;
	}
}

async function onProjectEditSubmit(payload: { id: string | number; name: string; description?: string }) {
	try {
		submittingEdit.value = true;
		const updated = await updateProject(String(payload.id), { name: payload.name, description: payload.description });
		if (updated?.name) {
			useToast.success("Project updated", { description: updated.name });
		}
		isProjectEditOpen.value = false;
		selectedProject.value = null;
		reloadProjects();
	} catch (e: any) {
		useToast.error("Update failed", { description: e?.message || String(e) });
	} finally {
		submittingEdit.value = false;
	}
}

async function onProjectDeleteConfirm() {
	if (!selectedProject.value) return;
	try {
		submittingDelete.value = true;
		await deleteProject(String(selectedProject.value.id));
		useToast.success("Project deleted");
		isProjectDeleteOpen.value = false;
		if (String(selectedProjectId.value || "") === String(selectedProject.value.id)) {
			setSelectedProject(null as any);
		}
		selectedProject.value = null;
		reloadProjects();
	} catch (e: any) {
		useToast.error("Delete failed", { description: e?.message || String(e) });
	} finally {
		submittingDelete.value = false;
	}
}
</script>


