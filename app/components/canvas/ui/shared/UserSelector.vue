<template>
	<div class="user-selector-component">
		<label v-if="label" class="user-selector-label">
			{{ label }}
		</label>

		<!-- Selected Users Display -->
		<div v-if="selectedUsers.length > 0" class="selected-users">
			<div
				v-for="user in selectedUsers"
				:key="user.id"
				class="selected-user-chip"
			>
				<div class="user-avatar">
					{{ getUserInitials(user) }}
				</div>
				<span class="user-name">{{ user.name || user.email }}</span>
				<button
					v-if="!readonly"
					class="remove-user-btn"
					@click="removeUser(user)"
				>
					<UIcon name="i-lucide-x" class="size-3" />
				</button>
			</div>
		</div>

		<!-- Add User Button/Dropdown -->
		<div v-if="!readonly" class="add-user-section">
			<button
				class="add-user-btn"
				@click="showDropdown = !showDropdown"
			>
				<UIcon name="i-lucide-user-plus" class="size-4" />
				<span>{{ addButtonText }}</span>
			</button>

			<!-- User Dropdown -->
			<div v-if="showDropdown" class="user-dropdown">
				<!-- Search -->
				<div class="dropdown-search">
					<UIcon name="i-lucide-search" class="search-icon" />
					<input
						v-model="searchQuery"
						type="text"
						placeholder="Search users..."
						class="search-input"
					>
				</div>

				<!-- Available Users List -->
				<div class="users-list">
					<div
						v-for="user in filteredAvailableUsers"
						:key="user.id"
						class="user-item"
						@click="addUser(user)"
					>
						<div class="user-avatar">
							{{ getUserInitials(user) }}
						</div>
						<div class="user-info">
							<div class="user-name">{{ user.name || user.email }}</div>
							<div class="user-email">{{ user.email }}</div>
						</div>
						<UIcon name="i-lucide-plus-circle" class="size-4 text-primary" />
					</div>

					<div v-if="filteredAvailableUsers.length === 0" class="no-users">
						{{
							searchQuery ? 'No users found' : 'No users available'
						}}
					</div>
				</div>
			</div>
		</div>

		<!-- Empty State -->
		<div v-if="selectedUsers.length === 0" class="empty-state">
			<UIcon name="i-lucide-users-round" class="size-6 text-white/20" />
			<span class="empty-text">{{ emptyText }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref } from "vue";

	interface User {
		id: string
		name?: string
		email: string
		avatar?: string
	}

	const props = withDefaults(defineProps<{
		modelValue: User[]
		availableUsers: User[]
		label?: string
		addButtonText?: string
		emptyText?: string
		readonly?: boolean
		multiple?: boolean
	}>(), {
		addButtonText: "Add User",
		emptyText: "No users assigned",
		readonly: false,
		multiple: true
	});

	const emit = defineEmits<{
		"update:modelValue": [users: User[]]
		userAdded: [user: User]
		userRemoved: [user: User]
	}>();

	const showDropdown = ref(false);
	const searchQuery = ref("");

	const selectedUsers = computed(() => props.modelValue);

	const filteredAvailableUsers = computed(() => {
		const selectedIds = new Set(selectedUsers.value.map((u) => u.id));
		let users = props.availableUsers.filter((u) => !selectedIds.has(u.id));

		if (searchQuery.value) {
			const query = searchQuery.value.toLowerCase();
			users = users.filter((u) =>
				u.name?.toLowerCase().includes(query)
				|| u.email?.toLowerCase().includes(query)
			);
		}

		return users;
	});

	const getUserInitials = (user: User): string => {
		const name = user.name || user.email || "?";
		return name.substring(0, 2).toUpperCase();
	};

	const addUser = (user: User) => {
		if (props.multiple) {
			emit("update:modelValue", [...selectedUsers.value, user]);
		} else {
			emit("update:modelValue", [user]);
		}
		emit("userAdded", user);
		showDropdown.value = false;
		searchQuery.value = "";
	};

	const removeUser = (user: User) => {
		const updated = selectedUsers.value.filter((u) => u.id !== user.id);
		emit("update:modelValue", updated);
		emit("userRemoved", user);
	};
</script>

<style scoped>
.user-selector-component {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.user-selector-label {
	font-size: 0.85rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
}

.selected-users {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.selected-user-chip {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 10px;
	background: rgba(59, 130, 246, 0.15);
	border: 1px solid rgba(59, 130, 246, 0.3);
	border-radius: 20px;
	font-size: 0.8rem;
	color: rgba(255, 255, 255, 0.9);
}

.user-avatar {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background: rgba(59, 130, 246, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.7rem;
	font-weight: 700;
	color: #3b82f6;
}

.user-name {
	max-width: 150px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.remove-user-btn {
	padding: 2px;
	background: rgba(239, 68, 68, 0.2);
	border: none;
	border-radius: 50%;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
}

.remove-user-btn:hover {
	background: rgba(239, 68, 68, 0.4);
}

.add-user-section {
	position: relative;
}

.add-user-btn {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 8px 14px;
	background: rgba(59, 130, 246, 0.15);
	border: 1px solid rgba(59, 130, 246, 0.3);
	border-radius: 8px;
	color: #3b82f6;
	font-size: 0.85rem;
	cursor: pointer;
	transition: all 0.2s;
}

.add-user-btn:hover {
	background: rgba(59, 130, 246, 0.25);
	border-color: rgba(59, 130, 246, 0.5);
}

.user-dropdown {
	position: absolute;
	top: calc(100% + 8px);
	left: 0;
	right: 0;
	background: linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98));
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	padding: 12px;
	z-index: 1000;
	backdrop-filter: blur(20px);
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
	max-height: 300px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.dropdown-search {
	position: relative;
	display: flex;
	align-items: center;
}

.search-icon {
	position: absolute;
	left: 10px;
	width: 14px;
	height: 14px;
	color: rgba(255, 255, 255, 0.4);
}

.search-input {
	width: 100%;
	padding: 8px 12px 8px 34px;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	color: white;
	font-size: 0.8rem;
}

.search-input::placeholder {
	color: rgba(255, 255, 255, 0.3);
}

.search-input:focus {
	outline: none;
	border-color: rgba(59, 130, 246, 0.4);
}

.users-list {
	overflow-y: auto;
	max-height: 220px;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.user-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px;
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s;
}

.user-item:hover {
	background: rgba(59, 130, 246, 0.1);
	border-color: rgba(59, 130, 246, 0.3);
}

.user-info {
	flex: 1;
	min-width: 0;
}

.user-info .user-name {
	font-size: 0.85rem;
	font-weight: 600;
	color: white;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.user-info .user-email {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.5);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.no-users {
	text-align: center;
	padding: 20px;
	color: rgba(255, 255, 255, 0.4);
	font-size: 0.8rem;
}

.empty-state {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px;
	background: rgba(0, 0, 0, 0.2);
	border: 1px dashed rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	color: rgba(255, 255, 255, 0.4);
	font-size: 0.8rem;
}

.empty-text {
	font-size: 0.8rem;
}
</style>
