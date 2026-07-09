"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { adminCall, adminList } from "@/lib/admin-client";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { cloudinaryUrl } from "@/lib/env";

type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
  image_public_id: string;
};

/** Square image picker — uploads to Cloudinary and returns the public_id. */
function CategoryImage({
  value,
  onChange,
  size = "h-16 w-16",
}: {
  value: string;
  onChange: (publicId: string) => void;
  size?: string;
}) {
  const [busy, setBusy] = useState(false);
  const preview = value ? cloudinaryUrl(value) : "";

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const { publicId } = await uploadToCloudinary(file);
      onChange(publicId);
    } finally {
      setBusy(false);
    }
  }

  return (
    <label
      className={`relative flex ${size} shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-ink/20 bg-surface transition hover:border-primary`}
      title="Upload category image"
    >
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="text-2xl text-ink/30">+</span>
      )}
      {busy && (
        <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-[10px] text-ink/60">
          …
        </span>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={busy}
        onChange={onFile}
      />
    </label>
  );
}

export function CategoriesAdmin() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  async function load() {
    setCategories(await adminList<AdminCategory>("/catalog/categories/"));
  }
  useEffect(() => {
    load().catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load categories."),
    );
  }, []);

  async function create() {
    if (!name.trim()) return toast.error("Give the category a name.");
    if (!image)
      return toast.error("Add an image that represents the category.");
    setBusy(true);
    try {
      await adminCall("/catalog/categories/", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), image_public_id: image }),
      });
      toast.success(`“${name.trim()}” category created`);
      setName("");
      setImage("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn’t create the category.");
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: number, body: Record<string, unknown>) {
    try {
      await adminCall(`/catalog/categories/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed.");
    }
  }

  async function remove(c: AdminCategory) {
    if (!window.confirm(`Delete the "${c.name}" category?`)) return;
    try {
      await adminCall(`/catalog/categories/${c.id}/`, { method: "DELETE" });
      toast.success(`“${c.name}” deleted`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {error && <Banner tone="error">{error}</Banner>}

      {/* Create */}
      <div className="admin-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">New category</h2>
        <div className="flex flex-wrap items-end gap-4">
          <CategoryImage value={image} onChange={setImage} />
          <div className="flex-1">
            <label className="field-label">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. T-Shirts"
              className="max-w-xs"
            />
          </div>
          <Button type="button" onClick={create} disabled={busy}>
            {busy ? "Creating…" : "Create category"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Every category needs a representative image (shown on the storefront).
        </p>
      </div>

      {/* List */}
      {categories.length === 0 ? (
        <p className="text-sm text-ink/55">No categories yet.</p>
      ) : (
        <div className="admin-card overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="p-3 font-medium">Image</th>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="p-3">
                    <CategoryImage
                      value={c.image_public_id}
                      onChange={(pid) => patch(c.id, { image_public_id: pid })}
                      size="h-12 w-12"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      defaultValue={c.name}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && v !== c.name) patch(c.id, { name: v });
                      }}
                      className="w-full max-w-[12rem] rounded-md border border-transparent bg-transparent px-2 py-1 font-medium text-ink hover:border-ink/15 focus:border-primary focus:outline-none"
                    />
                    <span className="ml-2 text-xs text-ink/40">/{c.slug}</span>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => patch(c.id, { is_active: !c.is_active })}
                      title="Toggle visibility"
                    >
                      <Badge tone={c.is_active ? "success" : "neutral"}>
                        {c.is_active ? "Active" : "Hidden"}
                      </Badge>
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => remove(c)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
