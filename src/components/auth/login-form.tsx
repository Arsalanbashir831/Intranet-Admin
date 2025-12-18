"use client";

// Update imports
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin, useMfaVerify } from "@/hooks/queries/use-auth"; // Added useMfaVerify
import { toast } from "sonner";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const mfaVerifyMutation = useMfaVerify(); // MFA Hook
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // MFA State
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  const [challengeToken, setChallengeToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleError = useErrorHandler({
    customMessages: {
      403: "Not authorized as admin. Please use an admin account to login.",
      401: "Invalid username or password.",
      500: "Server error. Please try again later.",
      503: "Service temporarily unavailable. Please try again later.",
    },
    showToast: false,
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);
    clearErrors();

    try {
      const response = await loginMutation.mutateAsync(data);

      // Check for MFA requirement
      if (response.mfa_required && response.challenge_token) {
        setIsMfaRequired(true);
        setChallengeToken(response.challenge_token);
        toast.info("Two-factor authentication required.");
      } else {
        toast.success("Login successful!");
        router.push(ROUTES.ADMIN.DASHBOARD);
      }
    } catch (error: unknown) {
      const errorMessage = handleError(error);
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode || mfaCode.length !== 6) {
      setApiError("Please enter a valid 6-digit code.");
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      await mfaVerifyMutation.mutateAsync({
        challenge_token: challengeToken,
        code: mfaCode,
      });
      toast.success("Login successful!");
      router.push(ROUTES.ADMIN.DASHBOARD);
    } catch (error: unknown) {
      setApiError("Invalid authentication code.");
      toast.error("Invalid authentication code.");
    } finally {
      setIsLoading(false);
    }
  };
  if (isMfaRequired) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8">
        <div className="w-full max-w-md space-y-8 flex flex-col items-center">
          {/* Icon */}
          <div className="h-20 w-20 bg-[#E5004E] rounded-full flex items-center justify-center mb-2">
            <div className="h-10 w-10 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-full h-full">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-[#111827] tracking-tight">
              OTP Verification
            </h1>
            <div className="text-lg text-gray-500">
              Enter the 6-digit code from your <br /> authenticator app
            </div>
            <div className="flex items-center justify-center gap-1 text-base text-gray-500 mt-2">
              <span>Not your account?</span>
              <Button
                variant="link"
                onClick={() => {
                  setIsMfaRequired(false);
                  setMfaCode("");
                  setChallengeToken("");
                }}
                className="text-[#2563EB] hover:underline font-medium px-0">
                Change it
              </Button>
            </div>
          </div>

          <form onSubmit={handleMfaSubmit} className="w-full space-y-8 mt-4">
            {apiError && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 text-center">
                {apiError}
              </div>
            )}
            <div className="flex justify-center w-full">
              <InputOTP
                maxLength={6}
                value={mfaCode}
                onChange={(val) => setMfaCode(val)}>
                <InputOTPGroup className="gap-3 sm:gap-4 flex w-full justify-center">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="w-14 h-14 sm:w-[80px] sm:h-[67px] rounded-2xl! sm:rounded-3xl! text-lg text-center border border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="submit"
              disabled={
                isLoading || mfaVerifyMutation.isPending || mfaCode.length !== 6
              }
              className="w-full h-14 bg-[#F4729F] hover:bg-[#E5004E] text-white rounded-full font-semibold text-lg transition-colors shadow-sm">
              {isLoading || mfaVerifyMutation.isPending
                ? "Verifying..."
                : "Submit"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8">
        <div className="w-full max-w-md lg:w-[450px] lg:h-[428px] md:py-0 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-semibold text-center text-gray-900 mb-8">
            ADMIN LOGIN
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full max-w-md flex-col items-stretch space-y-6 text-center">
            {apiError && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                {apiError}
              </div>
            )}

            <div className="w-full space-y-2">
              <Label htmlFor="username" className="text-sm text-[#2b2b2b]">
                Username <span className="text-[#27ae60]">*</span>
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                {...register("username")}
                className={[
                  "h-11 rounded-md border border-[#E5E7EB] bg-white text-[15px] shadow-none",
                  "focus-visible:ring-0 focus-visible:border-[#c62d64]",
                  errors.username || apiError ? "border-red-500" : "",
                ].join(" ")}
              />
              {errors.username && (
                <p className="text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="w-full space-y-2">
              <Label htmlFor="password" className="text-sm text-[#2b2b2b]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                {...register("password")}
                className={[
                  "h-11 rounded-md border border-[#E5E7EB] bg-white text-[15px] shadow-none",
                  "focus-visible:ring-0 focus-visible:border-[#c62d64]",
                  errors.password || apiError ? "border-red-500" : "",
                ].join(" ")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="text-right">
              <Link href={ROUTES.AUTH.FORGOT_PASSWORD}>
                <Button
                  variant="link"
                  className="text-sm text-teal-500 hover:underline"
                  type="button">
                  Forgot password ?
                </Button>
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading || loginMutation.isPending}
              className="h-11 w-full rounded-full bg-secondary text-white disabled:opacity-70">
              {isLoading || loginMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
