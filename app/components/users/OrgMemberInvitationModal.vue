<template>
	<UiDialog :open="isOpen" @update:open="onOpenChange">
		<UiDialogContent class="sm:max-w-lg">
			<UiDialogHeader>
				<UiDialogTitle>
					Invite Member to {{ props.projectId ? (props.projectName || 'Project') : (props.organisationName || 'Organisation') }}
				</UiDialogTitle>
				<UiDialogDescription>Send an invitation to join.</UiDialogDescription>
			</UiDialogHeader>
			<div class="space-y-4">
				<div class="space-y-2">
					<UiLabel for="invite-email">Email Address</UiLabel>
					<UiInput
						id="invite-email"
						v-model="inviteEmail"
						type="email"
						placeholder="Enter email address to invite"
						required
					/>
				</div>

				<div v-if="inviteError" class="text-sm text-destructive">
					{{ inviteError }}
				</div>

				<div v-if="inviteSuccess" class="text-sm text-green-600">
					{{ inviteSuccess }}
				</div>
			</div>
			<UiDialogFooter class="gap-2">
				<UiButton variant="outline" :disabled="isInviting" @click="closeModal">
					Cancel
				</UiButton>
				<UiButton :disabled="isInviting || !inviteEmail.trim()" @click="sendInvitation">
					<Icon v-if="isInviting" name="lucide:loader-2" class="size-4 mr-2 animate-spin" />
					Send Invitation
				</UiButton>
			</UiDialogFooter>
		</UiDialogContent>
	</UiDialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import UiDialog from "~/components/Ui/Dialog/Dialog.vue";
import UiDialogContent from "~/components/Ui/Dialog/Content.vue";
import UiDialogHeader from "~/components/Ui/Dialog/Header.vue";
import UiDialogTitle from "~/components/Ui/Dialog/Title.vue";
import UiDialogDescription from "~/components/Ui/Dialog/Description.vue";
import UiDialogFooter from "~/components/Ui/Dialog/Footer.vue";
import UiInput from "~/components/Ui/Input.vue";
import UiLabel from "~/components/Ui/Label.vue";
import UiButton from "~/components/Ui/Button.vue";
import { buttClient } from "~/utils/buttClient";

const props = defineProps<{
	open: boolean
	organisationId: string
	organisationName?: string
	projectId?: string
	projectName?: string
}>();

const emit = defineEmits<{
	"update:open": [value: boolean]
	invitationSent: []
}>();

const inviteEmail = ref("");
const isInviting = ref(false);
const inviteError = ref("");
const inviteSuccess = ref("");

const isOpen = computed({
	get: () => props.open,
	set: (value) => emit("update:open", value)
});

async function sendInvitation() {
	if (!inviteEmail.value.trim()) return;

	isInviting.value = true;
	inviteError.value = "";
	inviteSuccess.value = "";

	try {
		await (buttClient as any).sendInvitation({
			email: inviteEmail.value.trim(),
			entityId: props.projectId || props.organisationId,
			entityType: props.projectId ? "PROJECT" : "ORGANISATION",
			type: "invite",
			test: false
		});

		inviteSuccess.value = `Invitation sent to ${inviteEmail.value}`;
		inviteEmail.value = "";
		emit("invitationSent");

		setTimeout(() => {
			isOpen.value = false;
		}, 1200);
	} catch (error: any) {
		console.error("Failed to send invitation:", error);
		inviteError.value = error?.message || "Failed to send invitation. Please try again.";
	} finally {
		isInviting.value = false;
	}
}

function onOpenChange(v: boolean) {
	isOpen.value = v;
	if (!v) {
		inviteEmail.value = "";
		inviteError.value = "";
		inviteSuccess.value = "";
	}
}

function closeModal() {
	isOpen.value = false;
}
</script>


