<template>
	<div class="form-automation-controller space-y-6">
		<!-- Template Selection Section -->
		<FormTemplateSelector
			v-model:selected-templates="selectedFormTemplates"
			v-model:creation-mode="formCreationMode"
			@automate="handleAutomate"
			@mode-changed="handleModeChanged"
			@create-new="handleCreateNew"
		/>

		<!-- Form Automation Dialog -->
		<FormAutomationDialog
			v-model:open="showAutomationDialog"
			:template="currentTemplate"
			@save="handleFormGenerated"
			@cancel="showAutomationDialog = false"
		/>

		<!-- Generated Forms Display -->
		<GeneratedFormsList
			v-if="generatedForms.length > 0"
			:forms="generatedForms"
			@form-selected="handleFormSelected"
			@preview-with-chain="handlePreviewWithChain"
			@attach-hook="handleAttachHook"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useToast } from "~/components/Ui/composables/useToast";
import FormTemplateSelector from "./FormTemplateSelector.vue";
import GeneratedFormsList from "./GeneratedFormsList.vue";
import FormAutomationDialog from "./FormAutomationDialog.vue";

interface Form {
	id: string
	title?: string
	description?: string
	createdAt?: string
	json?: any
	html?: string
	css?: string
	fields?: any[]
	lastModified?: string
}

interface Props {
	forms?: Form[]
}

const props = withDefaults(defineProps<Props>(), {
	forms: () => []
});

const emit = defineEmits<{
	refreshForms: []
	formSelected: [form: Form]
	createForm: []
	attachHook: [form: Form]
	addFormBuilderNode: []
}>();

const toast = useToast();

// Form automation state
const selectedFormTemplates = ref<Array<any>>([]);
const formCreationMode = ref<"automated" | "instant">("automated");
const showAutomationDialog = ref(false);
const currentTemplate = ref<any>(null);

// Generated forms from automation - combines props and internal state
const internalGeneratedForms = ref<Array<{
	id: string
	title: string
	description: string
	icon: string
	fields?: any[]
	lastModified: string
	html?: string
	css?: string
	json?: any
}>>([]);

// Computed to combine prop forms and internally generated forms
const generatedForms = computed(() => {
	const propForms = props.forms || [];
	const combined = [...propForms, ...internalGeneratedForms.value];

	// Deduplicate by ID
	const uniqueForms = combined.reduce((acc, form) => {
		if (!acc.find((f: any) => f.id === form.id)) {
			acc.push(form);
		}
		return acc;
	}, [] as any[]);

	return uniqueForms;
});

// Automate selected templates based on creation mode
const handleAutomate = async () => {
	if (selectedFormTemplates.value.length === 0) {
		toast.add({
			title: "No Templates Selected",
			description: "Please select at least one template to automate",
			color: "warning"
		});
		return;
	}

	try {
		// Instant creation path: generate form artifacts locally and add to list
		if (formCreationMode.value === "instant") {
			const created: any[] = [];
			for (let i = 0; i < selectedFormTemplates.value.length; i++) {
				const template = selectedFormTemplates.value[i];
				const html = generateSimpleFormHtml(template);
				const css = defaultFormCss();
				const json = {
					id: `${template.id}-${Date.now()}-${i}`,
					title: template.title,
					description: template.description,
					submitLabel: template.submitLabel,
					fields: template.fields
				};
				created.push({ 
					id: json.id, 
					title: json.title, 
					description: json.description, 
					html, 
					css, 
					json, 
					lastModified: "Just now", 
					fields: json.fields 
				});
			}
			if (created.length) {
				internalGeneratedForms.value = [...created, ...internalGeneratedForms.value];
				localStorage.setItem("generatedForms", JSON.stringify(internalGeneratedForms.value));
				toast.add({ 
					title: "Forms Created", 
					description: `Created ${created.length} form(s) instantly`, 
					color: "success" 
				});
			}
			selectedFormTemplates.value = [];
			return;
		}

		// Automated path: open dialog with form builder
		if (formCreationMode.value === "automated") {
			// Open dialog for first selected template
			if (selectedFormTemplates.value.length > 0) {
				currentTemplate.value = selectedFormTemplates.value[0];
				showAutomationDialog.value = true;
				// If multiple templates selected, we'll process them one by one
				if (selectedFormTemplates.value.length > 1) {
					toast.add({
						title: "Multiple Templates",
						description: `Opening automation for ${selectedFormTemplates.value[0].title}. Other templates will be processed after this one.`,
						color: "info"
					});
				}
			}
			return;
		}

		selectedFormTemplates.value = [];
	} catch (error) {
		toast.add({
			title: "Automation Error",
			description: "Failed to start automation process",
			color: "error"
		});
		console.error("Automation error:", error);
	}
};

