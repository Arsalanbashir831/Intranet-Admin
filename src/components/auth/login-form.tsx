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

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync(data);
      toast.success("Login successful!");
      router.push(ROUTES.ADMIN.DASHBOARD);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Login failed. Please try again.");
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
          <h1 className="mb-8 text-center text-4xl font-medium tracking-tight text-[#373332] sm:mb-10 sm:text-5xl">
            ADMIN LOGIN
          </h1>

          {/* Fields */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full max-w-md flex-col items-stretch space-y-6 text-center"
          >
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
                  errors.username ? "border-red-500" : "",
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
                  errors.password ? "border-red-500" : "",
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
              {isLoading || loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        {/* Right: Image with spacing + rounded corners */}
        <div className="relative hidden items-center justify-center p-6 sm:p-8 lg:flex xl:p-12">
          <div className="relative h-[87vh] w-full overflow-hidden rounded-2xl shadow-md">
            <Image
              src="/auth-img.png"
              alt="Office"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
