import { PageHeader } from "@/components/page-header";
import { BlogEditor } from "@/features/admin/blog-editor";
import { adminFetch } from "@/lib/admin";
import type { BlogCategory } from "@/types/blog";

export const metadata = { title: "New post" };

export default async function NewPostPage() {
  const cats = await adminFetch<{ results: BlogCategory[] }>(
    "/admin/blog/categories/",
  ).catch(() => ({ results: [] }));

  return (
    <div>
      <PageHeader eyebrow="Content" title="New post" />
      <BlogEditor categories={cats.results} />
    </div>
  );
}
