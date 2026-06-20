"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { adminCall, adminList } from "@/lib/admin-client";
import type { BlogPost } from "@/types/blog";

export function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setPosts(await adminList<BlogPost>("/blog/posts/"));
  }
  useEffect(() => {
    load().catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load"),
    );
  }, []);

  async function remove(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    try {
      await adminCall(`/blog/posts/${id}/`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    }
  }

  if (error) return <Banner tone="error">{error}</Banner>;
  if (posts === null) return <p className="text-sm text-ink/50">Loading…</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Link href="/blog/new">
          <Button type="button">+ New post</Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="admin-card p-10 text-center text-sm text-ink/55">
          No posts yet. Write your first one — or generate it with AI.
        </div>
      ) : (
        <div className="admin-card overflow-x-auto p-0">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="pl-5">Title</th>
                <th>Status</th>
                <th>Date</th>
                <th>Read</th>
                <th className="pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td className="pl-5">
                    <Link
                      href={`/blog/${p.id}`}
                      className="font-medium text-ink hover:text-primary"
                    >
                      {p.title}
                    </Link>
                    <div className="text-xs text-ink/40">/blog/{p.slug}</div>
                  </td>
                  <td>
                    <Badge tone={p.status === "published" ? "success" : "neutral"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="text-ink/60">
                    {p.published_at
                      ? new Date(p.published_at).toLocaleDateString()
                      : new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-ink/60">{p.reading_minutes}m</td>
                  <td className="pr-5">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/blog/${p.id}`}
                        className="text-sm font-medium text-primary hover:text-accent"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(p.id, p.title)}
                        className="text-sm font-medium text-ink/40 hover:text-accent"
                      >
                        Delete
                      </button>
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
