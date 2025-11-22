<template>
	<div class="space-y-4">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-lg font-semibold">Tasks</h3>
				<p class="text-muted-foreground text-xs">Manage tasks for the selected scope</p>
			</div>
			<div class="flex items-center gap-2">
				<UiButton variant="outline" :disabled="loading" @click="loadTasks">
					<Icon name="lucide:refresh-cw" class="size-4 mr-2" />
					Refresh
				</UiButton>
				<UiButton @click="openCreate">
					<Icon name="lucide:plus" class="size-4 mr-2" />
					New Task
				</UiButton>
			</div>
		</div>

		<!-- Filters -->
		<div class="flex flex-col sm:flex-row gap-2">
			<input
				v-model="search"
				type="text"
				placeholder="Search tasks…"
				class="px-3 py-2 rounded border bg-background"
			>
			<select v-model="status" class="px-3 py-2 rounded border bg-background sm:w-48">
				<option value="">All Status</option>
				<option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
			</select>
			<div class="ml-auto text-xs text-muted-foreground self-center">
				{{ filtered.value.length }} of {{ (tasks || []).length }} tasks
			</div>
		</div>

		<!-- List -->
		<UiCard class="p-0 overflow-hidden">
			<div v-if="loading" class="p-6 text-sm text-muted-foreground">Loading…</div>
			<div v-else>
				<div v-if="filtered.value.length === 0" class="p-6 text-sm text-muted-foreground">No tasks found.</div>
				<ul v-else class="divide-y">
					<li v-for="task in filtered.value" :key="task.id" class="px-4 py-3">
						<UiContextMenu>
							<UiContextMenuTrigger as-child>
								<div class="flex items-start justify-between gap-3">
									<div class="min-w-0 flex-1">
										<div class="flex items-center gap-2">
											<div class="font-medium truncate">{{ task.name || 'Untitled task' }}</div>
											<span v-if="task.jiraStatus" class="text-xs px-2 py-0.5 rounded border">{{ task.jiraStatus }}</span>
											<span v-if="task.butt" class="text-xs px-2 py-0.5 rounded border">{{ task.butt }}</span>
										</div>
										<div v-if="task.description" class="text-xs text-muted-foreground truncate mt-0.5">
											{{ task.description }}
										</div>
										<!-- Inline status change buttons -->
										<div class="flex flex-wrap items-center gap-1 mt-2">
											<span class="text-[11px] text-muted-foreground mr-1">Move to:</span>
											<UiButton
												v-for="s in availableStatuses(task.jiraStatus)"
												:key="s"
												size="xs"
												variant="outline"
												:disabled="isChangingStatus"
												@click="changeStatus(task, s)"
											>
												{{ s }}
											</UiButton>
										</div>
									</div>
									<div class="flex items-center gap-1 shrink-0">
										<UiButton size="sm" variant="ghost" @click="openEdit(task)" title="Edit">
											<Icon name="lucide:edit" class="size-4" />
										</UiButton>
										<UiButton size="sm" variant="ghost" @click="confirmDelete(task)" title="Delete">
											<Icon name="lucide:trash-2" class="size-4 text-red-500" />
										</UiButton>
									</div>
								</div>
							</UiContextMenuTrigger>
							<UiContextMenuContent class="w-64">
								<UiContextMenuLabel class="my-1" label="Assign to member(s)" />
								<UiContextMenuSeparator />
								<UiContextMenuGroup>
									<UiContextMenuCheckboxItem
										v-for="member in orgMembers"
										:key="member.id || member.email"
										inset
										class="mb-1"
										:model-value="isMemberAssigned(task, member)"
										@select="(e) => e.preventDefault()"
										@click="toggleMemberAssignment(task, member)"
									>
										<div class="flex items-center gap-3">
											<UiAvatar class="h-6 w-6" :alt="member.name || member.email">
												<template #fallback>
													<span class="text-[10px]">{{ memberInitial(member) }}</span>
												</template>
											</UiAvatar>
											<span class="truncate">{{ member.name || member.email }}</span>
										</div>
									</UiContextMenuCheckboxItem>
								</UiContextMenuGroup>
							</UiContextMenuContent>
						</UiContextMenu>
					</li>
				</ul>
			</div>
		</UiCard>

		<!-- Create/Edit Modal -->
		<UiDialog v-model:open="showModal">
			<UiDialogContent class="sm:max-w-lg">
				<UiDialogHeader>
					<UiDialogTitle>{{ isEditing ? 'Edit Task' : 'Create Task' }}</UiDialogTitle>
				</UiDialogHeader>

				<form class="space-y-3" @submit.prevent="save">
					<UiInput v-model="form.name" placeholder="Task name" required />
					<UiTextarea v-model="form.description" placeholder="Description (optional)" :rows="3" />
					<div class="grid grid-cols-2 gap-2">
						<UiInput v-model="form.butt" placeholder="BUTT (optional)" />
						<UiInput v-model="form.sourceId" placeholder="Source ID (optional)" />
					</div>
					<UiSelect v-model="form.jiraStatus">
						<option disabled value="">Select status</option>
						<option v-for="s in allStatuses" :key="s" :value="s">{{ s }}</option>
					</UiSelect>
					<div class="flex justify-end gap-2 pt-2">
						<UiButton type="button" variant="outline" :disabled="saving" @click="close">Cancel</UiButton>
						<UiButton type="submit" :disabled="saving" :loading="saving">
							{{ isEditing ? 'Update' : 'Create' }}
						</UiButton>
					</div>
				</form>
			</UiDialogContent>
		</UiDialog>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref } from "vue";
	import UiButton from "~/components/ui/Button.vue";
	import UiCard from "~/components/ui/Card/Card.vue";
	import UiDialog from "~/components/ui/Dialog/Dialog.vue";
	import UiDialogContent from "~/components/ui/Dialog/Content.vue";
	import UiDialogHeader from "~/components/ui/Dialog/Header.vue";
	import UiDialogTitle from "~/components/ui/Dialog/Title.vue";
	import UiInput from "~/components/ui/Input.vue";
	import UiTextarea from "~/components/ui/Textarea.vue";
	import UiSelect from "~/components/ui/NativeSelect.vue";
	import { useTasks } from "~/composables/useTasks";
	import { useSelectedOrganisationId } from "~/composables/useSelectedOrganisationId";
	import { useOrganizationMembers } from "~/composables/useOrganizationMembers";
	import UiContextMenu from "~/components/ui/ContextMenu/ContextMenu.vue";
	import UiContextMenuTrigger from "~/components/ui/ContextMenu/Trigger.vue";
	import UiContextMenuContent from "~/components/ui/ContextMenu/Content.vue";
	import UiContextMenuGroup from "~/components/ui/ContextMenu/Group.vue";
	import UiContextMenuCheckboxItem from "~/components/ui/ContextMenu/CheckboxItem.vue";
	import UiContextMenuLabel from "~/components/ui/ContextMenu/Label.vue";
	import UiContextMenuSeparator from "~/components/ui/ContextMenu/Separator.vue";
	import UiAvatar from "~/components/ui/Avatar/Avatar.vue";

	const { tasks, loadTasks, createTask, updateTask, deleteTask, loading } = useTasks();

	const selectedOrgId = useSelectedOrganisationId();
	const { members: orgMembers } = useOrganizationMembers(selectedOrgId);

	const search = ref("");
	const status = ref("");
	const statusOptions = computed(() => {
		const set = new Set<string>();
		(tasks.value || []).forEach((t: any) => t.jiraStatus && set.add(t.jiraStatus));
		return Array.from(set).sort();
	});
	const allStatuses = computed(() => {
		const s = new Set<string>(["To Do","In Progress","Done","Backlog","Review","Testing"]);
		(tasks.value || []).forEach((t: any) => t.jiraStatus && s.add(t.jiraStatus));
		return Array.from(s);
	});

	const filtered = computed(() => {
		let arr = [...(tasks.value || [])];
		if (search.value) {
			const q = search.value.toLowerCase();
			arr = arr.filter(t =>
				(t.name || "").toLowerCase().includes(q)
				|| (t.description || "").toLowerCase().includes(q)
				|| (t.butt || "").toLowerCase().includes(q)
			);
		}
		if (status.value) {
			arr = arr.filter(t => t.jiraStatus === status.value);
		}
		return arr.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
	});

	// Modal/form
	const showModal = ref(false);
	const isEditing = ref(false);
	const editingId = ref<string | null>(null);
	const saving = ref(false);
	const isChangingStatus = ref(false);
	const form = ref<{ name: string; description?: string; butt?: string; sourceId?: string; jiraStatus?: string }>({
		name: "",
		description: "",
		butt: "",
		sourceId: "",
		jiraStatus: ""
	});

	function openCreate() {
		isEditing.value = false;
		editingId.value = null;
		form.value = { name: "", description: "", butt: "", sourceId: "", jiraStatus: "" };
		showModal.value = true;
	}

	function openEdit(task: any) {
		isEditing.value = true;
		editingId.value = task.id;
		form.value = {
			name: task.name || "",
			description: task.description || "",
			butt: task.butt || "",
			sourceId: task.sourceId || "",
			jiraStatus: task.jiraStatus || ""
		};
		showModal.value = true;
	}

	function close() {
		showModal.value = false;
	}

	async function save() {
		if (!form.value.name.trim()) return;
		saving.value = true;
		try {
			const payload: any = {
				name: form.value.name.trim(),
				description: form.value.description || undefined,
				butt: form.value.butt || undefined,
				sourceId: form.value.sourceId || undefined,
				jiraStatus: form.value.jiraStatus || undefined
			};
			if (isEditing.value && editingId.value) {
				await updateTask(editingId.value, payload);
			} else {
				await createTask(payload);
			}
			close();
			await loadTasks();
		} finally {
			saving.value = false;
		}
	}

	async function confirmDelete(task: any) {
		if (!confirm(`Delete "${task.name}"?`)) return;
		await deleteTask(task.id);
		await loadTasks();
	}

	function availableStatuses(current?: string) {
		return allStatuses.value.filter(s => s !== (current || ""));
	}

	async function changeStatus(task: any, newStatus: string) {
		if (isChangingStatus.value) return;
		isChangingStatus.value = true;
		try {
			await updateTask(task.id, { jiraStatus: newStatus } as any);
			await loadTasks();
		} finally {
			isChangingStatus.value = false;
		}
	}

	onMounted(() => {
		loadTasks();
	});

	function memberKey(m: any) {
		return m?.id ?? m?.email ?? m?.name ?? "";
	}

	function isMemberAssigned(task: any, member: any) {
		const owners: any[] = Array.isArray(task?.owners) ? task.owners : [];
		const key = String(memberKey(member));
		return owners.some((o: any) => String(o) === key);
	}

	function memberInitial(member: any) {
		const name = member?.name || member?.email || "";
		const parts = String(name).split(" ").filter(Boolean);
		if (parts.length === 0) return (String(name).charAt(0) || "").toUpperCase();
		if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
		return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
	}

	async function toggleMemberAssignment(task: any, member: any) {
		const owners: string[] = Array.isArray(task?.owners) ? [...task.owners] : [];
		const key = String(memberKey(member));
		const idx = owners.findIndex((o) => String(o) === key);
		if (idx >= 0) {
			owners.splice(idx, 1);
		} else {
			owners.push(key);
		}
		await updateTask(task.id, { owners } as any);
		await loadTasks();
	}
</script>


