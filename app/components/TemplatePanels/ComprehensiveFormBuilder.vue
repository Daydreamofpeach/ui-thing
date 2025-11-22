<template>
	<div class="comprehensive-form-builder h-full flex flex-col bg-background">
		<!-- Beautiful Header with Gradient -->
		<div class="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
						<UIcon name="i-lucide-wand-2" class="size-6 text-primary" />
					</div>
					<div>
						<h2 class="text-2xl font-bold text-foreground">Form Builder</h2>
						<p class="text-sm text-muted-foreground mt-1">Create beautiful forms with our intuitive builder</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<UiButton variant="outline" size="sm" @click="handleSaveAsTemplate" class="gap-2">
						<UIcon name="i-lucide-save" class="size-4" />
						Save Template
					</UiButton>
					<UiButton variant="outline" size="sm" @click="handlePreview" class="gap-2">
						<UIcon name="i-lucide-eye" class="size-4" />
						Preview
					</UiButton>
					<UiButton size="sm" @click="handleGenerate" :disabled="formFields.length === 0" class="gap-2">
						<UIcon name="i-lucide-sparkles" class="size-4" />
						Generate Form
					</UiButton>
				</div>
			</div>
		</div>

		<!-- Form Configuration - Beautiful Card Design -->
		<div class="border-b bg-muted/30 p-4">
			<UiCard class="border-0 shadow-sm">
				<UiCardContent class="p-4">
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div class="space-y-2">
							<UiLabel class="text-sm font-medium flex items-center gap-2">
								<UIcon name="i-lucide-type" class="size-4" />
								Form Title
							</UiLabel>
							<UiInput 
								v-model="formConfig.title" 
								placeholder="e.g., Contact Us Form" 
								class="w-full"
							/>
						</div>
						<div class="space-y-2">
							<UiLabel class="text-sm font-medium flex items-center gap-2">
								<UIcon name="i-lucide-file-text" class="size-4" />
								Description
							</UiLabel>
							<UiInput 
								v-model="formConfig.description" 
								placeholder="Brief description of your form" 
								class="w-full"
							/>
						</div>
						<div class="space-y-2">
							<UiLabel class="text-sm font-medium flex items-center gap-2">
								<UIcon name="i-lucide-send" class="size-4" />
								Submit Label
							</UiLabel>
							<UiInput 
								v-model="formConfig.submitLabel" 
								placeholder="Submit" 
								class="w-full"
							/>
						</div>
					</div>
				</UiCardContent>
			</UiCard>
		</div>

		<!-- Main Content Area with Split View -->
		<div class="flex-1 overflow-hidden flex gap-4 p-4">
			<!-- Fields Sidebar - Beautiful Design -->
			<div class="w-80 flex-shrink-0 flex flex-col">
				<div class="flex items-center justify-between mb-4">
					<h3 class="font-semibold text-lg flex items-center gap-2">
						<UIcon name="i-lucide-list" class="size-5 text-primary" />
						Fields
						<UiBadge variant="secondary" class="ml-2">{{ formFields.length }}</UiBadge>
					</h3>
					<UiButton 
						variant="default" 
						size="sm" 
						@click="showAddFieldDialog = true"
						class="gap-2 shadow-sm"
					>
						<UIcon name="i-lucide-plus" class="size-4" />
						Add Field
					</UiButton>
				</div>

				<!-- Empty State -->
				<div v-if="formFields.length === 0" class="flex-1 flex items-center justify-center border-2 border-dashed rounded-xl bg-muted/30">
					<div class="text-center p-6">
						<UIcon name="i-lucide-file-plus" class="size-16 mx-auto mb-4 text-muted-foreground/50" />
						<p class="text-sm font-medium text-foreground mb-1">No fields yet</p>
						<p class="text-xs text-muted-foreground mb-4">Start building your form by adding fields</p>
						<UiButton variant="outline" size="sm" @click="showAddFieldDialog = true" class="gap-2">
							<UIcon name="i-lucide-plus" class="size-4" />
							Add Your First Field
						</UiButton>
					</div>
				</div>

				<!-- Fields List with Drag Handle -->
				<div v-else class="flex-1 overflow-auto space-y-2 pr-2">
						<div
							v-for="(field, index) in formFields"
							:key="field.id"
							class="group relative"
						>
							<UiCard
								class="cursor-pointer transition-all hover:shadow-md border-2"
								:class="{ 
									'border-primary bg-primary/5 shadow-md': selectedFieldIndex === index,
									'border-transparent hover:border-muted-foreground/20': selectedFieldIndex !== index
								}"
								@click="selectField(index)"
							>
								<UiCardContent class="p-4">
									<div class="flex items-start gap-3">
										<!-- Drag Handle -->
										<div class="flex flex-col gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
											<UIcon name="i-lucide-grip-vertical" class="size-4 text-muted-foreground" />
										</div>
										
										<!-- Field Icon & Info -->
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-2 mb-2">
												<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
													<UIcon :name="getFieldIcon(field.variant)" class="size-4 text-primary" />
												</div>
												<div class="flex-1 min-w-0">
													<p class="font-semibold text-sm text-foreground truncate">
														{{ field.label || 'Unnamed Field' }}
													</p>
													<p class="text-xs text-muted-foreground">{{ field.variant }}</p>
												</div>
											</div>
											
											<!-- Field Metadata -->
											<div class="flex items-center gap-2 flex-wrap mt-2">
												<UiBadge v-if="field.required" variant="outline" class="text-xs">
													Required
												</UiBadge>
												<UiBadge v-if="field.placeholder" variant="secondary" class="text-xs truncate max-w-[120px]">
													{{ field.placeholder }}
												</UiBadge>
											</div>
										</div>

										<!-- Quick Actions -->
										<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
											<UiButton
												variant="ghost"
												size="sm"
												class="h-7 w-7 p-0"
												@click.stop="moveField(index, 'up')"
												:disabled="index === 0"
											>
												<UIcon name="i-lucide-chevron-up" class="size-3" />
											</UiButton>
											<UiButton
												variant="ghost"
												size="sm"
												class="h-7 w-7 p-0"
												@click.stop="moveField(index, 'down')"
												:disabled="index === formFields.length - 1"
											>
												<UIcon name="i-lucide-chevron-down" class="size-3" />
											</UiButton>
											<UiButton
												variant="ghost"
												size="sm"
												class="h-7 w-7 p-0 text-destructive hover:text-destructive"
												@click.stop="removeField(index)"
											>
												<UIcon name="i-lucide-trash-2" class="size-3" />
											</UiButton>
										</div>
									</div>
								</UiCardContent>
							</UiCard>
						</div>
					</div>
			</div>

			<!-- Field Editor - Beautiful Design -->
			<div class="flex-1 overflow-auto">
				<div v-if="selectedFieldIndex === null" class="flex items-center justify-center h-full">
					<div class="text-center max-w-md">
						<div class="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
							<UIcon name="i-lucide-mouse-pointer-click" class="size-12 text-primary/60" />
						</div>
						<h3 class="text-xl font-semibold text-foreground mb-2">Select a Field to Edit</h3>
						<p class="text-sm text-muted-foreground">
							Click on any field from the list to configure its properties and settings
						</p>
					</div>
				</div>

				<div v-else class="max-w-3xl mx-auto space-y-6 p-6">
					<!-- Field Header -->
					<div class="flex items-center justify-between mb-6">
						<div class="flex items-center gap-4">
							<div class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
								<UIcon :name="getFieldIcon(formFields[selectedFieldIndex].variant)" class="size-6 text-primary" />
							</div>
							<div>
								<h3 class="text-xl font-bold text-foreground">
									{{ formFields[selectedFieldIndex]?.label || 'Unnamed Field' }}
								</h3>
								<p class="text-sm text-muted-foreground">Configure field properties</p>
							</div>
						</div>
						<UiButton variant="outline" size="sm" @click="selectedFieldIndex = null" class="gap-2">
							<UIcon name="i-lucide-x" class="size-4" />
							Close
						</UiButton>
					</div>

					<!-- Field Configuration Form -->
					<div class="space-y-6">
						<!-- Basic Properties -->
						<UiCard>
							<UiCardHeader>
								<UiCardTitle class="text-base flex items-center gap-2">
									<UIcon name="i-lucide-settings" class="size-4" />
									Basic Properties
								</UiCardTitle>
							</UiCardHeader>
							<UiCardContent class="space-y-4">
								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-2">
										<UiLabel>Field Type</UiLabel>
										<UiSelect v-model="formFields[selectedFieldIndex].variant">
											<UiSelectTrigger class="w-full" placeholder="Select field type">
												<UiSelectValue />
											</UiSelectTrigger>
											<UiSelectContent>
												<UiSelectItem value="Input" text="Text Input">Text Input</UiSelectItem>
												<UiSelectItem value="Textarea" text="Textarea">Textarea</UiSelectItem>
												<UiSelectItem value="Select" text="Select Dropdown">Select Dropdown</UiSelectItem>
												<UiSelectItem value="MultiSelect" text="Multi-Select">Multi-Select</UiSelectItem>
												<UiSelectItem value="Checkbox" text="Checkbox">Checkbox</UiSelectItem>
												<UiSelectItem value="RadioGroup" text="Radio Group">Radio Group</UiSelectItem>
												<UiSelectItem value="DateField" text="Date Field">Date Field</UiSelectItem>
												<UiSelectItem value="CurrencyInput" text="Currency Input">Currency Input</UiSelectItem>
												<UiSelectItem value="FileInput" text="File Input">File Input</UiSelectItem>
												<UiSelectItem value="PinInput" text="Pin Input">Pin Input</UiSelectItem>
												<UiSelectItem value="TagsInput" text="Tags Input">Tags Input</UiSelectItem>
												<UiSelectItem value="VueformSlider" text="Slider">Slider</UiSelectItem>
												<UiSelectItem value="NativeCheckbox" text="Native Checkbox">Native Checkbox</UiSelectItem>
											</UiSelectContent>
										</UiSelect>
									</div>

									<div class="space-y-2">
										<UiLabel>Input Type <span class="text-muted-foreground text-xs">(for Input fields)</span></UiLabel>
										<UiSelect 
											v-if="formFields[selectedFieldIndex].variant === 'Input'"
											v-model="formFields[selectedFieldIndex].type" 
										>
											<UiSelectTrigger class="w-full" placeholder="Select input type">
												<UiSelectValue />
											</UiSelectTrigger>
											<UiSelectContent>
												<UiSelectItem value="text" text="Text">Text</UiSelectItem>
												<UiSelectItem value="email" text="Email">Email</UiSelectItem>
												<UiSelectItem value="password" text="Password">Password</UiSelectItem>
												<UiSelectItem value="number" text="Number">Number</UiSelectItem>
												<UiSelectItem value="tel" text="Telephone">Telephone</UiSelectItem>
												<UiSelectItem value="url" text="URL">URL</UiSelectItem>
											</UiSelectContent>
										</UiSelect>
										<p v-else class="text-xs text-muted-foreground py-2">Not applicable for this field type</p>
									</div>
								</div>

								<div class="space-y-2">
									<UiLabel>Field Label <span class="text-destructive">*</span></UiLabel>
									<UiInput 
										v-model="formFields[selectedFieldIndex].label" 
										placeholder="e.g., Full Name" 
										required
									/>
								</div>

								<div class="space-y-2">
									<UiLabel>Field Name (ID) <span class="text-destructive">*</span></UiLabel>
									<UiInput 
										v-model="formFields[selectedFieldIndex].name" 
										placeholder="e.g., full_name" 
										required
									/>
									<p class="text-xs text-muted-foreground">Used as the field identifier in form submissions</p>
								</div>

								<div class="space-y-2">
									<UiLabel>Placeholder Text</UiLabel>
									<UiInput 
										v-model="formFields[selectedFieldIndex].placeholder" 
										placeholder="e.g., Enter your full name" 
									/>
								</div>

								<div class="space-y-2">
									<UiLabel>Description / Help Text</UiLabel>
									<UiTextarea 
										v-model="formFields[selectedFieldIndex].description" 
										placeholder="Helpful text shown below the field" 
										:rows="2" 
									/>
								</div>

								<div class="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
									<UiCheckbox v-model="formFields[selectedFieldIndex].required" />
									<UiLabel class="cursor-pointer">This field is required</UiLabel>
								</div>
							</UiCardContent>
						</UiCard>

						<!-- Options Configuration (for Select, RadioGroup, etc.) -->
						<UiCard v-if="needsOptions(formFields[selectedFieldIndex].variant)">
							<UiCardHeader>
								<UiCardTitle class="text-base flex items-center gap-2">
									<UIcon name="i-lucide-list" class="size-4" />
									Field Options
								</UiCardTitle>
							</UiCardHeader>
							<UiCardContent class="space-y-4">
								<UiLabel>Options (one per line)</UiLabel>
								<UiTextarea
									v-model="fieldOptionsText"
									placeholder="Option 1&#10;Option 2&#10;Option 3"
									:rows="6"
									class="font-mono text-sm"
									@update:model-value="updateFieldOptions"
								/>
								<p class="text-xs text-muted-foreground">
									Enter each option on a new line. They will be automatically formatted.
								</p>
								
								<!-- Preview of Options -->
								<div v-if="formFields[selectedFieldIndex].options?.length" class="mt-4 p-3 rounded-lg bg-muted/50">
									<p class="text-xs font-medium text-muted-foreground mb-2">Preview:</p>
									<div class="flex flex-wrap gap-2">
										<UiBadge 
											v-for="(option, idx) in formFields[selectedFieldIndex].options" 
											:key="idx"
											variant="secondary"
											class="text-xs"
										>
											{{ option.label || option.value }}
										</UiBadge>
									</div>
								</div>
							</UiCardContent>
						</UiCard>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Add Field Dialog - Beautiful Modal -->
	<UiDialog v-model:open="showAddFieldDialog">
		<UiDialogContent class="max-w-lg">
			<UiDialogHeader>
				<UiDialogTitle class="flex items-center gap-2">
					<UIcon name="i-lucide-plus-circle" class="size-5 text-primary" />
					Add New Field
				</UiDialogTitle>
				<UiDialogDescription>
					Choose a field type to add to your form
				</UiDialogDescription>
			</UiDialogHeader>

			<div class="space-y-4 py-4">
				<div class="space-y-2">
					<UiLabel>Field Type</UiLabel>
					<UiSelect :model-value="newField.variant" @update:model-value="newField.variant = $event">
						<UiSelectTrigger class="w-full" placeholder="Select field type">
							<UiSelectValue />
						</UiSelectTrigger>
						<UiSelectContent>
							<UiSelectItem value="Input" text="Text Input">Text Input</UiSelectItem>
							<UiSelectItem value="Textarea" text="Textarea">Textarea</UiSelectItem>
							<UiSelectItem value="Select" text="Select Dropdown">Select Dropdown</UiSelectItem>
							<UiSelectItem value="MultiSelect" text="Multi-Select">Multi-Select</UiSelectItem>
							<UiSelectItem value="Checkbox" text="Checkbox">Checkbox</UiSelectItem>
							<UiSelectItem value="RadioGroup" text="Radio Group">Radio Group</UiSelectItem>
							<UiSelectItem value="DateField" text="Date Field">Date Field</UiSelectItem>
							<UiSelectItem value="CurrencyInput" text="Currency Input">Currency Input</UiSelectItem>
							<UiSelectItem value="FileInput" text="File Input">File Input</UiSelectItem>
						</UiSelectContent>
					</UiSelect>
				</div>

				<div class="space-y-2">
					<UiLabel>Label <span class="text-destructive">*</span></UiLabel>
					<UiInput v-model="newField.label" placeholder="Field label" required />
				</div>

				<div class="space-y-2">
					<UiLabel>Name (ID) <span class="text-destructive">*</span></UiLabel>
					<UiInput v-model="newField.name" placeholder="field_name" required />
				</div>
			</div>

			<UiDialogFooter>
				<UiButton variant="outline" @click="showAddFieldDialog = false">Cancel</UiButton>
				<UiButton @click="addNewField" :disabled="!newField.name || !newField.label">
					<UIcon name="i-lucide-plus" class="size-4 mr-2" />
					Add Field
				</UiButton>
			</UiDialogFooter>
		</UiDialogContent>
	</UiDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { FormBuilder } from "~/components/Ui/FormBuilder/FormBuilder.vue";
