"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Pie, PieChart, Cell, ResponsiveContainer, Label } from "recharts";

type Slice = { name: string; value: number; color: string };

export function EmployeeRingChart({ data, total }: { data: Slice[]; total?: number }) {
  const computedTotal = total ?? data.reduce((s, d) => s + d.value, 0);
  const config = Object.fromEntries(data.map((d) => [d.name, { label: d.name, color: d.color }])) as ChartConfig;
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
  return (
    <Card className="p-4 shadow-none gap-0 border-[#D0D0D0] h-full flex flex-col overflow-hidden">
      <div className="text-[#14172A] text-lg font-semibold leading-6 sm:text-[22px]">Employee Chart</div>
      <div className="text-[#666666] text-xs sm:text-sm mt-1">Hires as per department</div>
      <div ref={containerRef} className="relative mt-3 sm:mt-4 flex-1">
        <ChartContainer config={config} className="mx-auto h-full min-h-[180px] sm:min-h-[260px] w-full">
          <ResponsiveContainer>
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={innerR} outerRadius={outerR} strokeWidth={6}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-semibold sm:text-2xl">{computedTotal}</tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs sm:text-sm">Total Hires</tspan>
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
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-3">
            <span className="inline-block size-3 rounded-[4px]" style={{ backgroundColor: d.color }} />
            <span className="text-[13px] sm:text-[14px]">{d.name}</span>
            <span className="ml-auto font-medium">{d.value.toFixed(2)} %</span>
          </div>
        ))}
      </div>
    </Card>
  );
}


