// TODO: Uncomment when backend is ready
// import apiCaller from "@/lib/api-caller";
// import { API_ROUTES } from "@/constants/api-routes";
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
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<LoginResponse>(API_ROUTES.AUTH.LOGIN, "POST", credentials, {}, "json");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<LoginResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        access: "dummy_access_token_" + Date.now(),
        refresh: "dummy_refresh_token_" + Date.now(),
        email: credentials.email
      });
    }, 1000);
  });
}

export async function refreshToken(refreshToken: string) {
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<RefreshResponse>(API_ROUTES.AUTH.REFRESH_TOKEN, "POST", { refresh: refreshToken }, {}, "json");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<RefreshResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        access: "dummy_new_access_token_" + Date.now(),
        refresh: refreshToken
      });
    }, 500);
  });
}

export async function logout() {
  // TODO: Uncomment when backend is ready
  // await apiCaller<void>(API_ROUTES.AUTH.LOGOUT, "POST");
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
}