import UiButton from "~/components/Ui/Button.vue";
import UiInput from "~/components/Ui/Input.vue";
import UiTextarea from "~/components/Ui/Textarea.vue";
import UiSelect from "~/components/Ui/Select/Select.vue";
import UiSelectTrigger from "~/components/Ui/Select/Trigger.vue";
import UiSelectValue from "~/components/Ui/Select/Value.vue";
import UiSelectContent from "~/components/Ui/Select/Content.vue";
import UiSelectItem from "~/components/Ui/Select/Item.vue";
import UiCheckbox from "~/components/Ui/Checkbox/Checkbox.vue";
import UiLabel from "~/components/Ui/Label.vue";
import UiCard from "~/components/Ui/Card/Card.vue";
import UiCardContent from "~/components/Ui/Card/Content.vue";
import UiCardHeader from "~/components/Ui/Card/Header.vue";
import UiCardTitle from "~/components/Ui/Card/Title.vue";
import UiBadge from "~/components/Ui/Badge.vue";
import UIcon from "~/components/Ui/Icon.vue";
import UiDialog from "~/components/Ui/Dialog/Dialog.vue";
import UiDialogContent from "~/components/Ui/Dialog/Content.vue";
import UiDialogHeader from "~/components/Ui/Dialog/Header.vue";
import UiDialogTitle from "~/components/Ui/Dialog/Title.vue";
import UiDialogDescription from "~/components/Ui/Dialog/Description.vue";
import UiDialogFooter from "~/components/Ui/Dialog/Footer.vue";

