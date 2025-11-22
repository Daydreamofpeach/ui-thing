<template>
	<div class="ide-list-container">
		<!-- Header with Refresh -->
		<div class="ide-list-header">
			<div class="header-title">
				<UIcon name="i-lucide-monitor-check" class="w-5 h-5" :style="{ color: themeColor }" />
				<span :style="{ color: themeColor }">{{ title }}</span>
			</div>
			<button
				class="refresh-button"
				:style="refreshButtonStyle"
				:disabled="isChecking"
				@click="checkAllIDEs"
			>
				<UIcon 
					name="i-lucide-refresh-cw" 
					class="w-4 h-4"
					:class="{ 'animate-spin': isChecking }"
				/>
				<span>{{ isChecking ? 'Checking...' : 'Refresh' }}</span>
			</button>
		</div>

		<!-- IDE Cards Grid -->
		<div class="ide-cards-grid">
			<div
				v-for="ide in ides"
				:key="ide.name"
				class="ide-card"
				:class="getCardClass(ide)"
				:style="getCardStyle(ide)"
			>
				<!-- Status Icon -->
				<div class="ide-card-icon">
					<UIcon
						:name="getStatusIcon(ide)"
						:class="getIconClass(ide)"
						class="w-6 h-6"
					/>
				</div>

				<!-- IDE Info -->
				<div class="ide-card-content">
					<div class="ide-card-header">
						<span class="ide-name">{{ ide.name }}</span>
						<div
							class="status-badge"
							:style="getStatusBadgeStyle(ide)"
						>
							{{ getStatusLabel(ide) }}
						</div>
					</div>
					<div v-if="ide.version" class="ide-version">
						{{ ide.version }}
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="ide-card-actions">
					<button
						v-if="ide.status === 'installed' && showConnectButton"
						class="action-btn connect-btn"
						@click="handleConnect(ide)"
					>
						<UIcon name="i-lucide-link" class="w-4 h-4" />
						<span>{{ connectButtonLabel }}</span>
					</button>
					<button
						v-if="ide.status === 'installed' && showOpenButton"
						class="action-btn open-btn"
						@click="handleOpen(ide)"
					>
						<UIcon name="i-lucide-external-link" class="w-4 h-4" />
						<span>Open</span>
					</button>
				<button
					v-else-if="ide.status === 'not-installed'"
					class="action-btn install-btn"
					:disabled="installingIde === ide.name"
					@click="handleInstall(ide)"
				>
					<UIcon 
						:name="installingIde === ide.name ? 'i-lucide-loader-2' : 'i-lucide-download'" 
						class="w-4 h-4"
						:class="{ 'animate-spin': installingIde === ide.name }"
					/>
					<span>{{ installingIde === ide.name ? 'Installing...' : 'Get' }}</span>
				</button>
				</div>
			</div>
		</div>

		<!-- Summary Stats -->
		<div v-if="showSummary" class="status-summary" :style="{ borderColor: `${themeColor}40` }">
			<div class="summary-item">
				<UIcon name="i-lucide-check-circle" class="w-4 h-4 text-green-400" />
				<span>{{ installedCount }} Installed</span>
			</div>
			<div class="summary-item">
				<UIcon name="i-lucide-x-circle" class="w-4 h-4 text-red-400" />
				<span>{{ notInstalledCount }} Not Installed</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref } from "vue";
	import { useTauriShellCommand } from "#imports";
	import { useTemplateInstaller } from "@canvas/composables/useTemplateInstaller";

	interface Props {
		title?: string
		themeColor?: string
		showConnectButton?: boolean
		showOpenButton?: boolean
		showSummary?: boolean
		connectButtonLabel?: string
		autoCheck?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		title: "Available IDEs",
		themeColor: "#8b5cf6",
		showConnectButton: true,
		showOpenButton: true,
		showSummary: true,
		connectButtonLabel: "Connect",
		autoCheck: true
	});

	const emit = defineEmits<{
		connect: [ide: any]
		open: [ide: any]
		install: [ide: any]
	}>();

	const { installFromTemplate } = useTemplateInstaller();
	const installingIde = ref<string | null>(null);

	type IDEStatus = "checking" | "installed" | "not-installed";

	interface IDE {
		name: string
		status: IDEStatus
		version?: string
		checkCommand: string
		versionCommand: string
		openCommand?: string
		downloadUrl?: string
	}

	const isChecking = ref(false);

	const ides = ref<IDE[]>([
		{
			name: "VS Code",
			status: "checking",
			checkCommand: "if (Get-Command code -ErrorAction SilentlyContinue) { 'found' } else { '' }",
			versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (code --version 2>$null | Select-Object -First 1); if ($version) { $version } else { 'Installed' }",
			openCommand: "code",
			downloadUrl: "https://code.visualstudio.com/download"
		},
		{
			name: "Cursor",
			status: "checking",
			checkCommand: "if (Get-Command cursor -ErrorAction SilentlyContinue) { 'found' } else { '' }",
			versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (cursor --version 2>$null | Select-Object -First 1); if ($version) { $version } else { 'Installed' }",
			openCommand: "cursor",
			downloadUrl: "https://www.cursor.so/"
		},
		{
			name: "Visual Studio",
			status: "checking",
			checkCommand: "if (Test-Path 'C:\\Program Files\\Microsoft Visual Studio\\*\\*\\Common7\\IDE\\devenv.exe') { 'found' } else { '' }",
			versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $vsPath = Get-ChildItem 'C:\\Program Files\\Microsoft Visual Studio\\*\\*\\Common7\\IDE\\devenv.exe' -ErrorAction SilentlyContinue | Select-Object -First 1; if ($vsPath) { $vsPath.Directory.Parent.Parent.Name } else { 'Installed' }",
			openCommand: "start devenv",
			downloadUrl: "https://visualstudio.microsoft.com/downloads/"
		}
	]);

	// Computed stats
	const installedCount = computed(() => ides.value.filter(ide => ide.status === "installed").length);
	const notInstalledCount = computed(() => ides.value.filter(ide => ide.status === "not-installed").length);

	// Style helpers
	const refreshButtonStyle = computed(() => ({
		color: props.themeColor,
		borderColor: `${props.themeColor}40`,
		backgroundColor: `${props.themeColor}10`
	}));

	const getCardClass = (ide: IDE) => {
		return {
			"checking": ide.status === "checking",
			"installed": ide.status === "installed",
			"not-installed": ide.status === "not-installed"
		};
	};

	const getCardStyle = (ide: IDE) => {
		let borderColor = "rgba(100, 116, 139, 0.3)";
		if (ide.status === "installed") borderColor = "rgba(34, 197, 94, 0.5)";
		if (ide.status === "not-installed") borderColor = "rgba(239, 68, 68, 0.5)";
		if (ide.status === "checking") borderColor = "rgba(139, 92, 246, 0.3)";

		return { borderColor };
	};

	const getStatusIcon = (ide: IDE) => {
		if (ide.status === "checking") return "i-lucide-loader-2";
		if (ide.status === "installed") return "i-lucide-check-circle-2";
		return "i-lucide-x-circle";
	};

	const getIconClass = (ide: IDE) => {
		return {
			"animate-spin text-purple-400": ide.status === "checking",
			"text-green-400": ide.status === "installed",
			"text-red-400": ide.status === "not-installed"
		};
	};

	const getStatusLabel = (ide: IDE) => {
		if (ide.status === "checking") return "Checking...";
		if (ide.status === "installed") return "Installed";
		return "Not Found";
	};

	const getStatusBadgeStyle = (ide: IDE) => {
		let bg = "rgba(139, 92, 246, 0.2)";
		let color = "rgba(196, 181, 253, 1)";

		if (ide.status === "installed") {
			bg = "rgba(34, 197, 94, 0.2)";
			color = "rgba(134, 239, 172, 1)";
		} else if (ide.status === "not-installed") {
			bg = "rgba(239, 68, 68, 0.2)";
			color = "rgba(252, 165, 165, 1)";
		}

		return { backgroundColor: bg, color };
	};

	// Check IDE status
	const checkIDEStatus = async (ide: IDE): Promise<{ status: IDEStatus, version?: string }> => {
		try {
			const checkResponse = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				ide.checkCommand
			]).execute();

			const found = checkResponse.code === 0 && checkResponse.stdout.trim().toLowerCase().includes("found");
			
			if (found) {
				try {
					const versionResponse = await useTauriShellCommand.create("exec-pwsh", [
						"-Command",
						ide.versionCommand
					]).execute();
					
					console.log(`📊 ${ide.name} version response:`, {
						code: versionResponse.code,
						stdout: versionResponse.stdout,
						stderr: versionResponse.stderr
					});
					
					let version = versionResponse.stdout.trim();
					
					// Clean version string
					version = version.replace(/\x1B\[[0-9;]*m/g, ""); // Remove ANSI codes
					version = version.split('\n')[0].trim(); // Get first line only
					
					console.log(`✅ ${ide.name} cleaned version:`, version);
					
					return {
						status: "installed",
						version: version || "Installed"
					};
				} catch (versionError) {
					console.warn(`⚠️ ${ide.name} version check failed:`, versionError);
					return {
						status: "installed",
						version: "Installed"
					};
				}
			}
			
			return { status: "not-installed" };
		} catch (error) {
			console.error(`Error checking ${ide.name}:`, error);
			return { status: "not-installed" };
		}
	};

	const checkAllIDEs = async () => {
		isChecking.value = true;

		for (const ide of ides.value) {
			ide.status = "checking";
		}

		for (const ide of ides.value) {
			const result = await checkIDEStatus(ide);
			ide.status = result.status;
			ide.version = result.version;
		}

		isChecking.value = false;
	};

	const handleConnect = (ide: IDE) => {
		console.log("🔗 Connect clicked for IDE:", ide.name);
		emit("connect", ide);
	};

	const handleOpen = (ide: IDE) => {
		emit("open", ide);
	};

	const handleInstall = async (ide: IDE) => {
		console.log("═══════════════════════════════════════════");
		console.log("📥 INSTALLING IDE FROM TEMPLATE");
		console.log("  IDE Name:", ide.name);
		console.log("═══════════════════════════════════════════");

		installingIde.value = ide.name;

		try {
			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();

			const result = await installFromTemplate(ide.name, {
				currentOS: "windows",
				currentVersion: "11"
			});

			console.log("📊 Installation result:", result);

			if (result.status === "success") {
				toast.add({
					title: "Installation Complete",
					description: `${ide.name} has been installed successfully`,
					color: "green"
				});
				
				// Re-check IDE status after installation
				setTimeout(async () => {
					const checkResult = await checkIDEStatus(ide);
					ide.status = checkResult.status;
					ide.version = checkResult.version;
				}, 2000);
			} else if (result.status === "skipped") {
				toast.add({
					title: "Already Installed",
					description: result.message,
					color: "blue"
				});
			} else {
				toast.add({
					title: "Installation Failed",
					description: result.message,
					color: "red",
					timeout: 5000
				});
				
				// If template search failed and we have a download URL, offer manual download
				if (result.message.includes('Unable to find') && ide.downloadUrl) {
					console.log("💡 Offering manual download fallback");
					setTimeout(() => {
						toast.add({
							title: "Manual Installation Available",
							description: `Visit the website to download ${ide.name} manually`,
							color: "blue",
							timeout: 8000
						});
					}, 1000);
				}
			}
		} catch (error) {
			console.error("❌ Installation error:", error);
			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Installation Error",
				description: `Failed to install ${ide.name}. Please try downloading manually.`,
				color: "red",
				timeout: 5000
			});
			
			// Open download URL as fallback
			if (ide.downloadUrl) {
				console.log("🌐 Opening download URL as fallback:", ide.downloadUrl);
				window.open(ide.downloadUrl, "_blank");
			}
		} finally {
			installingIde.value = null;
			console.log("═══════════════════════════════════════════");
		}
	};

	onMounted(() => {
		if (props.autoCheck) {
			checkAllIDEs();
		}
	});

	defineExpose({
		checkAllIDEs
	});
