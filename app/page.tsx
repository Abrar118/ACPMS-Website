import HeroSection from "@/components/home/HeroSection";
import WhatWeDo from "@/components/home/WhatWeDo";
import WhoWeAre from "@/components/home/WhoWeAre";
import ClientTestimonials from "@/components/home/ClientTestimonials";
import Footer from "@/components/home/Footer";
import ClubHighlights from "@/components/home/ClubHighlights";
import { getHighlights } from "@/lib/db/events";

export default async function Home() {
    const highlights = await getHighlights();

    return (
        <main className="min-h-screen">
            <HeroSection />
            <WhatWeDo />
            <WhoWeAre />
            <ClubHighlights highlights={highlights ? JSON.parse(JSON.stringify(highlights)) : null} />
            <ClientTestimonials />
            <Footer />
        </main>
    );
}
