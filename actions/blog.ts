"use server";

import { revalidatePath } from "next/cache";
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  incrementBlogPostViewCount,
  type CreateBlogPostData,
} from "@/lib/db/blog-posts";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type BlogActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createBlogPostAction(
  postData: CreateBlogPostData
): Promise<BlogActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to create blog posts" };

    const post = await createBlogPost(user.id, postData);
    revalidatePath("/admin/blog", "page");
    revalidatePath("/blog", "page");
    return { success: true, message: "Blog post created successfully" };
  } catch (error: any) {
    console.error("Error creating blog post:", error);
    return { success: false, error: error.message || "Failed to create blog post" };
  }
}

export async function updateBlogPostAction(
  postId: string,
  postData: Partial<CreateBlogPostData>
): Promise<BlogActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to update blog posts" };

    const post = await updateBlogPost(postId, postData);
    revalidatePath("/admin/blog", "page");
    revalidatePath("/blog", "page");
    revalidatePath(`/blog/${post.slug}`, "page");
    return { success: true, message: "Blog post updated successfully" };
  } catch (error: any) {
    console.error("Error updating blog post:", error);
    return { success: false, error: error.message || "Failed to update blog post" };
  }
}

export async function deleteBlogPostAction(
  postId: string
): Promise<BlogActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete blog posts" };

    await deleteBlogPost(postId);
    revalidatePath("/admin/blog", "page");
    revalidatePath("/blog", "page");
    return { success: true, message: "Blog post deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting blog post:", error);
    return { success: false, error: error.message || "Failed to delete blog post" };
  }
}

export async function incrementBlogPostViewAction(
  postId: string
): Promise<BlogActionResult> {
  try {
    await incrementBlogPostViewCount(postId);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to increment view count:", error);
    return { success: false, error: error.message || "Failed to increment view count" };
  }
}
