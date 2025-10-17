"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CalendarIcon } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { useAnnouncementRate } from "@/hooks/queries/use-announcement-rate";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, subMonths, subYears } from "date-fns";

// Helper function to calculate date range based on granularity
const calculateDateRange = (granularity: string) => {
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
};

export function AverageAnnouncementChart() {
    const [granularity, setGranularity] = React.useState("Month");
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
      const range = calculateDateRange("Month");
      return {
        from: range.from,
        to: range.to,
      };
    });
    
    // Format dates for API
    const formattedStartDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
    const formattedEndDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";
    
    // Fetch data from API
    const { data, isLoading, isError } = useAnnouncementRate({
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      filter: granularity.toLowerCase()
    });
    
    const chartData = React.useMemo(() => {
      if (!data?.results) return [];
      
      return data.results.map(item => ({
        period: item.period,
        value: item.count
      }));
    }, [data]);
    
    const config = { 
      value: { 
        label: "Average Announcement Rate", 
        color: "#F4F2F3" 
      } 
    } as ChartConfig;

    const rangeLabel = React.useMemo(() => {
        const from = dateRange?.from;
        const to = dateRange?.to;
        if (!from || !to) return "Select range";
        const fmt = (d: Date) =>
            new Intl.DateTimeFormat("en-GB", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(d);
        return `${fmt(from)} - ${fmt(to)}`;
    }, [dateRange]);

    // Calculate average
    const average = React.useMemo(() => {
      if (!chartData.length) return 0;
      const sum = chartData.reduce((a, b) => a + b.value, 0);
      return Math.round(sum / chartData.length);
    }, [chartData]);
    
    // Loading state
    if (isLoading) {
      return (
        <Card className="p-4 shadow-none border-[#D0D0D0] gap-2 h-full flex flex-col overflow-hidden">
          <div className="text-sm font-medium">
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-semibold">
                <Skeleton className="h-8 w-12" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
              <Skeleton className="h-8 w-full md:w-[210px]" />
              <Skeleton className="h-8 w-full md:w-[110px]" />
            </div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="mt-3 w-full min-h-[180px] sm:min-h-[260px] flex-1 flex items-center justify-center">
            <Skeleton className="h-full w-full rounded" />
          </div>
        </Card>
      );
    }
    
    // Error state
    if (isError) {
      return (
        <Card className="p-4 shadow-none border-[#D0D0D0] gap-2 h-full flex flex-col overflow-hidden">
          <div className="text-sm font-medium">Average Announcement Rate</div>
          <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-semibold text-red-500">Error loading data</div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="!h-8 w-full md:w-[210px] justify-between text-left text-xs font-normal border-black"
                  >
                    <span className="truncate">{rangeLabel}</span>
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="rounded-md"
                  />
                </PopoverContent>
              </Popover>
              <Select value={granularity} onValueChange={setGranularity}>
                <SelectTrigger className="!h-8 rounded-[4px] w-full md:w-[110px] text-xs border-black">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Day">Day</SelectItem>
                  <SelectItem value="Week">Week</SelectItem>
                  <SelectItem value="Month">Month</SelectItem>
                  <SelectItem value="Year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Average Announcement Rate</div>
          <div className="mt-3 w-full min-h-[180px] sm:min-h-[260px] flex-1 flex items-center justify-center text-red-500">
            Failed to load announcement data. Please try again later.
          </div>
        </Card>
      );
    }

    return (
        <Card className="p-4 shadow-none border-[#D0D0D0] gap-2 h-full flex flex-col overflow-hidden">
            <div className="text-sm font-medium">Average Announcement Rate</div>
            <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="text-2xl font-semibold">{average}</div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="!h-8 w-full md:w-[210px] justify-between text-left text-xs font-normal border-black"
                            >
                                <span className="truncate">{rangeLabel}</span>
                                <CalendarIcon className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                                className="rounded-md"
                            />
                        </PopoverContent>
                    </Popover>
                    <Select value={granularity} onValueChange={setGranularity}>
                        <SelectTrigger className="!h-8 rounded-[4px] w-full md:w-[110px] text-xs border-black">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Day">Day</SelectItem>
                            <SelectItem value="Week">Week</SelectItem>
                            <SelectItem value="Month">Month</SelectItem>
                            <SelectItem value="Year">Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Average Announcement Rate</div>

            <ChartContainer config={config} className="mt-3 w-full min-h-[180px] sm:min-h-[260px] flex-1">
                <BarChart data={chartData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="period" 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8}
                      tickFormatter={(value) => {
                        // Format the date based on granularity
                        try {
                          const date = new Date(value);
                          switch (granularity) {
                            case "Day":
                              return format(date, "MMM d");
                            case "Week":
                              return format(date, "MMM d");
                            case "Month":
                              return format(date, "MMM yyyy");
                            case "Year":
                              return format(date, "yyyy");
                            default:
                              return value;
                          }
                        } catch {
                          return value;
                        }
                      }}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8} 
                      domain={[0, Math.max(10, ...chartData.map(d => d.value))]}
                    />
                    <ChartTooltip 
                      cursor={false} 
                      content={
                        <ChartTooltipContent 
                          formatter={(value) => `${value} announcements`}
                          labelFormatter={(label) => {
                            try {
                              const date = new Date(label);
                              return format(date, "MMM d, yyyy");
                            } catch {
                              return label;
                            }
                          }}
                        />
                      } 
                    />
                    <Bar
                        dataKey="value"
                        fill="#F4F2F3"
                        radius={6}
                        className="fill-[#fff4f8] stroke stroke-secondary hover:fill-[#D64575] transition-colors duration-200"
                    />
                </BarChart>
            </ChartContainer>
        </Card>
    );
}