import { PageHeader } from "@/components/page-header";
import { BlogAdmin } from "@/features/admin/blog-admin";

export const metadata = { title: "Blog" };

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Blog"
        description="Write, manage and publish posts — with AI assistance and built-in SEO."
      />
      <BlogAdmin />
    </div>
  );
}
