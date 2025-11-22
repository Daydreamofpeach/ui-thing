<template>
	<div v-if="customNodeProps" class="enhanced-node form-builder-node">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />

		<!-- Resizer -->
		<NodeResizer v-if="customNodeProps.selected" :min-width="1000" :min-height="800" />

		<!-- Node Header -->
		<div class="node-header">
			<div class="flex items-center gap-2">
				<Icon name="lucide:wand-2" class="w-4 h-4 text-primary" />
				<h3 class="text-sm font-semibold text-primary">
					{{ customNodeProps.data?.label || 'Form Builder' }}
				</h3>
			</div>
			<div class="flex items-center gap-1">
				<div class="w-2 h-2 rounded-full bg-primary" />
				<span class="text-xs text-primary/70">Active</span>
			</div>
		</div>

		<!-- Form Builder Content Container -->
		<div class="form-builder-container">
			<ComprehensiveFormBuilder
				@save-as-template="handleSaveAsTemplate"
				@generate="handleGenerate"
				@preview="handlePreview"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import { NodeResizer } from "@vue-flow/node-resizer";
import ComprehensiveFormBuilder from "../../TemplatePanels/ComprehensiveFormBuilder.vue";
import { useFormTemplateManagement } from "~/composables/useFormTemplateManagement";
import { useToast } from "~/components/Ui/composables/useToast";

interface Props {
	customNodeProps: any
	updateNodeData?: (nodeId: string, key: string, value: any) => void
	"create-automation-node"?: (templateData: any, position?: { x: number; y: number }) => void
	"create-form-preview"?: (form: any, parentNodeId: string) => void
}

const props = defineProps<Props>();
const toast = useToast();
const { saveFormAsTemplate, loadTemplates, getTemplateById } = useFormTemplateManagement();

async function handleSaveAsTemplate(templateData: any) {
	try {
		const createdTemplate = await saveFormAsTemplate({
			title: templateData.title,
			description: templateData.description,
			submitLabel: templateData.submitLabel,
			fields: templateData.fields,
			category: templateData.category || "custom",
			tags: templateData.tags || ["custom", "user-created"]
		});

		// Reload templates to update the list
		await loadTemplates();

		// Get the full template with automation steps
		const fullTemplate = createdTemplate?.id ? await getTemplateById(createdTemplate.id) : null;

		toast.add({
			title: "Template Saved",
			description: `"${templateData.title}" has been saved and can be used for automation`,
			color: "success"
		});

		// Create automation node instead of opening modal
		if (props["create-automation-node"] && fullTemplate) {
			const formBuilderPosition = props.customNodeProps?.position || { x: 0, y: 0 };
			const automationPosition = {
				x: formBuilderPosition.x + 1100,
				y: formBuilderPosition.y
			};
			props["create-automation-node"](fullTemplate, automationPosition);
		}
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
		const createdTemplate = await saveFormAsTemplate({
			title: formData.json.title,
			description: formData.json.description || "",
			submitLabel: formData.json.submitLabel || "Submit",
			fields: formData.json.fields || [],
			category: "custom",
			tags: ["custom", "user-created"]
		});
		
		// Reload templates to update the list
		await loadTemplates();

		// Get the full template with automation steps
		const fullTemplate = createdTemplate?.id ? await getTemplateById(createdTemplate.id) : null;
		
		toast.add({
			title: "Form Generated",
			description: `"${formData.json.title}" has been created and saved as a template`,
			color: "success"
		});

		// Create automation node instead of opening modal
		if (props["create-automation-node"] && fullTemplate) {
			const formBuilderPosition = props.customNodeProps?.position || { x: 0, y: 0 };
			const automationPosition = {
				x: formBuilderPosition.x + 1100,
				y: formBuilderPosition.y
			};
			props["create-automation-node"](fullTemplate, automationPosition);
		}
	} catch (err) {
		console.error("Failed to save form as template:", err);
		toast.add({
			title: "Error",
			description: "Failed to save form as template",
			color: "error"
		});
	}
}

