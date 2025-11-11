"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { API_ROUTES } from "@/constants/api-routes";
import apiCaller from "@/lib/api-caller";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// Call the forgot password APIII
			await apiCaller(API_ROUTES.AUTH.FORGOT_PASSWORD, "POST", { email });
			
			// Redirect to OTP verification page with email parameter
			router.push(ROUTES.AUTH.OTP_VERIFICATION + `/?email=${encodeURIComponent(email)}`);
			
			toast.success("Password reset email sent successfully!");
		} catch (err) {
			console.error("Forgot password error:", err);
			const errorMessage = err instanceof Error ? err.message : "Failed to send reset email. Please try again.";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex-1 flex items-center justify-center px-6 sm:px-8">
			<div className="w-full max-w-md lg:w-[450px] lg:h-[428px] md:py-0 space-y-6">
				{/* Title */}
				<div>
					<h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-2 text-center md:text-left">
						Forgot Password
					</h1>
					<p className="text-base sm:text-lg text-gray-600 text-center md:text-left">
						Please enter your details below
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Email Input */}
					<div className="relative space-y-2">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
							<Image
								src="/icons/sms.svg"
								alt="Email Icon"
								width={18}
								height={18}
								className="text-gray-400"
							/>
						</span>
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="hello@cartwright.com"
							required
							className="h-12 border-gray-700 rounded-full focus:border-pink-500 focus:ring-pink-500 text-gray-900 pl-10"
						/>
					</div>

					{/* Send Reset Email Button */}
					<Button 
						type="submit" 
						disabled={isSubmitting}
						className="w-full mb-4 h-12 bg-[#E5004E] hover:bg-pink-400 text-white rounded-full font-medium text-base">
						{isSubmitting ? "Sending..." : "Send reset email"}
					</Button>

					{/* Back to Sign In Button */}
					<Link href={ROUTES.AUTH.LOGIN}>
						<Button
							variant="outline"
							type="button"
							className="w-full h-12 border-gray-700 text-gray-700 hover:bg-gray-50 rounded-full font-medium text-base bg-transparent">
							Back to sign in
						</Button>
					</Link>
				</form>
			</div>
		</div>
	);
}