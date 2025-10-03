// lib/api.ts
import { API_ROUTES } from "@/constants/api-routes";
import { ROUTES } from "@/constants/routes";
import { getAuthTokens, setAuthCookies, clearAuthCookies } from "@/lib/cookies";
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
        const { accessToken } = getAuthTokens();
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
    } catch {
      // no-op on server or if storage is unavailable
    }
    return config;
  }

  private async refreshAccessToken(): Promise<string> {
    const { refreshToken } = getAuthTokens();
    const { data } = await this.axios.post(
      API_ROUTES.AUTH.REFRESH_TOKEN,
      refreshToken ? { refresh: refreshToken } : undefined
    );
    const newAccess = (data as { access?: string; refresh?: string }).access as string;
    const newRefresh = (data as { access?: string; refresh?: string }).refresh as string | undefined;

    if (typeof window !== "undefined") {
      setAuthCookies(newAccess, newRefresh ?? refreshToken ?? "");
    }

    this.axios.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
    return newAccess;
  }

  private setCookie(name: string, value: string, days: number = 7) {
    if (typeof document !== "undefined") {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }
  }

  private removeCookie(name: string) {
    if (typeof document !== "undefined") {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
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
    // If the failed request was the login attempt itself, token verification, or me endpoint,
    // do not try to refresh the token. Just pass the error along.
    if (originalReq.url === API_ROUTES.AUTH.OBTAIN_TOKEN || 
        originalReq.url === API_ROUTES.AUTH.VERIFY_TOKEN ||
        originalReq.url === API_ROUTES.AUTH.ME) {
      console.log("ApiClient: Login/verify/me attempt failed. Bypassing token refresh.");
      return Promise.reject(error);
    }

    // Handle network errors (no response from server)
    if (!error.response) {
      console.error("ApiClient: Network error or no response from server", error);
      return Promise.reject(new Error("Network error. Please check your connection and try again."));
    }

    // Handle specific HTTP status codes
    switch (error.response.status) {
      case 401:
        // Unauthorized - token might be expired
        break; // Continue with token refresh logic
      case 403:
        // Forbidden - user doesn't have permission
        console.error("ApiClient: Forbidden access", error);
        return Promise.reject(new Error("Access denied. You don't have permission to perform this action."));
      case 404:
        // Not found
        console.error("ApiClient: Resource not found", error);
        return Promise.reject(new Error("Requested resource not found."));
      case 429:
        // Too many requests
        console.error("ApiClient: Rate limit exceeded", error);
        return Promise.reject(new Error("Too many requests. Please try again later."));
      case 500:
        // Internal server error
        console.error("ApiClient: Internal server error", error);
        return Promise.reject(new Error("Server error. Please try again later."));
      case 502:
      case 503:
      case 504:
        // Service unavailable
        console.error("ApiClient: Service unavailable", error);
        return Promise.reject(new Error("Service temporarily unavailable. Please try again later."));
      default:
        // Other errors
        console.error("ApiClient: Unexpected error", error);
        return Promise.reject(new Error("An unexpected error occurred. Please try again."));
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
        if (typeof window !== "undefined") {
          clearAuthCookies();
          
          // Check if not already on login page
          const loginPath = ROUTES.AUTH.LOGIN.replace(/\/$/, "");
          const currentPath = window.location.pathname.replace(/\/$/, "");
          if (currentPath !== loginPath) {
            console.error("ApiClient: Token refresh failed, redirecting to login.");
            window.location.href = ROUTES.AUTH.LOGIN;
          }
        }
        return Promise.reject(new Error("Session expired. Please log in again."));
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