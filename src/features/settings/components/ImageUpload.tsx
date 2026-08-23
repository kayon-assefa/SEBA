// src/features/settings/components/ImageUpload.tsx

import * as React from "react";
import { Button } from "../../../components/ui/button";

export interface ImageUploadProps {
  label?: string;
  value?: string | null;
  onChange?: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  accept = "image/*",
  disabled = false,
  className,
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    onChange?.(file ?? null);
  };

  return (
    <div className={className}>
      {value ? (
        <img
          src={value}
          alt="Uploaded"
          className="mb-3 h-24 w-24 rounded-xl object-cover"
        />
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleChange}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {value ? "Change image" : "Upload image"}
      </Button>
    </div>
  );
}
