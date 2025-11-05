"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { RolesTable } from "@/components/roles/roles-table";
import { useAuth } from "@/contexts/auth-context";
import { useAppModalControls } from "@/components/common/app-modal";
import { NewRoleModal } from "@/components/roles/new-role-modal";

export default function RolesPage() {
  const { user } = useAuth();
  const isSuperuser = user?.isSuperuser === true;
  const { open, setOpen } = useAppModalControls(false);

  return (
    <>
      <PageHeader
        title="Roles"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Roles", href: ROUTES.ADMIN.ROLES }
        ]}
        action={
          isSuperuser ? (
            <Button onClick={() => setOpen(true)}>
              Add New
            </Button>
          ) : undefined
        }
      />
      <div className="px-4 md:px-12 py-4">
        <RolesTable />
      </div>

      <NewRoleModal open={open} setOpen={setOpen} />
    </>
  );
}

