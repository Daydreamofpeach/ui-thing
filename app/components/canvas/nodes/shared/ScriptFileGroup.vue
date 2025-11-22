<template>
	<div class="script-file-group">
		<div class="file-header" @click="toggleExpanded">
			<Icon
				:name="isExpanded ? 'lucide:chevron-down' : 'lucide:chevron-right'"
				class="w-3 h-3 chevron-icon"
			/>
			<Icon :name="getFileIcon()" class="w-4 h-4 file-icon" />
			<span class="file-name">{{ fileName }}</span>
			<span class="script-count">{{ scripts.length }} scripts</span>
		</div>

		<div v-if="isExpanded" class="scripts-list">
			<div
				v-for="(script, index) in sortedScripts"
				:key="`${fileName}-${script.name}-${index}`"
				class="script-item"
			>
				<div class="script-header">
					<div class="script-info">
						<div class="script-name-row">
							<span class="script-name">{{ script.name }}</span>
							<span v-if="script.order !== undefined && script.order > 0" class="script-order">
								#{{ script.order }}
							</span>
						</div>
						<span v-if="script.description" class="script-description" :title="script.description">
							{{ script.description }}
						</span>
						<span class="script-command">{{ truncateCommand(script.command) }}</span>
					</div>
					<div class="script-actions">
						<button
							:title="`Edit ${script.name}`"
							class="action-btn edit-btn"
							@click.stop="$emit('editScript', script)"
						>
							<Icon name="lucide:pencil" class="w-3 h-3" />
						</button>
						<button
							:title="`Run ${script.name}`"
							class="action-btn run-btn"
							@click.stop="$emit('runScript', script)"
						>
							<Icon name="lucide:play" class="w-3 h-3" />
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref } from "vue";

	interface Script {
		name: string;
		command: string;
		category?: string;
		description?: string;
		order?: number;
	}

	interface Props {
		fileName: string;
		fileType: string;
		scripts: Script[];
		defaultExpanded?: boolean;
	}

	const props = withDefaults(defineProps<Props>(), {
		defaultExpanded: false
	});

	defineEmits<{
		editScript: [script: Script];
		runScript: [script: Script];
	}>();

	const isExpanded = ref(props.defaultExpanded);

	const toggleExpanded = () => {
		isExpanded.value = !isExpanded.value;
	};

	// Sort scripts by order first, then alphabetically
	const sortedScripts = computed(() => {
		return [...props.scripts].sort((a, b) => {
			const orderA = a.order || 999;
			const orderB = b.order || 999;

			if (orderA !== orderB) {
				return orderA - orderB;
			}

			return a.name.localeCompare(b.name);
		});
	});

	const getFileIcon = () => {
		switch (props.fileType) {
		case "package.json":
			return "lucide:package";
		case "amplify.yaml":
			return "lucide:cloud";
		case "vercel.json":
			return "lucide:triangle";
		case "netlify.toml":
			return "lucide:hexagon";
		case "firebase.json":
			return "lucide:flame";
		case "azure-pipelines.yml":
			return "lucide:git-branch";
		default:
			return "lucide:file-code";
		}
	};

	const truncateCommand = (command: string) => {
		if (command.length > 60) {
			return `${command.substring(0, 60)}...`;
		}
		return command;
	};
</script>

<style scoped>
.script-file-group {
	margin-bottom: 0.5rem;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.375rem;
	background: rgba(0, 0, 0, 0.2);
	overflow: hidden;
}

.file-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.625rem 0.75rem;
	cursor: pointer;
	transition: all 0.2s ease;
	background: rgba(255, 255, 255, 0.03);
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.file-header:hover {
	background: rgba(255, 255, 255, 0.06);
}

.chevron-icon {
	color: rgba(255, 255, 255, 0.5);
	transition: transform 0.2s ease;
}

.file-icon {
	color: rgba(var(--color-primary-rgb), 0.8);
}

.file-name {
	font-size: 0.8125rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	flex: 1;
}

.script-count {
	font-size: 0.6875rem;
	color: rgba(255, 255, 255, 0.5);
	padding: 0.125rem 0.5rem;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 0.25rem;
}

.scripts-list {
	padding: 0.25rem;
}

.script-item {
	padding: 0.5rem 0.625rem;
	border-radius: 0.25rem;
	transition: all 0.2s ease;
	border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.script-item:last-child {
	border-bottom: none;
}

.script-item:hover {
	background: rgba(255, 255, 255, 0.05);
}

.script-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 0.5rem;
}

.script-info {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.script-name-row {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.script-name {
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
}

.script-order {
	font-size: 0.625rem;
	color: rgba(168, 85, 247, 0.9);
	background: rgba(168, 85, 247, 0.15);
	border: 1px solid rgba(168, 85, 247, 0.3);
	border-radius: 0.25rem;
	padding: 0.0625rem 0.375rem;
	font-weight: 700;
}

.script-description {
	font-size: 0.6875rem;
	color: rgba(255, 255, 255, 0.6);
	font-style: italic;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	padding-left: 0.125rem;
	border-left: 2px solid rgba(168, 85, 247, 0.4);
}

.script-command {
	font-size: 0.6875rem;
	font-family: monospace;
	color: rgba(255, 255, 255, 0.5);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.script-actions {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	flex-shrink: 0;
}

.action-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border-radius: 0.25rem;
	border: 1px solid rgba(255, 255, 255, 0.1);
	background: rgba(255, 255, 255, 0.05);
	color: rgba(255, 255, 255, 0.7);
	cursor: pointer;
	transition: all 0.2s ease;
}

.action-btn:hover {
	transform: scale(1.1);
}

.edit-btn:hover {
	background: rgba(168, 85, 247, 0.2);
	border-color: rgba(168, 85, 247, 0.4);
	color: rgba(168, 85, 247, 1);
}

.run-btn:hover {
	background: rgba(34, 197, 94, 0.2);
	border-color: rgba(34, 197, 94, 0.4);
	color: rgba(34, 197, 94, 1);
}
</style>