async function handlePreview(formData: any) {
	// Use existing browser node preview method - same as FormsPanelNode
	if (props["create-form-preview"]) {
		try {
			// Generate the actual HTML content using the same generator as FormsPanelNode
			const { generateFormPreviewHtml } = await import("~/utils/formPreviewGenerator");
			
			// Create form data object for the generator
			const formForPreview = {
				id: `form-preview-${Date.now()}`,
				title: formData.title || "Form Preview",
				description: formData.description || "",
				html: generateFormHtml(formData), // Generate form HTML from form data
				css: generateFormCss(), // Get CSS
				json: formData // Include full JSON for fallback
			};
			
			const htmlContent = generateFormPreviewHtml(formForPreview);
			console.log("📝 Generated HTML content for preview, length:", htmlContent.length);
			
			// For production builds, serve HTML content through localhost
			// For development/iframes, use data URL (works in development)
			let finalUrl: string;
			if (typeof window !== "undefined" && (window as any).__TAURI__) {
				// Production: Use localhost server
				const { localhostHtmlServer } = await import("~/utils/localhostHtmlServer");
				finalUrl = localhostHtmlServer.serveHtmlContent(htmlContent);
				console.log("📝 Created localhost URL for production build");
			} else {
				// Development: Use data URL for iframes
				finalUrl = `data:text/html;base64,${btoa(unescape(encodeURIComponent(htmlContent)))}`;
				console.log("📝 Created data URL for development iframe");
			}
			
			// Create browser node data - CRITICAL: Store actual HTML content!
			const browserNodeData = {
				id: `browser-preview-${formForPreview.id}-${Date.now()}`,
				label: `Preview: ${formForPreview.title}`,
				url: finalUrl,  // Use localhost URL for production, data URL for development
				htmlContent: htmlContent,  // CRITICAL: Store actual HTML for viewport spawning and saving
				formHtml: formForPreview.html || "",  // Store form HTML separately
				formCss: formForPreview.css || "",    // Store CSS separately
				formTitle: formForPreview.title || "",
				formId: formForPreview.id,
				status: "loaded",
				isFormPreview: true
			};
			
			// Call parent to create the browser node
			props["create-form-preview"](browserNodeData, props.customNodeProps.id);
			
			toast.add({
				title: "Preview Created",
				description: "Form preview opened in browser node",
				color: "success"
			});
		} catch (error) {
			console.error("❌ Error creating form preview node:", error);
			toast.add({
				title: "Error",
				description: "Failed to create form preview",
				color: "error"
			});
		}
	} else {
		toast.add({
			title: "Preview",
			description: "Preview handler not available. Please ensure the canvas is properly initialized.",
			color: "warning"
		});
	}
}

function generateFormHtml(formData: any): string {
	// Generate just the form HTML (not the full preview page)
	// generateFormPreviewHtml will wrap it in the full preview page structure
	const fieldsHtml = (formData.fields || []).map((f: any) => fieldToHtml(f)).join("\n");
	const formTitle = escapeHtml(formData.title || "Generated Form");
	const formDesc = escapeHtml(formData.description || "");
	const submitLabel = escapeHtml(formData.submitLabel || "Submit");
	
	// Return just the form HTML - generateFormPreviewHtml will add the wrapper, header, and scripts
	return `<form class="buildit-form">
  <h2>${formTitle}</h2>
  <p class="desc">${formDesc}</p>
  ${fieldsHtml}
  <button type="submit" class="btn">${submitLabel}</button>
</form>`;
}

function fieldToHtml(field: any): string {
	const name = escapeHtml(field.name || "field");
	const label = escapeHtml(field.label || name);
	const placeholder = escapeHtml(field.placeholder || "");
	const required = field.required ? " required" : "";
	const variant = field.variant || field.type || "Input";
	
	switch (variant) {
	case "Textarea":
		return `<label>${label}<textarea name="${name}" placeholder="${placeholder}"${required}></textarea></label>`;
	case "Select":
	case "MultiSelect":
		const multiple = variant === "MultiSelect" ? " multiple" : "";
		const options = (field.options || []).map((o: any) => {
			const optValue = escapeHtml(o.value || o.label || o || "");
			const optLabel = escapeHtml(o.label || o.value || o || "");
			return `<option value="${optValue}">${optLabel}</option>`;
		}).join("");
		return `<label>${label}<select name="${name}"${required}${multiple}>${options}</select></label>`;
	case "Checkbox":
		return `<label><input type="checkbox" name="${name}"${required}/> ${label}</label>`;
	case "RadioGroup":
		const radioOptions = (field.options || []).map((o: any, i: number) => {
			const optValue = escapeHtml(o.value || o.label || o || String(i));
			const optLabel = escapeHtml(o.label || o.value || o || String(i));
			return `<label><input type="radio" name="${name}" value="${optValue}"${required}/> ${optLabel}</label>`;
		}).join(" ");
		return `<fieldset><legend>${label}</legend>${radioOptions}</fieldset>`;
	default:
		const inputType = field.type || "text";
		return `<label>${label}<input type="${inputType}" name="${name}" placeholder="${placeholder}"${required}/></label>`;
	}
}

