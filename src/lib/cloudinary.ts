"use client";

type Signature = {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
};

/**
 * Upload a file straight to Cloudinary using a backend-signed request (the API
 * secret never reaches the browser). Returns the delivery URL and public_id.
 * "auto" lets Cloudinary detect image vs video; resource_type isn't signed.
 */
export async function uploadToCloudinary(
  file: File,
): Promise<{ url: string; publicId: string }> {
  const sigRes = await fetch(
    "/api/proxy/admin/catalog/products/upload-signature",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
  );
  if (!sigRes.ok) throw new Error("Could not get an upload signature.");
  const sig = (await sigRes.json()) as Signature;

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.api_key);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);

  const up = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloud_name}/auto/upload`,
    { method: "POST", body: form },
  );
  if (!up.ok)
    throw new Error(
      "Cloudinary upload failed (check credentials / CATALOG_IMAGE_BACKEND).",
    );
  const result = (await up.json()) as { secure_url: string; public_id: string };
  return { url: result.secure_url, publicId: result.public_id };
}
