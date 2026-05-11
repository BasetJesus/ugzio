import crypto from "crypto";

export async function proxyToPython(endpoint: string, payload: unknown): Promise<Response> {
  const url = `${process.env.PYTHON_SERVICE_URL || "http://localhost:8000"}${endpoint}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Trace-ID": crypto.randomUUID() },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(3000),
  });

  if (!res.ok) {
    throw new Error(`Python service error: ${res.status}`);
  }

  return res;
}
