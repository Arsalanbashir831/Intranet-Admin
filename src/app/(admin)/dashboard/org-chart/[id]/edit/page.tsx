
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { OrgChartForm, type OrgChartInitialValues } from "@/components/org-chart/org-chart-form";
// import { ScrollArea } from "@radix-ui/react-scroll-area";

interface EditOrgChartPageProps {
  params: Promise<{ id: string }>
}

export default async function EditOrgChartPage({ params }: EditOrgChartPageProps) {
  const { id } = await params;

  // Dummy data for now; replace with API-fetched values later
  const initialValues: OrgChartInitialValues = {
    name: "Linda Blair",
    address: "3890 Poplar Dr.",
    city: "Lahore",
    phone: "050 414 8778",
    email: "lindablair@mail.com",
    reportingTo: "Flores",
    departmentIds: ["1"],
    branch: "Lahore",
    profileImageUrl: "https://images.unsplash.com/photo-1593696954577-ab3d39317b97?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGZyZWUlMjBpbWFnZXN8ZW58MHx8MHx8fDA%3D",
    qualificationAndEducation:
      `<p><mark data-color="#FFFF00" style="background-color: rgb(255, 255, 0); color: inherit;">Bachelor's in Human Resources, University of California.</mark></p>`,
  };

  return (
    <>
      <PageHeader title="Org Chart/Directory" crumbs={[{ label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD }, { label: "Org Chart/Directory", href: ROUTES.ADMIN.ORG_CHART }, { label: "Edit", href: ROUTES.ADMIN.ORG_CHART_PROFILE_ID_EDIT(id) }]} action={<div className="flex gap-2"><Button variant='outline' className="border-primary">Save As Draft</Button><Button>Save</Button></div>} />
      {/* <ScrollArea className="h-[calc(100vh-10rem)]"> */}
        <div className="px-4 md:px-12 py-4">
          <OrgChartForm initialValues={initialValues} />
        </div>
      {/* </ScrollArea> */}
    </>
  );
}


