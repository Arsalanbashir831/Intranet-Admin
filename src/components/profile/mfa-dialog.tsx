"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMfaEnroll, useMfaConfirm, useMfaDisable } from "@/hooks/queries/use-auth";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check } from "lucide-react";

interface MfaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEnabled: boolean;
}

type ViewState = "initial" | "enroll-qr" | "disable-confirm";

export function MfaDialog({ open, onOpenChange, isEnabled }: MfaDialogProps) {
    const [view, setView] = React.useState<ViewState>("initial");
    const [secret, setSecret] = React.useState("");
    const [otpAuthUri, setOtpAuthUri] = React.useState("");
    const [code, setCode] = React.useState("");
    const [copied, setCopied] = React.useState(false);

    const { mutate: enroll, isPending: isEnrolling } = useMfaEnroll();
    const { mutate: confirm, isPending: isConfirming } = useMfaConfirm();
    const { mutate: disable, isPending: isDisabling } = useMfaDisable();

    // Reset state when dialog opens
    React.useEffect(() => {
        if (open) {
            setView("initial");
            setCode("");
            setSecret("");
            setOtpAuthUri("");
        }
    }, [open]);

    const handleStartEnroll = () => {
        enroll(undefined, {
            onSuccess: (data) => {
                setSecret(data.secret);
                setOtpAuthUri(data.otpauth_uri);
                setView("enroll-qr");
            },
            onError: () => {
                toast.error("Failed to start enrollment. Please try again.");
            }
        });
    };

    const handleConfirmEnroll = (e: React.FormEvent) => {
        e.preventDefault();
        confirm(
            { code },
            {
                onSuccess: () => {
                    toast.success("2FA enabled successfully!");
                    onOpenChange(false);
                },
                onError: () => {
                    toast.error("Invalid code. Please try again.");
                }
            }
        );
    };

    const handleDisable = (e: React.FormEvent) => {
        e.preventDefault();
        disable(
            { code },
            {
                onSuccess: () => {
                    toast.success("2FA disabled successfully.");
                    onOpenChange(false);
                },
                onError: () => {
                    toast.error("Failed to disable 2FA. Check your code and try again.");
                }
            }
        );
    };

    const copySecret = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Two-Factor Authentication (2FA)</DialogTitle>
                    <DialogDescription>
                        Enhance your account security by requiring a verification code during login.
                    </DialogDescription>
                </DialogHeader>

                {/* INITIAL VIEW */}
                {view === "initial" && (
                    <div className="space-y-4 py-4">
                        {isEnabled ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">
                                    ✓ Two-factor authentication is currently <strong>enabled</strong>.
                                </div>
                                <p className="text-sm text-gray-500">
                                    To disable 2FA, you will need to enter a code from your authenticator app.
                                </p>
                                <div className="flex justify-end">
                                    <Button
                                        variant="destructive"
                                        onClick={() => setView("disable-confirm")}
                                    >
                                        Disable 2FA
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500">
                                    When enabled, you will need to use an authenticator app (like Google Authenticator) to generate a code when logging in.
                                </p>
                                <div className="flex justify-end">
                                    <Button onClick={handleStartEnroll} disabled={isEnrolling}>
                                        {isEnrolling ? "Starting..." : "Setup 2FA"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ENROLLMENT - QR CODE SCAN */}
                {view === "enroll-qr" && (
                    <form onSubmit={handleConfirmEnroll} className="space-y-6 py-4">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="p-4 bg-white border rounded-lg shadow-sm">
                                {otpAuthUri && (
                                    <QRCodeSVG value={otpAuthUri} size={160} />
                                )}
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-sm font-medium">Scan this QR Code</p>
                                <p className="text-xs text-gray-500">Use Google Authenticator or similar app</p>
                            </div>

                            <div className="w-full relative">
                                <Label className="text-xs text-gray-500 mb-1 block">Or enter code manually</Label>
                                <div className="flex gap-2">
                                    <Input value={secret} readOnly className="font-mono text-xs bg-gray-50" />
                                    <Button size="icon" variant="outline" type="button" onClick={copySecret}>
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="verify-code">Verify Code</Label>
                            <Input
                                id="verify-code"
                                placeholder="Enter 6-digit code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                autoComplete="off"
                                required
                            />
                        </div>

                        <div className="flex justify-between">
                            <Button type="button" variant="ghost" onClick={() => setView("initial")}>
                                Back
                            </Button>
                            <Button type="submit" disabled={isConfirming || code.length !== 6}>
                                {isConfirming ? "Verifying..." : "Enable 2FA"}
                            </Button>
                        </div>
                    </form>
                )}

                {/* DISABLE CONFIRMATION */}
                {view === "disable-confirm" && (
                    <form onSubmit={handleDisable} className="space-y-4 py-4">
                        <div className="p-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200 text-sm">
                            Warning: Disabling 2FA will lower your account security.
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="disable-code">Enter Code to Confirm</Label>
                            <Input
                                id="disable-code"
                                placeholder="Enter 6-digit code from app"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                autoComplete="off"
                                required
                            />
                        </div>

                        <div className="flex justify-between mt-4">
                            <Button type="button" variant="ghost" onClick={() => setView("initial")}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={isDisabling || code.length !== 6}>
                                {isDisabling ? "Disabling..." : "Confirm Disable"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
