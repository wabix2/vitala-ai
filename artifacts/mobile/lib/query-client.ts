let baseUrl = "";

export function setBaseUrl(url: string) {
  baseUrl = url.endsWith("/") ? url : `${url}/`;
}

export function getApiUrl(): string {
  return baseUrl;
}
