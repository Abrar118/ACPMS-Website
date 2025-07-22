import HeroSection from "@/components/home/HeroSection";
import WelcomeSection from "@/components/home/WelcomeSection";
import ClubHighlights from "@/components/home/ClubHighlights";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import Footer from "@/components/home/Footer";

export default function Home() {
    return (
        <main className="min-h-screen">
            <HeroSection />
            <WelcomeSection />
            <ClubHighlights />
            <TestimonialsSection />
            <Footer />
        </main>
    );
}
