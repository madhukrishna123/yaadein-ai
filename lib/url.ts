export function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function absoluteAppUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  return `${appBaseUrl()}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}
