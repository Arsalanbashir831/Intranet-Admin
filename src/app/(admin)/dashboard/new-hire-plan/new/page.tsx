import { PageHeader } from "@/components/page-header";
import { ROUTES } from "@/constants/routes";
import { NewHirePlanForm } from "@/components/new-hire/new-hire-plan-form";

export default function NewHirePlanCreatePage() {
  return (
    <>
      <PageHeader
        title="New Hire Plan"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "New Hire Plan", href: ROUTES.ADMIN.NEW_HIRE_PLAN },
          { label: "New" },
        ]}
      />
        <div className="px-4 md:px-12 py-4">
          <NewHirePlanForm />
        </div>
    </>
  );
}


