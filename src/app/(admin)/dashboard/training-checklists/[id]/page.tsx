"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/common";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import {
  useChecklist,
  useExecutiveTrainingChecklist,
} from "@/hooks/queries/use-new-hire";
import type {
  ExecutiveTrainingChecklistEmployee,
  Attachment,
  AttachmentStatus,
} from "@/types/new-hire";
import Image from "next/image";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil } from "lucide-react";
import { Employee } from "@/types/employees";

function getStatusConfig(status: AttachmentStatus) {
  const statusConfig = {
    to_do: {
      label: "To Do",
      className: "text-[#FF7979] bg-[#FF7979]/10",
    },
    in_progress: {
      label: "In Progress",
      className: "text-[#FFA048] bg-[#FFA048]/10",
    },
    done: {
      label: "Done",
      className: "text-[#78D700] bg-[#78D700]/10",
    },
  };
  return statusConfig[status];
}

export default function NewHirePlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const trainingId = params.id as string;

  const isExecutive =
    user?.executiveId !== null && user?.executiveId !== undefined;

  // Fetch executive training checklist if user is executive
  const {
    data: executiveData,
    isLoading: isExecutiveLoading,
    isError: isExecutiveError,
  } = useExecutiveTrainingChecklist(isExecutive ? trainingId : "");

  // Fetch regular checklist for admin/manager users
  const {
    data: checklist,
    isLoading: isChecklistLoading,
    isError: isChecklistError,
  } = useChecklist(isExecutive ? "" : trainingId);

  const isLoading = isExecutive ? isExecutiveLoading : isChecklistLoading;
  const isError = isExecutive ? isExecutiveError : isChecklistError;

  // Show loading state with skeleton
  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Training Details"
          crumbs={[
            { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
            {
              label: "Training Checklists",
              href: ROUTES.ADMIN.NEW_HIRE_PLAN,
            },
            { label: "Training Details", href: "#" },
          ]}
        />
        <div className="mx-auto w-full px-5 sm:px-1 md:px-2 py-6 sm:py-8 lg:py-10">
          <Card className="shadow-sm border-[#FFF6F6] p-4 sm:p-5 md:p-5">
            {/* Title Skeleton */}
            <div className="mb-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-5/6 mb-2" />
              <Skeleton className="h-6 w-4/6" />
            </div>

            {/* Description Skeleton */}
            <div className="mb-6 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-10/12" />
              <Skeleton className="h-4 w-full" />
            </div>

            {/* Deadline and Attachments Skeleton */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Skeleton className="h-12 sm:h-14 rounded-xl" />
                  <Skeleton className="h-12 sm:h-14 rounded-xl" />
                  <Skeleton className="h-12 sm:h-14 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Assigned Employees Skeleton */}
            <div>
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg"
                  >
                    <Skeleton className="size-16 rounded-full" />
                    <div className="flex flex-col items-center text-center w-full gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div>
        <PageHeader
          title="Training Details"
          crumbs={[
            { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
            {
              label: "Training Checklists",
              href: ROUTES.ADMIN.NEW_HIRE_PLAN,
            },
            { label: "Training Details", href: "#" },
          ]}
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Training Not Found
            </h1>
            <p className="text-gray-600 mb-4">
              The training you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have access to it.
            </p>
            <Button onClick={() => router.push(ROUTES.ADMIN.NEW_HIRE_PLAN)}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleFileDownload = (fileUrl: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.target = "_blank";
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDeadline = (deadline: string | null | undefined) => {
    if (!deadline) return null;
    try {
      return format(new Date(deadline), "dd MMM yyyy");
    } catch {
      return deadline;
    }
  };

  // For executives, use executive data
  if (isExecutive && executiveData) {
    const training = executiveData;

    return (
      <div>
        <PageHeader
          title="Training Details"
          crumbs={[
            { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
            {
              label: "Training Checklists",
              href: ROUTES.ADMIN.NEW_HIRE_PLAN,
            },
            { label: "Training Details", href: "#" },
          ]}
        />

        <div className="mx-auto w-full px-5 sm:px-1 md:px-12 py-6 sm:py-8 lg:py-10">
          <Card className="shadow-none border-[#FFF6F6] p-4 sm:p-5 md:p-5">
            {/* Training Information */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {training.title}
              </h1>
              <div
                className="
                  text-[#202124] leading-relaxed space-y-4
                  text-sm sm:text-base md:text-lg font-extralight
                  [&_p]:leading-relaxed [&_p]:mb-4
                  [&_p_strong]:font-semibold [&_p_strong]:text-base [&_p_strong]:sm:text-lg [&_p_strong]:md:text-xl
                  [&_p:only-child_strong]:block [&_p:only-child_strong]:mb-2
                  [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:space-y-2 [&_ol]:ml-4 [&_ol]:sm:ml-6 [&_ol]:md:ml-8 [&_ol]:mb-4 [&_ol]:mt-2
                  [&_ol.list-decimal]:list-decimal [&_ol.list-inside]:list-outside [&_ol.list-inside]:pl-4
                  [&_ol_li]:mb-3 [&_ol_li]:pl-2 [&_ol_li]:list-item [&_ol_li]:min-h-[1.5rem]
                  [&_ol_li_p]:mb-0 [&_ol_li_p]:inline-block
                  [&_ol_li_p_strong]:font-semibold
                  [&_ol_li.list-item]:list-item
                  [&_ul]:list-disc [&_ul]:list-outside [&_ul]:space-y-2 [&_ul]:ml-4 [&_ul]:sm:ml-6 [&_ul]:md:ml-8 [&_ul]:mb-4 [&_ul]:mt-2
                  [&_ul.list-disc]:list-disc [&_ul.list-inside]:list-outside [&_ul.list-inside]:pl-4
                  [&_ul_li]:mb-2 [&_ul_li]:pl-2 [&_ul_li]:list-item [&_ul_li]:min-h-[1.5rem]
                  [&_ul_li_p]:mb-0
                  [&_ul_li.list-item]:list-item
                  [&_ol_li_ul]:list-disc [&_ol_li_ul]:list-outside [&_ol_li_ul]:ml-6 [&_ol_li_ul]:sm:ml-8 [&_ol_li_ul]:md:ml-10 [&_ol_li_ul]:mt-2 [&_ol_li_ul]:mb-2
                  [&_ol_li_ul_li]:mb-1 [&_ol_li_ul_li]:pl-2
                  [&_ol_li_ul_li_p]:mb-0
                "
                dangerouslySetInnerHTML={{ __html: training.description }}
              />
            </div>

            {/* Deadline and Attachments Section */}
            <div className="mb-6 space-y-4">
              {/* Deadline */}
              {training.deadline && (
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-1">
                    <Image
                      src="/icons/todo.svg"
                      alt="deadline"
                      width={14}
                      height={14}
                      className="sm:w-4 sm:h-4"
                    />
                    Deadline
                  </span>
                  <Badge className="text-[10px] sm:text-xs font-medium text-[#FF7979] bg-[#FF7979]/10 px-2 sm:px-3 py-1 rounded-md">
                    {formatDeadline(training.deadline)}
                  </Badge>
                </div>
              )}

              {/* Attachments */}
              {training.attachment && training.attachment.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-1">
                    <Image
                      src="/icons/todo.svg"
                      alt="attachments"
                      width={14}
                      height={14}
                      className="sm:w-4 sm:h-4"
                    />
                    Attachments
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {training.attachment.map(
                      (file: {
                        id: number;
                        file: string;
                        uploaded_at: string;
                      }) => {
                        // Extract filename from URL
                        const filename = file.file.split("/").pop() || "File";
                        return (
                          <Button
                            key={file.id}
                            variant="outline"
                            className="h-12 sm:h-14 flex items-center rounded-xl justify-start gap-2 border-gray-200 p-2 sm:p-3"
                            onClick={() => handleFileDownload(file.file)}
                          >
                            <div className="bg-[#E5004E] p-1.5 sm:p-2 rounded-sm flex items-center justify-center shrink-0">
                              <Image
                                src="/icons/clipboard.svg"
                                alt="clipboard"
                                width={18}
                                height={18}
                                className="sm:w-[22px] sm:h-[22px]"
                              />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-700 truncate flex-1 text-left">
                              {filename}
                            </span>
                          </Button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Assigned Employees */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Assigned Employees ({training.employees.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {training.employees.map(
                  (employee: ExecutiveTrainingChecklistEmployee) => {
                    const statusConfig = getStatusConfig(employee.status);
                    return (
                      <div
                        key={employee.employee_id}
                        className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <Avatar className="size-16">
                          <AvatarImage
                            src={employee.avatar || "/logos/profile-circle.svg"}
                            alt={employee.employee_name}
                          />
                          <AvatarFallback className="bg-gray-100 text-gray-600">
                            {employee.employee_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-center text-center w-full">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {employee.employee_name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {employee.employee_email}
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            "text-xs font-medium px-3 py-1 rounded-md",
                            statusConfig.className
                          )}
                        >
                          {statusConfig.label}
                        </Badge>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // For admin/manager users, use regular checklist data
  if (!isExecutive && checklist) {
    // Get all training attachments
    const trainingAttachments =
      checklist.attachments?.filter((att: Attachment) => att.type === "training") || [];

    // Get assigned employees
    const assignedEmployees = checklist.assigned_to_details || [];

    return (
      <div>
        <PageHeader
          title="Training Details"
          crumbs={[
            { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
            {
              label: "Training Checklists",
              href: ROUTES.ADMIN.NEW_HIRE_PLAN,
            },
            { label: "Training Details", href: "#" },
          ]}
          action={
            <Button
              onClick={() =>
                router.push(ROUTES.ADMIN.NEW_HIRE_PLAN_EDIT_ID(trainingId))
              }
              className="bg-primary hover:bg-primary/80"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          }
        />
        <div className="mx-auto w-full px-5 sm:px-1 md:px-12 py-6 sm:py-8 lg:py-10">
          <Card className="shadow-none border-[#FFF6F6] p-4 sm:p-5 md:p-7">
            {/* Training Information */}
            {trainingAttachments.length > 0 ? (
              trainingAttachments.map(
                (attachment: Attachment, index: number) => {
                  // Type assertion for deadline since it might not be in the type definition
                  const attachmentWithDeadline = attachment as Attachment & {
                    deadline?: string | null;
                  };

                  return (
                    <div key={attachment.id}>
                      {/* Separator between training checklists */}
                      {index > 0 && (
                        <div className="border-t border-gray-200 my-8"></div>
                      )}

                      {/* Training Checklist Section */}
                      <div className={index > 0 ? "pt-8" : ""}>
                        <div className="mb-6">
                          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                            {attachment.title}
                          </h1>
                          {attachment.detail && (
                            <div
                              className="
                            text-[#202124] leading-relaxed space-y-4
                            text-sm sm:text-base md:text-lg font-extralight
                            [&_p]:leading-relaxed [&_p]:mb-4
                            [&_p_strong]:font-semibold [&_p_strong]:text-base [&_p_strong]:sm:text-lg [&_p_strong]:md:text-xl
                            [&_p:only-child_strong]:block [&_p:only-child_strong]:mb-2
                            [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:space-y-2 [&_ol]:ml-4 [&_ol]:sm:ml-6 [&_ol]:md:ml-8 [&_ol]:mb-4 [&_ol]:mt-2
                            [&_ol.list-decimal]:list-decimal [&_ol.list-inside]:list-outside [&_ol.list-inside]:pl-4
                            [&_ol_li]:mb-3 [&_ol_li]:pl-2 [&_ol_li]:list-item [&_ol_li]:min-h-[1.5rem]
                            [&_ol_li_p]:mb-0 [&_ol_li_p]:inline-block
                            [&_ol_li_p_strong]:font-semibold
                            [&_ol_li.list-item]:list-item
                            [&_ul]:list-disc [&_ul]:list-outside [&_ul]:space-y-2 [&_ul]:ml-4 [&_ul]:sm:ml-6 [&_ul]:md:ml-8 [&_ul]:mb-4 [&_ul]:mt-2
                            [&_ul.list-disc]:list-disc [&_ul.list-inside]:list-outside [&_ul.list-inside]:pl-4
                            [&_ul_li]:mb-2 [&_ul_li]:pl-2 [&_ul_li]:list-item [&_ul_li]:min-h-[1.5rem]
                            [&_ul_li_p]:mb-0
                            [&_ul_li.list-item]:list-item
                            [&_ol_li_ul]:list-disc [&_ol_li_ul]:list-outside [&_ol_li_ul]:ml-6 [&_ol_li_ul]:sm:ml-8 [&_ol_li_ul]:md:ml-10 [&_ol_li_ul]:mt-2 [&_ol_li_ul]:mb-2
                            [&_ol_li_ul_li]:mb-1 [&_ol_li_ul_li]:pl-2
                            [&_ol_li_ul_li_p]:mb-0
                          "
                              dangerouslySetInnerHTML={{
                                __html: attachment.detail || "",
                              }}
                            />
                          )}
                        </div>

                        {/* Deadline and Attachments Section */}
                        <div className="mb-6 space-y-4">
                          {/* Deadline */}
                          {attachmentWithDeadline.deadline && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-1">
                                <Image
                                  src="/icons/todo.svg"
                                  alt="deadline"
                                  width={14}
                                  height={14}
                                  className="sm:w-4 sm:h-4"
                                />
                                Deadline
                              </span>
                              <Badge className="text-[10px] sm:text-xs font-medium text-[#FF7979] bg-[#FF7979]/10 px-2 sm:px-3 py-1 rounded-md">
                                {formatDeadline(attachmentWithDeadline.deadline)}
                              </Badge>
                            </div>
                          )}

                          {/* Attachments */}
                          {attachment.files && attachment.files.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-1">
                                <Image
                                  src="/icons/todo.svg"
                                  alt="attachments"
                                  width={14}
                                  height={14}
                                  className="sm:w-4 sm:h-4"
                                />
                                Attachments
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {attachment.files.map((file) => {
                                  // Extract filename from URL
                                  const filename =
                                    file.file.split("/").pop() || "File";
                                  return (
                                    <Button
                                      key={file.id}
                                      variant="outline"
                                      className="h-12 sm:h-14 flex items-center rounded-xl justify-start gap-2 border-gray-200 p-2 sm:p-3"
                                      onClick={() =>
                                        handleFileDownload(file.file)
                                      }
                                    >
                                      <div className="bg-[#E5004E] p-1.5 sm:p-2 rounded-sm flex items-center justify-center shrink-0">
                                        <Image
                                          src="/icons/clipboard.svg"
                                          alt="clipboard"
                                          width={18}
                                          height={18}
                                          className="sm:w-[22px] sm:h-[22px]"
                                        />
                                      </div>
                                      <span className="text-xs sm:text-sm text-gray-700 truncate flex-1 text-left">
                                        {filename}
                                      </span>
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Separator before Assigned Employees */}
                        {assignedEmployees.length > 0 && (
                          <div className="border-t border-gray-200 my-6"></div>
                        )}

                        {/* Assigned Employees for this Training Checklist */}
                        {assignedEmployees.length > 0 && (
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                              Assigned Employees ({assignedEmployees.length})
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                              {assignedEmployees.map((employee: Employee) => {
                                // Check if employee has task_statuses in the response
                                const employeeWithTaskStatuses = employee as Employee & {
                                  task_statuses?: Array<{
                                    attachment_id: number;
                                    attachment_title: string;
                                    status: "to_do" | "in_progress" | "done";
                                    status_display: string;
                                    updated_at: string;
                                  }>;
                                };

                                // Find the status for this specific attachment
                                const taskStatus = employeeWithTaskStatuses.task_statuses?.find(
                                  (ts) => ts.attachment_id === attachment.id
                                );

                                // Get status from task_statuses for this attachment or default to "to_do"
                                const employeeStatus = taskStatus?.status || "to_do";
                                const statusConfig = getStatusConfig(employeeStatus);

                                return (
                                  <div
                                    key={employee.id}
                                    className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                  >
                                    <Avatar className="size-16">
                                      <AvatarImage
                                        src={
                                          employee.profile_picture ||
                                          "/logos/profile-circle.svg"
                                        }
                                        alt={employee.emp_name}
                                      />
                                      <AvatarFallback className="bg-gray-100 text-gray-600">
                                        {employee.emp_name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-center text-center w-full">
                                      <h3 className="text-sm font-semibold text-gray-900">
                                        {employee.emp_name}
                                      </h3>
                                      {employee.email && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {employee.email}
                                        </p>
                                      )}
                                    </div>
                                    <Badge
                                      className={cn(
                                        "text-xs font-medium px-3 py-1 rounded-md",
                                        statusConfig.className
                                      )}
                                    >
                                      {statusConfig.label}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              )
            ) : (
              <div className="mb-6">
                <p className="text-gray-500">No training items found.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Fallback for any other case
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Training Not Found
        </h1>
        <p className="text-gray-600 mb-4">
          The training you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button onClick={() => router.push(ROUTES.ADMIN.NEW_HIRE_PLAN)}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
