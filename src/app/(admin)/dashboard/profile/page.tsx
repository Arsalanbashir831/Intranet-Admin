"use client";

import { useState } from "react";
import { ProfileCard } from "@/components/profile/profile-card";
import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog";
import { PageHeader } from "@/components/page-header";
import { ROUTES } from "@/constants/routes";

export default function ProfilePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <ProfileCard />
        </div>
      </div>

      <ChangePasswordDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