</script>

<style scoped>
.ide-list-container {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.ide-list-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem;
	border-bottom: 1px solid rgba(139, 92, 246, 0.2);
}

.header-title {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.875rem;
	font-weight: 600;
	letter-spacing: 0.05em;
	text-transform: uppercase;
}

.refresh-button {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
	border: 1px solid;
	border-radius: 0.5rem;
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
	transform: translateY(-1px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.refresh-button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.ide-cards-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 0.75rem;
	padding: 0 0.5rem;
}

.ide-card {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 1rem;
	background: rgba(31, 41, 55, 0.5);
	border: 2px solid;
	border-radius: 0.75rem;
	transition: all 0.2s ease;
}

.ide-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.ide-card.installed {
	background: rgba(34, 197, 94, 0.05);
}

.ide-card.not-installed {
	background: rgba(239, 68, 68, 0.05);
}

.ide-card-icon {
	display: flex;
	align-items: center;
	justify-content: center;
}

.ide-card-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.ide-card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
}

.ide-name {
	font-size: 0.9375rem;
	font-weight: 600;
	color: white;
}

.status-badge {
	padding: 0.25rem 0.75rem;
	border-radius: 0.375rem;
	font-size: 0.7rem;
	font-weight: 600;
	white-space: nowrap;
}

