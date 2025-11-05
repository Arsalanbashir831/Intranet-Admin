import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dropzone } from "@/components/ui/dropzone";
import {
	SelectableTags,
	createSelectableItems,
	createCustomSelectableItems,
} from "@/components/ui/selectable-tags";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ChevronDownIcon } from "lucide-react";
import {
	useDepartments,
	useSearchDepartments,
} from "@/hooks/queries/use-departments";
import { useManagerScope } from "@/contexts/manager-scope-context";

export type CompanyHubInitialData = {
	id?: string;
	type?: "announcement" | "policy";
	title?: string;
	selectedBranchDepartments?: string[];
	body?: string;
};

export type CompanyHubFormProps = {
	initialData?: CompanyHubInitialData;
	onFormDataChange?: (data: CompanyHubFormData) => void;
	onSubmit?: (data: CompanyHubFormData, isDraft: boolean) => void;
	existingAttachments?: Array<{
		id: number;
		name: string;
		file_url: string;
		size: number;
	}>;
	onAttachmentDelete?: (id: number) => void;
};

export type CompanyHubFormData = {
	type: "announcement" | "policy";
	title: string;
	selectedBranchDepartments: string[];
	body: string;
	attachedFiles: File[];
};

// Kept for compatibility (even though fields already exist on CompanyHubFormData)
export type CompanyHubFormSubmitData = CompanyHubFormData & {
	selectedBranchDepartments: string[];
};

