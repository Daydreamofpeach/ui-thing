<template>
	<div>
		<UiButton size="sm" @click="open = true">
			<Icon name="lucide:plus" class="size-4 mr-2" />
			New Task
		</UiButton>
		<UiDialog :open="open" @update:open="(v) => open = v">
			<UiDialogContent class="sm:max-w-lg">
				<UiDialogHeader>
					<UiDialogTitle>Create Task</UiDialogTitle>
				</UiDialogHeader>
				<form class="space-y-3" @submit.prevent="save">
					<UiInput v-model="form.name" placeholder="Task name" required />
					<UiTextarea v-model="form.description" placeholder="Description (optional)" :rows="3" />
					<div class="flex justify-end gap-2 pt-2">
						<UiButton type="button" variant="outline" :disabled="saving" @click="open = false">Cancel</UiButton>
						<UiButton type="submit" :disabled="saving" :loading="saving">
							Create
						</UiButton>
					</div>
				</form>
			</UiDialogContent>
		</UiDialog>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import UiButton from "~/components/Ui/Button.vue";
import UiDialog from "~/components/Ui/Dialog/Dialog.vue";
import UiDialogContent from "~/components/Ui/Dialog/Content.vue";
import UiDialogHeader from "~/components/Ui/Dialog/Header.vue";
import UiDialogTitle from "~/components/Ui/Dialog/Title.vue";
import UiInput from "~/components/Ui/Input.vue";
import UiTextarea from "~/components/Ui/Textarea.vue";
import { useTasks } from "~/composables/useTasks";

const emit = defineEmits<{
	(e: "created"): void
}>();

const open = ref(false);
const saving = ref(false);
const form = ref<{ name: string; description?: string }>({
	name: "",
	description: ""
});

const { createTask } = useTasks();

async function save() {
	if (!form.value.name.trim()) return;
	saving.value = true;
	try {
		await createTask({
			name: form.value.name.trim(),
			description: form.value.description || undefined,
		} as any);
		open.value = false;
		form.value = { name: "", description: "" };
		emit("created");
	} finally {
		saving.value = false;
	}
}
</script>



