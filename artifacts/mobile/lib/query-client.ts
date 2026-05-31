import { setBaseUrl as setClientBaseUrl } from "@workspace/api-client-react";

let baseUrl = "";

export function setBaseUrl(url: string) {
  const normalized = url.endsWith("/") ? url.slice(0, -1) : url;
  baseUrl = normalized ? `${normalized}/` : "";
  setClientBaseUrl(normalized || null);
}

export function getApiUrl(): string {
  return baseUrl;
}
