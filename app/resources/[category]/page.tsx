import { notFound } from "next/navigation";
import Footer from "@/components/home/Footer";
import CategoryResourcesClient from "@/components/resources/CategoryResourcesClient";
import { getResourcesByCategory } from "@/lib/db/resources";
import { EResourceCategory } from "@/components/shared/enums";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  // Validate category
  const validCategories = Object.values(EResourceCategory);
  if (!validCategories.includes(category as any)) {
    notFound();
  }

  // Fetch resources for this category
  const categoryResources = await getResourcesByCategory(category);

  // Get category display name
  const categoryKey = Object.keys(EResourceCategory).find(
    (key) =>
      EResourceCategory[key as keyof typeof EResourceCategory] ===
      category
  );

  return (
    <main className="min-h-screen">
      <CategoryResourcesClient
        resources={JSON.parse(JSON.stringify(categoryResources))}
        category={category}
        categoryName={categoryKey || category}
      />
      <Footer />
    </main>
  );
}
