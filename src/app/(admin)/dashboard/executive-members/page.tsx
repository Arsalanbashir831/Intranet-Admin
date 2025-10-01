import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { ExecutiveMembersTable } from "@/components/executive-members/executive-members-table";

export default function ExecutiveMembersPage() {
  return (
    <>
      <PageHeader
        title="Executive Members"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Executive Members", href: ROUTES.ADMIN.EXECUTIVE_MEMBERS }
        ]}
        action={
          <Link href={ROUTES.ADMIN.EXECUTIVE_MEMBERS_NEW}>
            <Button>
              Add New
            </Button>
          </Link>
        }
      />
      <div className="px-4 md:px-12 py-4">
        <ExecutiveMembersTable />
      </div>
    </>
  );
}
