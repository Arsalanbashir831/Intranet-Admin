// lib/api.ts
import { API_ROUTES } from "@/constants/api-routes";
import { ROUTES } from "@/constants/routes";
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

const BACKEND_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) || 
  "/api"; // fallback to Next.js API proxy

interface PendingRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

export class ApiClient {
  private axios: AxiosInstance;
  private isRefreshing = false;
  private queue: PendingRequest[] = [];

  constructor() {
    this.axios = axios.create({
      baseURL: BACKEND_URL,
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });

    this.axios.interceptors.request.use(this.attachAccessToken.bind(this));
    this.axios.interceptors.response.use(
      (res) => res,
      this.handleResponseError.bind(this)
    );
  }

  private attachAccessToken(config: InternalAxiosRequestConfig) {
    try {
      if (typeof window !== "undefined") {
        const token = window.localStorage.getItem("accessToken");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // no-op on server or if storage is unavailable
    }
    return config;
  }

  private async refreshAccessToken(): Promise<string> {
    const { data } = await this.axios.post(API_ROUTES.AUTH.REFRESH_TOKEN);
    const newToken = data.access_token as string;
    localStorage.setItem("accessToken", newToken);
    this.axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    return newToken;
  }

  private processQueue(error: unknown, token: string | null = null) {
    this.queue.forEach(({ resolve, reject }) => {
      if (error) reject(error);
      else resolve(token!);
    });
    this.queue = [];
  }

  private async handleResponseError(error: AxiosError) {
    const originalReq = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ** ADD THIS CHECK HERE **
    // If the failed request was the login attempt itself,
    // do not try to refresh the token. Just pass the error along.
    // Ensure API_ROUTES.AUTH.LOGIN is the exact URL path string used in the apiCaller.
    // If API_ROUTES.AUTH.LOGIN includes the base URL, you might need to compare against error.config.url directly
    // or ensure originalReq.url is just the path segment.
    // Assuming originalReq.url is the path relative to baseURL (e.g., "/auth/login")
    if (originalReq.url === API_ROUTES.AUTH.LOGIN) {
      console.log("ApiClient: Login attempt failed. Bypassing token refresh.");
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalReq._retry) {
      originalReq._retry = true;

      if (this.isRefreshing) {
        return new Promise((resolve, reject) => {
          this.queue.push({ resolve, reject });
        }).then((token) => {
          originalReq.headers!["Authorization"] = `Bearer ${token}`;
          return this.axios.request(originalReq);
        });
      }

      this.isRefreshing = true;
      try {
        const newToken = await this.refreshAccessToken();
        this.processQueue(null, newToken);
        originalReq.headers!["Authorization"] = `Bearer ${newToken}`;
        return this.axios.request(originalReq);
      } catch (refreshError) {
        this.processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        if (typeof window !== "undefined") {
          // Check if not already on login page or if it's an auth related path
          const loginPath = ROUTES.AUTH_LOGIN.replace(/\/$/, "");
          const currentPath = window.location.pathname.replace(/\/$/, "");
          if (currentPath !== loginPath) {
            // Trigger a more controlled logout via context if possible, or redirect.
            // For now, keeping the redirect but it's often better if UserContext handles this.
            console.error(
              "ApiClient: Token refresh failed, redirecting to login."
            );
            window.location.href = ROUTES.AUTH_LOGIN;
          }
        }
        return Promise.reject(refreshError);
      } finally {
        this.isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }

  public get instance(): AxiosInstance {
    return this.axios;
  }
}

export const api = new ApiClient().instance;
