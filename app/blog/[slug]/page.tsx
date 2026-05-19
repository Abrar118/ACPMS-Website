import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/db/blog-posts";
import { incrementBlogPostViewCount } from "@/lib/db/blog-posts";
import Footer from "@/components/home/Footer";
import BlogArticle from "@/components/blog/BlogArticle";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || !post.is_published) {
    notFound();
  }

  incrementBlogPostViewCount(post.id).catch(() => {});

  return (
    <main className="min-h-screen">
      <BlogArticle post={JSON.parse(JSON.stringify(post))} />
      <Footer />
    </main>
  );
}
