import {
  type ApiErrorResponse,
  PURCHASE_PASS_HEADER,
  apiErrorResponseSchema,
} from "@eztix/shared";

/**
 * Typed REST API client for `apps/web`.
 * Uses same-origin `/api/v1` (proxied via Next.js rewrites to Express in `apps/api`)
 * so that HTTP-only `SameSite=Lax` refresh cookies remain first-party.
 * Source: TRD Section 5.5, 11.3, 12
 */
export class ApiClientError extends Error {
  public readonly status: number;
  public readonly errorPayload: ApiErrorResponse["error"];

  constructor(status: number, errorPayload: ApiErrorResponse["error"]) {
    super(errorPayload.message);
    this.name = "ApiClientError";
    this.status = status;
    this.errorPayload = errorPayload;
  }
}

let inMemoryAccessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  purchasePass?: string;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = normalizedPath.startsWith("/api/")
    ? normalizedPath
    : `/api/v1${normalizedPath}`;

  const headers = new Headers(options.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (inMemoryAccessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${inMemoryAccessToken}`);
  }
  if (options.purchasePass) {
    headers.set(PURCHASE_PASS_HEADER, options.purchasePass);
  }

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
    body:
      options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const json: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsedError = apiErrorResponseSchema.safeParse(json);
    if (parsedError.success) {
      throw new ApiClientError(response.status, parsedError.data.error);
    }
    throw new ApiClientError(response.status, {
      code: "INTERNAL",
      message: `Request failed with status ${response.status}`,
      requestId: response.headers.get("x-request-id") ?? "req_unknown",
    });
  }

  return json as T;
}
