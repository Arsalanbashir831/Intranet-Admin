"use client";

import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { BranchesTable } from "@/components/branches/branches-table";
import { useAppModalControls } from "@/components/common/app-modal";
import { NewBranchModal } from "@/components/branches/new-branch-modal";
import { useAdmin } from "@/hooks/use-admin";

const BREADCRUMBS = [
  { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
  { label: "Branches", href: ROUTES.ADMIN.BRANCHES },
];

export default function BranchesPage() {
  const { isSuperuser } = useAdmin();
  const { open, setOpen } = useAppModalControls(false);

  return (
    <>
      <PageHeader
        title="Branches"
        crumbs={BREADCRUMBS}
        action={
          isSuperuser ? (
            <Button onClick={() => setOpen(true)}>Add New</Button>
          ) : undefined
        }
      />
      <div className="px-4 md:px-12 py-4">
        <BranchesTable />
      </div>

      <NewBranchModal open={open} setOpen={setOpen} />
    </>
  );
}
