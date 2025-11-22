<template>
	<div class="fixed inset-0 z-0 flex flex-col bg-background">
		<!-- Optional top slot -->
		<div class="relative z-20">
			<slot name="navbar" />
		</div>
		<div class="flex-1 p-4">
			<ClientOnly>
				<UiSplitter class="h-full w-full rounded-lg border">
					<!-- Left pane: fully collapsible/expandable with max-width constraint -->
					<UiSplitterPanel collapsible :collapsed-size="0" :min-size="0" :default-size="25" class="max-w-[336px]">
						<div class="h-full flex flex-col overflow-hidden">
							<!-- Left column content (placeholder) -->
							<slot name="left">
								<div class="flex-1 flex items-center justify-center text-sm text-muted-foreground">
									<span>Left pane</span>
								</div>
							</slot>
						</div>
					</UiSplitterPanel>
					<UiSplitterHandle with-handle />
					<!-- Right compound pane: fully collapsible/expandable -->
					<UiSplitterPanel collapsible :collapsed-size="0" :min-size="0" :default-size="75">
						<UiSplitter direction="vertical" class="h-full">
							<!-- Top (center) pane: fully collapsible/expandable - Canvas -->
							<UiSplitterPanel collapsible :collapsed-size="0" :min-size="0" :default-size="60">
								<div class="h-full flex flex-col overflow-hidden">
									<!-- Center / top content - Canvas -->
									<slot />
								</div>
							</UiSplitterPanel>
							<UiSplitterHandle with-handle />
							<!-- Bottom (right) pane: fully collapsible/expandable -->
							<UiSplitterPanel collapsible :collapsed-size="0" :min-size="0" :default-size="40">
								<div class="h-full flex flex-col p-4 overflow-auto">
									<!-- Right / bottom content (placeholder) -->
									<slot name="right">
										<div class="flex-1 flex items-center justify-center text-sm text-muted-foreground">
											<span>Details</span>
										</div>
									</slot>
								</div>
							</UiSplitterPanel>
						</UiSplitter>
					</UiSplitterPanel>
				</UiSplitter>
			</ClientOnly>
		</div>
	</div>
</template>

<script setup lang="ts">
import UiSplitter from "~/components/Ui/Splitter/Splitter.vue";
import UiSplitterPanel from "~/components/Ui/Splitter/Panel.vue";
import UiSplitterHandle from "~/components/Ui/Splitter/Handle.vue";
</script>

<style scoped>
.dashboard-layout {
	min-height: 100vh;
	min-width: 100vw;
}
</style>


