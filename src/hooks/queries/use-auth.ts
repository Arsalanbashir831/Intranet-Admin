import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
// Update imports to include MFA functions
import { login, logout, refreshToken, getMe, changePassword, resetPasswordWithOTP, forgotPassword, mfaEnroll, mfaConfirm, mfaVerify, mfaDisable } from "@/services/auth";


import { ROUTES } from "@/constants/routes";
import { setAuthCookies, clearAuthCookies } from "@/lib/cookies";
import { TokenRefresh, MfaConfirmRequest, MfaVerifyRequest, MfaDisableRequest } from "@/types/auth";

export function useLogin() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (credentials: { username: string; password: string }) => login(credentials),
		onSuccess: async (data) => { // Use 'any' temporarily or update LoginResponse type in hook if strict
			// If MFA is required, we don't set cookies or redirect yet
			if (data.mfa_required) {
				return;
			}

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
		onError: (error: Error) => {
			console.error("Login failed:", error);
			// Let the error pass through as-is so the component can access response data
			// The component will handle the error display logic
		},
	});
}

// ... existing useLogout ...

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
		onError: (error: Error) => {
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
		onSuccess: (data: TokenRefresh) => {
			// Update stored tokens (cookies-only)
			if (typeof window !== "undefined") {
				setAuthCookies(data.access, data.refresh || "");
			}
		},
		onError: (error: Error) => {
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
		mutationFn: (data: { email: string; otp: string; new_password: string }) => resetPasswordWithOTP(data),
		onError: (error: Error) => {
			console.error("Reset password failed:", error);
			throw new Error("Failed to reset password. Please try again.");
		},
	});
}

export function useChangePassword() {
	return useMutation({
		mutationFn: (payload: { current_password: string; new_password: string }) => changePassword(payload),
	});
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}

// MFA Hooks
export function useMfaEnroll() {
	return useMutation({
		mutationFn: mfaEnroll,
	});
}

export function useMfaConfirm() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: MfaConfirmRequest) => mfaConfirm(data),
		onSuccess: () => {
			// Refresh 'me' query to update user status
			qc.invalidateQueries({ queryKey: ["me"] });
		}
	});
}

export function useMfaVerify() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (data: MfaVerifyRequest) => mfaVerify(data),
		onSuccess: () => {
			// Success logic similar to login
			if (typeof window !== "undefined") {
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
		}
	});
}

export function useMfaDisable() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: MfaDisableRequest) => mfaDisable(data),
		onSuccess: () => {
			// Refresh 'me' query to update user status
			qc.invalidateQueries({ queryKey: ["me"] });
		}
	});
}
