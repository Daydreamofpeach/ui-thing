<template>
	<UiDialog :open="open" @update:open="onOpenChange">
		<UiDialogContent class="sm:max-w-lg">
			<UiDialogHeader>
				<UiDialogTitle>Create organisation</UiDialogTitle>
				<UiDialogDescription>Provide details to create a new organisation.</UiDialogDescription>
			</UiDialogHeader>
			<form class="space-y-4" @submit.prevent="submit">
				<div class="space-y-2">
					<UiLabel for="org-name">Name</UiLabel>
					<UiInput id="org-name" v-model="name" placeholder="Acme Inc." required />
				</div>
				<div class="space-y-2">
					<UiLabel for="org-desc">Description</UiLabel>
					<UiInput id="org-desc" v-model="description" placeholder="What does your organisation do?" />
				</div>
				<div class="space-y-2">
					<UiLabel for="org-email">Email</UiLabel>
					<UiInput id="org-email" v-model="email" type="email" placeholder="contact@acme.com" />
				</div>
				<UiDialogFooter class="gap-2">
					<UiButton type="button" variant="outline" :disabled="submitting" @click="onOpenChange(false)">Cancel</UiButton>
					<UiButton type="submit" :disabled="submitting">
						<Icon v-if="submitting" name="lucide:loader-2" class="size-4 mr-2 animate-spin" />
						Create
					</UiButton>
				</UiDialogFooter>
			</form>
		</UiDialogContent>
	</UiDialog>
</template>

<script setup lang="ts">
import { watch, ref } from "vue";
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
}>();
const _emit = defineEmits<{
	(e: "update:open", v: boolean): void
	(e: "submit", payload: { name: string; description?: string; email?: string }): void
}>();

const name = ref("");
const description = ref("");
const email = ref("");

watch(() => props.open, (o) => {
	if (o) {
		// reset form on open
		name.value = "";
		description.value = "";
		email.value = "";
	}
});

function onOpenChange(v: boolean) {
	_emit("update:open", v);
}

function submit() {
	if (!name.value.trim()) return;
	_emit("submit", {
		name: name.value.trim(),
		description: description.value?.trim() || undefined,
		email: email.value?.trim() || undefined
	});
}
</script>


