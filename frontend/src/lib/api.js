// frontend/src/lib/api.js

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Small fetch wrapper for the backend.
 * - sends the httpOnly auth cookie (credentials: "include")
 * - always returns parsed JSON, or throws an ApiError with a readable message
 */
export async function api(path, { method = "GET", body, headers } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Please check your connection.", 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // response had no JSON body
  }

  if (!res.ok) {
    throw new ApiError(data?.message || "Something went wrong. Please try again.", res.status);
  }
  return data;
}

// Auth endpoints in one place
export const authApi = {
  signup: (payload) => api("/api/auth/signup", { method: "POST", body: payload }),
  login: (payload) => api("/api/auth/login", { method: "POST", body: payload }),
  google: (credential) => api("/api/auth/google", { method: "POST", body: { credential } }),
  logout: () => api("/api/auth/logout", { method: "POST" }),
  me: () => api("/api/auth/me"),
};