"use client";

import { Card } from "@/components/ui/card";
// Lucide icons removed in favor of public icons
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

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
    employee: Employee;
}

export function EmployeeProfileCard({ employee }: EmployeeProfileCardProps) {
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

    const detailItems = [
        { iconSrc: "/icons/id-badge.svg", label: "User ID", value: employee.id },
        { iconSrc: "/icons/envelope.svg", label: "E-mail", value: employee.email },
        { iconSrc: "/icons/smartphone.svg", label: "Phone Number", value: employee.phone },
        { iconSrc: "/icons/calendar.svg", label: "Join Date", value: employee.joinDate },
        { iconSrc: "/icons/hierarchy.svg", label: "Department", value: employee.department },
        { iconSrc: "/icons/manager.svg", label: "Reporting to", value: employee.reportingTo },
        { iconSrc: "/icons/map-pin.svg", label: "Address", value: employee.address },
        { iconSrc: "/icons/map-pin.svg", label: "City", value: employee.city },
        { iconSrc: "/icons/branch.svg", label: "Branch", value: employee.branch },
    ];

    return (
        <Card className="border-none rounded-lg shadow-[0px_4px_30px_0px_#2E2D740c] gap-0">
            {/* Profile Header Section */}
            <div className="px-8 py-6">
                <div className="flex items-start gap-6 flex-1">
                    {/* Profile Picture */}
                    <Avatar className="size-36">
                        <AvatarImage src={employee.profileImage} alt={employee.name} />
                        <AvatarFallback className="text-lg font-semibold bg-gray-100 text-gray-600">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>

                    {/* Profile Info */}
                    <div className="flex items-start justify-between gap-10 w-full">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge
                                    variant="secondary"
                                    className="bg-[#1A9882] text-white rounded-full px-3 py-1 text-xs"
                                >
                                    {employee.status}
                                </Badge>
                            </div>

                            <h1 className="text-base font-semibold text-[#1D1F2C] mb-1">
                                {employee.name}
                            </h1>

                            <p className="text-sm text-[#667085] mb-4">
                                {employee.role}
                            </p>
                        </div>
                        <p className="text-[#667085] leading-relaxed max-w-3xl border border-[#E2E8F0] rounded-md p-4">
                            {employee.bio}
                        </p>
                    </div>
                </div>

            <Separator className="bg-[#E0E2E7] mt-6" />
            </div>


            <div className="p-8 pt-0">
                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {detailItems.map((item, index) => (
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
