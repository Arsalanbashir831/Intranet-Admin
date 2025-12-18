"use client";

import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { RolesTable } from "@/components/roles/roles-table";
import { useAppModalControls } from "@/components/common/app-modal";
import { NewRoleModal } from "@/components/roles/new-role-modal";
import { useAdmin } from "@/hooks/use-admin";

const BREADCRUMBS = [
  { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
  { label: "Roles", href: ROUTES.ADMIN.ROLES },
];

export default function RolesPage() {
  const { isSuperuser } = useAdmin();
  const { open, setOpen } = useAppModalControls(false);

  return (
    <>
      <PageHeader
        title="Roles"
        crumbs={BREADCRUMBS}
        action={
          isSuperuser ? (
            <Button onClick={() => setOpen(true)}>Add New</Button>
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
