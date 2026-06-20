export type ImageUrls = { thumb: string; card: string; detail: string };

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  post_count?: number;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image_public_id: string;
  cover: ImageUrls | null;
  category: string | null;
  tags: string[];
  status: "draft" | "published";
  published_at: string | null;
  meta_title: string;
  meta_description: string;
  reading_minutes: number;
  author_name: string;
  created_at: string;
  updated_at: string;
};

export type AiResult = {
  title: string;
  excerpt: string;
  meta_description: string;
  tags: string[];
  body: string;
};
