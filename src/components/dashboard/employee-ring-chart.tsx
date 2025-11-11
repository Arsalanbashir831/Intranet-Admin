"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Pie, PieChart, Cell, ResponsiveContainer, Label } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAllBranches } from "@/hooks/queries/use-branches";
import { Skeleton } from "@/components/ui/skeleton";
import { Branch } from "@/types/branches";
import { DEPARTMENT_COLORS } from "@/constants/colors";

type Slice = { name: string; value: number; color: string };
type BranchData = {
  branch: string;
  data: Slice[];
  total: number;
};


export function EmployeeRingChart() {
  const { data, isLoading, isError } = useAllBranches({ page_size: 1000 });
  const [selectedBranch, setSelectedBranch] = React.useState("all");

  // Process data for the chart
  const processedData = React.useMemo(() => {
    if (!data?.branches.results) return { all: null, branches: {} };

    const allBranchesData: Slice[] = [];
    const branchMap: Record<string, BranchData> = {};
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
      const branchDepartments: Slice[] = [];
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
    const allBranches: BranchData = {
      branch: "All Branches",
      data: allBranchesData,
      total: allBranchesTotal
    };

    return { all: allBranches, branches: branchMap };
  }, [data]);

  // Get current data based on selection
  const currentData = React.useMemo(() => {
    if (!processedData.all) return null;

    if (selectedBranch === "all") {
      return processedData.all;
    }

    return processedData.branches[selectedBranch] || null;
  }, [processedData, selectedBranch]);

  const config = React.useMemo(() => {
    if (!currentData) return {};
    return Object.fromEntries(
      currentData.data.map((d) => [d.name, { label: d.name, color: d.color }])
    ) as ChartConfig;
  }, [currentData]);

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [outerR, setOuterR] = React.useState(92);
  const [innerR, setInnerR] = React.useState(72);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      const width = rect.width;
      const height = el.clientHeight || rect.height || width;
      const base = Math.min(width, height);
      const outer = Math.max(48, Math.min(90, Math.round(base * 0.35)));
      const inner = Math.max(outer - 24, 40);
      setOuterR(outer);
      setInnerR(inner);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-4 shadow-none gap-0 border-[#D0D0D0] h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[#14172A] text-lg font-semibold leading-6 sm:text-[22px]">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="text-[#666666] text-xs sm:text-sm mt-1">
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-8 w-[140px] rounded-[4px]" />
        </div>
        <div ref={containerRef} className="relative mt-3 sm:mt-4 flex-1">
          <div className="mx-auto h-full min-h-[180px] sm:min-h-[260px] w-full flex items-center justify-center">
            <Skeleton className="rounded-full h-40 w-40" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="inline-block size-3 rounded-[4px]" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="ml-auto h-4 w-10" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Error state
  if (isError || !currentData) {
    return (
      <Card className="p-4 shadow-none gap-0 border-[#D0D0D0] h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[#14172A] text-lg font-semibold leading-6 sm:text-[22px]">Employee Chart</div>
            <div className="text-[#666666] text-xs sm:text-sm mt-1">Staff as per department</div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-red-500">
          Failed to load employee data. Please try again later.
        </div>
      </Card>
    );
  }

  // Empty state - show gray ring when no employees or no departments
  if (currentData.total === 0 || currentData.data.length === 0) {
    return (
      <Card className="p-4 shadow-none gap-0 border-[#D0D0D0] h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[#14172A] text-lg font-semibold leading-6 sm:text-[22px]">Employee Chart</div>
            <div className="text-[#666666] text-xs sm:text-sm mt-1">Staff as per department</div>
          </div>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[140px] h-8! rounded-[4px] text-xs border-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="all" value="all" className="text-xs">
                All Branches
              </SelectItem>
              {data?.branches.results.map((branch: Branch) => (
                <SelectItem key={branch.id} value={branch.id.toString()} className="text-xs">
                  {branch.branch_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div ref={containerRef} className="relative mt-3 sm:mt-4 flex-1">
          <ChartContainer config={{}} className="mx-auto h-full min-h-[180px] sm:min-h-[260px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[{ name: "No Data", value: 1 }]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={innerR}
                  outerRadius={outerR}
                  strokeWidth={6}
                  isAnimationActive={false}
                >
                  <Cell fill="#E0E0E0" /> {/* Gray color for empty state */}
                  <Label
                    content={({ viewBox }: { viewBox: { cx: number; cy: number } }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-semibold sm:text-2xl">0</tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs sm:text-sm">Total Staff</tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="mt-4 space-y-2 text-[12px] sm:text-[13px]">
          {currentData.data.length > 0 ? (
            currentData.data.map((d) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="inline-block size-3 rounded-[4px]" style={{ backgroundColor: d.color }} />
                <span className="text-[13px] sm:text-[14px]">{d.name}</span>
                <span className="ml-auto font-medium">0.00 %</span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3">
              <span className="inline-block size-3 rounded-[4px]" style={{ backgroundColor: "#E0E0E0" }} />
              <span className="text-[13px] sm:text-[14px]">No Departments</span>
              <span className="ml-auto font-medium">0.00 %</span>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 shadow-none gap-0 border-[#D0D0D0] h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[#14172A] text-lg font-semibold leading-6 sm:text-[22px]">Employee Chart</div>
          <div className="text-[#666666] text-xs sm:text-sm mt-1">Staff as per department</div>
        </div>
        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
          <SelectTrigger className="w-[140px] h-8! rounded-[4px] text-xs border-black">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all" value="all" className="text-xs">
              All Branches
            </SelectItem>
            {data?.branches.results.map((branch: Branch) => (
              <SelectItem key={branch.id} value={branch.id.toString()} className="text-xs">
                {branch.branch_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div ref={containerRef} className="relative mt-3 sm:mt-4 flex-1">
        <ChartContainer config={config} className="mx-auto h-full min-h-[180px] sm:min-h-[260px] w-full">
          <ResponsiveContainer>
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie data={currentData.data} dataKey="value" nameKey="name" innerRadius={innerR} outerRadius={outerR} strokeWidth={6}>
                {currentData.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <Label
                  content={({ viewBox }: { viewBox: { cx: number; cy: number } }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-semibold sm:text-2xl">{currentData.total}</tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs sm:text-sm">Total Staff</tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      <div className="mt-4 space-y-2 text-[12px] sm:text-[13px]">
        {currentData.data.map((d) => (
          <div key={d.name} className="flex items-center gap-3">
            <span className="inline-block size-3 rounded-[4px]" style={{ backgroundColor: d.color }} />
            <span className="text-[13px] sm:text-[14px]">{d.name}</span>
            <span className="ml-auto font-medium">
              {currentData.total > 0 ? ((d.value / currentData.total) * 100).toFixed(2) : "0.00"} %
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
