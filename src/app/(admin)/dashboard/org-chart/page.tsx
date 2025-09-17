import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { EmployeeTable, type EmployeeRow } from "@/components/org-chart/employee-table";
import { ScrollArea } from "@/components/ui/scroll-area";

const employees: EmployeeRow[] = [
  { id: "1", name: "Albert Flores", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D", location: "Toledo", email: "Fisherman12@gmail.com", department: "HR", role: "Director", reportingTo: "--", reportingAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D" },
  { id: "2", name: "Albert Flores", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D", location: "Orange", email: "Janecooper@gmail.com", department: "Marketing", role: "Manager", reportingTo: "Albert Flores", reportingAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D" },
  { id: "3", name: "Albert Flores", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D", location: "Naperville", email: "Fisherman12@gmail.com", department: "Finance", role: "HOD", reportingTo: "Albert Flores", reportingAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D" },
  { id: "4", name: "Albert Flores", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D", location: "Fairfield", email: "Janecooper@gmail.com", department: "Executive", role: "CEO", reportingTo: "--", reportingAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D" },
  { id: "5", name: "Albert Flores", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D", location: "Fairfield", email: "Joneshighman@gmail.com", department: "HR", role: "Director", reportingTo: "--", reportingAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D" },
  { id: "6", name: "Albert Flores", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D", location: "Fairfield", email: "Savannahbae@yahoo.com", department: "Legal", role: "Director", reportingTo: "--", reportingAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D" },
  { id: "7", name: "Albert Flores", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D", location: "Pembroke Pines", email: "Ester123@gmail.com", department: "Marketing", role: "Lead", reportingTo: "Albert Flores", reportingAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D" },
  { id: "8", name: "Albert Flores", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D", location: "Austin", email: "Fisherman12@gmail.com", department: "Finance", role: "Lead", reportingTo: "Albert Flores", reportingAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D" },
  { id: "9", name: "Albert Flores", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D", location: "Pembroke Pines", email: "Ester123@gmail.com", department: "Legal", role: "HOD", reportingTo: "Albert Flores", reportingAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D" },
];

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
       <ScrollArea className="h-[calc(100vh-10rem)]">
      
      <div className="px-5 md:px-12 py-4">
        <EmployeeTable rows={employees} />;
      </div>
      </ScrollArea>
    </>
  );
}