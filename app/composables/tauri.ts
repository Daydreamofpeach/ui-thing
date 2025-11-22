// Lightweight wrappers so client and web both compile
// Desktop: dynamically use Tauri APIs; Web: provide safe fallbacks

export const useTauriShellCommand = {
	create(command: string, args: string[]) {
		return {
			async execute(): Promise<{ code: number; stdout: string; stderr: string }> {
				try {
					if ((import.meta as any).env?.TAURI_PLATFORM) {
						// @ts-ignore
						const { Command } = await import(/* @vite-ignore */ "@tauri-apps/plugin-shell");
						// @ts-ignore
						const cmd = new Command(command, args);
						// @ts-ignore
						const res = await cmd.execute();
						return { code: res.code ?? 0, stdout: res.stdout ?? "", stderr: res.stderr ?? "" };
					}
				} catch (e) {
					console.warn("Tauri shell execute failed, using fallback:", e);
				}
				// Web fallback - no shell, return empty
				return { code: 0, stdout: "", stderr: "" };
			}
		};
	}
};

// Renamed to avoid shadowing the app's UI toast (vue-sonner)
export function useTauriToast() {
	return {
		add(opts: { title?: string; description?: string; color?: string }) {
			console.log("[tauri-toast]", opts?.color || "info", opts?.title || "", opts?.description || "");
		}
	};
}

export function useTauriOsPlatform(): string {
	try {
		// @ts-ignore
		if ((import.meta as any).env?.TAURI_PLATFORM) {
			// @ts-ignore
			return window.__TAURI__?.os?.platform?.() || navigator.platform || "unknown";
		}
	} catch {}
	return navigator.platform || "unknown";
}

export function useTauriOsVersion(): string {
	try {
		// @ts-ignore
		if ((import.meta as any).env?.TAURI_PLATFORM) {
			// Best effort
			// @ts-ignore
			return window.__TAURI__?.os?.version?.() || "unknown";
		}
	} catch {}
	return "unknown";
}

export function useTauriOsArch(): string {
	try {
		// @ts-ignore
		if ((import.meta as any).env?.TAURI_PLATFORM) {
			// @ts-ignore
			return window.__TAURI__?.os?.arch?.() || "unknown";
		}
	} catch {}
	return "unknown";
}

export async function useTauriOsLocale(): Promise<string> {
	try {
		// @ts-ignore
		if ((import.meta as any).env?.TAURI_PLATFORM) {
			// @ts-ignore
			return (await window.__TAURI__?.os?.locale?.()) || navigator.language || "en-US";
		}
	} catch {}
	return navigator.language || "en-US";
}


