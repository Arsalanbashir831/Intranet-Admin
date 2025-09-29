import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { setAuthCookies } from "@/lib/cookies";
import type { components } from "@/types/api";

// Align with backend: obtain token expects username and password and returns access/refresh
export type LoginRequest = { username: string; password: string };
export type LoginResponse = { access: string; refresh: string };
export type RefreshRequest = { refresh: string };
export type RefreshResponse = components["schemas"]["TokenRefresh"];
export type VerifyRequest = { token: string };

export async function login(credentials: LoginRequest) {
  const res = await apiCaller<LoginResponse>(API_ROUTES.AUTH.OBTAIN_TOKEN, "POST", credentials, {}, "json");
  const { access, refresh } = res.data;
  // Persist tokens immediately for subsequent requests
  setAuthCookies(access, refresh);
  return res.data;
}

export async function refreshToken(refreshToken: string) {
  const res = await apiCaller<RefreshResponse>(API_ROUTES.AUTH.REFRESH_TOKEN, "POST", { refresh: refreshToken }, {}, "json");
  return res.data;
}

export async function verifyToken(token: string) {
  // Returns void on 200, throws on 401/invalid
  await apiCaller<void>(API_ROUTES.AUTH.VERIFY_TOKEN, "POST", { token } as VerifyRequest, {}, "json");
}

export async function logout() {
  // No backend endpoint specified for logout in current routes.
  // If added later, call it here. For now this is a no-op placeholder.
}
