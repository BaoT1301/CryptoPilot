import { API_BASE_URL } from "@/lib/config";

export async function apiCall<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown
): Promise<T> {
  const token = localStorage.getItem("auth_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    let msg = HTTP_MESSAGES[res.status] ?? `Request failed (${res.status})`;
    try {
      const data = await res.json();
      // Handlers are not consistent about the field they use, so accept both
      // rather than falling back to a status code the user cannot act on.
      const fromBody = data?.message ?? data?.error;
      if (typeof fromBody === "string" && fromBody.trim()) msg = fromBody;
    } catch {
      // Body was not JSON, usually an HTML error page. The status message
      // above is more useful than a parse error.
    }
    throw new Error(msg);
  }

  // 204 No Content (order cancel, logout) has an empty body, and res.json()
  // on an empty body throws "Unexpected end of JSON input" -- turning a
  // successful request into a visible error.
  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    // A 2xx carrying non-JSON means a proxy or error page answered instead of
    // the API. Surfacing "Unexpected token '<'" tells the user nothing.
    throw new Error("The server sent an unexpected response.");
  }
}

/** Plain-language defaults so a failure never reads as a status code. */
const HTTP_MESSAGES: Record<number, string> = {
  400: "That request was not valid.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have access to that.",
  404: "That could not be found.",
  409: "That already exists.",
  429: "Too many requests. Try again shortly.",
  500: "Something went wrong on our side.",
  502: "The server is unreachable right now.",
  503: "The service is temporarily unavailable.",
};
