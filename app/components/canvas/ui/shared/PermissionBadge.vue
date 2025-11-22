<template>
	<div class="permission-badge" :class="[`level-${level}`, size]">
		<UIcon :name="getIcon()" class="badge-icon" />
		<span class="badge-text">{{ getText() }}</span>
	</div>
</template>

<script setup lang="ts">
	type PermissionLevel = "owner" | "admin" | "edit" | "view" | "none";
	type BadgeSize = "sm" | "md" | "lg";

	const props = withDefaults(defineProps<{
		level: PermissionLevel
		size?: BadgeSize
		customText?: string
	}>(), {
		size: "md"
	});

	const getIcon = (): string => {
		switch (props.level) {
			case "owner":
				return "i-lucide-crown";
			case "admin":
				return "i-lucide-shield-check";
			case "edit":
				return "i-lucide-pencil";
			case "view":
				return "i-lucide-eye";
			case "none":
				return "i-lucide-lock";
			default:
				return "i-lucide-user";
		}
	};

	const getText = (): string => {
		if (props.customText) return props.customText;
		
		switch (props.level) {
			case "owner":
				return "Owner";
			case "admin":
				return "Admin";
			case "edit":
				return "Can Edit";
			case "view":
				return "View Only";
			case "none":
				return "No Access";
			default:
				return "User";
		}
	};
</script>

<style scoped>
.permission-badge {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 4px 10px;
	border-radius: 12px;
	font-weight: 600;
	transition: all 0.2s;
}

/* Sizes */
.permission-badge.sm {
	font-size: 0.7rem;
	padding: 3px 8px;
}

.permission-badge.sm .badge-icon {
	width: 12px;
	height: 12px;
}

.permission-badge.md {
	font-size: 0.75rem;
	padding: 4px 10px;
}

.permission-badge.md .badge-icon {
	width: 14px;
	height: 14px;
}

.permission-badge.lg {
	font-size: 0.85rem;
	padding: 6px 12px;
}

.permission-badge.lg .badge-icon {
	width: 16px;
	height: 16px;
}

/* Permission Levels */
.permission-badge.level-owner {
	background: rgba(234, 179, 8, 0.15);
	border: 1px solid rgba(234, 179, 8, 0.3);
	color: #eab308;
}

.permission-badge.level-admin {
	background: rgba(168, 85, 247, 0.15);
	border: 1px solid rgba(168, 85, 247, 0.3);
	color: #a855f7;
}

.permission-badge.level-edit {
	background: rgba(59, 130, 246, 0.15);
	border: 1px solid rgba(59, 130, 246, 0.3);
	color: #3b82f6;
}

.permission-badge.level-view {
	background: rgba(34, 197, 94, 0.15);
	border: 1px solid rgba(34, 197, 94, 0.3);
	color: #22c55e;
}

.permission-badge.level-none {
	background: rgba(107, 114, 128, 0.15);
	border: 1px solid rgba(107, 114, 128, 0.3);
	color: #6b7280;
}

.badge-icon {
	flex-shrink: 0;
}

.badge-text {
	white-space: nowrap;
}
</style>

