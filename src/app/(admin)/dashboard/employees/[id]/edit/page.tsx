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

	// Get the branch department ID
	const branchDepartmentId = apiEmployee?.branch_department
		? String(apiEmployee.branch_department)
		: undefined;

	const initialValues: OrgChartInitialValues | undefined = apiEmployee
		? {
				emp_name: apiEmployee.emp_name ?? "",
				email: apiEmployee.email ?? undefined,
				phone: apiEmployee.phone ?? undefined,
				role: apiEmployee.role ?? undefined,
				education: apiEmployee.education ?? undefined,
				bio: apiEmployee.bio ?? undefined,
				branch_department: branchDepartmentId,
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
