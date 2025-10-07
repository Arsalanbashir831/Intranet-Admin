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
import {
	useAllBranches,
	useSearchBranches,
} from "@/hooks/queries/use-branches";

export type CompanyHubInitialData = {
	id?: string;
	type?: "announcement" | "policy";
	title?: string;
	tags?: string;
	selectedBranches?: string[];
	selectedDepartments?: string[];
	description?: string;
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
	tags: string;
	selectedBranches: string[];
	selectedDepartments: string[];
	description: string;
	attachedFiles: File[];
};

// Kept for compatibility (even though fields already exist on CompanyHubFormData)
export type CompanyHubFormSubmitData = CompanyHubFormData & {
	selectedBranches: string[];
	selectedDepartments: string[];
};

export function CompanyHubForm({
	initialData,
	onFormDataChange,
	existingAttachments = [],
	onAttachmentDelete,
}: CompanyHubFormProps) {
	// Load base datasets
	const { data: departmentsData } = useDepartments();
	const { data: branchesData } = useAllBranches();

	/**
	 * Adapters (async search) — normalize to SelectableItem[] only.
	 * These match SelectableTags’ updated expectation.
	 */
	// Create adapter hooks for SelectableTags search functionality
	const useSearchDepartmentsAdapter = (query: string) => {
		const searchResult = useSearchDepartments(query, { page: 1, pageSize: 50 });
		const selectableItems = React.useMemo(() => {
			// Transform the API response to match what SelectableTags expects
			if (searchResult.data) {
				// Handle the structure: { departments: { results: [...] } }
				if (
					typeof searchResult.data === "object" &&
					searchResult.data !== null &&
					"departments" in searchResult.data
				) {
					const departmentsData = searchResult.data as {
						departments?: {
							results?: Array<{ id: unknown; dept_name: unknown }>;
						};
					};
					const rawData = departmentsData.departments?.results || [];
					return createCustomSelectableItems(rawData, "id", "dept_name");
				}
				// Handle the structure: { results: [...] }
				if (
					typeof searchResult.data === "object" &&
					searchResult.data !== null &&
					"results" in searchResult.data
				) {
					return createCustomSelectableItems(
						(
							searchResult.data as {
								results: Array<{ id: unknown; dept_name: unknown }>;
							}
						).results || [],
						"id",
						"dept_name"
					);
				}
				// Handle direct array
				if (Array.isArray(searchResult.data)) {
					return createCustomSelectableItems(
						searchResult.data,
						"id",
						"dept_name"
					);
				}
			}
			return [];
		}, [searchResult.data]);

		// Return in the format that SelectableTags expects
		return {
			data: selectableItems,
			isLoading: searchResult.isLoading,
		};
	};

	const useSearchBranchesAdapter = (query: string) => {
		const searchResult = useSearchBranches(query, { page: 1, pageSize: 50 });
		const selectableItems = React.useMemo(() => {
			// Transform the API response to match what SelectableTags expects
			if (searchResult.data) {
				// Handle the structure: { branches: { results: [...] } }
				if (
					typeof searchResult.data === "object" &&
					searchResult.data !== null &&
					"branches" in searchResult.data
				) {
					const branchesData = searchResult.data as {
						branches?: {
							results?: Array<{ id: unknown; branch_name: unknown }>;
						};
					};
					const rawData = branchesData.branches?.results || [];
					return createCustomSelectableItems(rawData, "id", "branch_name");
				}
				// Handle the structure: { results: [...] }
				if (
					typeof searchResult.data === "object" &&
					searchResult.data !== null &&
					"results" in searchResult.data
				) {
					return createCustomSelectableItems(
						(
							searchResult.data as {
								results: Array<{ id: unknown; branch_name: unknown }>;
							}
						).results || [],
						"id",
						"branch_name"
					);
				}
				// Handle direct array
				if (Array.isArray(searchResult.data)) {
					return createCustomSelectableItems(
						searchResult.data,
						"id",
						"branch_name"
					);
				}
			}
			return [];
		}, [searchResult.data]);

		// Return in the format that SelectableTags expects
		return {
			data: selectableItems,
			isLoading: searchResult.isLoading,
		};
	};

	// Build base lists with "All" item, ids coerced to string for consistency
	const departments = React.useMemo(() => {
		const results = departmentsData?.departments?.results ?? [];
		if (!Array.isArray(results)) return [];
		const uniq = new Map<number, { id: string; name: string }>();
		results.forEach((d: { id: number; dept_name: string }) => {
			if (!uniq.has(d.id))
				uniq.set(d.id, { id: String(d.id), name: d.dept_name });
		});
		return [
			{ id: "all", name: "All Departments" },
			...Array.from(uniq.values()),
		];
	}, [departmentsData]);

	const branches = React.useMemo(() => {
		const results = branchesData?.branches?.results ?? [];
		if (!Array.isArray(results)) return [];
		const mapped = results.map((b: { id: number; branch_name: string }) => ({
			id: String(b.id),
			name: b.branch_name,
		}));
		return [{ id: "all", name: "All Branches" }, ...mapped];
	}, [branchesData]);

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
	const [tags, setTags] = React.useState<string>(initialData?.tags ?? "");
	const [selectedBranches, setSelectedBranches] = React.useState<string[]>(
		initialData?.selectedBranches ?? []
	);
	const [selectedDepartments, setSelectedDepartments] = React.useState<
		string[]
	>(initialData?.selectedDepartments ?? []);
	const [description, setDescription] = React.useState<string>(
		initialData?.description ?? ""
	);
	const [attachedFiles, setAttachedFiles] = React.useState<File[]>([]);

	// Sync when initialData changes
	React.useEffect(() => {
		if (!initialData) return;
		if (initialData.type) setTypeValue(initialData.type);
		if (typeof initialData.title === "string") setTitle(initialData.title);
		if (typeof initialData.tags === "string") setTags(initialData.tags);
		if (Array.isArray(initialData.selectedBranches))
			setSelectedBranches(initialData.selectedBranches);
		if (Array.isArray(initialData.selectedDepartments))
			setSelectedDepartments(initialData.selectedDepartments);
		if (typeof initialData.description === "string")
			setDescription(initialData.description);
	}, [initialData]);

	// Notify parent of changes
	const currentFormData = React.useMemo<CompanyHubFormData>(
		() => ({
			type: typeValue,
			title,
			tags,
			selectedBranches,
			selectedDepartments,
			description,
			attachedFiles,
		}),
		[
			typeValue,
			title,
			tags,
			selectedBranches,
			selectedDepartments,
			description,
			attachedFiles,
		]
	);

	React.useEffect(() => {
		onFormDataChange?.(currentFormData);
	}, [currentFormData, onFormDataChange]);

	// Helper sets for faster lookup
	const departmentIdsSet = React.useMemo(
		() => new Set(departments.filter((d) => d.id !== "all").map((d) => d.id)),
		[departments]
	);
	const branchIdsSet = React.useMemo(
		() => new Set(branches.filter((b) => b.id !== "all").map((b) => b.id)),
		[branches]
	);

	// "All" selection helpers
	const allDepartmentIds = React.useMemo(
		() => Array.from(departmentIdsSet),
		[departmentIdsSet]
	);
	const allBranchIds = React.useMemo(
		() => Array.from(branchIdsSet),
		[branchIdsSet]
	);

	// FIX: Do not drop ids coming from async search; only strip "all". If "all" selected, expand to full ids.
	const handleDepartmentSelectionChange = React.useCallback(
		(newSelection: string[]) => {
			if (newSelection.includes("all")) {
				setSelectedDepartments(allDepartmentIds);
				return;
			}
			// keep what user chose; just strip the synthetic "all"
			setSelectedDepartments(newSelection.filter((id) => id !== "all"));
		},
		[allDepartmentIds]
	);

	const handleBranchSelectionChange = React.useCallback(
		(newSelection: string[]) => {
			if (newSelection.includes("all")) {
				setSelectedBranches(allBranchIds);
				return;
			}
			setSelectedBranches(newSelection.filter((id) => id !== "all"));
		},
		[allBranchIds]
	);

	// All-selected flags (for hiding the "all" option)
	const areAllDepartmentsSelected = React.useMemo(() => {
		return (
			departmentIdsSet.size > 0 &&
			selectedDepartments.length === departmentIdsSet.size &&
			selectedDepartments.every((id) => departmentIdsSet.has(id))
		);
	}, [departmentIdsSet, selectedDepartments]);

	const areAllBranchesSelected = React.useMemo(() => {
		return (
			branchIdsSet.size > 0 &&
			selectedBranches.length === branchIdsSet.size &&
			selectedBranches.every((id) => branchIdsSet.has(id))
		);
	}, [branchIdsSet, selectedBranches]);

	// Hide "all" when everything is selected
	const departmentItems = React.useMemo(() => {
		return areAllDepartmentsSelected
			? departments.filter((d) => d.id !== "all")
			: departments;
	}, [departments, areAllDepartmentsSelected]);

	const branchItems = React.useMemo(() => {
		return areAllBranchesSelected
			? branches.filter((b) => b.id !== "all")
			: branches;
	}, [branches, areAllBranchesSelected]);

	// Displayed selections (we never store "all" in state)
	const displayedSelectedDepartments = selectedDepartments;
	const displayedSelectedBranches = selectedBranches;

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
						accept="image/*,.pdf,.doc,.docx"
						maxSize={10 * 1024 * 1024} // 10MB
						multiple
						showPreview={true}
						initialPreviewUrls={initialPreviewUrls}
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
				<Label className="col-span-12 md:col-span-2 text-sm">
					Hashtags/tags:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<Input
						placeholder="#importantNotice"
						className="border-[#E2E8F0]"
						value={tags}
						onChange={(e) => setTags(e.target.value)}
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-center gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm">
					Branch Access:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<SelectableTags
						items={createSelectableItems(branchItems)}
						selectedItems={displayedSelectedBranches}
						onSelectionChange={handleBranchSelectionChange}
						placeholder="Select branches (empty = public access)"
						searchPlaceholder="Search branches..."
						emptyMessage="No branches found."
						icon={<ChevronDownIcon size={12} className="text-[#535862]" />}
						useSearch={useSearchBranchesAdapter}
						useAllItems={() => ({
							data: createSelectableItems(branchItems),
							isLoading: false,
						})}
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
				<Label className="col-span-12 md:col-span-2 text-sm">
					Department Access:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<SelectableTags
						items={createSelectableItems(departmentItems)}
						selectedItems={displayedSelectedDepartments}
						onSelectionChange={handleDepartmentSelectionChange}
						placeholder="Select departments (empty = public access)"
						searchPlaceholder="Search departments..."
						emptyMessage="No departments found."
						icon={<ChevronDownIcon size={12} className="text-[#535862]" />}
						useSearch={useSearchDepartmentsAdapter}
						useAllItems={() => ({
							data: createSelectableItems(departmentItems),
							isLoading: false,
						})}
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-start gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm">
					Description:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<RichTextEditor
						content={description}
						onChange={setDescription}
						placeholder="Write Description for the Announcement/Policy"
						minHeight="200px"
						maxHeight="400px"
					/>
				</div>
			</div>
		</div>
	);
}
