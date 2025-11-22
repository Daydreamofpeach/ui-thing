<template>
	<NodeForm>
		<!-- Hook Name -->
		<FormField v-if="mode === 'create'" label="Hook Name" icon="i-lucide-tag">
			<UiInput
				:model-value="hookData.name"
				placeholder="Enter hook name"
				@update:model-value="(value) => $emit('updateField', 'name', value)"
			/>
		</FormField>

		<!-- Hook Info (Edit Mode) -->
		<UiCard v-else class="hook-info-section mb-4">
			<UiCardContent class="p-4 space-y-4">
				<div class="flex items-center gap-3 pb-3 border-b border-border">
					<Icon name="i-lucide-check-circle" class="w-5 h-5 text-primary" />
					<h3 class="text-lg font-bold text-foreground">
						{{ hookData.name }}
					</h3>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<div class="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg border border-border">
						<span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</span>
						<UiBadge variant="secondary" size="sm" class="w-fit mt-1">
							{{ hookData.type }}
						</UiBadge>
					</div>
					<div v-if="hookData.token" class="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg border border-border">
						<span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Token</span>
						<code class="text-xs font-mono text-foreground bg-background/50 px-2 py-1 rounded border border-border mt-1">
							{{ hookData.token.substring(0, 12) }}...
						</code>
					</div>
					<div class="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg border border-border">
						<span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Trigger</span>
						<UiBadge variant="default" size="sm" class="w-fit mt-1 font-mono">
							{{ hookData.trigger || 'form.submitted' }}
						</UiBadge>
					</div>
				</div>
			</UiCardContent>
		</UiCard>

		<!-- Description (Create Mode Only) -->
		<FormField v-if="mode === 'create'" label="Description" icon="i-lucide-file-text">
			<UiTextarea
				:model-value="hookData.description"
				placeholder="Describe what this hook does"
				:rows="2"
				@update:model-value="(value) => $emit('updateField', 'description', value)"
			/>
		</FormField>

		<!-- Auto-populated Trigger (Create Mode Only) -->
		<FormField v-if="mode === 'create'" icon="i-lucide-zap">
			<template #label>
				<div class="flex items-center justify-between w-full">
					<span>Trigger Event</span>
					<UiBadge variant="outline" size="sm">Auto-configured</UiBadge>
				</div>
			</template>
			<div class="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
				<Icon name="i-lucide-check-circle" class="w-4 h-4 text-primary flex-shrink-0" />
				<code class="text-sm font-mono font-bold text-primary flex-1">form.submitted</code>
				<span class="text-xs text-muted-foreground italic ml-auto">Fires when form is submitted</span>
			</div>
		</FormField>

		<!-- Listeners Section -->
		<FormItemList
			:items="hookData.listeners || []"
			label="Listeners (Transports)"
			icon="i-lucide-bell"
			item-icon="i-lucide-truck"
			item-icon-class="text-primary"
			add-button-label="Add Transport Listener"
			theme-color="var(--color-primary-rgb)"
			@add="$emit('addListener')"
			@remove="(index) => $emit('removeListener', index)"
			@update="(index, key, value) => $emit('updateListener', index, key, value)"
		>
			<template #item="{ item, update, remove }">
				<Icon name="i-lucide-truck" class="w-4 h-4 text-primary flex-shrink-0" />
				<div class="flex-1 flex flex-col gap-2 min-w-0">
					<UiInput
						:model-value="item.name || 'Unnamed Transport'"
						placeholder="Enter listener name"
						size="sm"
						@update:model-value="(value) => update('name', value)"
						@click.stop
						@mousedown.stop
					/>
					<UiSelect
						v-if="mode === 'create'"
						:model-value="item.type"
						@update:model-value="(value) => update('type', value)"
					>
						<UiSelectTrigger class="h-8 text-xs">
							<UiSelectValue :placeholder="item.type || 'Select type'" />
						</UiSelectTrigger>
						<UiSelectContent>
							<UiSelectItem value="EMAIL">📧 Email</UiSelectItem>
							<UiSelectItem value="SLACK">💬 Slack</UiSelectItem>
							<UiSelectItem value="DISCORD">🎮 Discord</UiSelectItem>
							<UiSelectItem value="WEBHOOK">🔗 Webhook</UiSelectItem>
						</UiSelectContent>
					</UiSelect>
					<UiBadge
						v-else
						:variant="item.status === 'configured' ? 'default' : 'outline'"
						size="sm"
						class="w-fit"
					>
						{{ item.status === 'configured' ? '✓ Configured' : '⏳ Pending' }}
					</UiBadge>
				</div>
				<UiButton
					type="button"
					variant="destructive"
					size="icon-sm"
					@click="remove"
					@mousedown.stop
					class="flex-shrink-0"
				>
					<Icon name="i-lucide-x" class="w-3 h-3" />
				</UiButton>
			</template>
		</FormItemList>

		<!-- Form Actions -->
		<FormActions>
			<!-- Create Mode Actions -->
			<template v-if="mode === 'create'">
				<UiButton
					:disabled="!hookData.name || isLoading"
					:loading="isLoading"
					class="w-full"
					@click="$emit('submit')"
				>
					<Icon name="i-lucide-webhook" class="w-4 h-4" />
					{{ isLoading ? 'Creating...' : 'Create Hook' }}
				</UiButton>
			</template>

			<!-- Edit Mode Actions -->
			<template v-else>
				<div class="flex gap-2 w-full">
					<UiButton
						variant="secondary"
						class="flex-1"
						@click="$emit('changeHook')"
					>
						<Icon name="i-lucide-repeat" class="w-4 h-4" />
						Change Hook
					</UiButton>
					<UiButton
						variant="destructive"
						class="flex-1"
						@click="$emit('delete')"
					>
						<Icon name="i-lucide-trash-2" class="w-4 h-4" />
						Delete Hook
					</UiButton>
				</div>
			</template>
		</FormActions>
	</NodeForm>