// Form generation helpers
function generateSimpleFormHtml(t: any): string {
	const fieldsHtml = (t.fields || []).map((f: any) => fieldToHtml(f)).join("\n");
	return `\n<form class="buildit-form">\n  <h2>${escapeHtml(t.title || "Generated Form")}</h2>\n  <p class="desc">${escapeHtml(t.description || "")}</p>\n  ${fieldsHtml}\n  <button type="submit" class="btn">${escapeHtml(t.submitLabel || "Submit")}</button>\n</form>\n`;
}

function fieldToHtml(f: any): string {
	const name = escapeHtml(f.name || f.label || "field");
	const label = escapeHtml(f.label || name);
	const placeholder = escapeHtml(f.placeholder || "");
	const required = f.required ? " required" : "";
	switch ((f.type || "text").toLowerCase()) {
	case "textarea":
		return `<label>${label}<textarea name="${name}" placeholder="${placeholder}"${required}></textarea></label>`;
	case "select":
		return `<label>${label}<select name="${name}"${required}>${(f.options || []).map((o: any) => `<option value="${escapeHtml(o.value || "")}">${escapeHtml(o.label || o.value || "")}</option>`).join("")}</select></label>`;
	case "checkbox":
		return `<label><input type="checkbox" name="${name}"${required}/> ${label}</label>`;
	case "radio":
		return `<fieldset><legend>${label}</legend>${(f.options || []).map((o: any, i: number) => `<label><input type="radio" name="${name}" value="${escapeHtml(o.value || String(i))}"${required}/> ${escapeHtml(o.label || o.value || String(i))}</label>`).join(" ")}</fieldset>`;
	case "email":
		return `<label>${label}<input type="email" name="${name}" placeholder="${placeholder}"${required}/></label>`;
	case "number":
		return `<label>${label}<input type="number" name="${name}" placeholder="${placeholder}"${required}/></label>`;
	case "password":
		return `<label>${label}<input type="password" name="${name}" placeholder="${placeholder}"${required}/></label>`;
	case "date":
		return `<label>${label}<input type="date" name="${name}"${required}/></label>`;
	default:
		return `<label>${label}<input type="text" name="${name}" placeholder="${placeholder}"${required}/></label>`;
	}
}

function defaultFormCss(): string {
	return `.buildit-form{display:flex;flex-direction:column;gap:.75rem}.buildit-form h2{margin:0}.buildit-form .desc{opacity:.8}.buildit-form label{display:flex;flex-direction:column;gap:.25rem}.buildit-form input,.buildit-form select,.buildit-form textarea{padding:.5rem;border:1px solid #ccc;border-radius:.375rem;background:rgba(255,255,255,.9)}.buildit-form .btn{padding:.5rem .75rem;border:1px solid #3b82f6;background:#3b82f6;color:#fff;border-radius:.375rem}`;
}

