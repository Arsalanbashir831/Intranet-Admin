import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

export default function OrgChartPage() {
  return (
    <>
      <PageHeader 
        title="Org Chart/Directory" 
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Org Chart/Directory", href: ROUTES.ADMIN.ORG_CHART }
        ]}
        action={
          <Link href={ROUTES.ADMIN.ORG_CHART_NEW}>
            <Button className="bg-[#D64575] hover:bg-[#D64575]/90 text-white">
              Add New Employee
            </Button>
          </Link>
        }
      />
      <div className="px-12 py-4">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Org Chart Directory</h3>
          <p className="text-gray-600 mb-6">View and manage employee profiles</p>
          <div className="space-x-4">
            <Link href="/dashboard/org-chart/profile/1">
              <Button variant="outline">
                View Linda Blair Profile
              </Button>
            </Link>
            <Link href={ROUTES.ADMIN.ORG_CHART_NEW}>
              <Button>
                Add New Employee
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}