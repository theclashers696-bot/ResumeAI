export class AIClientError extends Error {}

export async function callAI<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => ({}))) as { data?: T; error?: string };

  if (!res.ok) {
    throw new AIClientError(json.error ?? "Something went wrong. Please try again.");
  }

  return json.data as T;
}
