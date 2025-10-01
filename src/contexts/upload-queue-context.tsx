"use client";

import * as React from "react";
import { UploadStatus } from "../components/knowledge-base/upload-queue";

export type UploadItem = {
  id: string;
  name: string;
  size: number;
  progress: number; // 0-100
  status: UploadStatus;
  targetPath?: string; // where to add when done
  isApiUpload?: boolean; // Flag to distinguish API uploads from queue simulation
};

type QueueContextType = {
  items: UploadItem[];
  collapsed: boolean;
  enqueueFiles: (files: File[], targetPath?: string) => void;
  uploadFiles: (files: File[], folderId: number, onSuccess?: () => void) => void; // New direct upload method
  clear: () => void;
  remove: (id: string) => void;
  setCollapsed: (c: boolean) => void;
};

const QueueContext = React.createContext<QueueContextType | null>(null);

export function useUploadQueue() {
  const ctx = React.useContext(QueueContext);
  if (!ctx) throw new Error("useUploadQueue must be used within UploadQueueProvider");
  return ctx;
}

export function UploadQueueProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<UploadItem[]>([]);
  const [collapsed, setCollapsed] = React.useState(false);
  const processingIdRef = React.useRef<string | null>(null);

  const enqueueFiles = React.useCallback((files: File[], targetPath?: string) => {
    const next = files.map((f) => ({ id: crypto.randomUUID(), name: f.name, size: f.size, progress: 0, status: "pending" as const, targetPath }));
    setItems((prev) => [...prev, ...next]);
  }, []);

  // New method for direct API upload
  const uploadFiles = React.useCallback(async (files: File[], folderId: number, onSuccess?: () => void) => {
    const uploadItems = files.map((f) => ({ 
      id: crypto.randomUUID(), 
      name: f.name, 
      size: f.size, 
      progress: 0, 
      status: "uploading" as const, 
      targetPath: undefined,
      isApiUpload: true // Mark as API upload to skip queue processing
    }));
    
    // Add all files to queue as "uploading" simultaneously
    setItems((prev) => [...prev, ...uploadItems]);
    setCollapsed(false); // Show the queue
    
    try {
      // Import the bulk upload function dynamically to avoid circular dependencies
      const { bulkUploadFiles } = await import("@/services/knowledge-files");
      
      // Upload all files simultaneously via bulk API
      await bulkUploadFiles(files, folderId);
      
      // Mark all items as done simultaneously
      setItems((prev) => prev.map((item) => 
        uploadItems.some(ui => ui.id === item.id) 
          ? { ...item, status: "done" as const, progress: 100 }
          : item
      ));
      
      // Auto-clear after success
      setTimeout(() => {
        setItems((prev) => prev.filter((item) => !uploadItems.some(ui => ui.id === item.id)));
        if (items.length === uploadItems.length) {
          setCollapsed(true);
        }
      }, 2000);
      
      onSuccess?.();
    } catch {
      // Mark all items as error simultaneously
      setItems((prev) => prev.map((item) => 
        uploadItems.some(ui => ui.id === item.id) 
          ? { ...item, status: "error" as const }
          : item
      ));
    }
  }, [items.length]);

  const clear = React.useCallback(() => setItems([]), []);
  const remove = React.useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);

  // Sequential processing simulation; replace with real API (only for non-API uploads)
  React.useEffect(() => {
    const current = items.find((q) => !q.isApiUpload && (q.status === "uploading")) || items.find((q) => !q.isApiUpload && (q.status === "pending"));
    if (!current) {
      processingIdRef.current = null;
      return;
    }

    // If we are already processing this item, do nothing
    if (processingIdRef.current === current.id && current.status === "uploading") {
      return;
    }

    processingIdRef.current = current.id;

    if (current.status === "pending") {
      setItems((prev) => prev.map((i) => (i.id === current.id ? { ...i, status: "uploading", progress: 0 } : i)));
    }

    let progress = current.progress ?? 0;
    const interval = setInterval(() => {
      progress = Math.min(100, progress + 7); // steady forward progress
      if (progress >= 100) {
        clearInterval(interval);
        setItems((prev) => prev.map((i) => (i.id === current.id ? { ...i, progress: 100, status: "done" } : i)));
        window.dispatchEvent(new CustomEvent("kb:queue-finished-item", { detail: { id: current.id, name: current.name, targetPath: current.targetPath } }));
        processingIdRef.current = null;
      } else {
        setItems((prev) => prev.map((i) => (i.id === current.id ? { ...i, progress } : i)));
      }
    }, 250);

    return () => clearInterval(interval);
  }, [items]);

  // Auto-collapse and clear when finished
  React.useEffect(() => {
    if (items.length > 0 && items.every((i) => i.status === "done")) {
      const t = setTimeout(() => setCollapsed(true), 1200);
      const t2 = setTimeout(() => setItems([]), 4000);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
  }, [items]);

  const value = React.useMemo(() => ({ items, collapsed, enqueueFiles, uploadFiles, clear, remove, setCollapsed }), [items, collapsed, enqueueFiles, uploadFiles, clear, remove]);
  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}


