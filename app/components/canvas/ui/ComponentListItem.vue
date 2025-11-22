<template>
	<div class="component-item-wrapper" :class="{ expanded: isExpanded }">
		<!-- Compact Header -->
		<div
			class="component-item-compact"
			:class="{ expanded: isExpanded }"
			@click="toggleExpanded"
		>
			<div class="compact-content">
				<div class="component-type-icon" :class="typeClass">
					<UIcon :name="icon" class="size-3" />
				</div>
				<div class="compact-info">
					<div class="compact-name">
						{{ displayName }}
					</div>
					<div v-if="typeBadge" class="compact-type">
						{{ typeBadge }}
					</div>
				</div>
			</div>
			<button
				class="add-button-compact"
				:title="`Add ${displayName} to canvas`"
				@click.stop="handleAdd"
			>
				<UIcon name="i-lucide-plus" class="size-4" />
			</button>
		</div>

		<!-- Expanded Details -->
		<div v-if="isExpanded" class="component-expanded-details">
			<!-- Edit Mode -->
			<div v-if="isEditing" class="expanded-info">
				<div v-for="field in editableFields" :key="field.key" class="edit-field">
					<label>{{ field.label }}</label>
					<input
						v-model="editFormData[field.key]"
						type="text"
						class="edit-input"
						:placeholder="field.placeholder"
					>
				</div>
				<div class="expanded-actions">
					<button class="action-btn edit-btn save-btn" @click.stop="handleSave">
						<UIcon name="i-lucide-save" class="size-3" />
						Save
					</button>
					<button class="action-btn cancel-btn" @click.stop="handleCancelEdit">
						<UIcon name="i-lucide-x" class="size-3" />
						Cancel
					</button>
					<button class="action-btn delete-btn" @click.stop="handleDelete">
						<UIcon name="i-lucide-trash-2" class="size-3" />
						Delete
					</button>
				</div>
			</div>

			<!-- View Mode -->
			<div v-else class="expanded-info">
				<div v-for="detail in detailRows" :key="detail.label" class="info-row">
					<span class="info-label">{{ detail.label }}</span>
					<span class="info-value" :class="detail.valueClass">{{ detail.value }}</span>
				</div>
				<div class="expanded-actions">
					<button class="action-btn edit-btn" @click.stop="handleStartEdit">
						<UIcon name="i-lucide-edit-2" class="size-3" />
						Edit
					</button>
					<button class="action-btn delete-btn" @click.stop="handleDelete">
						<UIcon name="i-lucide-trash-2" class="size-3" />
						Delete
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { ComponentType } from "../composables/useComponentMetadata";
	import { computed, ref, watch } from "vue";
	import { useComponentMetadata } from "../composables/useComponentMetadata";

	interface Props {
		component: any
		componentType: ComponentType
		expanded?: boolean
		editing?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		expanded: false,
		editing: false
	});

	const emit = defineEmits<{
		add: [component: any]
		edit: [component: any, updates: any]
		delete: [component: any]
		toggleExpanded: [componentId: string]
	}>();

	const { getComponentIcon, getComponentDisplayName, getTemplateTypeClass, getTemplateTypeDisplayName } = useComponentMetadata();

	const isExpanded = ref(props.expanded);
	const isEditing = ref(props.editing);
	const editFormData = ref<any>({});

	// Computed properties
	const displayName = computed(() => getComponentDisplayName(props.component, props.componentType));
	const icon = computed(() => getComponentIcon(props.component, props.componentType));

	const typeClass = computed(() => {
		if (props.componentType === "template" && props.component.template?.type) {
			return getTemplateTypeClass(props.component.template.type);
		}
		return `component-${props.componentType}`;
	});

	const typeBadge = computed(() => {
		if (props.componentType === "template" && props.component.template?.type) {
			return getTemplateTypeDisplayName(props.component.template.type);
		}
		return null;
	});

	const editableFields = computed(() => {
		const common = [
			{ key: "name", label: "Name", placeholder: "Component name" },
			{ key: "description", label: "Description", placeholder: "Component description" }
		];

		switch (props.componentType) {
		case "template":
			return [
				...common,
				{ key: "template.type", label: "Type", placeholder: "Template type" }
			];
		case "solution":
			return [
				...common,
				{ key: "type", label: "Type", placeholder: "Solution type" },
				{ key: "status", label: "Status", placeholder: "Solution status" }
			];
		case "transport":
			return [
				{ key: "type", label: "Type", placeholder: "Transport type" },
				{ key: "target", label: "Target", placeholder: "Target address" }
			];
		case "hook":
			return common; // Hooks typically can't be edited
		default:
			return common;
		}
	});

	const detailRows = computed(() => {
		const rows: Array<{ label: string, value: string, valueClass?: string }> = [];

		// ID (always show)
		rows.push({ label: "ID", value: props.component.id || "N/A", valueClass: "text-xs" });

		// Description
		if (props.component.description) {
			rows.push({ label: "Description", value: props.component.description });
		}

		// Type-specific details
		switch (props.componentType) {
		case "template":
			if (props.component.template?.type) {
				rows.push({
					label: "Type",
					value: getTemplateTypeDisplayName(props.component.template.type)
				});
			}
			if (props.component.author) {
				rows.push({ label: "Author", value: props.component.author });
			}
			break;

		case "hook":
			if (props.component.type) {
				rows.push({ label: "Type", value: props.component.type });
			}
			if (props.component.priority) {
				rows.push({ label: "Priority", value: String(props.component.priority) });
			}
			if (props.component.token) {
				rows.push({
					label: "Token",
					value: `${props.component.token.substring(0, 20)}...`,
					valueClass: "text-xs font-mono"
				});
			}
			if (props.component.enabled !== undefined) {
				rows.push({
					label: "Enabled",
					value: props.component.enabled ? "Yes" : "No",
					valueClass: props.component.enabled ? "text-emerald-400" : "text-red-400"
				});
			}
			break;

		case "transport":
			if (props.component.type) {
				rows.push({ label: "Type", value: props.component.type });
			}
			if (props.component.target) {
				rows.push({
					label: "Target",
					value: props.component.target,
					valueClass: "text-xs font-mono"
				});
			}
			if (props.component.enabled !== undefined) {
				rows.push({
					label: "Enabled",
					value: props.component.enabled ? "Yes" : "No",
					valueClass: props.component.enabled ? "text-emerald-400" : "text-red-400"
				});
			}
			break;

		case "solution":
			if (props.component.type) {
				rows.push({ label: "Type", value: props.component.type });
			}
			if (props.component.status) {
				rows.push({ label: "Status", value: props.component.status });
			}
			break;
		}

		return rows;
	});

	// Methods
	const toggleExpanded = () => {
		isExpanded.value = !isExpanded.value;
		emit("toggleExpanded", props.component.id);
	};

	const handleAdd = () => {
		emit("add", props.component);
	};

	const handleStartEdit = () => {
		isEditing.value = true;
		editFormData.value = { ...props.component };
	};

	const handleCancelEdit = () => {
		isEditing.value = false;
		editFormData.value = {};
	};

	const handleSave = () => {
		emit("edit", props.component, editFormData.value);
		isEditing.value = false;
		editFormData.value = {};
	};

	const handleDelete = () => {
		emit("delete", props.component);
	};

	// Watch for external changes to expanded state
	watch(() => props.expanded, (newVal) => {
		isExpanded.value = newVal;
	});

	watch(() => props.editing, (newVal) => {
		isEditing.value = newVal;
		if (newVal) {
			editFormData.value = { ...props.component };
		}
	});
</script>

<style scoped>
	/* Styles will be in NodeCanvasRightPanel.css for consistency */
</style>
