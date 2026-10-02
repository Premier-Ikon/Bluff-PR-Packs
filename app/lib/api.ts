const API_URL = process.env.NEXT_PUBLIC_PR_API_URL || "";

export async function api<T>(body: Record<string, unknown>, token = ""): Promise<T> {
  if (!API_URL) {
    throw new Error("PR API URL is not configured.");
  }
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as T & { success?: boolean; error?: string };
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || "Could not reach the PR packs API.");
  }
  return payload;
}
