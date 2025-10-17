"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FileIcon, ImagePlusIcon, XIcon } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import Image from "next/image";

export interface DropzoneProps {
  onFileSelect?: (files: FileList | null) => void;
  onClear?: () => void; // Callback when images are cleared
  onImageRemove?: (url: string, index: number) => void; // Callback when individual image is removed
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  children?: React.ReactNode;
  showPreview?: boolean;
  initialPreviewUrls?: string[]; // pre-loaded previews (e.g., existing images in edit mode)
}

export const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  ({
    onFileSelect,
    onClear,
    onImageRemove,
    accept = "image/*",
    maxSize,
    className,
    disabled = false,
    multiple = false,
    children,
    showPreview = true,
    initialPreviewUrls = [],
    ...props
  }, ref) => {
    const [isDragOver, setIsDragOver] = React.useState(false);
    const [previewUrls, setPreviewUrls] = React.useState<string[]>(initialPreviewUrls ?? []);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };


    const handleClick = () => {
      if (!disabled) {
        fileInputRef.current?.click();
      }
    };

    // Helper function to determine if a file is an image
    const isImageFile = (file: File) => {
      return file.type.startsWith('image/');
    };

    // Helper function to determine if a file is a document (PDF, Word, etc.)
    const isDocumentFile = (file: File) => {
      const docTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
      ];
      return docTypes.includes(file.type);
    };

    // Helper function to get file icon based on type
    const getFileIcon = (file: File | string) => {
      if (typeof file === 'string') {
        // For URLs, check extension
        if (file.endsWith('.pdf')) return 'pdf';
        if (file.endsWith('.doc') || file.endsWith('.docx')) return 'word';
        if (file.endsWith('.xls') || file.endsWith('.xlsx')) return 'excel';
        if (file.endsWith('.txt')) return 'text';
        return 'file';
      }
      
      // For File objects, check MIME type
      if (file.type === 'application/pdf') return 'pdf';
      if (file.type === 'application/msword' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'word';
      if (file.type === 'application/vnd.ms-excel' || 
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'excel';
      if (file.type === 'text/plain') return 'text';
      if (file.type === 'text/csv') return 'csv';
      return 'file';
    };

    // Helper function to get file extension
    const getFileExtension = (file: File | string) => {
      if (typeof file === 'string') {
        const parts = file.split('.');
        return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
      }
      const parts = file.name.split('.');
      return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
    };

    // Helper function to get file name
    const getFileName = (file: File | string) => {
      if (typeof file === 'string') {
        // Extract file name from URL
        try {
          // Try to decode the URL first in case it's encoded
          const decodedUrl = decodeURIComponent(file);
          const urlParts = decodedUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          
          // If we have a query parameter or hash, remove it
          const fileNameWithoutQuery = fileName.split('?')[0].split('#')[0];
          
          // If the file name is empty or just a GUID, we might want to use a more user-friendly name
          // But for now, we'll return what we have
          return fileNameWithoutQuery || 'Unknown File';
        } catch {
          // Fallback if decoding fails
          const urlParts = file.split('/');
          return urlParts.length > 0 ? urlParts[urlParts.length - 1].split('?')[0].split('#')[0] : 'Unknown File';
        }
      }
      return file.name;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect?.(files);

        // Generate preview URLs for images and track all files
        if (showPreview) {
          const newUrls: string[] = [];
          Array.from(files).forEach(file => {
            if (isImageFile(file)) {
              newUrls.push(URL.createObjectURL(file));
            } else if (isDocumentFile(file)) {
              // For documents, we'll store the file object in a data attribute
              // and use a placeholder URL with file info
              const fileInfo = {
                name: file.name,
                type: file.type,
                size: file.size
              };
              // Create a data URL with file info
              const fileDataUrl = `file://${encodeURIComponent(JSON.stringify(fileInfo))}`;
              newUrls.push(fileDataUrl);
            }
          });
          if (multiple) {
            setPreviewUrls(prev => [...prev, ...newUrls]);
          } else {
            // Replace previous preview with the latest selected file when multiple=false
            setPreviewUrls(newUrls.slice(0, 1));
          }
        }
      }

      // Clear the input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileSelect?.(files);

        // Generate preview URLs for images and track all files
        if (showPreview) {
          const newUrls: string[] = [];
          Array.from(files).forEach(file => {
            if (isImageFile(file)) {
              newUrls.push(URL.createObjectURL(file));
            } else if (isDocumentFile(file)) {
              // For documents, we'll store the file object in a data attribute
              const fileInfo = {
                name: file.name,
                type: file.type,
                size: file.size
              };
              const fileDataUrl = `file://${encodeURIComponent(JSON.stringify(fileInfo))}`;
              newUrls.push(fileDataUrl);
            }
          });
          if (multiple) {
            setPreviewUrls(prev => [...prev, ...newUrls]);
          } else {
            setPreviewUrls(newUrls.slice(0, 1));
          }
        }
      }
    };

    const clearAllImages = () => {
      previewUrls.forEach(url => { if (url.startsWith('blob:')) URL.revokeObjectURL(url) });
      setPreviewUrls([]);
      onClear?.(); // Notify parent component about clearing
    };

    // Sync external previews and clean up on change/unmount
    React.useEffect(() => {
      if (initialPreviewUrls && initialPreviewUrls.length) {
        setPreviewUrls(initialPreviewUrls);
      }
    }, [initialPreviewUrls?.join(",")]);

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-4",
          className
        )}
        {...props}
      >
        {/* Upload Icon Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled}
          className={cn(
            "grid size-14 place-items-center rounded-full border-2 text-primary transition-colors",
            "border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20",
            "hover:text-secondary hover:border-secondary",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="relative">
            <ImagePlusIcon className="size-6" />
          </div>
        </Button>

        {/* Dropzone Area or Preview */}
        {previewUrls.length > 0 && showPreview ? (
          <div className="flex-1 rounded-md border border-[#E2E8F0] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {multiple 
                  ? `${previewUrls.length} file${previewUrls.length !== 1 ? 's' : ''} selected`
                  : "1 file selected"
                }
              </span>
              <Button
                variant="link"
                type="button"
                onClick={clearAllImages}
                className="text-xs p-0 text-red-500 hover:text-red-600 font-medium hover:no-underline h-fit"
              >
                {multiple ? "Clear all" : "Clear"}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => {
                // Check if it's an image URL (blob or http/https)
                const isImageUrl = url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://');
                
                // Check if it's a file data URL (from newly selected files)
                const isFileDataUrl = url.startsWith('file://');
                
                // Check if it's a special attachment URL (containing original file name)
                const isAttachmentUrl = url.startsWith('attachment://');
                
                // Check if it's an existing attachment URL (http/https but not blob)
                const isExistingAttachment = (url.startsWith('http://') || url.startsWith('https://')) && !url.startsWith('blob:') && !url.startsWith('attachment://');
                
                if (isAttachmentUrl) {
                  // Render preview for existing attachments with original file names
                  try {
                    const decodedData = decodeURIComponent(url.replace('attachment://', ''));
                    const fileInfo = JSON.parse(decodedData);
                    const fileUrl = fileInfo.url;
                    const fileName = fileInfo.name || 'Unknown File';
                    const fileExtension = fileName.split('.').pop()?.toUpperCase() || '';
                    
                    // Determine if it's an image based on the actual file URL
                    const isImage = /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(fileUrl);
                    
                    if (isImage) {
                      // Render image preview for existing image attachments
                      return (
                        <div key={index} className="relative group">
                          <div
                            className="cursor-pointer"
                            onClick={() => {
                              // Open image in new tab
                              window.open(fileUrl, '_blank');
                            }}
                          >
                            <Image
                              src={fileUrl}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md border"
                              width={100}
                              height={100}
                            />
                          </div>
                          <Button
                            type="button"
                            size='icon'
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent opening the image when clicking the remove button
                              const urlToRemove = previewUrls[index];
                              const newUrls = previewUrls.filter((_, i) => i !== index);
                              setPreviewUrls(newUrls);
                              
                              // Notify parent about removal
                              onImageRemove?.(urlToRemove, index);
                              
                              // If all images are removed, notify parent
                              if (newUrls.length === 0) {
                                onClear?.();
                              }
                            }}
                            className="absolute -top-2 -right-2 bg-primary text-white rounded-full size-6 flex items-center justify-center text-xs hover:bg-primary/90 transition-colors"
                          >
                            <XIcon size={12} />
                          </Button>
                        </div>
                      );
                    } else {
                      // Render document preview for existing document attachments
                      return (
                        <div key={index} className="relative group">
                          <div 
                            className="w-full h-24 flex flex-col items-center justify-center rounded-md border bg-gray-50 p-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              // Open file in new tab or download it
                              window.open(fileUrl, '_blank');
                            }}
                          >
                            <FileIcon className="size-8 text-gray-400 mb-1" />
                            <div className="text-xs text-center truncate w-full px-1">
                              <div className="font-medium truncate">{fileName}</div>
                              <div className="text-gray-500">{fileExtension}</div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size='icon'
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent opening the file when clicking the remove button
                              const urlToRemove = previewUrls[index];
                              const newUrls = previewUrls.filter((_, i) => i !== index);
                              setPreviewUrls(newUrls);
                              
                              // Notify parent about removal
                              onImageRemove?.(urlToRemove, index);
                              
                              // If all files are removed, notify parent
                              if (newUrls.length === 0) {
                                onClear?.();
                              }
                            }}
                            className="absolute -top-2 -right-2 bg-primary text-white rounded-full size-6 flex items-center justify-center text-xs hover:bg-primary/90 transition-colors"
                          >
                            <XIcon size={12} />
                          </Button>
                        </div>
                      );
                    }
                  } catch {
                    // Fallback for any parsing errors
                    return (
                      <div key={index} className="relative group">
                        <div 
                          className="w-full h-24 flex flex-col items-center justify-center rounded-md border bg-gray-50 p-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            console.log("Cannot open attachment due to parsing error");
                          }}
                        >
                          <FileIcon className="size-8 text-gray-400 mb-1" />
                          <div className="text-xs text-center truncate w-full px-1">
                            <div className="font-medium truncate">File</div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size='icon'
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening the file when clicking the remove button
                            const urlToRemove = previewUrls[index];
                            const newUrls = previewUrls.filter((_, i) => i !== index);
                            setPreviewUrls(newUrls);
                            
                            // Notify parent about removal
                            onImageRemove?.(urlToRemove, index);
                            
                            // If all files are removed, notify parent
                            if (newUrls.length === 0) {
                              onClear?.();
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-primary text-white rounded-full size-6 flex items-center justify-center text-xs hover:bg-primary/90 transition-colors"
                        >
                          <XIcon size={12} />
                        </Button>
                      </div>
                    );
                  }
                } else if (isImageUrl && !url.startsWith('blob:')) {
                  // Render preview for existing attachments (URLs) - fallback for direct URLs
                  // Determine if it's an image or document based on extension
                  const isExistingImage = /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url);
                  const fileName = getFileName(url); // Use the helper function to get the correct file name
                  const fileExtension = getFileExtension(url);
                  
                  if (isExistingImage) {
                    // Render image preview for existing image attachments
                    return (
                      <div key={index} className="relative group">
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            // Open image in new tab
                            window.open(url, '_blank');
                          }}
                        >
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border"
                            width={100}
                            height={100}
                          />
                        </div>
                        <Button
                          type="button"
                          size='icon'
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening the image when clicking the remove button
                            const urlToRemove = previewUrls[index];
                            const newUrls = previewUrls.filter((_, i) => i !== index);
                            setPreviewUrls(newUrls);
                            
                            // Notify parent about removal
                            onImageRemove?.(urlToRemove, index);
                            
                            // If all images are removed, notify parent
                            if (newUrls.length === 0) {
                              onClear?.();
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-primary text-white rounded-full size-6 flex items-center justify-center text-xs hover:bg-primary/90 transition-colors"
                        >
                          <XIcon size={12} />
                        </Button>
                      </div>
                    );
                  } else {
                    // Render document preview for existing document attachments
                    return (
                      <div key={index} className="relative group">
                        <div 
                          className="w-full h-24 flex flex-col items-center justify-center rounded-md border bg-gray-50 p-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            // Open file in new tab or download it
                            window.open(url, '_blank');
                          }}
                        >
                          <FileIcon className="size-8 text-gray-400 mb-1" />
                          <div className="text-xs text-center truncate w-full px-1">
                            <div className="font-medium truncate">{fileName}</div>
                            <div className="text-gray-500">{fileExtension}</div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size='icon'
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening the file when clicking the remove button
                            const urlToRemove = previewUrls[index];
                            const newUrls = previewUrls.filter((_, i) => i !== index);
                            setPreviewUrls(newUrls);
                            
                            // Notify parent about removal
                            onImageRemove?.(urlToRemove, index);
                            
                            // If all files are removed, notify parent
                            if (newUrls.length === 0) {
                              onClear?.();
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-primary text-white rounded-full size-6 flex items-center justify-center text-xs hover:bg-primary/90 transition-colors"
                        >
                          <XIcon size={12} />
                        </Button>
                      </div>
                    );
                  }
                } else if (url.startsWith('blob:')) {
                  // Render image preview for newly selected images
                  return (
                    <div key={index} className="relative group">
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          // Open image in new tab
                          window.open(url, '_blank');
                        }}
                      >
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border"
                          width={100}
                          height={100}
                        />
                      </div>
                      <Button
                        type="button"
                        size='icon'
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent opening the image when clicking the remove button
                          const urlToRemove = previewUrls[index];
                          const newUrls = previewUrls.filter((_, i) => i !== index);
                          setPreviewUrls(newUrls);
                          
                          // Only revoke blob URLs, not absolute URLs
                          if (urlToRemove.startsWith('blob:')) {
                            URL.revokeObjectURL(urlToRemove);
                          }
                          
                          // Notify parent about removal
                          onImageRemove?.(urlToRemove, index);
                          
                          // If all images are removed, notify parent
                          if (newUrls.length === 0) {
                            onClear?.();
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-primary text-white rounded-full size-6 flex items-center justify-center text-xs hover:bg-primary/90 transition-colors"
                      >
                        <XIcon size={12} />
                      </Button>
                    </div>
                  );
                } else if (isFileDataUrl) {
                  // Render document preview for newly selected files
                  try {
                    const decodedData = decodeURIComponent(url.replace('file://', ''));
                    const fileInfo = JSON.parse(decodedData);
                    const fileName = fileInfo.name || 'Unknown File';
                    const fileExtension = fileName.split('.').pop()?.toUpperCase() || '';
                    
                    return (
                      <div key={index} className="relative group">
                        <div 
                          className="w-full h-24 flex flex-col items-center justify-center rounded-md border bg-gray-50 p-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            console.log("Cannot open file due to parsing error");
                          }}
                        >
                          <FileIcon className="size-8 text-gray-400 mb-1" />
                          <div className="text-xs text-center truncate w-full px-1">
                            <div className="font-medium truncate">{fileName}</div>
                            <div className="text-gray-500">{fileExtension}</div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size='icon'
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening the file when clicking the remove button
                            const urlToRemove = previewUrls[index];
                            const newUrls = previewUrls.filter((_, i) => i !== index);
                            setPreviewUrls(newUrls);
                            
                            // Notify parent about removal
                            onImageRemove?.(urlToRemove, index);
                            
                            // If all files are removed, notify parent
                            if (newUrls.length === 0) {
                              onClear?.();
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-primary text-white rounded-full size-6 flex items-center justify-center text-xs hover:bg-primary/90 transition-colors"
                        >
                          <XIcon size={12} />
                        </Button>
                      </div>
                    );
                  } catch {
                    // Fallback for any parsing errors
                    return (
                      <div key={index} className="relative group">
                        <div 
                          className="w-full h-24 flex flex-col items-center justify-center rounded-md border bg-gray-50 p-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            console.log("Cannot open file due to parsing error");
                          }}
                        >
                          <FileIcon className="size-8 text-gray-400 mb-1" />
                          <div className="text-xs text-center truncate w-full px-1">
                            <div className="font-medium truncate">File</div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size='icon'
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening the file when clicking the remove button
                            const urlToRemove = previewUrls[index];
                            const newUrls = previewUrls.filter((_, i) => i !== index);
                            setPreviewUrls(newUrls);
                            
                            // Notify parent about removal
                            onImageRemove?.(urlToRemove, index);
                            
                            // If all files are removed, notify parent
                            if (newUrls.length === 0) {
                              onClear?.();
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-primary text-white rounded-full size-6 flex items-center justify-center text-xs hover:bg-primary/90 transition-colors"
                        >
                          <XIcon size={12} />
                        </Button>
                      </div>
                    );
                  }
                } else if (isExistingAttachment) {
                  // Render preview for existing attachments (URLs) - fallback for direct URLs
                  // Determine if it's an image or document based on extension
                  const isExistingImage = /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url);
                  const fileName = getFileName(url); // Use the helper function to get the correct file name
                  const fileExtension = getFileExtension(url);
                  
                  if (isExistingImage) {
                    // Render image preview for existing image attachments
                    return (
                      <div key={index} className="relative group">
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            // Open image in new tab
                            window.open(url, '_blank');
                          }}
                        >
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border"
                            width={100}
                            height={100}
                          />
                        </div>
                        <Button
                          type="button"
                          size='icon'
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening the image when clicking the remove button
                            const urlToRemove = previewUrls[index];
                            const newUrls = previewUrls.filter((_, i) => i !== index);
                            setPreviewUrls(newUrls);
                            
                            // Notify parent about removal
                            onImageRemove?.(urlToRemove, index);
                            
                            // If all images are removed, notify parent
                            if (newUrls.length === 0) {
                              onClear?.();
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-primary text-white rounded-full size-6 flex items-center justify-center text-xs hover:bg-primary/90 transition-colors"
                        >
                          <XIcon size={12} />
                        </Button>
                      </div>
                    );
                  } else {
                    // Render document preview for existing document attachments
                    return (
                      <div key={index} className="relative group">
                        <div 
                          className="w-full h-24 flex flex-col items-center justify-center rounded-md border bg-gray-50 p-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            // Open file in new tab or download it
                            window.open(url, '_blank');
                          }}
                        >
                          <FileIcon className="size-8 text-gray-400 mb-1" />
                          <div className="text-xs text-center truncate w-full px-1">
                            <div className="font-medium truncate">{fileName}</div>
                            <div className="text-gray-500">{fileExtension}</div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size='icon'
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening the file when clicking the remove button
                            const urlToRemove = previewUrls[index];
                            const newUrls = previewUrls.filter((_, i) => i !== index);
                            setPreviewUrls(newUrls);
                            
                            // Notify parent about removal
                            onImageRemove?.(urlToRemove, index);
                            
                            // If all files are removed, notify parent
                            if (newUrls.length === 0) {
                              onClear?.();
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-primary text-white rounded-full size-6 flex items-center justify-center text-xs hover:bg-primary/90 transition-colors"
                        >
                          <XIcon size={12} />
                        </Button>
                      </div>
                    );
                  }
                }
                // Fallback for unknown URL types
                return (
                  <div key={index} className="relative group">
                    <div 
                      className="w-full h-24 flex flex-col items-center justify-center rounded-md border bg-gray-50 p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        // Open file in new tab or download it
                        window.open(url, '_blank');
                      }}
                    >
                      <FileIcon className="size-8 text-gray-400 mb-1" />
                      <div className="text-xs text-center truncate w-full px-1">
                        <div className="font-medium truncate">File</div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size='icon'
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening the file when clicking the remove button
                        const urlToRemove = previewUrls[index];
                        const newUrls = previewUrls.filter((_, i) => i !== index);
                        setPreviewUrls(newUrls);
                        
                        // Notify parent about removal
                        onImageRemove?.(urlToRemove, index);
                        
                        // If all files are removed, notify parent
                        if (newUrls.length === 0) {
                          onClear?.();
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-primary text-white rounded-full size-6 flex items-center justify-center text-xs hover:bg-primary/90 transition-colors"
                    >
                      <XIcon size={12} />
                    </Button>
                  </div>
                );
              })}
            </div>
            <Button
              variant="link"
              type="button"
              onClick={handleClick}
              className="mt-3 p-0 text-sm text-primary hover:text-primary/80 font-medium hover:no-underline h-fit"
            >
              {multiple ? "Add more files" : "Replace file"}
            </Button>
          </div>
        ) : (
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex-1 rounded-md border border-[#E2E8F0] p-6 text-sm text-muted-foreground cursor-pointer transition-colors",
              "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
              isDragOver && "border-primary bg-primary/5",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="text-center">
              <span className="text-primary font-medium">Click to upload</span>
              <span className="text-muted-foreground"> or drag and drop</span>
              <div className="text-xs text-muted-foreground mt-1">
                {accept === "image/*" ? "PNG, JPG, GIF, WebP and more" : "SVG, PNG, JPG, GIF, PDF, DOC, TXT and more"}
              </div>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Custom Children */}
        {children}
      </div>
    );
  }
);

Dropzone.displayName = "Dropzone";
