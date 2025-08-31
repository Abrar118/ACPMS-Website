import { redirect } from "next/navigation";
import Footer from "@/components/home/Footer";
import ResourcesClient from "@/components/resources/ResourcesClient";
import { getCurrentUser } from "@/lib/auth-server";
import { getFeaturedResources, getPublishedResources } from "@/queries/resources";
import createSupabaseServer from "@/utils/supabase/supabase-server";

export default async function ResourcesPage() {
    // Check if user is authenticated
    const { user } = await getCurrentUser();
    if (!user) {
        redirect("/auth");
    }

    const supabase = await createSupabaseServer();
    
    // Fetch featured and published resources
    const [featuredResponse, allResourcesResponse] = await Promise.all([
        getFeaturedResources(supabase),
        getPublishedResources(supabase),
    ]);

    const featuredResources = featuredResponse.data || [];
    const allResources = allResourcesResponse.data || [];

    return (
        <main className="min-h-screen">
            <ResourcesClient 
                featuredResources={featuredResources}
                allResources={allResources}
            />
            <Footer />
        </main>
    );
}
