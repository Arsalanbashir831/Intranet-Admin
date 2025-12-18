
import { RefObject } from "react";

/**
 * Handles the search keyboard shortcut (Ctrl+F / Cmd+F)
 */
export function handleSearchShortcut(e: KeyboardEvent, inputRef: RefObject<HTMLInputElement>) {
  const isMac = navigator.platform.toUpperCase().includes("MAC");
  const mod = isMac ? e.metaKey : e.ctrlKey;
  if (mod && e.key.toLowerCase() === "f") {
    e.preventDefault();
    inputRef.current?.focus();
  }
}
