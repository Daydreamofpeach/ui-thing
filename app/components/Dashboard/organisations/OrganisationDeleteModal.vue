<template>
	<UiDialog :open="open" @update:open="onOpenChange">
		<UiDialogContent class="sm:max-w-md">
			<UiDialogHeader>
				<UiDialogTitle>Delete organisation</UiDialogTitle>
				<UiDialogDescription>
					This action cannot be undone. This will permanently delete the organisation
					<strong>{{ organisation?.name }}</strong>.
				</UiDialogDescription>
			</UiDialogHeader>
			<UiDialogFooter class="gap-2">
				<UiButton type="button" variant="outline" :disabled="submitting" @click="onOpenChange(false)">Cancel</UiButton>
				<UiButton type="button" variant="destructive" :disabled="submitting" @click="confirm">
					<Icon v-if="submitting" name="lucide:loader-2" class="size-4 mr-2 animate-spin" />
					Delete
				</UiButton>
			</UiDialogFooter>
		</UiDialogContent>
	</UiDialog>
</template>

<script setup lang="ts">
import UiDialog from "~/components/Ui/Dialog/Dialog.vue";
import UiDialogContent from "~/components/Ui/Dialog/Content.vue";
import UiDialogHeader from "~/components/Ui/Dialog/Header.vue";
import UiDialogTitle from "~/components/Ui/Dialog/Title.vue";
import UiDialogDescription from "~/components/Ui/Dialog/Description.vue";
import UiDialogFooter from "~/components/Ui/Dialog/Footer.vue";
import UiButton from "~/components/Ui/Button.vue";

const props = defineProps<{
	open: boolean
	submitting?: boolean
	organisation?: { id: string | number; name: string }
}>();
const _emit = defineEmits<{
	(e: "update:open", v: boolean): void
	(e: "confirm"): void
}>();

function onOpenChange(v: boolean) {
	_emit("update:open", v);
}

function confirm() {
	_emit("confirm");
}
</script>


