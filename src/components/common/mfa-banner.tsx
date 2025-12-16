"use client";

import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/queries/use-auth";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export function MfaBanner() {
    const { data: meData, isLoading } = useMe();

    // Don't show while loading
    if (isLoading) return null;

    // Check if MFA is enabled
    const mfaEnabled = meData?.user?.mfa_enabled;

    // If enabled (or undefined/null which shouldn't happen for valid user), don't show
    if (mfaEnabled) return null;

    return (
        <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-3 shadow-sm mb-2">
            <div className="container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mx-auto max-w-7xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-full text-amber-600 shrink-0">
                        <ShieldAlert className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-amber-800">
                            Two-Factor Authentication is disabled
                        </p>
                        <p className="text-xs text-amber-700/90">
                            Your account is currently less secure. Enable 2FA to better protect your data.
                        </p>
                    </div>
                </div>
                <Link href={ROUTES.ADMIN.PROFILE} className="block self-end">
                    <Button
                        size="sm"
                        variant="outline"
                        className="whitespace-nowrap bg-white border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 h-8"
                    >
                        Enable 2FA
                    </Button>
                </Link>
            </div>
        </div>
    );
}