.ide-version {
	font-size: 0.75rem;
	color: rgba(156, 163, 175, 1);
}

.ide-card-actions {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}

.action-btn {
	flex: 1;
	min-width: 70px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.375rem;
	padding: 0.5rem 0.75rem;
	border-radius: 0.5rem;
	font-size: 0.8125rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	border: none;
}

.connect-btn {
	background: rgba(59, 130, 246, 0.2);
	color: rgba(147, 197, 253, 1);
	border: 1px solid rgba(59, 130, 246, 0.4);
}

.connect-btn:hover {
	background: rgba(59, 130, 246, 0.3);
	transform: translateY(-1px);
}

.open-btn {
	background: rgba(34, 197, 94, 0.2);
	color: rgba(134, 239, 172, 1);
	border: 1px solid rgba(34, 197, 94, 0.4);
}

.open-btn:hover {
	background: rgba(34, 197, 94, 0.3);
	transform: translateY(-1px);
}

.install-btn {
	background: rgba(251, 146, 60, 0.2);
	color: rgba(253, 186, 116, 1);
	border: 1px solid rgba(251, 146, 60, 0.4);
}

.install-btn:hover {
	background: rgba(251, 146, 60, 0.3);
	transform: translateY(-1px);
}

.status-summary {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 2rem;
	padding: 0.75rem;
	border: 1px solid;
	border-radius: 0.75rem;
	background: rgba(139, 92, 246, 0.05);
}

.summary-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.875rem;
	font-weight: 500;
	color: rgba(229, 231, 235, 1);
}

.animate-spin {
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>

