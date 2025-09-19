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

    return (
        <>
            <PageHeader
                title="Org Chart/Directory"
                crumbs={[
                    { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
                    { label: "Org Chart / Directory", href: ROUTES.ADMIN.ORG_CHART },
                    { label: "Employee", href: ROUTES.ADMIN.ORG_CHART_PROFILE_ID(id) }
                ]}
                action={
                    <Link href={ROUTES.ADMIN.ORG_CHART_PROFILE_ID_EDIT(id)}>
                        <Button className="bg-primary hover:bg-primary/90 text-white">
                            Edit Profile
                        </Button>
                    </Link>
                }
            />

            <div className="px-4 md:px-12 py-6">
                {/* Updated EmployeeProfileCard to fetch by id internally */}
                <EmployeeProfileCard employeeId={id} />
            </div>
        </>
    );
}