interface FormConfig {
	title: string
	description: string
	submitLabel: string
}

const emit = defineEmits<{
	"save-as-template": [formData: any]
	"generate": [formData: { html: string; css: string; json: any }]
	"preview": [formData: any]
}>();

const formConfig = ref<FormConfig>({
	title: "",
	description: "",
	submitLabel: "Submit"
});

const formFields = ref<FormBuilder[]>([]);
const selectedFieldIndex = ref<number | null>(null);
const showAddFieldDialog = ref(false);
const fieldOptionsText = ref("");

const newField = ref<Partial<FormBuilder>>({
	name: "",
	label: "",
	variant: "Input",
	placeholder: "",
	description: "",
	required: false,
	type: "text"
});

// Watch for field selection changes to update options text
watch(() => selectedFieldIndex.value, (index) => {
	if (index !== null && formFields.value[index]) {
		const field = formFields.value[index];
		if (field.options) {
			fieldOptionsText.value = field.options.map((o: any) => o.label || o.value || o).join("\n");
		} else {
			fieldOptionsText.value = "";
		}
	}
});

function needsOptions(variant: string): boolean {
	return ["Select", "MultiSelect", "RadioGroup"].includes(variant);
}

function getFieldIcon(variant: string): string {
	const iconMap: Record<string, string> = {
		Input: "i-lucide-type",
		Textarea: "i-lucide-align-left",
		Select: "i-lucide-chevron-down",
		MultiSelect: "i-lucide-list",
		Checkbox: "i-lucide-check-square",
		RadioGroup: "i-lucide-circle",
		DateField: "i-lucide-calendar",
		CurrencyInput: "i-lucide-dollar-sign",
		FileInput: "i-lucide-file",
		PinInput: "i-lucide-keypad",
		TagsInput: "i-lucide-tag",
		VueformSlider: "i-lucide-sliders-horizontal",
		NativeCheckbox: "i-lucide-square"
	};
	return iconMap[variant] || "i-lucide-type";
}

