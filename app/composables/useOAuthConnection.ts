// @ts-expect-error - Nuxt auto-import
import { useToast } from "#imports";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { buttClient } from "../utils/buttClient";

export interface OAuthConnectionOptions {
	integrationId: string;
	integrationName: string;
	organizationId: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSuccess?: (integration: any) => void;
	onError?: (error: Error) => void;
	onClose?: () => void;
}

export function useOAuthConnection() {
	const toast = useToast();

	/**
	 * Initiates an OAuth connection flow using Tauri WebviewWindow
	 * @param options - Configuration options for the OAuth flow
	 * @returns Promise that resolves when the window is created
	 */
	async function initiateOAuthConnection(options: OAuthConnectionOptions): Promise<void> {
		const { integrationId, integrationName, organizationId, onSuccess, onError, onClose } = options;

		try {
			console.log("🔗 Starting OAuth connection for:", integrationName);

			// Get OAuth URL from API
			const connection = await buttClient.connect(integrationId, "false");
			const oauthUrl = connection.url;

			if (!oauthUrl) {
				throw new Error("No OAuth URL returned from API");
			}

			console.log("🌐 Opening OAuth URL:", oauthUrl);

			// Create unique webview ID
			const webviewId = `oauth-${integrationId}-${Date.now()}`;

			// Create Tauri WebviewWindow
			const webview = new WebviewWindow(webviewId, {
				url: oauthUrl,
				title: `Connect to ${integrationName}`,
				width: 600,
				height: 700,
				center: true,
				resizable: true,
				minimizable: false,
				maximizable: false,
				closable: true,
				alwaysOnTop: false,
			});

			// Handle window creation
			webview.once("tauri://created", () => {
				console.log("✅ Tauri OAuth window created:", webviewId);
				toast.add({
					title: "OAuth Window Opened",
					description: `Please complete authentication for ${integrationName}`,
					color: "info",
				});

				// Poll integration status and auto-close when connected
				const pollInterval = setInterval(async () => {
					try {
						const orgIntegrations = await buttClient.findIntegrationsByOrganisationId(organizationId);
						const updatedIntegration = orgIntegrations?.find((i: any) => i.id === integrationId);

						if (updatedIntegration?.connected) {
							console.log("✅ Integration connected, auto-closing window");
							clearInterval(pollInterval);

							toast.add({
								title: "Integration Connected",
								description: `Successfully connected to ${integrationName}`,
								color: "success",
							});

							// Close the window
							await webview.close();

							// Call success callback
							if (onSuccess) {
								onSuccess(updatedIntegration);
							}
						}
					} catch (error) {
						console.error("Failed to check integration status:", error);
					}
				}, 2000); // Check every 2 seconds

				// Clean up interval if window is manually closed
				webview.once("tauri://destroyed", () => {
					console.log("🔄 OAuth window closed");
					clearInterval(pollInterval);

					// Call close callback
					if (onClose) {
						onClose();
					}
				});
			});

			// Handle window creation errors
			webview.once("tauri://error", (e: any) => {
				console.error("❌ Tauri OAuth window error:", e);

				const error = new Error("Failed to open OAuth window");
				toast.add({
					title: "Window Error",
					description: "Failed to open OAuth window",
					color: "error",
				});

				// Call error callback
				if (onError) {
					onError(error);
				}
			});
		} catch (error: any) {
			console.error("❌ OAuth connection error:", error);

			toast.add({
				title: "Connection Failed",
				description: `Failed to connect ${integrationName}: ${error.message}`,
				color: "error",
			});

			// Call error callback
			if (onError) {
				onError(error);
			}

			throw error;
		}
	}

	return {
		initiateOAuthConnection,
	};
}

