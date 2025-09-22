import { PageHeader } from "@/components/page-header";
import { ROUTES } from "@/constants/routes";
import * as React from "react";
import { ExecutiveMemberDetailTable } from "@/components/executive-members/executive-member-detail-table";

interface ExecutiveMemberDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ExecutiveMemberDetailsPage({ params }: ExecutiveMemberDetailsPageProps) {
  const { id } = await params;
  return (
    <>
      <PageHeader
        title="Executive Members"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Org Chart/Directory", href: ROUTES.ADMIN.ORG_CHART },
          { label: "Executive Members", href: ROUTES.ADMIN.EXECUTIVE_MEMBERS },
          { label: "Executive Member Details" },
        ]}
      />
      <div className="px-4 md:px-12 py-4">
        <ExecutiveMemberDetailTable executiveId={id} />
      </div>
    </>
  );
}
