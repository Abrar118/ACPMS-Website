import { Suspense } from "react";
import { getPublishedBlogPosts } from "@/lib/db/blog-posts";
import Footer from "@/components/home/Footer";
import BlogClient from "@/components/blog/BlogClient";

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <BlogClient posts={JSON.parse(JSON.stringify(posts))} />
      </Suspense>
      <Footer />
    </main>
  );
}
