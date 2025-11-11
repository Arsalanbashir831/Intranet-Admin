"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useResetPasswordWithOTP } from "@/hooks/queries/use-auth";
import { ROUTES } from "@/constants/routes";

export function ResetPassword() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";
  const otp = searchParams?.get("otp") || "";

  const { mutate: resetPassword } = useResetPasswordWithOTP();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      const errorMessage = "Email is required";
      toast.error(errorMessage);
      return;
    }

    if (!otp) {
      const errorMessage = "OTP is required";
      toast.error(errorMessage);
      return;
    }

    if (newPassword !== confirmPassword) {
      const errorMessage = "Passwords do not match";
      toast.error(errorMessage);
      return;
    }

    if (newPassword.length < 8) {
      const errorMessage = "Password must be at least 8 characters long";
      toast.error(errorMessage);
      return;
    }

    setIsSubmitting(true);

    resetPassword(
      {
        email,
        otp,
        new_password: newPassword,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          toast.success("Password reset successfully!");
        },
        onError: (error) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to reset password. Please try again.";
          toast.error(errorMessage);
        },
      }
    );

    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8">
        <div className="w-full max-w-md space-y-6 py-8 md:py-0 text-center">
          <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 mb-6">
            Password Reset Successful
          </h1>
          <p className="text-gray-600 mb-6">
            Your password has been successfully reset. You can now sign in with
            your new password.
          </p>
          <Link href={ROUTES.AUTH.LOGIN}>
            <Button className="w-full h-12 mb-2 bg-[#E5004E] hover:bg-pink-300 text-white rounded-full font-medium text-base">
              Go to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show error if email or OTP is missing
  if (!email || !otp) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8">
        <div className="w-full max-w-md space-y-6 py-8 md:py-0 text-center">
          <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 mb-6">
            Invalid Reset Link
          </h1>
          <p className="text-gray-600 mb-6">
            The password reset link is invalid or has expired. Please request a
            new password reset.
          </p>
          <Link href={ROUTES.AUTH.FORGOT_PASSWORD}>
            <Button className="w-full h-12 mb-2 bg-[#E5004E] hover:bg-pink-300 text-white rounded-full font-medium text-base">
              Request New Reset Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 sm:px-8">
      <div className="w-full max-w-md space-y-6 py-8 md:py-0">
        <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 mb-6 text-center md:text-left">
          Reset Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="new-password"
              className="text-sm font-medium text-gray-700"
            >
              New Password*
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-12 pr-10 border-gray-200 focus:border-pink-500 focus:ring-pink-500 bg-gray-50"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm New Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="confirm-password"
              className="text-sm font-medium text-gray-700"
            >
              Confirm New Password*
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Password"
                required
                className="h-12 pr-10 border-gray-200 focus:border-pink-500 focus:ring-pink-500 bg-gray-50"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 mb-2 bg-[#E5004E] hover:bg-pink-300 text-white rounded-full font-medium text-base"
          >
            {isSubmitting ? "Resetting..." : "Confirm Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
