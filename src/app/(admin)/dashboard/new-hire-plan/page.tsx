import { NewHireTable } from "@/components/new-hire/new-hire-table";
import { PageHeader } from "@/components/page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ROUTES } from "@/constants/routes";

export default function NewHirePlanPage() {
  return (
    <>
      <PageHeader title="New Hire Plan" crumbs={[{ label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD }, { label: "New Hire Plan", href: ROUTES.ADMIN.NEW_HIRE_PLAN }]} />
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="px-5 md:px-12 py-4">
          <NewHireTable />;
        </div>
      </ScrollArea>
    </>
  );
}


