"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { useMe } from "@/hooks/queries/use-auth";
import type { EmployeeWithScope } from "@/types/manager-scope";

interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  joinDate: string;
  department: string;
  reportingTo: string;
  branch: string;
  status: string;
  bio: string;
  profileImage: string;
}

interface EmployeeProfileCardProps {
  employee?: Employee;
}


type ExtendedEmployee = EmployeeWithScope & {
  email?: string;
  phone?: string | null;
  hire_date?: string;
  bio?: string | null;
};

export function EmployeeProfileCard({ employee }: EmployeeProfileCardProps) {
  const { data, isLoading, isError } = useMe();

  // Check if user is an admin (superuser or employee with isAdmin flag)
  const isAdmin = data?.user?.is_superuser || data?.employee?.isAdmin;
  const isAdminWithoutEmployee = isAdmin && !data?.employee;

  const apiEmployee = data?.employee as ExtendedEmployee | undefined;
  const resolvedEmployee: Employee | undefined = apiEmployee
    ? {
        id: apiEmployee.id.toString(),
        name: apiEmployee.emp_name,
        role: apiEmployee.role || "",
        email: apiEmployee.email || "",
        phone: apiEmployee.phone || "",
        joinDate: apiEmployee.hire_date
          ? new Date(apiEmployee.hire_date).toLocaleDateString()
          : "",
        department:
          apiEmployee.branch_departments?.[0]?.department?.dept_name || "",
        reportingTo: apiEmployee.branch_departments?.[0]?.manager
          ? apiEmployee.branch_departments[0].manager.employee?.emp_name || "--"
          : "--",
        branch: apiEmployee.branch_departments?.[0]?.branch?.branch_name || "",
        status: "Active Employee",
        bio: apiEmployee.bio || "",
        profileImage: apiEmployee.profile_picture || "",
      }
    : employee;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading profile data</div>;
  }

  // Pink masked icon helper
  const PinkIcon = ({ src, size = 18 }: { src: string; size?: number }) => (
    <span
      aria-hidden
      className="inline-block bg-[#E5004E]"
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );

  // Show admin card if user is admin without employee data
  if (isAdminWithoutEmployee && data?.user) {
    return (
      <div className="w-full py-4 sm:py-6 lg:py-2">
        <Card
          className="
            mx-auto w-full max-w-full
            rounded-2xl border-0 bg-white
            px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-7
          "
        >
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 sm:gap-6">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="relative">
                <Avatar className="size-20 sm:size-24 md:size-28">
                  <AvatarImage
                    src="/logos/profile-circle.svg"
                    alt={data.user.username}
                  />
                  <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                    {data.user.username
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0">
                <Badge className="bg-[#E5004E] text-white rounded-full px-3 py-1 text-xs">
                  Administrator
                </Badge>
                <div className="mt-2 text-[#111827] font-semibold">
                  {data.user.username}
                </div>
                <div className="text-sm text-[#6B7280]">Admin User</div>
              </div>
            </div>
          </div>

          <Separator className="my-5 sm:my-6 bg-[#E7E9EE]" />

          <div
            className="
              grid gap-x-6 gap-y-6
              grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
            "
          >
            {[
              {
                icon: "/icons/id-badge.svg",
                label: "User ID",
                value: `ID-${data.user.id}`,
              },
              {
                icon: "/icons/envelope.svg",
                label: "E-mail",
                value: data.user.email,
              },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3">
                <div className="mt-0.5 size-9 rounded-full bg-[#FFE9F1] grid place-items-center">
                  <PinkIcon src={row.icon} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] text-[#6B7280]">{row.label}</div>
                  <div className="text-[13px] sm:text-sm font-medium text-[#111827] truncate">
                    {row.value || "--"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!resolvedEmployee) {
    return <div>No profile data available</div>;
  }

  return (
    <div className="w-full py-4 sm:py-6 lg:py-2">
      <Card
        className="
          mx-auto w-full max-w-full
          rounded-2xl border-0 bg-white
          px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-7
        "
      >
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 sm:gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="relative">
              <Avatar className="size-20 sm:size-24 md:size-28">
                <AvatarImage
                  src={
                    resolvedEmployee.profileImage || "/logos/profile-circle.svg"
                  }
                  alt={resolvedEmployee.name}
                />
                <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                  {resolvedEmployee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0">
              <Badge className="bg-[#1A9882] text-white rounded-full px-3 py-1 text-xs">
                {resolvedEmployee.status}
              </Badge>
              <div className="mt-2 text-[#111827] font-semibold">
                {resolvedEmployee.name}
              </div>
              <div className="text-sm text-[#6B7280]">
                {resolvedEmployee.role}
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="w-full">
              {resolvedEmployee.bio && resolvedEmployee.bio.includes("<") ? (
                <div
                  className="min-h-[50px] border border-[#E2E8F0]  text-[#535862] p-3 rounded-md overflow-y-auto w-full text-sm"
                  dangerouslySetInnerHTML={{ __html: resolvedEmployee.bio }}
                />
              ) : resolvedEmployee.bio ? (
                <Textarea
                  value={resolvedEmployee.bio}
                  readOnly
                  className="min-h-[50px] resize-none border-[#E2E8F0] w-full"
                />
              ) : (
                <Textarea
                  value="No bio information available"
                  readOnly
                  className="min-h-[50px] resize-none border-[#E2E8F0] w-full"
                />
              )}
            </div>
          </div>
        </div>

        <Separator className="my-5 sm:my-6 bg-[#E7E9EE]" />

        <div
          className="
            grid gap-x-6 gap-y-6
            grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
          "
        >
          {[
            {
              icon: "/icons/id-badge.svg",
              label: "User ID",
              value: `ID-${resolvedEmployee.id}`,
            },
            {
              icon: "/icons/envelope.svg",
              label: "E-mail",
              value: resolvedEmployee.email,
            },
            {
              icon: "/icons/smartphone.svg",
              label: "Phone Number",
              value: resolvedEmployee.phone,
            },
            {
              icon: "/icons/calendar.svg",
              label: "Join Date",
              value: resolvedEmployee.joinDate,
            },
            {
              icon: "/icons/hierarchy.svg",
              label: "Department",
              value: resolvedEmployee.department,
            },
            {
              icon: "/icons/manager.svg",
              label: "Reporting to",
              value: resolvedEmployee.reportingTo,
            },
            {
              icon: "/icons/branch.svg",
              label: "Branch",
              value: resolvedEmployee.branch,
            },
          ].map((row) => (
            <div key={row.label} className="flex items-start gap-3">
              <div className="mt-0.5 size-9 rounded-full bg-[#FFE9F1] grid place-items-center">
                <PinkIcon src={row.icon} />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] text-[#6B7280]">{row.label}</div>
                <div className="text-[13px] sm:text-sm font-medium text-[#111827] truncate">
                  {row.value || "--"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export const ProfileCard = EmployeeProfileCard;
