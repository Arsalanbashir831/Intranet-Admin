import { CompanyHubInitialData } from "@/types/company-hub";

/**
 * calculates initial branches from priority order:
 * 1. permittedBranchDepartments (converted back to branches)
 * 2. permittedBranches (direct)
 * 3. selectedBranchDepartments (legacy, converted)
 */
export function getInitialBranches(
    initialData: CompanyHubInitialData | undefined,
    branchDepartmentIdToCombination: Map<string, { branchId: number; departmentId: number }>
): string[] {
    // If permittedBranchDepartments exists, convert from branch_department_ids
    if (initialData?.permittedBranchDepartments?.length) {
        const branchIds = new Set<string>();
        for (const bdId of initialData.permittedBranchDepartments) {
            const combo = branchDepartmentIdToCombination.get(String(bdId));
            if (combo) {
                branchIds.add(String(combo.branchId));
            }
        }
        return Array.from(branchIds);
    }
    // If permittedBranches exists, use it directly
    if (initialData?.permittedBranches?.length) {
        return initialData.permittedBranches;
    }
    // Fallback to selectedBranchDepartments (for backward compatibility)
    if (initialData?.selectedBranchDepartments?.length) {
        const branchIds = new Set<string>();
        for (const bdId of initialData.selectedBranchDepartments) {
            const combo = branchDepartmentIdToCombination.get(bdId);
            if (combo) {
                branchIds.add(String(combo.branchId));
            }
        }
        return Array.from(branchIds);
    }
    return [];
}

/**
 * calculates initial departments from priority order:
 * 1. permittedBranchDepartments (converted back to departments)
 * 2. permittedDepartments (direct)
 * 3. selectedBranchDepartments (legacy, converted)
 */
export function getInitialDepartments(
    initialData: CompanyHubInitialData | undefined,
    branchDepartmentIdToCombination: Map<string, { branchId: number; departmentId: number }>
): string[] {
    // If permittedBranchDepartments exists, convert from branch_department_ids
    if (initialData?.permittedBranchDepartments?.length) {
        const deptIds = new Set<string>();
        for (const bdId of initialData.permittedBranchDepartments) {
            const combo = branchDepartmentIdToCombination.get(String(bdId));
            if (combo) {
                deptIds.add(String(combo.departmentId));
            }
        }
        return Array.from(deptIds);
    }
    // If permittedDepartments exists, use it directly
    if (initialData?.permittedDepartments?.length) {
        return initialData.permittedDepartments;
    }
    // Fallback to selectedBranchDepartments (for backward compatibility)
    if (initialData?.selectedBranchDepartments?.length) {
        const deptIds = new Set<string>();
        for (const bdId of initialData.selectedBranchDepartments) {
            const combo = branchDepartmentIdToCombination.get(bdId);
            if (combo) {
                deptIds.add(String(combo.departmentId));
            }
        }
        return Array.from(deptIds);
    }
    return [];
}

/**
 * Converts selected branches and departments into branch_department_ids
 * and returns the payload fields structure
 */
export function getPayloadFields(
    selectedBranches: string[],
    selectedDepartments: string[],
    branchDepartmentsData: any,
    isManager: boolean,
    managedDepartments?: number[]
) {
    const hasBranches = selectedBranches.length > 0;
    const hasDepartments = selectedDepartments.length > 0;

    // Convert branches and departments to branch_department_ids
    const branchDeptIds: string[] = [];
    if (hasBranches && hasDepartments && branchDepartmentsData?.branch_departments?.results) {
        const branchIdSet = new Set(selectedBranches.map(Number));
        const deptIdSet = new Set(selectedDepartments.map(Number));

        for (const bd of branchDepartmentsData.branch_departments.results) {
            if (isManager && managedDepartments && !managedDepartments.includes(bd.id)) {
                continue;
            }

            if (
                bd.branch?.id &&
                branchIdSet.has(bd.branch.id) &&
                bd.department?.id &&
                deptIdSet.has(bd.department.id)
            ) {
                branchDeptIds.push(String(bd.id));
            }
        }
    }

    return {
        permittedBranches: hasBranches && !hasDepartments ? selectedBranches : undefined,
        permittedDepartments: hasDepartments && !hasBranches ? selectedDepartments : undefined,
        permittedBranchDepartments: hasBranches && hasDepartments ? branchDeptIds : undefined,
        selectedBranchDepartments: branchDeptIds, // Keep for backward compatibility
    };
}


export function getAttachmentPreviewUrls(
    existingAttachments: Array<{
        id: number;
        name: string;
        file_url: string;
        size: number;
    }>
) {
    return existingAttachments.map((attachment) => {
        const fileInfo = {
            url: attachment.file_url,
            name: attachment.name,
            id: attachment.id,
        };
        return `attachment://${encodeURIComponent(JSON.stringify(fileInfo))}`;
    });
}

export function getAttachmentIdByUrl(
    url: string,
    existingAttachments: Array<{ file_url: string; id: number }>
) {
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
}
