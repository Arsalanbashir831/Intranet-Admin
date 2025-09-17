import { DepartmentsTable } from "@/components/departments/departments-table";
import { PageHeader } from "@/components/page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ROUTES } from "@/constants/routes";


export default function KnowledgeBasePage() {
  return (
    <>
      <PageHeader title="Knowledge Base" crumbs={[{ label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD }, { label: "Knowledge Base", href: ROUTES.ADMIN.KNOWLEDGE_BASE }]} />
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="px-12 py-4">
          <DepartmentsTable />
        </div>
      </ScrollArea>
    </>
  );
}


