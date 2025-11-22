<template>
	<FormField :label="label" :icon="icon">
		<template #label-badge>
			<span v-if="showCount" class="item-count-badge" :style="badgeStyle">
				{{ items.length }}
			</span>
		</template>

		<!-- Items List -->
		<div v-if="items.length" class="items-list">
			<div
				v-for="(item, index) in items"
				:key="index"
				class="item-row"
			>
				<slot name="item" :item="item" :index="index" :update="(key, value) => updateItem(index, key, value)" :remove="() => removeItem(index)">
					<!-- Default item template -->
					<UIcon v-if="itemIcon" :name="itemIcon" class="w-4 h-4" :class="itemIconClass" />
					<div class="item-content">
						<span>{{ getItemLabel(item) }}</span>
					</div>
					<button
						type="button"
						class="remove-button"
						@click="removeItem(index)"
						@mousedown.stop
					>
						<UIcon name="i-lucide-x" class="w-3 h-3" />
					</button>
				</slot>
			</div>
		</div>

		<!-- Add Item Button -->
		<button
			type="button"
			class="add-item-button"
			:style="addButtonStyle"
			@click="addItem"
		>
			<UIcon name="i-lucide-plus-circle" class="w-4 h-4" />
			<span>{{ addButtonLabel }}</span>
		</button>
	</FormField>
</template>

<script setup lang="ts">
	import { computed } from "vue"
	import FormField from "./FormField.vue"
	import UIcon from "~/components/Ui/Icon.vue"

	interface Props {
		items: any[]
		label?: string
		icon?: string
		itemIcon?: string
		itemIconClass?: string
		itemLabelKey?: string
		addButtonLabel?: string
		showCount?: boolean
		themeColor?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		label: "Items",
		icon: undefined,
		itemIcon: undefined,
		itemIconClass: "",
		itemLabelKey: "name",
		addButtonLabel: "Add Item",
		showCount: true,
		themeColor: "6, 182, 212"
	})

	const emit = defineEmits<{
		add: []
		remove: [index: number]
		update: [index: number, key: string, value: any]
	}>()

	const badgeStyle = computed(() => ({
		backgroundColor: `rgba(${props.themeColor}, 0.2)`,
		borderColor: `rgba(${props.themeColor}, 0.3)`,
		color: `rgb(${props.themeColor})`
	}))

	const addButtonStyle = computed(() => ({
		background: `linear-gradient(135deg, rgba(${props.themeColor}, 0.2), rgba(${props.themeColor}, 0.1))`,
		borderColor: `rgba(${props.themeColor}, 0.4)`,
		color: `rgba(${props.themeColor}, 0.9)`
	}))

	const getItemLabel = (item: any): string => {
		return item[props.itemLabelKey] || "Unnamed Item"
	}

	const addItem = () => {
		emit("add")
	}

	const removeItem = (index: number) => {
		emit("remove", index)
	}

	const updateItem = (index: number, key: string, value: any) => {
		emit("update", index, key, value)
	}
</script>

<style scoped>
.item-count-badge {
	margin-left: auto;
	padding: 0.25rem 0.5rem;
	background: rgba(20, 184, 166, 0.2);
	border: 1px solid rgba(20, 184, 166, 0.3);
	border-radius: 0.25rem;
	font-size: 0.625rem;
	font-weight: 700;
	color: rgb(20, 184, 166);
}

.items-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	margin-bottom: 0.75rem;
	max-height: 200px;
	overflow-y: auto;
}

.item-row {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.75rem 1rem;
	background: rgba(20, 184, 166, 0.1);
	border: 1px solid rgba(20, 184, 166, 0.2);
	border-radius: 0.5rem;
	transition: all 0.2s ease;
}

.item-row:hover {
	background: rgba(20, 184, 166, 0.15);
	border-color: rgba(20, 184, 166, 0.3);
}

.item-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.remove-button {
	padding: 0.5rem;
	background: rgba(239, 68, 68, 0.2);
	border: 1px solid rgba(239, 68, 68, 0.3);
	border-radius: 0.375rem;
	color: rgba(239, 68, 68, 0.9);
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.remove-button:hover {
	background: rgba(239, 68, 68, 0.3);
	border-color: rgba(239, 68, 68, 0.5);
	color: rgb(239, 68, 68);
}

.add-item-button {
	width: 100%;
	padding: 0.875rem 1.25rem;
	background: linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0.1));
	border: 1px solid rgba(20, 184, 166, 0.4);
	border-radius: 0.5rem;
	color: rgba(20, 184, 166, 0.9);
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
}

.add-item-button:hover {
	background: linear-gradient(135deg, rgba(20, 184, 166, 0.3), rgba(20, 184, 166, 0.2));
	border-color: rgba(20, 184, 166, 0.6);
	color: rgb(20, 184, 166);
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(20, 184, 166, 0.3);
}
</style>

