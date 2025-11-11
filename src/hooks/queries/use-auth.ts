import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { login, logout, refreshToken, getMe, changePassword, resetPasswordWithOTP} from "@/services/auth";
import type { LoginRequest, ChangePasswordRequest, ResetPasswordWithOTPRequest } from "@/services/auth";
import { ROUTES } from "@/constants/routes";
import { setAuthCookies, clearAuthCookies } from "@/lib/cookies";

export function useLogin() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (credentials: LoginRequest) => login(credentials),
		onSuccess: async (data) => {
			// Store tokens via cookies only
			if (typeof window !== "undefined") {
				setAuthCookies(data.access, data.refresh);

				// Dispatch custom event to notify auth context
				window.dispatchEvent(new CustomEvent("auth:login"));
			}

			// Invalidate all queries to refetch with new auth state
			qc.invalidateQueries();

			// Navigate to dashboard
			if (typeof window !== "undefined") {
				// Redirect directly to dashboard
				window.location.assign(ROUTES.ADMIN.DASHBOARD);
			}
		},
		onError: (error) => {
			console.error("Login failed:", error);
			// Let the error pass through as-is so the component can access response data
			// The component will handle the error display logic
		},
	});
}

export function useLogout() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: logout,
		retry: false,
		// Prevent churn immediately when user clicks sign out
		onMutate: async () => {
			await qc.cancelQueries();
			if (typeof window !== "undefined") {
				clearAuthCookies();
				window.dispatchEvent(new CustomEvent("auth:logout"));
			}
		},
		onSuccess: () => {
			// Clear tokens (cookies-only)
			if (typeof window !== "undefined") {
				clearAuthCookies();

				// Dispatch custom event to notify auth context
				window.dispatchEvent(new CustomEvent("auth:logout"));
			}

			// Clear all cached data
			qc.clear();

			// Redirect to login page
			if (typeof window !== "undefined") {
				window.location.href = ROUTES.AUTH.LOGIN;
			}
		},
		onError: (error) => {
			console.error("Logout failed:", error);
			// Even if logout fails on server, clear local state
			if (typeof window !== "undefined") {
				clearAuthCookies();

				// Dispatch custom event to notify auth context
				window.dispatchEvent(new CustomEvent("auth:logout"));

				qc.clear();
				window.location.href = ROUTES.AUTH.LOGIN;
			}
		},
	});
}

export function useRefreshToken() {
	return useMutation({
		mutationFn: (refreshTokenValue: string) => refreshToken(refreshTokenValue),
		onSuccess: (data) => {
			// Update stored tokens (cookies-only)
			if (typeof window !== "undefined") {
				setAuthCookies(data.access, data.refresh || "");
			}
		},
		onError: (error) => {
			console.error("Token refresh failed:", error);
			// If refresh fails, clear tokens and redirect to login
			if (typeof window !== "undefined") {
				clearAuthCookies();
				window.location.href = ROUTES.AUTH.LOGIN;
			}
		},
	});
}

export function useMe() {
	return useQuery({
		queryKey: ["me"],
		queryFn: getMe,
		staleTime: 60_000,
		refetchOnWindowFocus: false,
	});
}

export function useResetPasswordWithOTP() {
	return useMutation({
	  mutationFn: (data: ResetPasswordWithOTPRequest) => resetPasswordWithOTP(data),
	  onError: (error) => {
		console.error("Reset password failed:", error);
		throw new Error("Failed to reset password. Please try again.");
	  },
	});
  }

export function useChangePassword() {
	return useMutation({
		mutationFn: (payload: ChangePasswordRequest) => changePassword(payload),
	});
}
