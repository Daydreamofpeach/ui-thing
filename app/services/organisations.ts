import { getButtClient } from "~/utils/buttClient";
import { useRuntimeConfig } from "#imports";

export interface OrganisationPayload {
  name: string;
  description?: string;
  email?: string;
}

export async function fetchOrganisations(): Promise<any[]> {
  const client = getButtClient();
  const token = client.getAccessToken?.();
  const { public: pub } = useRuntimeConfig();
  const base: string = ((pub as any)?.buttApiUrl || "https://api.dev.builditbuilder.com").replace(/\/+$/,''); // strip trailing slash
  const res = await fetch(`${base}/v1/organisations`, {
    headers: {
      "Authorization": token ? `Bearer ${token}` : "",
    },
  });
  if (!res.ok) throw new Error(`Failed to load organisations: ${res.status}`);
  const data = await res.json().catch(() => ([]));
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function createOrganisation(payload: OrganisationPayload) {
  const client = getButtClient();
  const token = client.getAccessToken?.();
  const { public: pub } = useRuntimeConfig();
  const base: string = ((pub as any)?.buttApiUrl || "https://api.dev.builditbuilder.com").replace(/\/+$/,''); // strip trailing slash
  const res = await fetch(`${base}/v1/organisations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Create failed: ${res.status}`);
  return data;
}

export async function updateOrganisation(id: string | number, payload: Partial<OrganisationPayload>) {
  const client = getButtClient();
  const token = client.getAccessToken?.();
  const { public: pub } = useRuntimeConfig();
  const base: string = ((pub as any)?.buttApiUrl || "https://api.dev.builditbuilder.com").replace(/\/+$/,''); // strip trailing slash
  const res = await fetch(`${base}/v1/organisations/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Update failed: ${res.status}`);
  return data;
}

export async function deleteOrganisation(id: string | number) {
  const client = getButtClient();
  const token = client.getAccessToken?.();
  const { public: pub } = useRuntimeConfig();
  const base: string = ((pub as any)?.buttApiUrl || "https://api.dev.builditbuilder.com").replace(/\/+$/,''); // strip trailing slash
  const res = await fetch(`${base}/v1/organisations/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": token ? `Bearer ${token}` : "",
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Delete failed: ${res.status}`);
  return data;
}


