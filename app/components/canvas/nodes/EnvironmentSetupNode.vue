<template>
	<div class="environment-setup-node">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />

		<!-- Node Resizer -->
		<NodeResizer :min-width="900" :min-height="700" color="rgba(139, 92, 246, 0.5)" />

		<div class="setup-panel glassmorphic-panel p-6 rounded-xl border border-primary/20 shadow-lg shadow-primary/10 backdrop-blur-md">
			<h3 class="text-xl font-semibold text-white/90 mb-4 flex items-center gap-2">
				<Icon name="i-lucide-settings" class="w-6 h-6 text-primary" />
				Setup & Environment
			</h3>
			<p class="text-white/70 mb-4">
				Configure your development environment and tools for the Buildit workflow.
			</p>

			<div class="space-y-6 max-h-[600px] overflow-y-auto pr-2">
				<!-- Buildit CLI Status -->
				<div>
					<h4 class="font-medium text-white/80 mb-3">
						Buildit CLI Status
					</h4>
					<div class="space-y-3">
						<CLIStatusCard
							:show-commands="false"
							:show-install-info="false"
							:auto-check="false"
						/>
						<button
							class="w-full px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm border border-blue-500/30 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
							@click="$emit('openCliNode')"
						>
							<Icon name="i-lucide-external-link" class="w-4 h-4" />
							Open Dedicated CLI Check Node
						</button>
					</div>
				</div>

				<!-- Language Check Nodes -->
				<div>
					<h4 class="font-medium text-white/80 mb-3">
						Language Check Nodes
					</h4>
					<div class="grid grid-cols-2 gap-3">
						<button
							class="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm border border-orange-500/30 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
							@click="$emit('openRustNode')"
						>
							<Icon name="i-simple-icons-rust" class="w-4 h-4" />
							Rust Check
						</button>
					</div>
				</div>

				<!-- Package Managers -->
				<div>
					<h4 class="font-medium text-white/80 mb-3">
						Package Managers
					</h4>
					<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
						<div v-for="pm in packageManagers" :key="pm.name" class="p-3 border border-white/10 rounded-lg bg-black/20 relative">
							<a
								:href="getPackageManagerUrl(pm.name)"
								target="_blank"
								rel="noopener noreferrer"
								class="absolute top-2 right-2 text-white/40 hover:text-white/60 transition-colors duration-200"
								:title="`Visit ${pm.name} website`"
							>
								<Icon name="i-lucide-external-link" class="w-3 h-3" />
							</a>
							<div class="text-sm text-white/70 mb-1">
								{{ pm.name }}
							</div>
							<div v-if="pm.installed" class="text-green-400 text-xs">
								{{ pm.version }}
							</div>
							<div v-else class="text-white/40 text-xs">
								Not found
							</div>
						</div>
					</div>
					<div class="mt-3">
						<button
							class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm border border-white/20 transition-all duration-200 hover:scale-105"
							@click="$emit('detect-package-managers')"
						>
							<Icon name="i-lucide-refresh-cw" class="w-4 h-4 inline mr-1" />
							Rescan Package Managers
						</button>
					</div>
				</div>

				<!-- Chocolatey Status -->
				<div>
					<h4 class="font-medium text-white/80 mb-3">
						Chocolatey
					</h4>
					<div class="flex items-center gap-3 p-3 border border-white/10 rounded-lg bg-black/20">
						<div class="flex items-center gap-2">
							<Icon
								:name="chocolateyVersion && chocolateyVersion !== 'Not installed' ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
								:class="chocolateyVersion && chocolateyVersion !== 'Not installed' ? 'text-green-400' : 'text-red-400'"
								class="w-4 h-4"
							/>
							<div class="text-sm" :class="chocolateyVersion && chocolateyVersion !== 'Not installed' ? 'text-green-400' : 'text-red-400'">
								{{ chocolateyVersion || 'Detecting...' }}
							</div>
						</div>
						<div class="ml-auto flex gap-2">
							<button
								class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm border border-white/20 transition-all duration-200 hover:scale-105"
								@click="$emit('detect-chocolatey')"
							>
								<Icon name="i-lucide-refresh-cw" class="w-4 h-4 inline mr-1" />
								Recheck
							</button>
						</div>
					</div>
				</div>

				<!-- Node.js Status -->
				<div>
					<h4 class="font-medium text-white/80 mb-3">
						Node.js
					</h4>
					<div class="flex items-center gap-3 p-3 border border-white/10 rounded-lg bg-black/20">
						<div class="text-sm text-white/70">
							{{ nodeVersion || 'Detecting...' }}
						</div>
						<div class="ml-auto">
							<button
								class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm border border-white/20 transition-all duration-200 hover:scale-105"
								@click="$emit('detect-node')"
							>
								<Icon name="i-lucide-refresh-cw" class="w-4 h-4 inline mr-1" />
								Recheck Node.js
							</button>
						</div>
					</div>
				</div>

				<!-- Operating System Information -->
				<div>
					<h4 class="font-medium text-white/80 mb-3">
						Operating System
					</h4>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
						<div class="p-3 border border-white/10 rounded-lg bg-black/20">
							<div class="text-sm text-white/70 mb-1">
								System
							</div>
							<div class="text-green-400 text-xs">
								{{ osInfo?.platform }} {{ osInfo?.version }}
							</div>
						</div>
						<div class="p-3 border border-white/10 rounded-lg bg-black/20">
							<div class="text-sm text-white/70 mb-1">
								Architecture
							</div>
							<div class="text-green-400 text-xs">
								{{ osInfo?.arch }}
							</div>
						</div>
						<div class="p-3 border border-white/10 rounded-lg bg-black/20">
							<div class="text-sm text-white/70 mb-1">
								Locale
							</div>
							<div class="text-green-400 text-xs">
								{{ osInfo?.locale || 'Not detectable' }}
							</div>
						</div>
					</div>
				</div>

				<!-- System Information -->
				<div v-if="envVars && Object.keys(envVars).length > 0">
					<h4 class="font-medium text-white/80 mb-3">
						System Information
					</h4>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div v-if="envVars.WINDOWS_PRODUCT" class="p-3 border border-white/10 rounded-lg bg-black/20">
							<div class="text-sm text-white/70 mb-1">
								Windows Product
							</div>
							<div class="text-green-400 text-xs">
								{{ envVars.WINDOWS_PRODUCT }}
							</div>
						</div>
						<div v-if="envVars.WINDOWS_VERSION" class="p-3 border border-white/10 rounded-lg bg-black/20">
							<div class="text-sm text-white/70 mb-1">
								Windows Version
							</div>
							<div class="text-green-400 text-xs">
								{{ envVars.WINDOWS_VERSION }}
							</div>
						</div>
						<div v-if="envVars.TOTAL_MEMORY" class="p-3 border border-white/10 rounded-lg bg-black/20">
							<div class="text-sm text-white/70 mb-1">
								Total Memory
							</div>
							<div class="text-green-400 text-xs">
								{{ envVars.TOTAL_MEMORY }}
							</div>
						</div>
						<div v-if="envVars.PROCESSORS" class="p-3 border border-white/10 rounded-lg bg-black/20">
							<div class="text-sm text-white/70 mb-1">
								Processors
							</div>
							<div class="text-green-400 text-xs">
								{{ envVars.PROCESSORS }}
							</div>
						</div>
						<div v-if="envVars.COMPUTERNAME" class="p-3 border border-white/10 rounded-lg bg-black/20">
							<div class="text-sm text-white/70 mb-1">
								Computer Name
							</div>
							<div class="text-green-400 text-xs">
								{{ envVars.COMPUTERNAME }}
							</div>
						</div>
						<div v-if="envVars.USERDOMAIN" class="p-3 border border-white/10 rounded-lg bg-black/20">
							<div class="text-sm text-white/70 mb-1">
								User Domain
							</div>
							<div class="text-green-400 text-xs">
								{{ envVars.USERDOMAIN }}
							</div>
						</div>
					</div>
				</div>

				<!-- IDE Information -->
				<div v-if="ideInfo && ideInfo.length > 0">
					<h4 class="font-medium text-white/80 mb-3">
						Development Tools
					</h4>
					<div class="space-y-3">
						<div v-for="ide in ideInfo" :key="ide.name" class="relative flex items-center justify-between p-3 border border-white/10 rounded-lg bg-black/20">
							<div class="flex items-center gap-3">
								<Icon
									:name="ide.status === 'checking' ? 'i-heroicons-arrow-path' : ide.status === 'installed' ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
									:class="{
										'animate-spin text-gray-400': ide.status === 'checking',
										'text-green-400': ide.status === 'installed',
										'text-red-400': ide.status === 'not-installed'
									}"
									class="w-5 h-5"
								/>
								<div>
									<div class="text-sm text-white/80 font-medium">
										{{ ide.name }}
									</div>
									<div v-if="ide.version" class="text-xs text-white/60">
										{{ ide.version }}
									</div>
								</div>
							</div>
							<div class="flex items-center gap-2">
								<span
									class="px-2 py-1 rounded-full text-xs"
									:class="ide.status === 'installed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'"
								>
									{{ ide.status === 'checking' ? 'Checking...' : ide.status === 'installed' ? 'Installed' : 'Not Installed' }}
								</span>
							</div>
						</div>
					</div>
					<div class="mt-3">
						<button
							class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm border border-white/20 transition-all duration-200 hover:scale-105"
							@click="$emit('check-all-ides')"
						>
							<Icon name="i-lucide-refresh-cw" class="w-4 h-4 inline mr-1" />
							Rescan IDEs
						</button>
					</div>
				</div>

				<!-- Environment Variables -->
				<div v-if="envVars && Object.keys(envVars).length > 0">
					<h4 class="font-medium text-white/80 mb-3">
						Environment Variables
					</h4>
					<div class="space-y-3">
						<!-- System Environment Variables -->
						<div class="p-3 border border-white/10 rounded-lg bg-black/20">
							<div class="text-sm text-white/70 mb-2">
								System Environment
							</div>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
								<div v-if="envVars.PATH" class="flex items-center justify-between text-xs">
									<span class="text-white/60 font-mono">PATH</span>
									<span class="text-white/80 font-mono truncate ml-2 max-w-32" :title="envVars.PATH">
										{{ envVars.PATH.length > 30 ? `${envVars.PATH.substring(0, 30)}...` : envVars.PATH }}
									</span>
								</div>
								<div v-if="envVars.USERNAME" class="flex items-center justify-between text-xs">
									<span class="text-white/60 font-mono">USERNAME</span>
									<span class="text-white/80 font-mono">{{ envVars.USERNAME }}</span>
								</div>
								<div v-if="envVars.USERPROFILE" class="flex items-center justify-between text-xs">
									<span class="text-white/60 font-mono">USERPROFILE</span>
									<span class="text-white/80 font-mono truncate ml-2 max-w-32" :title="envVars.USERPROFILE">
										{{ envVars.USERPROFILE.length > 30 ? `${envVars.USERPROFILE.substring(0, 30)}...` : envVars.USERPROFILE }}
									</span>
								</div>
								<div v-if="envVars.APPDATA" class="flex items-center justify-between text-xs">
									<span class="text-white/60 font-mono">APPDATA</span>
									<span class="text-white/80 font-mono truncate ml-2 max-w-32" :title="envVars.APPDATA">
										{{ envVars.APPDATA.length > 30 ? `${envVars.APPDATA.substring(0, 30)}...` : envVars.APPDATA }}
									</span>
								</div>
							</div>
						</div>

						<!-- Development Environment Variables -->
						<div class="p-3 border border-white/10 rounded-lg bg-black/20">
							<div class="text-sm text-white/70 mb-2">
								Development Environment
							</div>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
								<div v-if="envVars.NODE_ENV" class="flex items-center justify-between text-xs">
									<span class="text-white/60 font-mono">NODE_ENV</span>
									<span class="text-white/80 font-mono">{{ envVars.NODE_ENV }}</span>
								</div>
								<div v-if="envVars.NODE_PATH" class="flex items-center justify-between text-xs">
									<span class="text-white/60 font-mono">NODE_PATH</span>
									<span class="text-white/80 font-mono truncate ml-2 max-w-32" :title="envVars.NODE_PATH">
										{{ envVars.NODE_PATH.length > 30 ? `${envVars.NODE_PATH.substring(0, 30)}...` : envVars.NODE_PATH }}
									</span>
								</div>
							</div>
						</div>
					</div>
					<div class="mt-3">
						<button
							class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm border border-white/20 transition-all duration-200 hover:scale-105"
							@click="$emit('refresh-env-vars')"
						>
							<Icon name="i-lucide-refresh-cw" class="w-4 h-4 inline mr-1" />
							Refresh Environment
						</button>
					</div>
				</div>

				<!-- Rust Status -->
				<div>
					<h4 class="font-medium text-white/80 mb-3">
						Rust
					</h4>
					<div class="flex items-center gap-3 p-3 border border-white/10 rounded-lg bg-black/20">
						<div class="flex items-center gap-2">
							<Icon
								:name="rustVersion && rustVersion !== 'Not installed' ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
								:class="rustVersion && rustVersion !== 'Not installed' ? 'text-green-400' : 'text-red-400'"
								class="w-4 h-4"
							/>
							<div class="text-sm" :class="rustVersion && rustVersion !== 'Not installed' ? 'text-green-400' : 'text-red-400'">
								{{ rustVersion || 'Detecting...' }}
							</div>
						</div>
						<div class="ml-auto flex gap-2">
							<button
								v-if="rustVersion && rustVersion !== 'Not installed'"
								class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm border border-white/20 transition-all duration-200 hover:scale-105"
								@click="$emit('detect-rust')"
							>
								<Icon name="i-lucide-refresh-cw" class="w-4 h-4 inline mr-1" />
								Recheck
							</button>
							<button
								v-else
								class="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm border border-orange-500/30 transition-all duration-200 hover:scale-105"
								@click="$emit('install-rust')"
							>
								<Icon name="i-lucide-download" class="w-4 h-4 inline mr-1" />
								Install Rust
							</button>
						</div>
					</div>
				</div>

				<!-- PHP Status -->
				<div>
					<h4 class="font-medium text-white/80 mb-3">
						PHP
					</h4>
					<div class="flex items-center gap-3 p-3 border border-white/10 rounded-lg bg-black/20">
						<div class="flex items-center gap-2">
							<Icon
								:name="phpVersion && phpVersion !== 'Not installed' ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
								:class="phpVersion && phpVersion !== 'Not installed' ? 'text-green-400' : 'text-red-400'"
								class="w-4 h-4"
							/>
							<div class="text-sm" :class="phpVersion && phpVersion !== 'Not installed' ? 'text-green-400' : 'text-red-400'">
								{{ phpVersion || 'Detecting...' }}
							</div>
						</div>
						<div class="ml-auto flex gap-2">
							<button
								v-if="phpVersion && phpVersion !== 'Not installed'"
								class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm border border-white/20 transition-all duration-200 hover:scale-105"
								@click="$emit('detect-php')"
							>
								<Icon name="i-lucide-refresh-cw" class="w-4 h-4 inline mr-1" />
								Recheck
							</button>
							<button
								v-else
								class="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm border border-orange-500/30 transition-all duration-200 hover:scale-105"
								@click="$emit('install-php')"
							>
								<Icon name="i-lucide-download" class="w-4 h-4 inline mr-1" />
								Install PHP
							</button>
						</div>
					</div>
				</div>

				<!-- .NET Status -->
				<div>
					<h4 class="font-medium text-white/80 mb-3">
						.NET
					</h4>
					<div class="flex items-center gap-3 p-3 border border-white/10 rounded-lg bg-black/20">
						<div class="flex items-center gap-2">
							<Icon
								:name="dotnetVersion && dotnetVersion !== 'Not installed' ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
								:class="dotnetVersion && dotnetVersion !== 'Not installed' ? 'text-green-400' : 'text-red-400'"
								class="w-4 h-4"
							/>
							<div class="text-sm" :class="dotnetVersion && dotnetVersion !== 'Not installed' ? 'text-green-400' : 'text-red-400'">
								{{ dotnetVersion || 'Detecting...' }}
							</div>
						</div>
						<div class="ml-auto flex gap-2">
							<button
								v-if="dotnetVersion && dotnetVersion !== 'Not installed'"
								class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm border border-white/20 transition-all duration-200 hover:scale-105"
								@click="$emit('detect-dotnet')"
							>
								<Icon name="i-lucide-refresh-cw" class="w-4 h-4 inline mr-1" />
								Recheck
							</button>
							<button
								v-else
								class="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm border border-orange-500/30 transition-all duration-200 hover:scale-105"
								@click="$emit('install-dotnet')"
							>
								<Icon name="i-lucide-download" class="w-4 h-4 inline mr-1" />
								Install .NET
							</button>
						</div>
					</div>
				</div>

				<!-- Python Status -->
				<div>
					<h4 class="font-medium text-white/80 mb-3">
						Python
					</h4>
					<div class="flex items-center gap-3 p-3 border border-white/10 rounded-lg bg-black/20">
						<div class="flex items-center gap-2">
							<Icon
								:name="pythonVersion && pythonVersion !== 'Not installed' ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
								:class="pythonVersion && pythonVersion !== 'Not installed' ? 'text-green-400' : 'text-red-400'"
								class="w-4 h-4"
							/>
							<div class="text-sm" :class="pythonVersion && pythonVersion !== 'Not installed' ? 'text-green-400' : 'text-red-400'">
								{{ pythonVersion || 'Detecting...' }}
							</div>
						</div>
						<div class="ml-auto flex gap-2">
							<button
								v-if="pythonVersion && pythonVersion !== 'Not installed'"
								class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm border border-white/20 transition-all duration-200 hover:scale-105"
								@click="$emit('detect-python')"
							>
								<Icon name="i-lucide-refresh-cw" class="w-4 h-4 inline mr-1" />
								Recheck
							</button>
							<button
								v-else
								class="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm border border-orange-500/30 transition-all duration-200 hover:scale-105"
								@click="$emit('install-python')"
							>
								<Icon name="i-lucide-download" class="w-4 h-4 inline mr-1" />
								Install Python
							</button>
						</div>
					</div>
				</div>

				<!-- Java Status -->
				<div>
					<h4 class="font-medium text-white/80 mb-3">
						Java
					</h4>
					<div class="flex items-center gap-3 p-3 border border-white/10 rounded-lg bg-black/20">
						<div class="flex items-center gap-2">
							<Icon
								:name="javaVersion && javaVersion !== 'Not installed' ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
								:class="javaVersion && javaVersion !== 'Not installed' ? 'text-green-400' : 'text-red-400'"
								class="w-4 h-4"
							/>
							<div class="text-sm" :class="javaVersion && javaVersion !== 'Not installed' ? 'text-green-400' : 'text-red-400'">
								{{ javaVersion || 'Detecting...' }}
							</div>
						</div>
						<div class="ml-auto flex gap-2">
							<button
								v-if="javaVersion && javaVersion !== 'Not installed'"
								class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm border border-white/20 transition-all duration-200 hover:scale-105"
								@click="$emit('detect-java')"
							>
								<Icon name="i-lucide-refresh-cw" class="w-4 h-4 inline mr-1" />
								Recheck
							</button>
							<button
								v-else
								class="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm border border-orange-500/30 transition-all duration-200 hover:scale-105"
								@click="$emit('install-java')"
							>
								<Icon name="i-lucide-download" class="w-4 h-4 inline mr-1" />
								Install Java
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { Handle, Position } from "@vue-flow/core";
	import { NodeResizer } from "@vue-flow/node-resizer";
	import { computed, ref } from "vue";
	import CLIStatusCard from "~/components/canvas/shared/CLIStatusCard.vue";

	interface Props {
		customNodeProps: {
			id: string
			data: {
				label?: string
				cliInstalled?: boolean
				cliVersion?: string
				chocolateyVersion?: string
				packageManagers?: Array<{ name: string, version: string, installed: boolean }>
				nodeVersion?: string
				rustVersion?: string
				phpVersion?: string
				dotnetVersion?: string
				pythonVersion?: string
				javaVersion?: string
				osInfo?: {
					platform: string
					version: string
					arch: string
					locale?: string
				}
				envVars?: Record<string, string>
				ideInfo?: Array<{
					name: string
					status: "checking" | "installed" | "not-installed"
					version?: string
				}>
			}
		}
	}

	const props = defineProps<Props>();

	const emit = defineEmits([
		"detect-node",
		"detect-package-managers",
		"detect-chocolatey",
		"detect-rust",
		"detect-php",
		"detect-dotnet",
		"detect-python",
		"detect-java",
		"install-rust",
		"install-php",
		"install-dotnet",
		"install-python",
		"install-java",
		"check-all-ides",
		"refresh-env-vars",
		"openCliNode",
		"openRustNode"
	]);

	const cliInstalled = computed(() => props.customNodeProps.data?.cliInstalled || false);
	const cliVersion = computed(() => props.customNodeProps.data?.cliVersion || "");
	const chocolateyVersion = computed(() => props.customNodeProps.data?.chocolateyVersion || "");
	const packageManagers = computed(() => props.customNodeProps.data?.packageManagers || []);
	const nodeVersion = computed(() => props.customNodeProps.data?.nodeVersion || "");
	const rustVersion = computed(() => props.customNodeProps.data?.rustVersion || "");
	const phpVersion = computed(() => props.customNodeProps.data?.phpVersion || "");
	const dotnetVersion = computed(() => props.customNodeProps.data?.dotnetVersion || "");
	const pythonVersion = computed(() => props.customNodeProps.data?.pythonVersion || "");
	const javaVersion = computed(() => props.customNodeProps.data?.javaVersion || "");
	const osInfo = computed(() => props.customNodeProps.data?.osInfo);
	const envVars = computed(() => props.customNodeProps.data?.envVars || {});
	const ideInfo = computed(() => props.customNodeProps.data?.ideInfo || []);

	const cliInstalling = ref(false);
	const cliChecking = ref(false);

	const checkBuilditCli = async () => {
		cliChecking.value = true;
		// Trigger parent to detect
		setTimeout(() => cliChecking.value = false, 2000);
	};

	const installBuilditCli = async () => {
		cliInstalling.value = true;
		// Trigger parent to install
		setTimeout(() => cliInstalling.value = false, 3000);
	};

	const getPackageManagerUrl = (name: string) => {
		const urls: Record<string, string> = {
			npm: "https://www.npmjs.com/",
			yarn: "https://yarnpkg.com/",
			pnpm: "https://pnpm.io/",
			bun: "https://bun.sh/"
		};
		return urls[name] || "#";
	};
</script>

<style scoped>
.environment-setup-node {
	position: relative;
	min-width: 900px;
}

.setup-panel {
	background: rgba(17, 24, 39, 0.95);
	max-height: 750px;
	overflow: hidden;
}

/* Scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
	width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
	background: rgba(255, 255, 255, 0.05);
	border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
	background: rgba(139, 92, 246, 0.5);
	border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
	background: rgba(139, 92, 246, 0.7);
}
</style>
