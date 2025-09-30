"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { useEmployee } from "@/hooks/queries/use-employees";
import type { components } from "@/types/api";

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
    education: string;
    profileImage: string;
}

interface EmployeeProfileCardProps {
    employee?: Employee;
    employeeId?: number | string;
}

// Types from OpenAPI
type ApiEmployee = components["schemas"]["Employee"];

// Small helper types for fields not captured in OpenAPI schema
interface BranchRef { branch_name?: string }
interface DepartmentRef { dept_name?: string }
interface ManagerRef { emp_name?: string }
interface BranchDepartmentRef {
    branch?: BranchRef;
    department?: DepartmentRef;
    manager?: ManagerRef | null;
}

// Type guard for the wrapped detail response
const isDetailWrapper = (value: unknown): value is { employee: ApiEmployee } => {
    return Boolean(value) && typeof value === "object" && "employee" in (value as Record<string, unknown>);
};

export function EmployeeProfileCard({ employee, employeeId }: EmployeeProfileCardProps) {
    const { data } = useEmployee(employeeId ?? "");

    // Unwrap to ApiEmployee or use optional prop fallback
    const apiEmployee: ApiEmployee | undefined = isDetailWrapper(data) ? data.employee : (data as ApiEmployee | undefined);

    // Extract nested fields safely without using any
    const branchDepartment: BranchDepartmentRef | undefined = (apiEmployee as unknown as { branch_department?: BranchDepartmentRef } | undefined)?.branch_department;
    const hireDate: string | undefined = (apiEmployee as unknown as { hire_date?: string } | undefined)?.hire_date
        ?? (apiEmployee as unknown as { join_date?: string } | undefined)?.join_date;

    const resolved: Employee | null = apiEmployee ? {
        id: String((apiEmployee as unknown as { id?: number | string }).id ?? ""),
        name: String((apiEmployee as unknown as { emp_name?: string; name?: string }).emp_name ?? (apiEmployee as unknown as { name?: string }).name ?? ""),
        role: String((apiEmployee as unknown as { role?: string }).role ?? ""),
        email: String((apiEmployee as unknown as { email?: string }).email ?? ""),
        phone: String((apiEmployee as unknown as { phone?: string }).phone ?? ""),
        joinDate: hireDate ? new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" }).format(new Date(hireDate)) : "",
        department: String(branchDepartment?.department?.dept_name ?? ""),
        reportingTo: String(branchDepartment?.manager?.emp_name ?? "--"),
        address: String((apiEmployee as unknown as { address?: string }).address ?? ""),
        city: String((apiEmployee as unknown as { city?: string }).city ?? ""),
        branch: String(branchDepartment?.branch?.branch_name ?? ""),
        status: "ACTIVE",
        education: String((apiEmployee as unknown as { education?: string }).education ?? ""),
        profileImage: String((apiEmployee as unknown as { profile_picture?: string }).profile_picture ?? ""),
    } : (employee ?? null);

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
                            dangerouslySetInnerHTML={{ __html: resolved.education }}
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