</template>

<script setup lang="ts">
	import FormActions from "@canvas/shared/form/FormActions.vue";
	import FormField from "@canvas/shared/form/FormField.vue";
	import FormItemList from "@canvas/shared/form/FormItemList.vue";
	import NodeForm from "@canvas/shared/form/NodeForm.vue";
	import Icon from "~/components/Ui/Icon.vue";
	import UiButton from "~/components/Ui/Button.vue";
	import UiInput from "~/components/Ui/Input.vue";
	import UiTextarea from "~/components/Ui/Textarea.vue";
	import UiSelect from "~/components/Ui/Select/Select.vue";
	import UiSelectTrigger from "~/components/Ui/Select/Trigger.vue";
	import UiSelectValue from "~/components/Ui/Select/Value.vue";
	import UiSelectContent from "~/components/Ui/Select/Content.vue";
	import UiSelectItem from "~/components/Ui/Select/Item.vue";
	import UiBadge from "~/components/Ui/Badge.vue";
	import UiCard from "~/components/Ui/Card/Card.vue";
	import UiCardContent from "~/components/Ui/Card/Content.vue";

	interface HookData {
		name?: string
		description?: string
		type?: string
		token?: string
		trigger?: string
		listeners?: any[]
	}

	interface Props {
		mode?: "create" | "edit"
		hookData: HookData
		isLoading?: boolean
	}

	withDefaults(defineProps<Props>(), {
		mode: "create",
		isLoading: false
	});

	defineEmits<{
		submit: []
		delete: []
		changeHook: []
		resubscribe: []
		updateField: [key: string, value: any]
		addListener: []
		removeListener: [index: number]
		updateListener: [index: number, key: string, value: any]
	}>();

</script>

<style scoped>
.hook-info-section {
	/* Styles handled by UiCard */
}
</style>
