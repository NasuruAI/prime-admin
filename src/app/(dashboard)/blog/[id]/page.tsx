import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { BlogEditor } from "@/features/admin/blog-editor";
import { adminFetch } from "@/lib/admin";
import { ApiRequestError } from "@/lib/api";
import type { BlogCategory, BlogPost } from "@/types/blog";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  let post: BlogPost;
  try {
    post = await adminFetch<BlogPost>(`/admin/blog/posts/${params.id}/`);
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) notFound();
    throw err;
  }
  const cats = await adminFetch<{ results: BlogCategory[] }>(
    "/admin/blog/categories/",
  ).catch(() => ({ results: [] }));

  return (
    <div>
      <PageHeader eyebrow="Content" title="Edit post" />
      <BlogEditor post={post} categories={cats.results} />
    </div>
  );
}
