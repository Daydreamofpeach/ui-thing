<template>
	<UiDialog :open="isOpen" @update:open="handleOpenChange">
		<UiDialogContent class="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0">
			<!-- Beautiful Header with Gradient -->
			<UiDialogHeader class="p-6 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
						<UIcon name="i-lucide-wand-2" class="size-6 text-primary" />
					</div>
					<div class="flex-1">
						<UiDialogTitle class="text-2xl font-bold flex items-center gap-2 mb-1">
							{{ template?.title || 'Create Form' }}
						</UiDialogTitle>
						<UiDialogDescription class="text-base">
							{{ template?.description || 'Build your form using our comprehensive form builder' }}
						</UiDialogDescription>
					</div>
				</div>
			</UiDialogHeader>

			<!-- Form Builder Content -->
			<div class="flex-1 overflow-hidden min-h-0 bg-background">
				<ComprehensiveFormBuilder
					@save-as-template="handleSaveAsTemplate"
					@generate="handleGenerate"
					@preview="handlePreview"
				/>
			</div>
		</UiDialogContent>
	</UiDialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import UiDialog from "~/components/Ui/Dialog/Dialog.vue";
import UiDialogContent from "~/components/Ui/Dialog/Content.vue";
import UiDialogHeader from "~/components/Ui/Dialog/Header.vue";
import UiDialogTitle from "~/components/Ui/Dialog/Title.vue";
import UiDialogDescription from "~/components/Ui/Dialog/Description.vue";
import ComprehensiveFormBuilder from "./ComprehensiveFormBuilder.vue";
import { useFormTemplateManagement } from "~/composables/useFormTemplateManagement";
import { useToast } from "~/components/Ui/composables/useToast";

interface Template {
	id: string
	title: string
	description: string
	fields?: any[]
}

interface Props {
	open: boolean
	template?: Template | null
}

const props = defineProps<Props>();

const emit = defineEmits<{
	"update:open": [value: boolean]
	save: [formData: { html: string; css: string; json: any }]
	cancel: []
}>();

const isOpen = computed({
	get: () => props.open,
	set: (value) => emit("update:open", value)
});

const toast = useToast();
const { saveFormAsTemplate, loadTemplates } = useFormTemplateManagement();

async function handleSaveAsTemplate(templateData: any) {
	try {
		await saveFormAsTemplate({
			title: templateData.title,
			description: templateData.description,
			submitLabel: templateData.submitLabel,
			fields: templateData.fields,
			category: templateData.category || "custom",
			tags: templateData.tags || ["custom", "user-created"]
		});

		// Reload templates to update the list
		await loadTemplates();

		toast.add({
			title: "Template Saved",
			description: `"${templateData.title}" has been saved and can be used for automation`,
			color: "success"
		});
	} catch (err: any) {
		toast.add({
			title: "Error",
			description: err.message || "Failed to save template",
			color: "error"
		});
	}
}

async function handleGenerate(formData: { html: string; css: string; json: any }) {
	// Save as template when generating
	try {
		await saveFormAsTemplate({
			title: formData.json.title,
			description: formData.json.description || "",
			submitLabel: formData.json.submitLabel || "Submit",
			fields: formData.json.fields || [],
			category: "custom",
			tags: ["custom", "user-created"]
		});
		
		// Reload templates to update the list
		await loadTemplates();
	} catch (err) {
		console.error("Failed to save form as template:", err);
	}
	
	emit("save", formData);
	isOpen.value = false;
}

function handlePreview(_formData: any) {
	// Preview functionality can be implemented later
	toast.add({
		title: "Preview",
		description: "Preview functionality coming soon",
		color: "info"
	});
}

function handleOpenChange(value: boolean) {
	isOpen.value = value;
	if (!value) {
		emit("cancel");
	}
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
