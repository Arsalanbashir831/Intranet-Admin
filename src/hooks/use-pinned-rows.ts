"use client";

import * as React from "react";

export function usePinnedRows<TItem extends { id: string }>(
  rows: TItem[],
  compare?: (a: TItem, b: TItem) => number
) {
  const [pinnedIds, setPinnedIds] = React.useState<Set<string>>(new Set());

  const togglePin = React.useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isPinned = React.useCallback((id: string) => pinnedIds.has(id), [pinnedIds]);

  const ordered = React.useMemo(() => {
    const copy = [...rows];
    // First apply optional sorting comparator (ascending)
    if (compare) copy.sort(compare);
    // Then move pinned items to the top while preserving relative order within groups
    copy.sort((a, b) => {
      const ap = pinnedIds.has(a.id) ? 1 : 0;
      const bp = pinnedIds.has(b.id) ? 1 : 0;
      return bp - ap; // pinned first
    });
    return copy;
  }, [rows, compare, pinnedIds]);

  return { pinnedIds, togglePin, isPinned, ordered } as const;
}


