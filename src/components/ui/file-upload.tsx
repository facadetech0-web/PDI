"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

export interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
  maxSize?: number; // bytes
  className?: string;
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 1,
  accept = { "image/*": [".jpeg", ".png", ".webp"] },
  maxSize = 5242880, // 5MB
  className,
}: FileUploadProps) {
  const [previews, setPreviews] = React.useState<string[]>([]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
      
      const newPreviews = acceptedFiles.map((file) => {
        if (file.type.startsWith("image/")) {
          return URL.createObjectURL(file);
        }
        return "";
      });
      setPreviews(newPreviews);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxFiles,
    accept,
    maxSize,
  });

  const clearPreviews = () => {
    previews.forEach((p) => {
      if (p) URL.revokeObjectURL(p);
    });
    setPreviews([]);
  };

  React.useEffect(() => {
    return () => clearPreviews();
  }, [previews]);

  return (
    <div className={cn("w-full flex flex-col gap-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-card/10 hover:bg-card/25 hover:border-primary/50 text-muted-foreground",
          isDragActive && "border-primary bg-primary/5 text-primary",
          className
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-10 w-10 mb-4 stroke-1.5" />
        <p className="text-sm font-semibold text-center text-foreground/80">
          {isDragActive
            ? "Drop the files here..."
            : "Drag & drop files here, or click to browse"}
        </p>
        <p className="text-xs text-center mt-1 text-muted-foreground/60">
          Supports image formats (max size: 5MB)
        </p>
      </div>

      {fileRejections.length > 0 && (
        <p className="text-xs text-destructive font-medium">
          Some files were rejected. Please check size limits (max 5MB) or format constraints.
        </p>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
          {previews.map((preview, index) => {
            if (!preview) return null;
            return (
              <div
                key={preview}
                className="relative aspect-square rounded-lg border border-white/5 overflow-hidden group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
