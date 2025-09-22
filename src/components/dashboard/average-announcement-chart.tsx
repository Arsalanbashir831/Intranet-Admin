"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ArrowUpRight, CalendarIcon } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";

export function AverageAnnouncementChart({ data }: { data: { month: string; value: number }[] }) {
    const config = { value: { label: "Average Announcement Rate", color: "#F4F2F3" } } as ChartConfig;
    const [granularity, setGranularity] = React.useState("Month");
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: new Date(2023, 0, 1),
        to: new Date(2023, 11, 31),
    });

    const rangeLabel = React.useMemo(() => {
        const from = dateRange?.from;
        const to = dateRange?.to;
        if (!from || !to) return "Select range";
        const fmt = (d: Date) =>
            new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(d);
        return `${fmt(from)} - ${fmt(to)}`;
    }, [dateRange]);

    const average = Math.round(
        data.reduce((a, b) => a + b.value, 0) / Math.max(1, data.length)
    );

    return (
        <Card className="p-4 shadow-none border-[#D0D0D0] gap-2 h-full flex flex-col overflow-hidden">
            <div className="text-sm font-medium">Average Announcement Rate</div>
            <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="text-2xl font-semibold">{average}%</div>
                    <div className="flex items-center gap-1 rounded-full bg-[#E8FFF3] px-2 py-0.5 text-xs font-medium text-[#18A957]">
                        <ArrowUpRight className="size-3" /> 12%
                    </div>
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
                <BarChart data={data}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(v) => `${v}%`} />} />
                    <Bar
                        dataKey="value"
                        fill="#F4F2F3"
                        radius={6}
                        className="hover:fill-[#D64575] transition-colors duration-200"
                    />
                </BarChart>
            </ChartContainer>
        </Card>
    );
}


