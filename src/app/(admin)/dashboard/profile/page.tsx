"use client";

import { useState } from "react";
import { ProfileCard } from "@/components/profile/profile-card";
import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog";
import { PageHeader } from "@/components/common";
import { ROUTES } from "@/constants/routes";
import { MfaDialog } from "@/components/profile/mfa-dialog";
import { Badge } from "@/components/ui/badge";
import { useMe } from "@/hooks/queries/use-auth";

export default function ProfilePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMfaDialogOpen, setIsMfaDialogOpen] = useState(false);
  const { data: meData } = useMe();
  const mfaEnabled = meData?.user?.mfa_enabled; // Updated to read from employee object

  return (
    <>
      <PageHeader
        title="Profile"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Profile" },
        ]}
        action={
          <Button
            variant="outline"
            className="bg-primary text-white hover:bg-primary/90 hover:text-white border-0 shadow-sm"
            onClick={() => setIsDialogOpen(true)}
          >
            Change Password
          </Button>
        }
      />
      <div className="w-full min-h-screen bg-[#F8F8F8]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <ProfileCard />

          {/* Security Section */}
          <div className="w-full">
            <h2 className="text-lg font-semibold mb-4 text-[#111827]">Security Settings</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-full">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[#111827]">Two-Factor Authentication (2FA)</h3>
                    {mfaEnabled && <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Enabled</Badge>}
                  </div>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security to your account using an authenticator app.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant='outline'
                    onClick={() => setIsMfaDialogOpen(true)}
                    className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    {mfaEnabled ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <MfaDialog
        open={isMfaDialogOpen}
        onOpenChange={setIsMfaDialogOpen}
        isEnabled={!!mfaEnabled}
      />
    </>
  );
}
