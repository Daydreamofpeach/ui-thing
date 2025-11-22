<template>
	<div class="dashboard-layout fixed inset-0 z-0 flex flex-col bg-background">
		<!-- Optional top slot -->
		<div class="relative z-20">
			<slot name="navbar" />
		</div>

		<div class="flex flex-1 h-0 w-full overflow-hidden mt-4 px-4 pb-4 gap-4">
			<!-- Left Column -->
			<UiCard
				class="h-full flex-shrink-0 flex-grow-0"
				:style="{ flexBasis: '260px', minWidth: '200px', maxWidth: '45vw' }"
				data-panel="left"
				role="region"
				aria-label="Left Sidebar"
				tabindex="0"
			>
				<div class="h-full flex flex-col pt-6 px-4">
					<slot name="left" />
				</div>
			</UiCard>

			<!-- Center Column -->
			<div class="relative z-10 flex-1 min-w-[160px] h-full flex flex-col">
				<UiCard class="h-full w-full" data-panel="center" role="main" aria-label="Main content" tabindex="0">
					<div class="flex-1 flex flex-col w-full pt-6 px-6 pb-6">
						<slot />
					</div>
				</UiCard>
			</div>

			<!-- Right Column -->
			<UiCard
				class="h-full flex-shrink-0 flex-grow-0"
				:style="{ flexBasis: '300px', minWidth: '220px', maxWidth: '45vw' }"
				data-panel="right"
				role="region"
				aria-label="Right Sidebar"
				tabindex="0"
			>
				<div class="h-full flex flex-col pt-6 px-4">
					<slot name="right" />
				</div>
			</UiCard>
		</div>
	</div>
</template>

<script setup lang="ts">
import UiCard from "~/components/Ui/Card/Card.vue";
</script>

<style scoped>
.dashboard-layout {
	min-height: 100vh;
	min-width: 100vw;
}
</style>