export function CompanyHubForm({
	initialData,
	onFormDataChange,
	existingAttachments = [],
	onAttachmentDelete,
}: CompanyHubFormProps) {
	// Get manager scope to filter departments
	const { isManager, managedDepartments } = useManagerScope();
	
	// Load base datasets
	const { data: departmentsData } = useDepartments();

	/**
	 * Adapters (async search) — normalize to SelectableItem[] only.
	 * These match SelectableTags' updated expectation.
	 */
	// Create adapter functions for branch departments (similar to org-chart-form.tsx)
	const useAllBranchDepartments = () => {
		const result = useDepartments(undefined, { pageSize: 100 });
		const branchDeptItems = React.useMemo(() => {
			// Handle both array format (new) and nested object format (old)
			const results = Array.isArray(result.data) 
				? result.data 
				: (result.data as { departments?: { results?: unknown[] } } | undefined)?.departments?.results ?? [];

			const items: { id: string; label: string }[] = [];
			for (const dept of results || []) {
				const deptData = dept as {
					dept_name?: string;
					name?: string;
					branch_departments?: unknown[];
				};
				const deptName = String(deptData.dept_name ?? deptData.name ?? "");
				const branchDepartments = deptData.branch_departments as
					| Array<{
							id: number;
							branch?: { branch_name?: string };
							branch_name?: string;
					  }>
					| undefined;
				if (Array.isArray(branchDepartments)) {
					for (const bd of branchDepartments) {
						const bdId = String(bd.id);
						const branchName = String(
							bd?.branch?.branch_name ?? bd?.branch_name ?? ""
						);
						
						// Filter: If manager, only show their managed departments
						if (isManager && !managedDepartments.includes(bd.id)) {
							continue; // Skip this department
						}
						
						items.push({ id: bdId, label: `${deptName} - ${branchName}` });
					}
				}
			}
			return items;
		}, [result.data, isManager, managedDepartments]);

		return {
			data: branchDeptItems,
			isLoading: result.isLoading,
		};
	};

	const useSearchBranchDepartmentsAdapter = (query: string) => {
		const result = useSearchDepartments(query, { pageSize: 100 });
		const branchDeptItems = React.useMemo(() => {
			// Handle both array format (new) and nested object format (old)
			const results = Array.isArray(result.data) 
				? result.data 
				: (result.data as { departments?: { results?: unknown[] } } | undefined)?.departments?.results ?? [];
			const items: { id: string; label: string }[] = [];
			for (const dept of results || []) {
				const deptData = dept as {
					dept_name?: string;
					name?: string;
					branch_departments?: unknown[];
				};
				const deptName = String(deptData.dept_name ?? deptData.name ?? "");
				const branchDepartments = deptData.branch_departments as
					| Array<{
							id: number;
							branch?: { branch_name?: string };
							branch_name?: string;
					  }>
					| undefined;
				if (Array.isArray(branchDepartments)) {
					for (const bd of branchDepartments) {
						const bdId = String(bd.id);
						const branchName = String(
							bd?.branch?.branch_name ?? bd?.branch_name ?? ""
						);
						
						// Filter: If manager, only show their managed departments
						if (isManager && !managedDepartments.includes(bd.id)) {
							continue; // Skip this department
						}
						
						items.push({ id: bdId, label: `${deptName} - ${branchName}` });
					}
				}
			}
			return items;
		}, [result.data, isManager, managedDepartments]);

		return {
			data: branchDeptItems,
			isLoading: result.isLoading,
		};
	};


	// Attachments → special preview urls
	const initialPreviewUrls = React.useMemo(() => {
		return existingAttachments.map((attachment) => {
			const fileInfo = {
				url: attachment.file_url,
				name: attachment.name,
				id: attachment.id,
			};
			return `attachment://${encodeURIComponent(JSON.stringify(fileInfo))}`;
		});
	}, [existingAttachments]);

	const getAttachmentIdByUrl = (url: string) => {
		if (url.startsWith("attachment://")) {
			try {
				const decoded = decodeURIComponent(url.replace("attachment://", ""));
				const fileInfo = JSON.parse(decoded);
				return fileInfo.id ?? null;
			} catch {
				return null;
			}
		}
		const match = existingAttachments.find((a) => a.file_url === url);
		return match?.id;
	};

	// Form state
	const [typeValue, setTypeValue] = React.useState<"announcement" | "policy">(
		initialData?.type ?? "announcement"
	);
	const [title, setTitle] = React.useState<string>(initialData?.title ?? "");
	const [selectedBranchDepartments, setSelectedBranchDepartments] = React.useState<string[]>(
		initialData?.selectedBranchDepartments ?? []
	);
	const [body, setBody] = React.useState<string>(
		initialData?.body ?? ""
	);
	const [attachedFiles, setAttachedFiles] = React.useState<File[]>([]);

	// Sync when initialData changes
	React.useEffect(() => {
		if (!initialData) return;
		if (initialData.type) setTypeValue(initialData.type);
		if (typeof initialData.title === "string") setTitle(initialData.title);
		if (Array.isArray(initialData.selectedBranchDepartments))
			setSelectedBranchDepartments(initialData.selectedBranchDepartments);
		if (typeof initialData.body === "string")
			setBody(initialData.body);
	}, [initialData]);

	// Notify parent of changes
	const currentFormData = React.useMemo<CompanyHubFormData>(
		() => ({
			type: typeValue,
			title,
			selectedBranchDepartments,
			body,
			attachedFiles,
		}),
		[
			typeValue,
			title,
			selectedBranchDepartments,
			body,
			attachedFiles,
		]
	);

	React.useEffect(() => {
		onFormDataChange?.(currentFormData);
	}, [currentFormData, onFormDataChange]);


	return (
		<div className="grid gap-6">
			<div className="grid grid-cols-12 items-start gap-4 border-b border-[#E9EAEB] pb-4">
				<Label className="col-span-12 md:col-span-2 text-sm">Type:</Label>
				<div className="col-span-12 md:col-span-10">
					<RadioGroup
						value={typeValue}
						onValueChange={(v) => setTypeValue(v as "announcement" | "policy")}
						className="flex gap-6">
						<div className="flex items-center gap-2">
							<RadioGroupItem value="announcement" id="type-ann" />
							<Label
								htmlFor="type-ann"
								className="cursor-pointer text-[#535862]">
								Announcement
							</Label>
						</div>
						<div className="flex items-center gap-2">
							<RadioGroupItem value="policy" id="type-pol" />
							<Label
								htmlFor="type-pol"
								className="cursor-pointer text-[#535862]">
								Policy
							</Label>
						</div>
					</RadioGroup>
				</div>
			</div>

			<div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
				<Label className="col-span-12 md:col-span-2 text-sm">Title:</Label>
				<div className="col-span-12 md:col-span-10">
					<Input
						placeholder="e.g. Announcement 1/Policy"
						className="border-[#E2E8F0]"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-start gap-4 border-b border-[#E9EAEB] pb-4">
				<Label className="col-span-12 md:col-span-2 text-sm">
					Attachments:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<Dropzone
						onFileSelect={(files) => {
							if (files) {
								setAttachedFiles(Array.from(files));
							}
						}}
						onClear={() => {
							setAttachedFiles([]);
							if (existingAttachments.length > 0 && onAttachmentDelete) {
								existingAttachments.forEach((attachment) =>
									onAttachmentDelete(attachment.id)
								);
							}
						}}
						onImageRemove={(url) => {
							if (url.startsWith("attachment://")) {
								try {
									const decodedData = decodeURIComponent(
										url.replace("attachment://", "")
									);
									const fileInfo = JSON.parse(decodedData);
									const attachmentId = fileInfo.id;
									if (attachmentId && onAttachmentDelete)
										onAttachmentDelete(attachmentId);
								} catch (e) {
									console.error("Error parsing attachment URL:", e);
								}
							} else if (
								!url.startsWith("blob:") &&
								!url.startsWith("file://")
							) {
								const attachmentId = getAttachmentIdByUrl(url);
								if (attachmentId && onAttachmentDelete)
									onAttachmentDelete(attachmentId);
							}
						}}
						accept="image/*"
						maxSize={10 * 1024 * 1024} // 10MB
						multiple={false}
						showPreview={true}
						initialPreviewUrls={initialPreviewUrls}
					/>
				</div>
			</div>


			<div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
				<Label className="col-span-12 md:col-span-2 text-sm">
					Branch Department Access:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<SelectableTags
						items={[]} // Empty since we're using async hooks
						selectedItems={selectedBranchDepartments}
						onSelectionChange={setSelectedBranchDepartments}
						placeholder="Select branch departments (empty = public access)"
						searchPlaceholder="Search branch departments..."
						emptyMessage="No branch departments found."
						icon={<ChevronDownIcon size={12} className="text-[#535862]" />}
						useSearch={useSearchBranchDepartmentsAdapter}
						useAllItems={useAllBranchDepartments}
					/>
					{isManager && (
						<p className="mt-1 text-xs text-muted-foreground">
							As a manager, you can only assign announcements to your managed departments.
						</p>
					)}
				</div>
			</div>

			<div className="grid grid-cols-12 items-start gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm">
					Description:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<RichTextEditor
						content={body}
						onChange={setBody}
						placeholder="Write content for the Announcement/Policy"
						minHeight="200px"
						maxHeight="400px"
					/>
				</div>
			</div>
		</div>
	);
}
