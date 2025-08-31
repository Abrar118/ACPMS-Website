import { redirect, notFound } from "next/navigation";
import Footer from "@/components/home/Footer";
import CategoryResourcesClient from "@/components/resources/CategoryResourcesClient";
import { getCurrentUser } from "@/lib/auth-server";
import { getResourcesByCategory } from "@/queries/resources";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import { EResourceCategory } from "@/components/shared/enums";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Await params before using
  const { category } = await params;

  // Check if user is authenticated
  const { user } = await getCurrentUser();
  if (!user) {
    redirect("/auth");
  }

  // Validate category
  const validCategories = Object.values(EResourceCategory);
  if (!validCategories.includes(category as any)) {
    notFound();
  }

  const supabase = await createSupabaseServer();

  // Fetch resources for this category
  const categoryResourcesResponse = await getResourcesByCategory(
    supabase,
    category
  );
  const categoryResources = categoryResourcesResponse.data || [];

  // Get category display name
  const categoryKey = Object.keys(EResourceCategory).find(
    (key) =>
      EResourceCategory[key as keyof typeof EResourceCategory] ===
      category
  );

  return (
    <main className="min-h-screen">
      <CategoryResourcesClient
        resources={categoryResources}
        category={category}
        categoryName={categoryKey || category}
      />
      <Footer />
    </main>
  );
}
