<template>
	<UiDialog :open="open" @update:open="onOpenChange">
		<UiDialogContent class="sm:max-w-lg">
			<UiDialogHeader>
				<UiDialogTitle>Edit project</UiDialogTitle>
				<UiDialogDescription>Update project details.</UiDialogDescription>
			</UiDialogHeader>
			<form class="space-y-4" @submit.prevent="submit">
				<div class="space-y-2">
					<UiLabel for="proj-name">Name</UiLabel>
					<UiInput id="proj-name" v-model="name" required />
				</div>
				<div class="space-y-2">
					<UiLabel for="proj-desc">Description</UiLabel>
					<UiInput id="proj-desc" v-model="description" />
				</div>
				<UiDialogFooter class="gap-2">
					<UiButton type="button" variant="outline" :disabled="submitting" @click="onOpenChange(false)">Cancel</UiButton>
					<UiButton type="submit" :disabled="submitting">
						<Icon v-if="submitting" name="lucide:loader-2" class="size-4 mr-2 animate-spin" />
						Save changes
					</UiButton>
				</UiDialogFooter>
			</form>
		</UiDialogContent>
	</UiDialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import UiDialog from "~/components/Ui/Dialog/Dialog.vue";
import UiDialogContent from "~/components/Ui/Dialog/Content.vue";
import UiDialogHeader from "~/components/Ui/Dialog/Header.vue";
import UiDialogTitle from "~/components/Ui/Dialog/Title.vue";
import UiDialogDescription from "~/components/Ui/Dialog/Description.vue";
import UiDialogFooter from "~/components/Ui/Dialog/Footer.vue";
import UiButton from "~/components/Ui/Button.vue";
import UiLabel from "~/components/Ui/Label.vue";
import UiInput from "~/components/Ui/Input.vue";

const props = defineProps<{
	open: boolean
	submitting?: boolean
	project?: { id: string | number; name: string; description?: string }
}>();
const _emit = defineEmits<{
	(e: "update:open", v: boolean): void
	(e: "submit", payload: { id: string | number; name: string; description?: string }): void
}>();

const name = ref("");
const description = ref("");

watch(() => props.open, (o) => {
	if (o && props.project) {
		name.value = props.project.name || "";
		description.value = props.project.description || "";
	}
});

function onOpenChange(v: boolean) {
	_emit("update:open", v);
}

function submit() {
	if (!props.project) return;
	if (!name.value.trim()) return;
	_emit("submit", {
		id: props.project.id,
		name: name.value.trim(),
		description: description.value?.trim() || undefined
	});
}
</script>


