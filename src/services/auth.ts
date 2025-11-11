import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { setAuthCookies } from "@/lib/cookies";
import type { MeResponse } from "@/types/auth";


export async function login(credentials: { username: string; password: string }) {
  const res = await apiCaller<{ access: string; refresh: string; }>(API_ROUTES.AUTH.OBTAIN_TOKEN, "POST", credentials, {}, "json");
  const { access, refresh } = res.data;
  // Persist tokens immediately for subsequent requests
  setAuthCookies(access, refresh);
  return res.data;
}

export async function refreshToken(refreshToken: string) {
  const res = await apiCaller<{ access: string; refresh: string; }>(API_ROUTES.AUTH.REFRESH_TOKEN, "POST", { refresh: refreshToken }, {}, "json");
  return res.data;
}

export async function verifyToken(token?: string) {
  // Returns void on 200, throws on 401/invalid
  // If no token provided, get the current token from cookies
  let tokenToVerify = token;
  if (!tokenToVerify && typeof window !== "undefined") {
    const { getAuthTokens } = await import("@/lib/cookies");
    const { accessToken } = getAuthTokens();
    tokenToVerify = accessToken || undefined;
  }

  if (!tokenToVerify) {
    throw new Error("No token available for verification");
  }

  await apiCaller<void>(API_ROUTES.AUTH.VERIFY_TOKEN, "POST", { token: tokenToVerify }, {}, "json");
}

// New function to get user profile information
export async function getMe(): Promise<MeResponse> {
  const res = await apiCaller<MeResponse>(API_ROUTES.AUTH.ME, "GET");
  return res.data;
}

export async function changePassword(
  payload: {
    current_password: string;
    new_password: string;
  }
): Promise<{ message?: string; }> {
  const res = await apiCaller<{ message?: string; }>(
    API_ROUTES.AUTH.CHANGE_PASSWORD,
    "POST",
    payload,
    {},
    "json"
  );
  return res.data;
}

export async function logout() {
  // No backend endpoint specified for logout in current routes.
  // If added later, call it here. For now this is a no-op placeholder.
}

export async function resetPasswordWithOTP(data: { email: string; otp: string; new_password: string }) {
  await apiCaller<void>(API_ROUTES.AUTH.RESET_PASSWORD, "POST", data, {}, "json");
}