"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { BranchesTable } from "@/components/branches/branches-table";
import { useAuth } from "@/contexts/auth-context";
import { useAppModalControls } from "@/components/common/app-modal";
import { NewBranchModal } from "@/components/branches/new-branch-modal";

export default function BranchesPage() {
  const { user } = useAuth();
  const isSuperuser = user?.isSuperuser === true;
  const { open, setOpen } = useAppModalControls(false);

  return (
    <>
      <PageHeader
        title="Branches"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Branches", href: ROUTES.ADMIN.BRANCHES }
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
        <BranchesTable />
      </div>

      <NewBranchModal open={open} setOpen={setOpen} />
    </>
  );
}

