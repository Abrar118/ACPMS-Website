import HeroSection from "@/components/home/HeroSection";
import StatsCounter from "@/components/home/StatsCounter";
import WhatWeDo from "@/components/home/WhatWeDo";
import EventCountdown from "@/components/home/EventCountdown";
import WhoWeAre from "@/components/home/WhoWeAre";
import ClientTestimonials from "@/components/home/ClientTestimonials";
import Footer from "@/components/home/Footer";
import ClubHighlights from "@/components/home/ClubHighlights";
import { getHighlights, getUpcomingEvents } from "@/lib/db/events";

export default async function Home() {
    const [highlights, upcomingEvents] = await Promise.all([
        getHighlights(),
        getUpcomingEvents(),
    ]);
    const nextEvent = upcomingEvents[0] ?? null;

    return (
        <main className="min-h-screen">
            <HeroSection />
            <StatsCounter
                stats={[
                    { label: "Active Members", value: 50, suffix: "+" },
                    { label: "Events Hosted", value: 10, suffix: "+" },
                    { label: "Competitions", value: 5, suffix: "+" },
                    { label: "Years Active", value: 3, suffix: "+" },
                ]}
            />
            <WhatWeDo />
            <EventCountdown
                nextEvent={
                    nextEvent
                        ? JSON.parse(JSON.stringify(nextEvent))
                        : null
                }
            />
            <WhoWeAre />
            <ClubHighlights highlights={highlights ? JSON.parse(JSON.stringify(highlights)) : null} />
            <ClientTestimonials />
            <Footer />
        </main>
    );
}
