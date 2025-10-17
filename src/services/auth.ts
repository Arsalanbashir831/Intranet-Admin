import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { setAuthCookies } from "@/lib/cookies";
import type { components } from "@/types/api";

// Define types for the me API response
export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
};

export type Executive = {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  role: string;
  education: string;
  bio: string;
  profile_picture: string;
  created_at: string;
  updated_at: string;
};

export type Employee = {
  id: number;
  emp_name: string;
  profile_picture: string | null;
  role: string;
  branch_department_ids: number[];
  isAdmin: boolean;
  // Add employee fields as needed
};

export type MeResponse = {
  user: User;
  employee: Employee | null;
  executive: Executive | null;
};

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
  
  await apiCaller<void>(API_ROUTES.AUTH.VERIFY_TOKEN, "POST", { token: tokenToVerify } as VerifyRequest, {}, "json");
}

// New function to get user profile information
export async function getMe(): Promise<MeResponse> {
  const res = await apiCaller<MeResponse>(API_ROUTES.AUTH.ME, "GET");
  return res.data;
}

export async function logout() {
  // No backend endpoint specified for logout in current routes.
  // If added later, call it here. For now this is a no-op placeholder.
}