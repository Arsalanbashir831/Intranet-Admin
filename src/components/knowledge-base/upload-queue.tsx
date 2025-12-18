"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, X, Loader2 } from "lucide-react";
import { UploadQueueProps } from "@/types/knowledge-base";

export function UploadQueue({
  items,
  onClear,
  onRemove,
  collapsed,
  setCollapsed,
}: UploadQueueProps) {
  if (items.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 w-[320px]">
      <Card className="border-[#E4E4E4] p-3 shadow-sm gap-0">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">Upload queue</div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>
          </div>
        </div>
        {!collapsed && (
          <div className="max-h-[240px] space-y-2 overflow-auto pr-1">
            <div className="flex items-center justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={onClear}>
                Clear All
              </Button>
            </div>
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded border border-[#F0F0F0] p-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="truncate pr-2">{item.name}</span>
                  <div className="flex items-center gap-2">
                    {item.status === "uploading" ? (
                      <div className="flex items-center gap-1">
                        <Loader2 className="size-3 animate-spin" />
                        <span className="text-muted-foreground">
                          Uploading...
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        {item.status === "done"
                          ? "Done"
                          : item.status === "error"
                          ? "Error"
                          : "Pending"}
                      </span>
                    )}
                    {item.status !== "uploading" && (
                      <button
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => onRemove?.(item.id)}>
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
                {item.status === "uploading" ? (
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-[#F1F5F9]">
                    <div
                      className="h-full bg-[#22C55E] animate-pulse"
                      style={{ width: "100%" }}
                    />
                  </div>
                ) : item.status !== "pending" ? null : (
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-[#F1F5F9]">
                    <div
                      className="h-full bg-[#94A3B8]"
                      style={{ width: "0%" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
