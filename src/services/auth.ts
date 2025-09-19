import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import type { components } from "@/types/api";

export type LoginRequest = components["schemas"]["CustomTokenObtainPairRequest"];
// The actual response from Django JWT might include access/refresh tokens
export type LoginResponse = {
  access: string;
  refresh: string;
  email?: string;
};
export type RefreshRequest = components["schemas"]["TokenRefreshRequest"];
export type RefreshResponse = components["schemas"]["TokenRefresh"];

export async function login(credentials: LoginRequest) {
  const res = await apiCaller<LoginResponse>(API_ROUTES.AUTH.LOGIN, "POST", credentials, {}, "json");
  return res.data;
}

export async function refreshToken(refreshToken: string) {
  const res = await apiCaller<RefreshResponse>(API_ROUTES.AUTH.REFRESH_TOKEN, "POST", { refresh: refreshToken }, {}, "json");
  return res.data;
}

export async function logout() {
  await apiCaller<void>(API_ROUTES.AUTH.LOGOUT, "POST");
}
