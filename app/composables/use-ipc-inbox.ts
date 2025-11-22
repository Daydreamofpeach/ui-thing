export interface IpcItem {
	id?: number
	requestId?: number | string
	name?: string
	formName?: string
	activeTab?: string
	export?: string
	fields?: unknown[]
	allVersions?: {
		json: string
		html: string
		css: string
		javascript: string
		react: string
		typescript: string
		apiSchema: string
	}
	settings?: any
	metadata?: {
		from?: string
		sentAt?: string
		totalFields?: number
		fieldTypes?: string[]
		hasValidation?: boolean
		hasConditional?: boolean
		styling?: {
			hasCustomCSS?: boolean
			theme?: string
			layout?: number
		}
	}
	receivedAt?: string
	processed?: boolean
	headers?: Record<string, string>
	[key: string]: unknown
}

interface FetchJsonOptions extends RequestInit {
	timeoutMs?: number
}

async function fetchWithTimeout(input: RequestInfo | URL, init: FetchJsonOptions = {}) {
	const { timeoutMs = 5000, ...rest } = init;
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(input, { ...rest, signal: controller.signal });
		return res;
	} finally {
		clearTimeout(timer);
	}
}

export async function startSidecar(): Promise<{ ok: boolean, message?: string, endpoints?: any, error?: string }> {
	try {
		const res = await fetch("/api/start-api-server", { method: "POST" });
		const json = await res.json().catch(() => ({}));
		return res.ok ? { ok: true, message: (json as any)?.message, endpoints: (json as any)?.endpoints } : { ok: false, error: (json as any)?.error || "Failed to start sidecar" };
	} catch (e: any) {
		return { ok: false, error: e?.message || "Failed to start sidecar" };
	}
}

export async function checkReceiverHealth(): Promise<{ ok: boolean, via?: string }> {
	const urls = [
		"http://localhost:9002/health",
		"/health"
	];
	for (const url of urls) {
		try {
			const res = await fetchWithTimeout(url, { timeoutMs: 2000 });
			if (res.ok) return { ok: true, via: url };
		} catch {
			// continue
		}
	}
	return { ok: false };
}

export async function fetchInbox(): Promise<{ ok: boolean, data: IpcItem[], via?: string }> {
	const urls = [
		"http://localhost:9002/api/receive-data",
		"/api/receive-data"
	];
	for (const url of urls) {
		try {
			const res = await fetchWithTimeout(url, { timeoutMs: 4000 });
			if (!res.ok) continue;
			const json = await res.json().catch(() => undefined) as any;
			const data: IpcItem[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
			return { ok: true, data, via: url };
		} catch {
			// keep trying
		}
	}
	return { ok: false, data: [] };
}

export function subscribeInbox(callback: (items: IpcItem[], via?: string) => void, intervalMs = 3000) {
	let disposed = false;
	let timer: any;
	const seen = new Set<string | number>();

	const tick = async () => {
		if (disposed) return;
		const { ok, data, via } = await fetchInbox();
		if (ok && data?.length) {
			const newOnes = data.filter((d) => {
				const key = (d.requestId ?? d.id) as any;
				if (key == null) return false;
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
			if (newOnes.length) callback(newOnes, via);
		}
		timer = setTimeout(tick, intervalMs);
	};

	tick();

	return () => {
		disposed = true;
		if (timer) clearTimeout(timer);
	};
}
