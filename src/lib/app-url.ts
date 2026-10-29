export function getCanonicalAppOrigin(value = process.env.NEXT_PUBLIC_APP_URL): string {
  if (!value) throw new Error("NEXT_PUBLIC_APP_URL is not configured");

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_APP_URL must be an absolute URL");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("NEXT_PUBLIC_APP_URL must use HTTP(S)");
  }
  if (url.username || url.password) {
    throw new Error("NEXT_PUBLIC_APP_URL must not contain credentials");
  }

  return url.origin;
}
