"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
	OrgChartForm,
	type OrgChartInitialValues,
} from "@/components/org-chart/org-chart-form";
// import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useParams } from "next/navigation";
import { useEmployee } from "@/hooks/queries/use-employees";
import type { components } from "@/types/api";
import { Loader2 } from "lucide-react";

export default function EditOrgChartPage() {
	const params = useParams<{ id: string }>();
	const id = params?.id;

	const { data, isLoading, isError } = useEmployee(String(id));
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	type ApiEmployee = components["schemas"]["Employee"];
	const isDetailWrapper = (
		value: unknown
	): value is { employee: ApiEmployee } => {
		return (
			Boolean(value) &&
			typeof value === "object" &&
			"employee" in (value as Record<string, unknown>)
		);
	};
	const apiEmployee: ApiEmployee | undefined = isDetailWrapper(data)
		? data.employee
		: (data as ApiEmployee | undefined);

	// Get the branch department ID - check multiple possible fields
	const branchDepartmentId = React.useMemo(() => {
		if (!apiEmployee) return undefined;
		
		// Try branch_department_ids array first (from API response)
		if (Array.isArray((apiEmployee as typeof apiEmployee & { branch_department_ids?: number[] }).branch_department_ids) && 
		    (apiEmployee as typeof apiEmployee & { branch_department_ids?: number[] }).branch_department_ids!.length > 0) {
			return String((apiEmployee as typeof apiEmployee & { branch_department_ids?: number[] }).branch_department_ids![0]);
		}
		
		// Try branch_departments array (from API response)
		const branchDepartments = (apiEmployee as typeof apiEmployee & { branch_departments?: Array<{ id: number }> }).branch_departments;
		if (Array.isArray(branchDepartments) && branchDepartments.length > 0 && branchDepartments[0].id) {
			return String(branchDepartments[0].id);
		}
		
		// Fallback to branch_department (if it exists as a single value)
		if ((apiEmployee as typeof apiEmployee & { branch_department?: number }).branch_department) {
			return String((apiEmployee as typeof apiEmployee & { branch_department?: number }).branch_department);
		}
		
		return undefined;
	}, [apiEmployee]);

	// Get role_id - use role_id from API response, fallback to role string and map it
	const roleId = React.useMemo(() => {
		if (!apiEmployee) return undefined;
		
		// Try role_id first (from API response)
		const roleIdValue = (apiEmployee as typeof apiEmployee & { role_id?: number }).role_id;
		if (roleIdValue !== undefined) {
			return String(roleIdValue);
		}
		
		// Fallback: map role string to role_id if role_id is not available
		const roleString = apiEmployee.role;
		if (roleString === "Junior Staff") return "1";
		if (roleString === "Mid Senior Staff") return "2";
		if (roleString === "Senior Staff") return "3";
		if (roleString === "Manager") return "4";
		
		return undefined;
	}, [apiEmployee]);

	const initialValues: OrgChartInitialValues | undefined = apiEmployee
		? {
				emp_name: apiEmployee.emp_name ?? "",
				email: apiEmployee.email ?? undefined,
				phone: apiEmployee.phone ?? undefined,
				role: roleId, // Use role_id converted to string
				education: apiEmployee.education ?? undefined,
				bio: apiEmployee.bio ?? undefined,
				branch_department: branchDepartmentId, // Use branch_department_ids[0] or branch_departments[0].id
				profileImageUrl: apiEmployee.profile_picture ?? undefined,
				address: (apiEmployee as typeof apiEmployee & { address?: string })?.address ?? undefined,
				city: (apiEmployee as typeof apiEmployee & { city?: string })?.city ?? undefined,
		  }
		: undefined;

	let submitFn: (() => void) | null = null;

	const handleSave = () => {
		setIsSubmitting(true);
		submitFn?.();
	};

	const handleSubmitComplete = (success: boolean) => {
		// Reset the submitting state when form submission is complete
		if (!success) {
			setIsSubmitting(false);
		}
		// If success is true, the form will navigate to another page,
		// so we don't need to reset the state
	};

	return (
		<>
			<PageHeader
				title="Employees"
				crumbs={[
					{ label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
					{ label: "Employees", href: ROUTES.ADMIN.ORG_CHART },
					{
						label: apiEmployee?.emp_name || "Employee",
						href: ROUTES.ADMIN.ORG_CHART_PROFILE_ID(String(id)),
					},
					{
						label: "Edit",
						href: ROUTES.ADMIN.ORG_CHART_PROFILE_ID_EDIT(String(id)),
					},
				]}
				action={
					<div className="flex gap-2">
						<Button onClick={handleSave} disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="animate-spin mr-2 h-4 w-4" />{" "}
									<span>Saving...</span>
								</>
							) : (
								"Save"
							)}
						</Button>
					</div>
				}
			/>
			<div className="px-4 md:px-12 py-4">
				{isLoading && <div>Loading employee...</div>}
				{isError && <div>Failed to load employee.</div>}
				{initialValues && (
					<OrgChartForm
						initialValues={initialValues}
						isEdit
						employeeId={String(id)}
						onRegisterSubmit={(fn) => {
							submitFn = fn;
						}}
						onSubmitComplete={handleSubmitComplete}
					/>
				)}
			</div>
		</>
	);
}