function selectField(index: number) {
	selectedFieldIndex.value = index;
}

function addNewField() {
	if (!newField.value.name || !newField.value.label) return;

	const field: FormBuilder = {
		id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		name: newField.value.name,
		label: newField.value.label,
		variant: newField.value.variant || "Input",
		placeholder: newField.value.placeholder || "",
		description: newField.value.description || "",
		required: newField.value.required || false,
		type: newField.value.type || "text"
	};

	formFields.value.push(field);
	selectedFieldIndex.value = formFields.value.length - 1;
	showAddFieldDialog.value = false;

	// Reset new field
	newField.value = {
		name: "",
		label: "",
		variant: "Input",
		placeholder: "",
		description: "",
		required: false,
		type: "text"
	};
}

function removeField(index: number) {
	formFields.value.splice(index, 1);
	if (selectedFieldIndex.value === index) {
		selectedFieldIndex.value = null;
	} else if (selectedFieldIndex.value !== null && selectedFieldIndex.value > index) {
		selectedFieldIndex.value--;
	}
}

function moveField(index: number, direction: "up" | "down") {
	const newIndex = direction === "up" ? index - 1 : index + 1;
	if (newIndex < 0 || newIndex >= formFields.value.length) return;

	const field = formFields.value.splice(index, 1)[0];
	formFields.value.splice(newIndex, 0, field);
	selectedFieldIndex.value = newIndex;
}

