export type DashboardGranularity = "Day" | "Week" | "Month" | "Year";

export type RingChartSlice = { 
  name: string; 
  value: number; 
  color: string; 
};

export type RingChartBranchData = {
  branch: string;
  data: RingChartSlice[];
  total: number;
};

export type StatCardItem = {
  id: string;
  label: string;
  value: string | number;
  iconPath: string; // from public/icons
  padTo?: number; // left pad numbers (e.g., 2 => 07)
};
