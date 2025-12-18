import { NewHireTable } from "@/components/new-hire/new-hire-table";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

const BREADCRUMBS = [
  { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
  { label: "Training Checklists", href: ROUTES.ADMIN.NEW_HIRE_PLAN },
];

export default function NewHirePlanPage() {
  return (
    <>
      <PageHeader
        title="Training Checklists"
        crumbs={BREADCRUMBS}
        action={
          <Link href={ROUTES.ADMIN.ADD_NEW_HIRE_PLAN}>
            <Button>Add New</Button>
          </Link>
        }
      />
      <div className="px-4 md:px-12 py-4">
        <NewHireTable />
      </div>
    </>
  );
}
