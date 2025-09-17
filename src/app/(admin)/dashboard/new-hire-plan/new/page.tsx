import { PageHeader } from "@/components/page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        action={null}
      />
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="px-5 md:px-12 py-4">
          <NewHirePlanForm />
        </div>
      </ScrollArea>
    </>
  );
}


