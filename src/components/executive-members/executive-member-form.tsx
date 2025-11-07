"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
	SelectableTags,
	createSelectableItems,
} from "@/components/ui/selectable-tags";
import {
	useCreateExecutive,
	useUpdateExecutive,
} from "@/hooks/queries/use-executive-members";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

export type ExecutiveMemberInitialValues = {
	name?: string;
	address?: string;
	city?: string;
	phone?: string;
	email?: string;
	role?: string;
	education?: string;
	bio?: string;
	profileImageUrl?: string;
};

export function ExecutiveMemberForm({
	initialValues,
	onRegisterSubmit,
	isEdit = false,
	executiveId,
	onSubmitComplete,
}: {
	initialValues?: ExecutiveMemberInitialValues;
	onRegisterSubmit?: (submit: () => void) => void;
	isEdit?: boolean;
	executiveId?: string;
	onSubmitComplete?: (success: boolean) => void; // Added this new prop
}) {
	// Form state
	const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
	const [isRemovingPicture, setIsRemovingPicture] = React.useState(false);
	const [selectedRoleId, setSelectedRoleId] = React.useState<
		string | undefined
	>(initialValues?.role);
	const [educationHtml, setEducationHtml] = React.useState<string | undefined>(
		initialValues?.education
	);
	const [bioHtml, setBioHtml] = React.useState<string | undefined>(
		initialValues?.bio
	);

	// React Query mutations
	const createExecutive = useCreateExecutive();
	const updateExecutive = useUpdateExecutive(executiveId || "");
	const router = useRouter();

	// Role options for SelectableTags
	const roleOptions = React.useMemo(
		() => [
			{ id: "CEO", name: "CEO" },
			{ id: "CTO", name: "CTO" },
			{ id: "CFO", name: "CFO" },
			{ id: "Director", name: "Director" },
			{ id: "VP of Sales", name: "VP of Sales" },
			{ id: "VP of Marketing", name: "VP of Marketing" },
			{ id: "VP of Operations", name: "VP of Operations" },
			{ id: "VP of HR", name: "VP of HR" },
			{ id: "President", name: "President" },
			{ id: "Managing Director", name: "Managing Director" },
			{ id: "Executive Director", name: "Executive Director" },
			{ id: "Other", name: "Other" },
		],
		[]
	);

	// Reinitialize if initialValues change
	React.useEffect(() => {
		setEducationHtml(initialValues?.education);
		setBioHtml(initialValues?.bio);
		setSelectedRoleId(initialValues?.role);
		setSelectedFiles([]);
		setIsRemovingPicture(false);
	}, [initialValues?.education, initialValues?.bio, initialValues?.role]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const name = String(data.get("name") || "").trim();
		const email = String(data.get("email") || "").trim();
		const role = selectedRoleId || String(data.get("role") || "").trim();
		const address = String(data.get("address") || "").trim();
		const city = String(data.get("city") || "").trim();
		const phone = String(data.get("phone") || "").trim();
		const education =
			educationHtml || String(data.get("education") || "").trim();
		const bio = bioHtml || String(data.get("bio") || "").trim();

		if (!name || !email || !role || !address || !city || !phone || !education) {
			toast.error("All fields are required");
			onSubmitComplete?.(false); // Notify parent that submission failed
			return;
		}

		const payload = {
			name,
			email,
			role,
			address,
			city,
			phone,
			education,
			bio,
			profile_picture:
				selectedFiles[0] || (isRemovingPicture ? null : undefined),
		} as import("@/services/executive-members").ExecutiveCreateRequest;

		try {
			if (isEdit && executiveId) {
				await updateExecutive.mutateAsync(payload);
				toast.success("Executive member updated successfully");
			} else {
				await createExecutive.mutateAsync(payload);
				toast.success("Executive member created successfully");
			}
			onSubmitComplete?.(true); // Notify parent that submission succeeded
			router.push(ROUTES.ADMIN.EXECUTIVE_MEMBERS);
		} catch (error: unknown) {
			const err = error as { response?: { data?: Record<string, unknown> } };
			const dataErr = err?.response?.data;
			const messages: string[] = [];
			if (dataErr && typeof dataErr === "object") {
				for (const key of Object.keys(dataErr)) {
					const value = dataErr[key];
					if (Array.isArray(value)) {
						value.forEach((msg: unknown) =>
							messages.push(`${key}: ${String(msg)}`)
						);
					} else if (typeof value === "string") {
						messages.push(`${key}: ${value}`);
					}
				}
			}
			if (messages.length) {
				messages.forEach((m) => toast.error(m));
			} else {
				toast.error("Failed to save. Please try again.");
			}
			onSubmitComplete?.(false); // Notify parent that submission failed
		}
	};

	// Allow parent to trigger submit from outside via PageHeader Save button
	const formRef = React.useRef<HTMLFormElement | null>(null);
	React.useEffect(() => {
		if (onRegisterSubmit) {
			onRegisterSubmit(() => {
				if (formRef.current) {
					// Trigger native form submission to use handleSubmit
					formRef.current.requestSubmit();
				}
			});
		}
	}, [onRegisterSubmit]);

	return (
		<form ref={formRef} className="grid gap-6" onSubmit={handleSubmit}>
			<div className="grid grid-cols-12 items-center gap-4 border-t border-[#E9EAEB] pt-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					Name:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<Input
						name="name"
						defaultValue={initialValues?.name}
						placeholder="Name"
						className="border-[#E2E8F0]"
						required
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-center gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					Address:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<Input
						name="address"
						defaultValue={initialValues?.address}
						placeholder="Address"
						className="border-[#E2E8F0]"
						required
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-center gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					City:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<Input
						name="city"
						defaultValue={initialValues?.city}
						placeholder="City"
						className="border-[#E2E8F0]"
						required
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-center gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					Phone Number:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<Input
						name="phone"
						defaultValue={initialValues?.phone}
						placeholder="Phone Number"
						className="border-[#E2E8F0]"
						required
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-center gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					Email Id:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<Input
						name="email"
						defaultValue={initialValues?.email}
						placeholder="Email Id"
						type="email"
						className="border-[#E2E8F0]"
						required
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-center gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					Role:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<SelectableTags
						items={createSelectableItems(roleOptions)}
						selectedItems={selectedRoleId ? [selectedRoleId] : []}
						onSelectionChange={(ids) => {
							const last = ids[ids.length - 1];
							setSelectedRoleId(last);
						}}
						placeholder="Select role"
						searchPlaceholder="Search roles..."
						emptyMessage="No roles found."
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-start gap-4 border-t border-[#E9EAEB] pt-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					Profile Picture:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<Dropzone
						onFileSelect={(files) => {
							if (files) {
								setSelectedFiles(Array.from(files));
								setIsRemovingPicture(false);
							}
						}}
						onClear={() => {
							setSelectedFiles([]);
							if (initialValues?.profileImageUrl) {
								setIsRemovingPicture(true);
							}
						}}
						accept="image/*"
						initialPreviewUrls={
							initialValues?.profileImageUrl
								? [initialValues.profileImageUrl]
								: []
						}
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-start gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					Qualification or Education
				</Label>
				<div className="col-span-12 md:col-span-10">
					<RichTextEditor
						content={educationHtml}
						placeholder="Enter qualification or education details..."
						minHeight="200px"
						maxHeight="400px"
						onChange={(html) => setEducationHtml(html)}
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-start gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					Bio
				</Label>
				<div className="col-span-12 md:col-span-10">
					<RichTextEditor
						content={bioHtml}
						placeholder="Enter bio details..."
						minHeight="200px"
						maxHeight="400px"
						onChange={(html) => setBioHtml(html)}
					/>
				</div>
			</div>
		</form>
	);
}
