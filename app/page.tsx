import HeroSection from "@/components/home/HeroSection";
import StatsCounter from "@/components/home/StatsCounter";
import WhatWeDo from "@/components/home/WhatWeDo";
import EventCountdown from "@/components/home/EventCountdown";
import WhoWeAre from "@/components/home/WhoWeAre";
import ClientTestimonials from "@/components/home/ClientTestimonials";
import Footer from "@/components/home/Footer";
import ClubHighlights from "@/components/home/ClubHighlights";
import { getHighlights, getClubStats, getNextOrLatestEvent } from "@/lib/db/events";

export default async function Home() {
    const [highlights, stats, featuredEvent] = await Promise.all([
        getHighlights(),
        getClubStats(),
        getNextOrLatestEvent(),
    ]);

    return (
        <main className="min-h-screen">
            <HeroSection />
            <StatsCounter
                stats={[
                    { label: "Club Members", value: stats.memberCount, suffix: "+" },
                    { label: "Events Hosted", value: stats.eventCount, suffix: "+" },
                    { label: "Competitions", value: stats.competitionCount, suffix: "+" },
                    { label: "Resources", value: stats.resourceCount, suffix: "+" },
                ]}
            />
            <WhatWeDo />
            <EventCountdown
                nextEvent={
                    featuredEvent
                        ? JSON.parse(JSON.stringify(featuredEvent))
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
