"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useRef, useState, useCallback } from "react";

interface ImageUploadProps {
  images: File[];
  onChange: (files: File[]) => void;
}

export async function uploadImages(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  const urls: string[] = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    const data = await res.json();
    urls.push(data.url);
  }
  return urls;
}

export default function ImageUpload({ images, onChange }: ImageUploadProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const MAX_IMAGES = 5;

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const newFiles = Array.from(fileList).filter((f) =>
        f.type.startsWith("image/")
      );
      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) return;
      const filesToAdd = newFiles.slice(0, remaining);
      onChange([...images, ...filesToAdd]);
    },
    [images, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t("sell.images")}
      </label>

      {/* Image preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
          {images.map((file, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
              <Image
                src={URL.createObjectURL(file)}
                alt={`${locale === "mg" ? "Sary" : "Photo"} ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, 20vw"
              />
              {idx === 0 && (
                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary text-white text-[10px] font-medium rounded">
                  {locale === "mg" ? "Voalohany" : "Principal"}
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {images.length < MAX_IMAGES && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleInputChange}
            className="hidden"
          />
          <svg
            className="w-10 h-10 mx-auto text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-gray-500 mb-1">{t("sell.addImages")}</p>
          <p className="text-xs text-gray-400">
            {locale === "mg"
              ? `${images.length}/${MAX_IMAGES} sary`
              : `${images.length}/${MAX_IMAGES} photos`}
          </p>
        </div>
      )}
    </div>
  );
}
