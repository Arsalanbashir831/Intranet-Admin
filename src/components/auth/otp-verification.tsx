"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { API_ROUTES } from "@/constants/api-routes";
import apiCaller from "@/lib/api-caller";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";

export function OTPVerification() {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      // Verify the OTP by attempting to reset password with a test password
      // In a real implementation, the backend would verify the OTP separately
      // For now, we'll just redirect to the reset password page
      if (otp.length === 4) {
        // Redirect to reset password page with email and OTP
        router.push(
          ROUTES.AUTH.RESET_PASSWORD +
            `/?email=${encodeURIComponent(email)}&otp=${otp}`
        );
      } else {
        throw new Error("Please enter a valid 4-digit OTP");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Invalid OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email is required to resend OTP");
      return;
    }

    try {
      // Resend OTP
      await apiCaller(API_ROUTES.AUTH.FORGOT_PASSWORD, "POST", { email });
      toast.success("OTP resent successfully!");
    } catch (err) {
      console.error("Resend OTP error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to resend OTP. Please try again.";
      toast.error(errorMessage);
    }
  };

  // Show error if email is missing
  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8">
        <div className="w-full max-w-md space-y-6 py-12 lg:py-0 text-center">
          <h1 className="text-3xl sm:text-5xl font-semibold text-gray-900 mb-6">
            Invalid Request
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6">
            Email is required for OTP verification. Please request a new OTP.
          </p>
          <Link href={ROUTES.AUTH.FORGOT_PASSWORD}>
            <Button className="w-full h-12 mb-2 bg-[#E5004E] hover:bg-pink-300 text-white rounded-full font-medium text-base">
              Request New OTP
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 sm:px-8">
      <div className="w-full max-w-md lg:w-[400px] lg:h-[428px] space-y-6 py-12 lg:py-0">
        {/* Icon */}
        <div className="w-16 h-16 bg-[#E5004E] rounded-full flex items-center justify-center mx-auto lg:mx-0">
          <Image src="/icons/lock.svg" alt="Lock Icon" width={28} height={28} />
        </div>

        {/* Title */}
        <div className="text-center lg:text-left">
          <h1 className="text-3xl sm:text-5xl font-semibold text-gray-900 mb-2">
            OTP Verification
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-1">
            We&lsquo;ve sent a 4-digit code to{" "}
            <span className="font-medium">{email || "your email"}</span>
          </p>
          <p className="text-base sm:text-lg text-gray-600">
            Not your email?{" "}
            <Button
              asChild
              variant="link"
              className="p-0 h-auto text-blue-500 hover:underline font-normal"
            >
              <Link href={ROUTES.AUTH.FORGOT_PASSWORD}>Change it</Link>
            </Button>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center">
            <InputOTP
              maxLength={4}
              value={otp}
              onChange={setOtp}
              disabled={isVerifying}
            >
              <InputOTPGroup className="flex gap-3 sm:gap-4">
                {[0, 1, 2, 3].map((index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="w-14 h-14 sm:w-[80px] sm:h-[67px] !rounded-2xl sm:!rounded-3xl text-lg text-center border border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isVerifying || otp.length !== 4}
            className="w-full h-12 mb-2 bg-[#E5004E] hover:bg-pink-300 text-white rounded-full font-medium text-base"
          >
            {isVerifying ? "Verifying..." : "Submit"}
          </Button>
        </form>

        {/* Resend Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn&lsquo;t get the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="text-blue-500 hover:underline"
            >
              Resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
