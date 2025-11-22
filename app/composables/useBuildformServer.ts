import { invoke } from "@tauri-apps/api/core";
import { Command, open } from "@tauri-apps/plugin-shell";

export interface ServerStatus {
	running: boolean
	port?: number
	url?: string
}

export const useBuildformServer = () => {
	const checkStatus = async (): Promise<ServerStatus> => {
		// Try to find server on known ports with a fast HEAD
		const candidatePorts = [9003];
		for (const port of candidatePorts) {
			try {
				const controller = new AbortController();
				const t = setTimeout(() => controller.abort(), 800);
				const res = await fetch(`http://localhost:${port}`, { method: "HEAD", signal: controller.signal });
				clearTimeout(t);
				if (res.ok || res.status < 500) {
					return { running: true, port, url: `http://localhost:${port}` };
				}
			} catch {
				// continue
			}
		}
		return { running: false };
	};

	const startServer = async (): Promise<ServerStatus> => {
		// Check if server is already running
		const status = await checkStatus();
		if (status.running) {
			return status;
		}

		try {
			// Use the new Rust command to start the plugins server
			console.log("🚀 Starting plugins server using Rust command...");
			const result = await invoke<ServerStatus>("start_plugins_server");
			console.log("✅ Server started successfully:", result);
			return result;
		} catch (error) {
			console.error("❌ Failed to start server:", error);
			throw new Error(`Failed to start server: ${error}`);
		}
	};

	const openInterface = async (): Promise<void> => {
		// First ensure server is running
		const status = await startServer();

		if (status.url) {
			// Open URL in default browser
			await open(status.url);
		} else {
			throw new Error("Server URL not available");
		}
	};

	const stopServer = async (): Promise<void> => {
		try {
			// For now, just show a message - stopping server requires more complex permissions
			console.log("To stop the server, you may need to manually close it or restart the application");
		} catch (error) {
			console.error("Failed to stop server:", error);
			throw new Error(`Failed to stop server: ${error}`);
		}
	};

	const getBuildformPath = async (): Promise<string> => {
		// Return a simple path description since we can't easily access file system
		return "Plugins path: ../plugins (relative to client directory)";
	};

	return {
		startServer,
		openInterface,
		checkStatus,
		stopServer,
		getBuildformPath
	};
};
