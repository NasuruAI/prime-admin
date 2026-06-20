"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { adminCall, adminList } from "@/lib/admin-client";

type AdminReview = {
  id: string;
  product: string;
  product_title: string;
  author_name: string;
  rating: number;
  title: string;
  body: string;
  is_verified_purchase: boolean;
  status: "published" | "hidden";
  created_at: string;
};

const selectCls =
  "h-10 border border-ink/15 bg-white px-2 text-sm text-ink focus:border-primary focus:outline-none";

export function ReviewsAdmin() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [status, setStatus] = useState<"" | "published" | "hidden">("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const qs = status ? `?status=${status}` : "";
    setReviews(await adminList<AdminReview>(`/catalog/reviews/${qs}`));
  }
  useEffect(() => {
    load().catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load reviews."),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function setReviewStatus(r: AdminReview, next: AdminReview["status"]) {
    setBusy(r.id);
    setError(null);
    try {
      await adminCall(`/catalog/reviews/${r.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(r: AdminReview) {
    if (!window.confirm(`Delete this review by ${r.author_name}?`)) return;
    setBusy(r.id);
    setError(null);
    try {
      await adminCall(`/catalog/reviews/${r.id}/`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {error && <Banner tone="error">{error}</Banner>}

      <div className="flex items-center gap-3">
        <label className="text-sm text-ink/60">Filter</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className={selectCls}
        >
          <option value="">All</option>
          <option value="published">Published</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-ink/55">No reviews.</p>
      ) : (
        <div className="admin-card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="p-3 font-medium">Product</th>
                <th className="p-3 font-medium">Rating</th>
                <th className="p-3 font-medium">Review</th>
                <th className="p-3 font-medium">Author</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {reviews.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="p-3 font-medium text-ink">
                    {r.product_title}
                  </td>
                  <td className="p-3 text-ink/70">{"★".repeat(r.rating)}</td>
                  <td className="max-w-sm p-3 text-ink/70">
                    {r.title && (
                      <span className="block font-medium text-ink">
                        {r.title}
                      </span>
                    )}
                    {r.body}
                  </td>
                  <td className="p-3 text-ink/70">
                    {r.author_name}
                    {r.is_verified_purchase && (
                      <Badge className="ml-1" tone="success">
                        Verified
                      </Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <Badge tone={r.status === "published" ? "success" : "neutral"}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      {r.status === "published" ? (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={busy === r.id}
                          onClick={() => setReviewStatus(r, "hidden")}
                        >
                          Hide
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={busy === r.id}
                          onClick={() => setReviewStatus(r, "published")}
                        >
                          Publish
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={busy === r.id}
                        onClick={() => remove(r)}
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
