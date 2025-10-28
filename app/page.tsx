import HeroSection from "@/components/home/HeroSection";
import WhatWeDo from "@/components/home/WhatWeDo";
import WhoWeAre from "@/components/home/WhoWeAre";
import BentoGrid from "@/components/home/BentoGrid";
import ClientTestimonials from "@/components/home/ClientTestimonials";
import Footer from "@/components/home/Footer";

export default function Home() {
    return (
        <main className="min-h-screen">
            <HeroSection />
            <WhatWeDo />
            <WhoWeAre />
            <BentoGrid />
            <ClientTestimonials />
            <Footer />
        </main>
    );
}
