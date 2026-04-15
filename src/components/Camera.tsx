"use client";

import { useRef, useCallback } from "react";

interface CameraProps {
  onCapture: (imageData: string) => void;
}

export default function Camera({ onCapture }: CameraProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onCapture(reader.result);
        }
      };
      reader.readAsDataURL(file);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [onCapture]
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-lg flex flex-col items-center gap-4">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="w-full py-4 px-6 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 active:scale-[0.98] text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-3 text-lg"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
            />
          </svg>
          Scan Menu
        </button>
        {/* Opens native camera (rear-facing) */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />

        <div className="flex items-center gap-3 text-zinc-500 text-sm w-full">
          <div className="flex-1 h-px bg-zinc-800" />
          <span>or</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        <button
          onClick={() => galleryInputRef.current?.click()}
          className="w-full py-3 px-6 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-zinc-300 font-medium rounded-2xl transition-all"
        >
          Upload from Gallery
        </button>
        {/* Opens photo library (no capture attribute) */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>
    </div>
  );
}
