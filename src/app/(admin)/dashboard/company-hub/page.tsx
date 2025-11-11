
import { RecentAnnouncementsTable } from "@/components/announcements/recent-announcements-table";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

export default function CompanyHubPage() {
  return (
    <>
      <PageHeader title="Company Hub" crumbs={[{ label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD }, { label: "Company Hub", href: ROUTES.ADMIN.COMPANY_HUB }]} action={<Link href={ROUTES.ADMIN.COMPANY_HUB_NEW}><Button>Add New</Button></Link>} />
      {/* <ScrollArea className="h-[calc(100vh-10rem)]"> */}
        <div className="px-4 md:px-12 py-4">
          <RecentAnnouncementsTable/>
        </div>
      {/* </ScrollArea> */}
    </>
  );
}


