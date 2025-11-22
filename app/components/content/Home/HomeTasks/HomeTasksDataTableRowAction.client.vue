<script setup lang="ts">
  import type { Row } from "@tanstack/vue-table";
  import { useTasks } from "~/composables/useTasks";

  interface DataTableRowActionsProps {
    row: Row<HomeTask>;
  }
  const props = defineProps<DataTableRowActionsProps>();

  const task = computed(() => props.row.original);

  const { updateTask, deleteTask } = useTasks();

  // Edit modal state
  const showEdit = ref(false);
  const saving = ref(false);
  const form = ref<{ name: string; description?: string; jiraStatus?: string }>({
    name: "",
    description: "",
    jiraStatus: ""
  });

  function openEdit() {
    form.value = {
      name: (task.value as any)?.title || "",
      description: (task.value as any)?.description || "",
      jiraStatus: (task.value as any)?.status || ""
    };
    showEdit.value = true;
  }

  async function saveEdit() {
    saving.value = true;
    try {
      const id = (props.row.original as any)?.id;
      if (id) {
        // Map HomeTask.status to Jira case if provided
        const status = form.value.jiraStatus;
        const jira = mapHomeStatusToJira(status);
        await updateTask(String(id), {
          name: form.value.name,
          description: form.value.description,
          jiraStatus: jira
        } as any);
      }
      showEdit.value = false;
    } finally {
      saving.value = false;
    }
  }

  async function doDelete() {
    const id = (props.row.original as any)?.id;
    if (!id) return;
    if (!confirm(`Delete "${(task.value as any)?.title}"?`)) return;
    await deleteTask(String(id));
  }

  function mapHomeStatusToJira(status?: string) {
    const s = String(status || "").toLowerCase();
    if (s === "in progress") return "In Progress";
    if (s === "done") return "Done";
    if (s === "backlog") return "Backlog";
    if (s === "canceled") return "Canceled";
    if (s === "todo") return "To Do";
    return undefined;
  }

  function mapJiraToHome(status?: string) {
    const s = String(status || "").toLowerCase();
    if (s.includes("progress")) return "in progress";
    if (s.includes("done") || s.includes("complete")) return "done";
    if (s.includes("backlog")) return "backlog";
    if (s.includes("cancel")) return "canceled";
    return "todo";
  }

  async function changeStatus(next: string) {
    const id = (props.row.original as any)?.id;
    if (!id) return;
    const jira = mapHomeStatusToJira(next);
    await updateTask(String(id), { jiraStatus: jira } as any);
  }
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton variant="ghost" class="flex size-8 p-0 data-[state=open]:bg-muted">
        <Icon name="lucide:ellipsis" class="size-4" />
        <span class="sr-only">Open menu</span>
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="w-[200px]">
      <UiDropdownMenuItem @click="openEdit">Edit</UiDropdownMenuItem>
      <UiDropdownMenuSub>
        <UiDropdownMenuSubTrigger>Change status</UiDropdownMenuSubTrigger>
        <UiDropdownMenuSubContent>
          <UiDropdownMenuItem @click="changeStatus('To Do')">To Do</UiDropdownMenuItem>
          <UiDropdownMenuItem @click="changeStatus('In Progress')">In Progress</UiDropdownMenuItem>
          <UiDropdownMenuItem @click="changeStatus('Done')">Done</UiDropdownMenuItem>
          <UiDropdownMenuItem @click="changeStatus('Backlog')">Backlog</UiDropdownMenuItem>
          <UiDropdownMenuItem @click="changeStatus('Canceled')">Canceled</UiDropdownMenuItem>
        </UiDropdownMenuSubContent>
      </UiDropdownMenuSub>
      <UiDropdownMenuSeparator />
      <UiDropdownMenuItem @click="doDelete">
        Delete
        <UiDropdownMenuShortcut>⌘⌫</UiDropdownMenuShortcut>
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>

  <!-- Edit Modal -->
  <UiDialog :open="showEdit" @update:open="(v) => showEdit = v">
    <UiDialogContent class="sm:max-w-lg">
      <UiDialogHeader>
        <UiDialogTitle>Edit Task</UiDialogTitle>
      </UiDialogHeader>
      <form class="space-y-3" @submit.prevent="saveEdit">
        <UiInput v-model="form.name" placeholder="Task name" required />
        <UiTextarea v-model="form.description" placeholder="Description (optional)" :rows="3" />
        <UiSelect v-model="form.jiraStatus">
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
          <option value="Backlog">Backlog</option>
          <option value="Canceled">Canceled</option>
        </UiSelect>
        <div class="flex justify-end gap-2 pt-2">
          <UiButton type="button" variant="outline" :disabled="saving" @click="showEdit = false">Cancel</UiButton>
          <UiButton type="submit" :disabled="saving" :loading="saving">
            Save
          </UiButton>
        </div>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