function updateFieldOptions() {
	if (selectedFieldIndex.value === null) return;

	const field = formFields.value[selectedFieldIndex.value];
	if (needsOptions(field.variant)) {
		field.options = fieldOptionsText.value
			.split("\n")
			.filter(line => line.trim())
			.map((line, index) => ({
				value: line.trim().toLowerCase().replace(/\s+/g, "_"),
				label: line.trim()
			}));
	}
}

function handleSaveAsTemplate() {
	const templateData = {
		id: `template_${Date.now()}`,
		title: formConfig.value.title || "Untitled Form",
		description: formConfig.value.description || "",
		submitLabel: formConfig.value.submitLabel || "Submit",
		fields: formFields.value.map((f) => ({
			label: f.label,
			name: f.name,
			type: mapVariantToType(f.variant),
			component: mapVariantToComponent(f.variant),
			required: f.required,
			placeholder: f.placeholder,
			description: f.description,
			options: f.options
		})),
		category: "custom",
		tags: ["custom", "user-created"],
		version: "1.0.0",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};

	emit("save-as-template", templateData);
}

function handleGenerate() {
	const html = generateFormHtml();
	const css = defaultFormCss();
	const json = {
		id: `form_${Date.now()}`,
		title: formConfig.value.title || "Generated Form",
		description: formConfig.value.description || "",
		submitLabel: formConfig.value.submitLabel || "Submit",
		fields: formFields.value.map((f) => ({
			name: f.name,
			label: f.label,
			type: mapVariantToType(f.variant),
			required: f.required,
			placeholder: f.placeholder,
			description: f.description,
			options: f.options
		}))
	};

	emit("generate", { html, css, json });
}

