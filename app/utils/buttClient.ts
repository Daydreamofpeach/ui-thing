import { ButtClient, ClientType } from "@butt/client";
import { useRuntimeConfig } from "#imports";

const resolveClientType = () => {
	// Check for Tauri in multiple ways
	const hasTauriEnv = import.meta.env?.TAURI_PLATFORM;
	const hasTauriWindow = typeof window !== 'undefined' && (window as any).__TAURI__;
	
	if (hasTauriEnv || hasTauriWindow) {
		return ClientType.DESKTOP;
	}

	return ClientType.WEB;
};

let cachedButtClient: ButtClient | null = null;

export function getButtClient(): ButtClient {
	if (cachedButtClient) return cachedButtClient;

	const config = useRuntimeConfig();
	const clientType = resolveClientType();
	
	// CRITICAL: For Tauri DESKTOP (production or dev), ALWAYS use absolute API URL
	// This prevents requests from going to tauri.localhost/bapi (which serves Nuxt HTML)
	// For WEB browser: Use proxy in dev to avoid CORS, absolute URL in production
	const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__;
	const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';
	
	let base: string;
	if (clientType === ClientType.DESKTOP || isTauri) {
		// Tauri DESKTOP always uses absolute API URL (https://api.dev.builditbuilder.com)
		// This is essential because Tauri production builds serve static HTML files
		// and relative paths like /bapi would try to load from the local file system
		base = "https://api.dev.builditbuilder.com";
		console.log("🔧 ButtClient: Tauri DESKTOP detected, using absolute API URL:", base);
	} else if (clientType === ClientType.WEB) {
		// WEB browser: Use proxy in dev to avoid CORS, absolute URL in production
		base = isProduction 
			? "https://api.dev.builditbuilder.com"
			: "/bapi";
		console.log("🔧 ButtClient: WEB client detected, using", base, isProduction ? "(production)" : "(dev proxy)");
	} else {
		// Fallback to absolute URL to be safe
		base = "https://api.dev.builditbuilder.com";
		console.log("🔧 ButtClient: Fallback to absolute API URL:", base);
	}

	cachedButtClient = new ButtClient({
		serviceId: (config?.public as any)?.serviceId || "izgF1l9wZPXdTqkgW_-VuTRQWNgKYMzkZWMvkIFPa5A",
		clientType,
		verbose: "bbbbbb",
		// Set both baseUrl and bapi to ensure all API requests use the correct base
		baseUrl: base,
		bapi: base
	});
	
	console.log("✅ ButtClient initialized with:", {
		clientType: ClientType[clientType],
		baseUrl: base,
		isTauri: isTauri || false,
		isProduction: isProduction,
		serviceId: (config?.public as any)?.serviceId || "izgF1l9wZPXdTqkgW_-VuTRQWNgKYMzkZWMvkIFPa5A"
	});

	return cachedButtClient;
}

// Provide a default export-style constant used by some client code paths
export const buttClient = getButtClient();

export const resolveIntegrationLogo = (cdn: string | null, logo: string | undefined | null): string | null => {	
	if (!logo) return null;
	if (!cdn) return logo;
	return `${cdn}${logo}`;
}

/**
 * Get current organization ID from localStorage or context
 */
export function getCurrentOrganisationId(): string | null {
	// Check the primary key used by useSelectedOrganisationId composable
	const primaryOrgId = localStorage.getItem("ORG_ID");
	if (primaryOrgId) {
		return primaryOrgId;
	}

	// Try to get from localStorage with other keys
	const orgId = localStorage.getItem("current-organisation-id");
	if (orgId) {
		return orgId;
	}

	// Try to get from sessionStorage
	const sessionOrgId = sessionStorage.getItem("current-organisation-id");
	if (sessionOrgId) {
		return sessionOrgId;
	}

	// Try to get from other common storage keys
	const keys = [
		"organisation-id",
		"organization-id",
		"org-id",
		"selected-organisation-id",
		"selected-organization-id"
	];

	for (const key of keys) {
		const value = localStorage.getItem(key) || sessionStorage.getItem(key);
		if (value) {
			return value;
		}
	}

	return null;
}