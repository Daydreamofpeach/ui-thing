<template>
	<div class="modal-overlay" @click="handleOverlayClick">
		<div class="modal-content" @click.stop>
			<div class="modal-header">
				<h3 class="modal-title">
					Configure {{ node?.data?.type || "Node" }}
				</h3>
				<button class="close-button" @click="close">
					<Icon name="lucide:x" class="w-4 h-4" />
				</button>
			</div>

			<div class="modal-body">
				<div class="form-group">
					<label class="form-label">Node Name</label>
					<input
						v-model="nodeData.name"
						type="text"
						class="form-input"
						placeholder="Enter node name"
					/>
				</div>

				<div class="form-group">
					<label class="form-label">Description</label>
					<textarea
						v-model="nodeData.description"
						rows="3"
						class="form-textarea"
						placeholder="Enter node description"
					></textarea>
				</div>

				<!-- Node-specific configuration -->
				<div v-if="node?.data?.type === 'hook'" class="form-group">
					<label class="form-label">Hook Type</label>
					<select v-model="nodeData.hookType" class="form-select">
						<option value="before">Before</option>
						<option value="after">After</option>
						<option value="error">Error</option>
						<option value="success">Success</option>
					</select>
				</div>

				<div v-if="node?.data?.type === 'transport'" class="form-group">
					<label class="form-label">Transport Type</label>
					<select v-model="nodeData.transportType" class="form-select">
						<option value="http">HTTP</option>
						<option value="websocket">WebSocket</option>
						<option value="grpc">gRPC</option>
					</select>
				</div>

				<div v-if="node?.data?.type === 'template'" class="form-group">
					<label class="form-label">Template Type</label>
					<select v-model="nodeData.templateType" class="form-select">
						<option value="component">Component</option>
						<option value="page">Page</option>
						<option value="layout">Layout</option>
					</select>
				</div>
			</div>

			<div class="modal-footer">
				<button class="btn-secondary" @click="close">
					Cancel
				</button>
				<button class="btn-primary" @click="save">
					Save Changes
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { ref, watch } from "vue";

	interface Props {
		node: any;
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		close: [];
		save: [nodeData: any];
	}>();

	const nodeData = ref({
		name: "",
		description: "",
		hookType: "before",
		transportType: "http",
		templateType: "component"
	});

	// Watch for node changes and update form data
	watch(() => props.node, (newNode) => {
		if (newNode) {
			nodeData.value = {
				name: newNode.data?.name || "",
				description: newNode.data?.description || "",
				hookType: newNode.data?.hookType || "before",
				transportType: newNode.data?.transportType || "http",
				templateType: newNode.data?.templateType || "component"
			};
		}
	}, { immediate: true });

	const close = () => {
		emit("close");
	};

	const save = () => {
		emit("save", nodeData.value);
	};

	const handleOverlayClick = () => {
		close();
	};
</script>

<style scoped>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
	}

	.modal-content {
		background: white;
		border-radius: 12px;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-title {
		font-size: 18px;
		font-weight: 600;
		color: #111827;
		margin: 0;
	}

	.close-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.close-button:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.modal-body {
		padding: 24px;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-label {
		display: block;
		font-size: 14px;
		font-weight: 500;
		color: #374151;
		margin-bottom: 6px;
	}

	.form-input,
	.form-textarea,
	.form-select {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 14px;
		transition: border-color 0.2s ease;
	}

	.form-input:focus,
	.form-textarea:focus,
	.form-select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-textarea {
		resize: vertical;
		min-height: 80px;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		padding: 20px 24px;
		border-top: 1px solid #e5e7eb;
	}

	.btn-secondary {
		padding: 10px 20px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: white;
		color: #374151;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-secondary:hover {
		background: #f9fafb;
		border-color: #9ca3af;
	}

	.btn-primary {
		padding: 10px 20px;
		border: none;
		border-radius: 6px;
		background: #3b82f6;
		color: white;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-primary:hover {
		background: #2563eb;
	}
</style>