function handlePreview() {
	emit("preview", {
		title: formConfig.value.title,
		description: formConfig.value.description,
		submitLabel: formConfig.value.submitLabel,
		fields: formFields.value
	});
}

function generateFormHtml(): string {
	const fieldsHtml = formFields.value.map((f) => fieldToHtml(f)).join("\n");
	return `\n<form class="buildit-form">\n  <h2>${escapeHtml(formConfig.value.title || "Generated Form")}</h2>\n  <p class="desc">${escapeHtml(formConfig.value.description || "")}</p>\n  ${fieldsHtml}\n  <button type="submit" class="btn">${escapeHtml(formConfig.value.submitLabel || "Submit")}</button>\n</form>\n`;
}

function fieldToHtml(field: FormBuilder): string {
	const name = escapeHtml(field.name || "field");
	const label = escapeHtml(field.label || name);
	const placeholder = escapeHtml(field.placeholder || "");
	const required = field.required ? " required" : "";
	
	switch (field.variant) {
	case "Textarea":
		return `<label>${label}<textarea name="${name}" placeholder="${placeholder}"${required}></textarea></label>`;
	case "Select":
	case "MultiSelect":
		return `<label>${label}<select name="${name}"${required}${field.variant === "MultiSelect" ? " multiple" : ""}>${(field.options || []).map((o: any) => `<option value="${escapeHtml(o.value || "")}">${escapeHtml(o.label || o.value || "")}</option>`).join("")}</select></label>`;
	case "Checkbox":
		return `<label><input type="checkbox" name="${name}"${required}/> ${label}</label>`;
	case "RadioGroup":
		return `<fieldset><legend>${label}</legend>${(field.options || []).map((o: any, i: number) => `<label><input type="radio" name="${name}" value="${escapeHtml(o.value || String(i))}"${required}/> ${escapeHtml(o.label || o.value || String(i))}</label>`).join(" ")}</fieldset>`;
	default:
		const inputType = field.type || "text";
		return `<label>${label}<input type="${inputType}" name="${name}" placeholder="${placeholder}"${required}/></label>`;
	}
}

