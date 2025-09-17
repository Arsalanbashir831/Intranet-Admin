"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Crumb = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  title: string;
  crumbs: Crumb[];
  action?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, crumbs, action, className }: PageHeaderProps) {
  return (
    <div className={cn("px-5 md:px-12 pb-4 border-b border-[#E4E4E4]", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight truncate">{title}</h1>
          <div className="mt-1">
            <Breadcrumb>
              <BreadcrumbList>
                {crumbs.map((c, idx) => {
                  const isLast = idx === crumbs.length - 1;
                  return (
                    <React.Fragment key={`${c.label}-${idx}`}>
                      <BreadcrumbItem>
                        {isLast || !c.href ? (
                          <BreadcrumbPage className="text-[#D64575]">{c.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={c.href} className="text-muted-foreground hover:text-foreground">
                            {c.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast ? <BreadcrumbSeparator >/</BreadcrumbSeparator> : null}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        {action ? <div className="shrink-0 self-end">{action}</div> : null}
      </div>
    </div>
  );
}


