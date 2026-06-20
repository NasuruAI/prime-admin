"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCall } from "@/lib/admin-client";
import { cloudinaryUrl } from "@/lib/env";
import type { AiResult, BlogCategory, BlogPost } from "@/types/blog";

import { CloudinaryUpload } from "./cloudinary-upload";

const labelCls = "mb-1 block text-xs font-medium text-ink/60";
const selectCls =
  "h-10 w-full border border-ink/15 bg-white px-3 text-sm text-ink focus:border-primary focus:outline-none";

export function BlogEditor({
  post,
  categories: initialCategories,
}: {
  post?: BlogPost;
  categories: BlogCategory[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [coverId, setCoverId] = useState(post?.cover_image_public_id ?? "");
  const [coverUrl, setCoverUrl] = useState(
    post?.cover?.card ?? cloudinaryUrl(post?.cover_image_public_id ?? ""),
  );
  const [categoryId, setCategoryId] = useState(post?.category ?? "");
  const [tagsText, setTagsText] = useState((post?.tags ?? []).join(", "));
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    post?.meta_description ?? "",
  );
  const [status, setStatus] = useState<"draft" | "published">(
    post?.status ?? "draft",
  );

  const [tab, setTab] = useState<"write" | "preview">("write");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // AI panel
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  const tags = () =>
    tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  async function save(nextStatus?: "draft" | "published") {
    if (!title.trim()) {
      setError("A title is required.");
      return;
    }
    const finalStatus = nextStatus ?? status;
    setBusy(true);
    setError(null);
    setNotice(null);
    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim(),
      body,
      cover_image_public_id: coverId,
      category: categoryId || null,
      tags: tags(),
      meta_title: metaTitle.trim(),
      meta_description: metaDescription.trim(),
      status: finalStatus,
    };
    try {
      if (post) {
        const updated = await adminCall<BlogPost>(`/blog/posts/${post.id}/`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setStatus(updated.status);
        setSlug(updated.slug);
        setNotice(
          finalStatus === "published" ? "Published." : "Saved as draft.",
        );
        router.refresh();
      } else {
        const created = await adminCall<BlogPost>("/blog/posts/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.replace(`/blog/${created.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function newCategory() {
    const name = window.prompt("New category name");
    if (!name?.trim()) return;
    try {
      const cat = await adminCall<BlogCategory>("/blog/categories/", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      setCategories((c) => [...c, cat]);
      setCategoryId(cat.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add category.");
    }
  }

  async function generate() {
    if (!aiTopic.trim()) {
      setError("Enter a topic for the AI to write about.");
      return;
    }
    setAiBusy(true);
    setError(null);
    try {
      const result = await adminCall<AiResult>("/blog/posts/ai/", {
        method: "POST",
        body: JSON.stringify({
          topic: aiTopic.trim(),
          tone: aiTone.trim(),
          keywords: aiKeywords.trim(),
        }),
      });
      if (result.title && !title.trim()) setTitle(result.title);
      if (result.excerpt) setExcerpt(result.excerpt);
      if (result.meta_description) setMetaDescription(result.meta_description);
      if (result.tags?.length) setTagsText(result.tags.join(", "));
      if (result.body) setBody(result.body);
      setTab("preview");
      setNotice("Draft generated — review and edit before publishing.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI generation failed.");
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <div className="grid gap-5 pb-16 lg:grid-cols-[1fr_20rem]">
      {/* Main column */}
      <div className="flex flex-col gap-5">
        {error && <Banner tone="error">{error}</Banner>}
        {notice && <Banner tone="success">{notice}</Banner>}

        {/* AI writer */}
        <section className="admin-card overflow-hidden">
          <button
            type="button"
            onClick={() => setAiOpen((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-3.5 text-left"
          >
            <span className="flex items-center gap-2 font-display text-sm font-bold text-ink">
              ✨ Write with AI
            </span>
            <span className="text-ink/40">{aiOpen ? "–" : "+"}</span>
          </button>
          {aiOpen && (
            <div className="border-t border-ink/10 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Topic / working title</label>
                  <Input
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g. How to style oversized hoodies in Lagos"
                  />
                </div>
                <div>
                  <label className={labelCls}>Tone (optional)</label>
                  <Input
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    placeholder="friendly, expert…"
                  />
                </div>
                <div>
                  <label className={labelCls}>Keywords (optional)</label>
                  <Input
                    value={aiKeywords}
                    onChange={(e) => setAiKeywords(e.target.value)}
                    placeholder="hoodies lagos, streetwear"
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={generate}
                disabled={aiBusy}
                className="mt-3"
              >
                {aiBusy ? "Writing…" : "Generate draft"}
              </Button>
              <p className="mt-2 text-xs text-ink/45">
                Fills the title, body, excerpt, tags and meta. Always review
                before publishing.
              </p>
            </div>
          )}
        </section>

        {/* Title + slug */}
        <section className="admin-card p-5">
          <label className={labelCls}>Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="!h-12 text-base"
          />
          <div className="mt-3">
            <label className={labelCls}>Slug (optional — auto from title)</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated"
            />
          </div>
        </section>

        {/* Body: write / preview */}
        <section className="admin-card overflow-hidden">
          <div className="flex border-b border-ink/10">
            {(["write", "preview"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-medium capitalize transition ${
                  tab === t
                    ? "border-b-2 border-primary text-ink"
                    : "text-ink/50 hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "write" ? (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={22}
              placeholder="Write your post in Markdown…"
              className="w-full resize-y p-5 font-mono text-sm leading-relaxed text-ink focus:outline-none"
            />
          ) : (
            <div className="md min-h-[20rem] p-5">
              {body.trim() ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
              ) : (
                <p className="text-ink/40">Nothing to preview yet.</p>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <aside className="flex h-fit flex-col gap-4 lg:sticky lg:top-6">
        <section className="admin-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Status</span>
            <Badge tone={status === "published" ? "success" : "neutral"}>
              {status}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            <Button type="button" onClick={() => save()} disabled={busy} variant="ghost">
              {busy ? "Saving…" : "Save draft"}
            </Button>
            <Button
              type="button"
              onClick={() => save("published")}
              disabled={busy}
            >
              {status === "published" ? "Update & keep live" : "Publish"}
            </Button>
            {status === "published" && (
              <button
                type="button"
                onClick={() => save("draft")}
                className="text-xs text-ink/50 transition hover:text-accent"
              >
                Unpublish
              </button>
            )}
          </div>
          {post && (
            <p className="mt-3 text-xs text-ink/45">
              {post.reading_minutes} min read · /blog/{slug}
            </p>
          )}
        </section>

        <section className="admin-card p-5">
          <label className={labelCls}>Cover image</label>
          <CloudinaryUpload
            value={coverUrl}
            aspect="wide"
            onChange={(url, publicId) => {
              setCoverUrl(url);
              setCoverId(publicId ?? "");
            }}
          />
        </section>

        <section className="admin-card flex flex-col gap-3 p-5">
          <div>
            <label className={labelCls}>Category</label>
            <div className="flex gap-2">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={selectCls}
              >
                <option value="">— none —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button type="button" variant="ghost" onClick={newCategory}>
                +
              </Button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Tags (comma-separated)</label>
            <Input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="streetwear, lagos"
            />
          </div>
          <div>
            <label className={labelCls}>Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Short summary (auto if blank)"
              className="w-full border border-ink/15 bg-white p-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>
        </section>

        <section className="admin-card flex flex-col gap-3 p-5">
          <span className="text-sm font-semibold text-ink">SEO</span>
          <div>
            <label className={labelCls}>Meta title</label>
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Defaults to the title"
            />
          </div>
          <div>
            <label className={labelCls}>Meta description</label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Search-result description (auto if blank)"
              className="w-full border border-ink/15 bg-white p-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-right text-[11px] text-ink/40">
              {metaDescription.length}/300
            </p>
          </div>
        </section>

        <Link
          href="/blog"
          className="text-center text-sm text-ink/55 transition hover:text-primary"
        >
          ← Back to all posts
        </Link>
      </aside>
    </div>
  );
}
