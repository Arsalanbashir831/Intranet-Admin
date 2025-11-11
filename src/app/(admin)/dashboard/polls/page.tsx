import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { PollsTable } from "@/components/polls/polls-table";

export default function PollsPage() {
  return (
    <>
      <PageHeader
        title="Polls"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Polls", href: ROUTES.ADMIN.POLLS }
        ]}
        action={
          <Link href={ROUTES.ADMIN.POLLS_NEW}>
            <Button>Create Poll</Button>
          </Link>
        }
      />
      <div className="px-4 md:px-12 py-4">
        <PollsTable />
      </div>
    </>
  );
}
