import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { EmployeeProfileCard } from "@/components/org-chart/employee-profile-card";
import Link from "next/link";

interface ProfilePageProps {
    params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { id } = await params;
    // In a real app, you'd fetch employee data based on params.id
    const employeeData = {
        id: "ID-011221",
        name: "Linda Blair",
        role: "HR",
        email: "lindablair@mail.com",
        phone: "050 414 8778",
        joinDate: "12/12/2022",
        department: "HR",
        reportingTo: "Flores",
        address: "3890 Poplar Dr.",
        city: "Lahore",
        branch: "Lahore",
        status: "Active Employee",
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        profileImage: "", // Placeholder for now
    };

    return (
        <>
            <PageHeader
                title="Org Chart/Directory"
                crumbs={[
                    { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
                    { label: "Org Chart / Directory", href: ROUTES.ADMIN.ORG_CHART },
                    { label: "Linda Blair", href: ROUTES.ADMIN.ORG_CHART_PROFILE_ID(id) }
                ]}
                action={
                    <Link href={ROUTES.ADMIN.ORG_CHART_PROFILE_ID_EDIT(id)}>
                        <Button className="bg-primary hover:bg-primary/90 text-white">
                            Edit Profile
                        </Button>
                    </Link>
                }
            />

            

            {/* Profile Details Card */}
            <div className="px-4 md:px-12 py-6">
                <EmployeeProfileCard employee={employeeData} />
            </div>
        </>
    );
}
