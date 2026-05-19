import Footer from "@/components/home/Footer";
import ResourcesClient from "@/components/resources/ResourcesClient";
import { getFeaturedResources, getPublishedResources } from "@/lib/db/resources";

export default async function ResourcesPage() {
    // Fetch featured and published resources
    const [featuredResources, allResources] = await Promise.all([
        getFeaturedResources(),
        getPublishedResources(),
    ]);

    return (
        <main className="min-h-screen">
            <ResourcesClient
                featuredResources={JSON.parse(JSON.stringify(featuredResources))}
                allResources={JSON.parse(JSON.stringify(allResources))}
            />
            <Footer />
        </main>
    );
}
