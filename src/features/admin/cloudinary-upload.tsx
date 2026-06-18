"use client";

import { useState } from "react";

import { uploadToCloudinary } from "@/lib/cloudinary";

/**
 * Uploads an image (or video) straight to Cloudinary (signed; the API secret
 * never reaches the browser) and returns the delivery URL + public_id via
 * `onChange`. Used for store imagery (hero) and product images.
 */
const isVideo = (url: string) =>
  /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.includes("/video/upload/");

export function CloudinaryUpload({
  value,
  onChange,
  label,
  accept = "image/*",
  aspect = "square",
}: {
  value: string;
  /** Receives the delivery URL and the Cloudinary public_id (for product images). */
  onChange: (url: string, publicId?: string) => void;
  label?: string;
  /** File types to accept. Pass e.g. "image/*,video/mp4" to allow video. */
  accept?: string;
  /** Preview aspect ratio. */
  aspect?: "square" | "wide";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { url, publicId } = await uploadToCloudinary(file);
      onChange(url, publicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {label && (
        <label className="text-xs font-medium text-ink/60">{label}</label>
      )}
      <div
        className={`relative w-full overflow-hidden border border-ink/10 bg-surface ${
          aspect === "wide" ? "aspect-video" : "aspect-square"
        }`}
      >
        {value ? (
          isVideo(value) ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={value}
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          )
        ) : (
          <span className="flex h-full items-center justify-center text-[11px] text-ink/30">
            No image
          </span>
        )}
      </div>
      <input
        type="file"
        accept={accept}
        onChange={onFile}
        disabled={busy}
        className="block w-full min-w-0 text-xs text-ink/70 file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-primary disabled:opacity-50"
      />
      <div className="flex items-center justify-between gap-2">
        {busy ? (
          <span className="text-xs text-ink/50">Uploading…</span>
        ) : (
          <span />
        )}
        {value && !busy && (
          <button
            type="button"
            onClick={() => onChange("", "")}
            className="text-xs font-medium text-ink/40 hover:text-accent"
          >
            Remove
          </button>
        )}
      </div>
      {error && <p className="break-words text-xs text-accent">{error}</p>}
    </div>
  );
}