function generateFormCss(): string {
	return `body {
	margin: 0;
	padding: 20px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	min-height: 100vh;
}

.preview-container {
	max-width: 800px;
	margin: 0 auto;
	background: white;
	border-radius: 12px;
	padding: 40px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.preview-header {
	text-align: center;
	margin-bottom: 32px;
	padding-bottom: 24px;
	border-bottom: 2px solid #e2e8f0;
}

.preview-header h1 {
	margin: 0 0 12px 0;
	font-size: 32px;
	font-weight: 700;
	color: #1a202c;
}

.preview-header p {
	margin: 0 0 16px 0;
	font-size: 16px;
	color: #718096;
}

.preview-badge {
	display: inline-block;
	padding: 6px 12px;
	background: #48bb78;
	color: white;
	border-radius: 20px;
	font-size: 12px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.buildit-form {
	display: flex;
	flex-direction: column;
	gap: 24px;
}

.buildit-form h2 {
	display: none;
}

.buildit-form .desc {
	display: none;
}

.buildit-form label {
	display: flex;
	flex-direction: column;
	gap: 8px;
	font-size: 14px;
	font-weight: 600;
	color: #2d3748;
}

.buildit-form input,
.buildit-form select,
.buildit-form textarea {
	padding: 12px 16px;
	border: 2px solid #e2e8f0;
	border-radius: 8px;
	background: #f7fafc;
	font-size: 14px;
	color: #2d3748;
	transition: all 0.2s ease;
	font-family: inherit;
}

.buildit-form input:focus,
.buildit-form select:focus,
.buildit-form textarea:focus {
	outline: none;
	border-color: #667eea;
	background: white;
	box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.buildit-form input:hover,
.buildit-form select:hover,
.buildit-form textarea:hover {
	border-color: #cbd5e0;
}

.buildit-form textarea {
	min-height: 120px;
	resize: vertical;
}

.buildit-form input[type="checkbox"],
.buildit-form input[type="radio"] {
	width: auto;
	margin-right: 8px;
	cursor: pointer;
}

.buildit-form fieldset {
	border: 2px solid #e2e8f0;
	border-radius: 8px;
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.buildit-form legend {
	padding: 0 8px;
	font-weight: 600;
	color: #2d3748;
}

.buildit-form .btn {
	padding: 16px 32px;
	border: none;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	border-radius: 8px;
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	margin-top: 8px;
}

.buildit-form .btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.buildit-form .btn:active {
	transform: translateY(0);
}

.success-message {
	display: none;
	background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
	color: white;
	padding: 20px;
	border-radius: 8px;
	margin-top: 24px;
	text-align: center;
	font-weight: 600;
	animation: slideIn 0.3s ease-out;
	box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.success-message.show {
	display: block;
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}`;
}

function escapeHtml(s: string): string {
	if (!s) return "";
	const div = document.createElement("div");
	div.textContent = s;
	return div.innerHTML;
}
</script>

<style scoped>
.form-builder-node {
	min-width: 1000px;
	min-height: 800px;
	background: rgba(var(--color-neutral-rgb), 0.08);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(var(--color-primary-rgb), 0.3);
	border-radius: 12px;
	padding: 16px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	transition: all 0.2s ease;
	position: relative;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.form-builder-node:hover {
	background: rgba(var(--color-neutral-rgb), 0.12);
	border-color: rgba(var(--color-primary-rgb), 0.4);
	transform: translateY(-2px);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.form-builder-node.selected {
	border-color: rgba(var(--color-primary-rgb), 0.6);
	box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
}

.node-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
	padding-bottom: 8px;
	border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.2);
}

.form-builder-container {
	flex: 1;
	overflow: hidden;
	min-height: 0;
	max-height: calc(100% - 60px);
	position: relative;
}

.connection-handle {
	width: 8px;
	height: 8px;
	background: rgba(var(--color-primary-rgb), 0.8);
	border: 2px solid rgba(255, 255, 255, 0.9);
	border-radius: 50%;
	transition: all 0.2s ease;
}

.connection-handle:hover {
	background: rgba(var(--color-primary-rgb), 1);
	transform: scale(1.2);
}
</style>