function escapeHtml(s: string): string {
	return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Handle form selection
const handleFormSelected = (form: Form) => {
	console.log("🔍 FormAutomationController: Form selected:", form);
	emit("formSelected", form);
};

// Preview form with full submission chain (Browser → Hook → Transport)
const handlePreviewWithChain = (form: Form) => {
	console.log("🔗 FormAutomationController: Preview with chain called for:", form);

	// First emit form preview (creates browser node)
	emit("formSelected", form);
	console.log("✅ FormAutomationController: formSelected emitted");

	// Then immediately emit hook attachment (creates hook + transport chain)
	setTimeout(() => {
		emit("attachHook", form);
		console.log("✅ FormAutomationController: attachHook emitted");
	}, 100);
};

// Attach hook to form
const handleAttachHook = (form: Form) => {
	console.log("🪝 FormAutomationController: Attaching hook to form:", form);
	emit("attachHook", form);
};

// Handle mode change
const handleModeChanged = (mode: "automated" | "instant") => {
	console.log("🔄 FormAutomationController: Mode changed to:", mode);
	formCreationMode.value = mode;
};

// Handle create new form (adds form builder node to canvas)
const handleCreateNew = () => {
	console.log("➕ FormAutomationController: Create new form requested - adding form builder node");
	emit("addFormBuilderNode");
};

// Handle form generated from dialog
const handleFormGenerated = async (formData: { html: string; css: string; json: any }) => {
	console.log("✅ FormAutomationController: Form generated from dialog:", formData);
	
	// Add to internal generated forms
	internalGeneratedForms.value.unshift({
		id: formData.json.id,
		title: formData.json.title,
		description: formData.json.description || "Automatically generated form",
		icon: "i-lucide-file-text",
		fields: formData.json.fields || [],
		lastModified: "Just now",
		html: formData.html,
		css: formData.css,
		json: formData.json
	});

	// Save to localStorage
	localStorage.setItem("generatedForms", JSON.stringify(internalGeneratedForms.value));

	toast.add({
		title: "Form Generated",
		description: `Successfully created "${formData.json.title}" with ${formData.json.fields.length} fields`,
		color: "success"
	});

	// Reload templates to show the newly created form template in the list
	// This will be handled by FormTemplateSelector's onMounted, but we can trigger a refresh
	emit("refreshForms");

	// Process next template if any
	if (selectedFormTemplates.value.length > 1) {
		selectedFormTemplates.value.shift(); // Remove processed template
		currentTemplate.value = selectedFormTemplates.value[0];
		// Open dialog for next template after a short delay
		setTimeout(() => {
			showAutomationDialog.value = true;
		}, 500);
	} else {
		selectedFormTemplates.value = [];
		currentTemplate.value = null;
	}
};

// Listen for forms created by automation
const listenForCreatedForms = () => {
	if (typeof window !== "undefined" && (window as any).__TAURI__) {
		import("@tauri-apps/api/event").then(({ listen }) => {
			listen("forms:created", (event) => {
				console.log("📝 Forms created event received:", event);
				const { forms } = event.payload as any;

				if (forms && Array.isArray(forms)) {
					forms.forEach((form: any) => {
						const existingIndex = internalGeneratedForms.value.findIndex((f) => f.id === form.id);
						if (existingIndex === -1) {
							internalGeneratedForms.value.unshift({
								id: form.id,
								title: form.title || form.json?.title || "Generated Form",
								description: form.json?.description || "Automatically generated form",
								icon: "i-lucide-file-text",
								fields: form.json?.fields?.map((f: any) => f.label || f.name) || [],
								lastModified: "Just now",
								html: form.html,
								css: form.css,
								json: form.json
							});
						}
					});

					toast.add({
						title: "Forms Generated",
						description: `Successfully created ${forms.length} form(s) with artifacts`,
						color: "success"
					});
				}
			});
		}).catch((error) => {
			console.error("Failed to set up forms listener:", error);
		});
	}
};

// Initialize
onMounted(() => {
	listenForCreatedForms();

	// Load existing forms from localStorage
	try {
		const stored = localStorage.getItem("generatedForms");
		if (stored) {
			internalGeneratedForms.value = JSON.parse(stored);
		}
	} catch (error) {
		console.error("Failed to load generated forms:", error);
	}

	// Log initial state
	console.log("📝 FormAutomationController mounted:");
	console.log("  - Props forms:", props.forms?.length || 0);
	console.log("  - Internal forms:", internalGeneratedForms.value.length);
	console.log("  - Total combined:", generatedForms.value.length);
});
</script>

<style scoped>
.form-automation-controller {
	padding: 1.5rem;
	width: 100%;
}
</style>

