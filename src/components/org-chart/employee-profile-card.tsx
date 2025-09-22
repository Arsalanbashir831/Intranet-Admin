"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { useEmployee } from "@/hooks/queries/use-employees";

interface Employee {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    joinDate: string;
    department: string;
    reportingTo: string;
    address: string;
    city: string;
    branch: string;
    status: string;
    bio: string;
    profileImage: string;
}

interface EmployeeProfileCardProps {
    employee?: Employee;
    employeeId?: number | string;
}

export function EmployeeProfileCard({ employee, employeeId }: EmployeeProfileCardProps) {
    const { data } = useEmployee(employeeId ?? "");
    const e: unknown = data ?? employee;
    const resolved: Employee | null = e ? {
        id: String((e as { id?: number | string }).id ?? ""),
        name: (e as { full_name?: string; name?: string }).full_name ?? (e as { full_name?: string; name?: string }).name ?? "",
        role: (e as { emp_role?: string; job_title?: string }).emp_role ?? (e as { emp_role?: string; job_title?: string }).job_title ?? "",
        email: (e as { email?: string; user_email?: string }).email ?? (e as { email?: string; user_email?: string }).user_email ?? "",
        phone: (e as { phone?: string; phone_number?: string }).phone ?? (e as { phone?: string; phone_number?: string }).phone_number ?? "",
        joinDate: (e as { join_date?: string }).join_date ? new Date((e as { join_date?: string }).join_date!).toLocaleDateString() : "",
        department: ((e as { branch_detail?: { department_detail?: { name?: string } } }).branch_detail?.department_detail?.name) ?? (e as { department_name?: string; department?: string }).department_name ?? (e as { department_name?: string; department?: string }).department ?? "",
        reportingTo: (e as { supervisor_name?: string; reportingTo?: string }).supervisor_name ?? (e as { supervisor_name?: string; reportingTo?: string }).reportingTo ?? "--",
        address: (e as { address?: string }).address ?? "",
        city: (e as { user_city?: string; city?: string }).user_city ?? (e as { user_city?: string; city?: string }).city ?? "",
        branch: (e as { branch_name?: string; branch?: string }).branch_name ?? (e as { branch_name?: string; branch?: string }).branch ?? "",
        status: (e as { active?: boolean }).active ? "ACTIVE" : "INACTIVE",
        bio: (e as { qualification_details?: string }).qualification_details ?? "",
        profileImage: (e as { profile_picture_url?: string; profile_picture?: string }).profile_picture_url ?? (e as { profile_picture_url?: string; profile_picture?: string }).profile_picture ?? "",
    } : null;

    if (!resolved) {
        return <Card className="border-none rounded-lg shadow-[0px_4px_30px_0px_#2E2D740c] gap-0 p-8">Loading...</Card>;
    }
    // Helper to render an icon from public/icons with brand color using CSS mask
    const PublicIcon = ({ src }: { src: string }) => (
        <span
            className="size-4 bg-primary"
            style={{
                WebkitMaskImage: `url(${src})`,
                maskImage: `url(${src})`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                display: "inline-block",
            }}
        />
    );

    return (
        <Card className="border-none rounded-lg shadow-[0px_4px_30px_0px_#2E2D740c] gap-0">
            {/* Profile Header Section */}
            <div className="px-8 py-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 flex-1">
                    {/* Profile Picture */}
                    <Avatar className="size-36">
                        <AvatarImage src={resolved.profileImage} alt={resolved.name} />
                        <AvatarFallback className="text-lg font-semibold bg-gray-100 text-gray-600">
                            {resolved.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>

                    {/* Profile Info */}
                    <div className="flex flex-col md:flex-row items-start justify-between md:gap-10 w-full">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge
                                    variant="secondary"
                                    className="bg-[#1A9882] text-white rounded-full px-3 py-1 text-xs"
                                >
                                    {resolved.status}
                                </Badge>
                            </div>

                            <h1 className="text-base font-semibold text-[#1D1F2C] mb-1">
                                {resolved.name}
                            </h1>

                            <p className="text-sm text-[#667085] mb-4">
                                {resolved.role}
                            </p>
                        </div>
                        <div className="text-[#667085] leading-relaxed max-w-3xl border border-[#E2E8F0] rounded-md p-4 prose prose-sm sm:prose-base focus:outline-none prose-p:leading-relaxed prose-pre:p-0 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 [&_ul_li_p]:inline [&_ol_li_p]:inline [&_ul_li_p]:m-0 [&_ol_li_p]:m-0 flex-1"
                             dangerouslySetInnerHTML={{ __html: resolved.bio }}
                        />
                    </div>
                </div>

            <Separator className="bg-[#E0E2E7] mt-6" />
            </div>


            <div className="p-8 pt-0">
                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { iconSrc: "/icons/id-badge.svg", label: "User ID", value: resolved.id },
                        { iconSrc: "/icons/envelope.svg", label: "E-mail", value: resolved.email },
                        { iconSrc: "/icons/smartphone.svg", label: "Phone Number", value: resolved.phone },
                        { iconSrc: "/icons/calendar.svg", label: "Join Date", value: resolved.joinDate },
                        { iconSrc: "/icons/hierarchy.svg", label: "Department", value: resolved.department },
                        { iconSrc: "/icons/manager.svg", label: "Reporting to", value: resolved.reportingTo },
                        { iconSrc: "/icons/map-pin.svg", label: "Address", value: resolved.address },
                        { iconSrc: "/icons/map-pin.svg", label: "City", value: resolved.city },
                        { iconSrc: "/icons/branch.svg", label: "Branch", value: resolved.branch },
                    ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                            {/* Icon from public/icons */}
                            <div className="w-10 h-10 rounded-full bg-[#F0F1F3] grid place-items-center flex-shrink-0">
                                <PublicIcon src={item.iconSrc} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#667085] mb-1">
                                    {item.label}
                                </p>
                                <p className="text-sm font-medium text-[#1D1F2C] truncate">
                                    {item.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
