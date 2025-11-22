<template>
	<div v-if="ide" class="ide-display-card" :style="cardStyle">
		<div class="ide-display-icon">
			<UIcon name="i-lucide-code-2" class="size-6" :style="{ color: themeColor }" />
		</div>
		<div class="ide-display-info">
			<span class="ide-display-name">{{ ide.name }}</span>
			<span v-if="cleanedVersion" class="ide-display-version">v{{ cleanedVersion }}</span>
		</div>
		<button
			v-if="showOpenButton"
			class="ide-display-action-btn"
			:style="buttonStyle"
			@click="handleOpen"
		>
			<UIcon name="i-lucide-external-link" class="size-4" />
			<span>Open</span>
		</button>
	</div>
	<div v-else class="ide-display-empty">
		<UIcon name="i-lucide-info" class="size-4 text-blue-400" />
		<p class="ide-display-empty-text">
			{{ emptyMessage }}
		</p>
	</div>
</template>

<script setup lang="ts">
	import { computed } from "vue";

	interface Props {
		ide: any
		themeColor?: string
		showOpenButton?: boolean
		emptyMessage?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		themeColor: "#10b981",
		showOpenButton: false,
		emptyMessage: "Connect an IDE in the Project Node's IDEs tab first"
	});

	const emit = defineEmits<{
		open: [ide: any]
	}>();

	// Clean version string - remove ANSI codes, Nushell errors, etc.
	const cleanedVersion = computed(() => {
		console.log("🔍 IdeDisplay: Cleaning version for", props.ide?.name);
		console.log("  Raw version:", props.ide?.version);
		
		if (!props.ide?.version) {
			console.log("  ❌ No version property found");
			return "";
		}
		
		let version = props.ide.version;
		
		// Skip if it's the fallback
		if (version === "Installed") {
			return "";
		}
		
		// Remove ANSI escape codes
		version = version.replace(/\x1B\[[0-9;]*m/g, "");
		
		// Remove Nushell errors and error messages
		version = version.replace(/Error:.*$/gm, "");
		version = version.replace(/nu::shell::.*$/gm, "");
		version = version.replace(/\[31;1m.*?\[0m/g, "");
		version = version.replace(/\[0m/g, "");
		
		// Get first line only
		version = version.split('\n')[0].trim();
		
		// If it's empty or still contains error, return nothing
		if (!version || version.toLowerCase().includes('error')) {
			console.log("  ⚠️ Version cleaned but empty or has errors");
			return "";
		}
		
		console.log("  ✅ Final cleaned version:", version);
		return version;
	});

	const cardStyle = computed(() => ({
		borderColor: `${props.themeColor}40`,
		backgroundColor: `${props.themeColor}10`
	}));

	const buttonStyle = computed(() => ({
		borderColor: `${props.themeColor}60`,
		backgroundColor: `${props.themeColor}20`,
		color: props.themeColor
	}));

	const handleOpen = () => {
		emit("open", props.ide);
	};
</script>

<style scoped>
.ide-display-card {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.875rem;
	border: 1px solid;
	border-radius: 0.5rem;
}

.ide-display-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
	height: 2.5rem;
	background: rgba(16, 185, 129, 0.15);
	border-radius: 0.5rem;
	flex-shrink: 0;
}

.ide-display-info {
	display: flex;
	flex-direction: column;
	gap: 0.125rem;
	flex: 1;
}

.ide-display-name {
	font-size: 0.9375rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
}

.ide-display-version {
	font-size: 0.75rem;
	color: rgba(156, 163, 175, 1);
}

.ide-display-version-raw {
	opacity: 0.7;
	font-style: italic;
}

.ide-display-version-placeholder {
	font-size: 0.75rem;
	color: rgba(156, 163, 175, 0.5);
	font-style: italic;
}

.ide-display-action-btn {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0.875rem;
	border: 1px solid;
	border-radius: 0.5rem;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;
}

.ide-display-action-btn:hover {
	transform: translateY(-1px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.ide-display-empty {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem;
	background: rgba(59, 130, 246, 0.1);
	border: 1px solid rgba(59, 130, 246, 0.3);
	border-radius: 0.5rem;
}

.ide-display-empty-text {
	font-size: 0.8125rem;
	color: rgba(147, 197, 253, 1);
	margin: 0;
}
</style>