function defaultFormCss(): string {
	return `.buildit-form{display:flex;flex-direction:column;gap:.75rem}.buildit-form h2{margin:0}.buildit-form .desc{opacity:.8}.buildit-form label{display:flex;flex-direction:column;gap:.25rem}.buildit-form input,.buildit-form select,.buildit-form textarea{padding:.5rem;border:1px solid #ccc;border-radius:.375rem;background:rgba(255,255,255,.9)}.buildit-form .btn{padding:.5rem .75rem;border:1px solid #3b82f6;background:#3b82f6;color:#fff;border-radius:.375rem}`;
}

function mapVariantToType(variant: string): string {
	const variantMap: Record<string, string> = {
		Input: "text",
		Textarea: "textarea",
		Select: "select",
		MultiSelect: "select",
		Checkbox: "checkbox",
		RadioGroup: "radio",
		DateField: "date",
		CurrencyInput: "number",
		FileInput: "file"
	};
	return variantMap[variant] || "text";
}

function mapVariantToComponent(variant: string): string {
	const componentMap: Record<string, string> = {
		Input: "UiVeeInput",
		Textarea: "UiVeeTextarea",
		Select: "UiVeeSelect",
		MultiSelect: "UiVeeMultiSelect",
		Checkbox: "UiVeeCheckbox",
		RadioGroup: "UiVeeRadioGroup",
		DateField: "UiVeeDateField",
		CurrencyInput: "UiVeeCurrencyInput",
		FileInput: "UiVeeFileInput"
	};
	return componentMap[variant] || "UiVeeInput";
}

function escapeHtml(s: string): string {
	return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
</script>

<style scoped>
.comprehensive-form-builder {
	min-height: 600px;
}
</style>
