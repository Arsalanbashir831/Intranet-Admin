"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/queries/use-auth";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";
import RightAuthAside from "./RightAuthAside";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null); // Add state for API errors

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors, // Add clearErrors function
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null); // Clear previous API errors
    clearErrors(); // Clear form validation errors
    
    try {
      await loginMutation.mutateAsync(data);
      toast.success("Login successful!");
      router.push(ROUTES.ADMIN.DASHBOARD);
    } catch (error: unknown) {
      // Type the error object to check for axios-like response structure
      const err = error as { 
        response?: { 
          status?: number;
          data?: { 
            detail?: string;
            username?: string[];
            password?: string[];
          } 
        };
        message?: string;
      };
      
      // Check if this is an API error with a response (axios error structure)
      const statusCode = err.response?.status;
      
      if (statusCode) {
        // Handle specific HTTP status codes
        if (statusCode === 403) {
          // Forbidden - user is not authorized as admin or account locked
          const detail = err.response?.data?.detail;
          
          // Check for specific backend messages
          if (detail === "Not authorized as admin.") {
            setApiError("Not authorized as admin. Please use an admin account to login.");
            toast.error("Not authorized as admin.");
          } else if (detail) {
            // Show any other detail message from backend
            setApiError(detail);
            toast.error(detail);
          } else {
            // Generic 403 message
            setApiError("Account access denied. Please contact your administrator.");
            toast.error("Access denied.");
          }
        } else if (statusCode === 401) {
          // Unauthorized - incorrect credentials
          setApiError("Invalid username or password.");
          toast.error("Invalid credentials.");
        } else if (statusCode === 400) {
          // Bad request - likely validation errors
          if (err.response?.data?.username) {
            setApiError(err.response.data.username[0]);
          } else if (err.response?.data?.password) {
            setApiError(err.response.data.password[0]);
          } else {
            setApiError("Invalid username or password.");
          }
        } else if (statusCode === 500) {
          // Server error
          setApiError("Server error. Please try again later.");
          toast.error("Server error. Please try again later.");
        } else if (statusCode === 503) {
          // Service unavailable
          setApiError("Service temporarily unavailable. Please try again later.");
          toast.error("Service temporarily unavailable.");
        } else {
          // Other errors - try to get detail from backend
          const errorMessage = err.response?.data?.detail || "Login failed. Please try again.";
          setApiError(errorMessage);
          toast.error(errorMessage);
        }
      } else {
        // No status code - could be network error or error thrown from mutation hook
        // Check if error has a message that we can display
        if (error instanceof Error && error.message) {
          setApiError(error.message);
          toast.error(error.message);
        } else {
          setApiError("Unable to connect to the server. Please check your connection and try again.");
          toast.error("Connection error. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto grid min-h-screen grid-cols-1 overflow-hidden bg-white lg:grid-cols-2">
        {/* Left: Form (centered content) */}
        <div className="relative flex flex-col items-center justify-center px-6 py-14 sm:px-10 lg:px-14">
          {/* Keep logo at the top-left while centering the rest */}
          <div className="absolute left-6 top-6 sm:left-10 sm:top-8">
            <Image
              src="/logo-primary.svg"
              alt="Cartwright King"
              width={200}
              height={52}
              className="h-auto w-[200px] md:w-[240px]"
              priority
            />
          </div>

          {/* Title */}
          <h1 className="mb-8 text-center text-4xl font-bold tracking-tight text-[#373332] sm:mb-10 sm:text-5xl">
            ADMIN LOGIN
          </h1>

          {/* Fields */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full max-w-md flex-col items-stretch space-y-6 text-center"
          >
            {/* Display API error message */}
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
                <p className="text-sm text-red-500">{errors.username.message}</p>
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
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || loginMutation.isPending}
              className="h-11 w-full rounded-full bg-secondary text-white disabled:opacity-70"
            >
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

        {/* Right: Full-width auth pane */}
        <div className="relative hidden lg:flex">
          <RightAuthAside/>
        </div>
      </div>
    </div>
  );
}
