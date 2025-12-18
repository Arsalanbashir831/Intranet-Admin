import { subDays, subMonths, subYears } from "date-fns";
import { DashboardGranularity, RingChartSlice, RingChartBranchData } from "@/types/dashboard";
import { Branch } from "@/types/branches";
import { DEPARTMENT_COLORS } from "@/constants/colors";

// --- Average Announcement Chart Handlers ---

export function calculateDateRange(granularity: string) {
  const to = new Date();
  let from: Date;
  
  switch (granularity) {
    case "Day":
      from = subDays(to, 30);
      break;
    case "Week":
      from = subDays(to, 120); // 120 days = ~17 weeks
      break;
    case "Month":
      from = subMonths(to, 12);
      break;
    case "Year":
      from = subYears(to, 5);
      break;
    default:
      from = subMonths(to, 12);
  }
  
  return { from, to };
}

// --- Employee Ring Chart Handlers ---

export function processEmployeeRingData(data: { branches: { results: Branch[] } } | undefined) {
  if (!data?.branches.results) return { all: null, branches: {} };

  const allBranchesData: RingChartSlice[] = [];
  const branchMap: Record<string, RingChartBranchData> = {};
  const departmentSet = new Set<string>();

  // Collect all unique department names first
  data.branches.results.forEach((branch: Branch) => {
    branch.departments.forEach(dept => {
      departmentSet.add(dept.dept_name);
    });
  });

  const uniqueDepartments = Array.from(departmentSet);

  // Process all branches data
  data.branches.results.forEach((branch: Branch) => {
    const branchDepartments: RingChartSlice[] = [];
    let branchTotal = 0;

    // Create a map of department names to colors for this branch
    const branchDepartmentColors: Record<string, string> = {};
    branch.departments.forEach((dept) => {
      const deptIndex = uniqueDepartments.indexOf(dept.dept_name);
      branchDepartmentColors[dept.dept_name] = DEPARTMENT_COLORS[deptIndex % DEPARTMENT_COLORS.length];
    });

    branch.departments.forEach((dept) => {
      const employeeCount = dept.employee_count || 0;
      const color = branchDepartmentColors[dept.dept_name];

      // Add to branch data
      branchDepartments.push({
        name: dept.dept_name,
        value: employeeCount,
        color
      });

      branchTotal += employeeCount;
    });

    // Store branch data
    branchMap[branch.id.toString()] = {
      branch: branch.branch_name,
      data: branchDepartments,
      total: branchTotal
    };

    // Add to all branches data
    branchDepartments.forEach(dept => {
      const existingDept = allBranchesData.find(d => d.name === dept.name);
      if (existingDept) {
        existingDept.value += dept.value;
      } else {
        allBranchesData.push({ ...dept });
      }
    });
  });

  // Create "All Branches" data
  const allBranchesTotal = allBranchesData.reduce((sum, dept) => sum + dept.value, 0);
  const allBranches: RingChartBranchData = {
    branch: "All Branches",
    data: allBranchesData,
    total: allBranchesTotal
  };

  return { all: allBranches, branches: branchMap };
}

// --- Stat Cards Handlers ---

export function formatStatValue(value: string | number, padTo?: number) {
  if (typeof value === "number" && padTo && padTo > 0) {
    return value.toString().padStart(padTo, "0");
  }
  return value;
}
