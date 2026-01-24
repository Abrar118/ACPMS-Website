import HeroSection from "@/components/home/HeroSection";
import WhatWeDo from "@/components/home/WhatWeDo";
import WhoWeAre from "@/components/home/WhoWeAre";
import ClientTestimonials from "@/components/home/ClientTestimonials";
import Footer from "@/components/home/Footer";
import ClubHighlights from "@/components/home/ClubHighlights";

export default function Home() {
    return (
        <main className="min-h-screen">
            <HeroSection />
            <WhatWeDo />
            <WhoWeAre />
            <ClubHighlights />
            <ClientTestimonials />
            <Footer />
        </main>
    );
}
