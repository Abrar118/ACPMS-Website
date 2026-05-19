import { Suspense } from "react";
import HeroSection from "@/components/home/HeroSection";
import StatsCounter from "@/components/home/StatsCounter";
import WhatWeDo from "@/components/home/WhatWeDo";
import EventCountdown from "@/components/home/EventCountdown";
import WhoWeAre from "@/components/home/WhoWeAre";
import ClientTestimonials from "@/components/home/ClientTestimonials";
import Footer from "@/components/home/Footer";
import ClubHighlights from "@/components/home/ClubHighlights";
import { getHighlights, getClubStats, getNextOrLatestEvent } from "@/lib/db/events";

async function StatsSection() {
    const stats = await getClubStats();
    return (
        <StatsCounter
            stats={[
                { label: "Club Members", value: stats.memberCount, suffix: "+" },
                { label: "Events Hosted", value: stats.eventCount, suffix: "+" },
                { label: "Competitions", value: stats.competitionCount, suffix: "+" },
                { label: "Resources", value: stats.resourceCount, suffix: "+" },
            ]}
        />
    );
}

async function EventSection() {
    const featuredEvent = await getNextOrLatestEvent();
    return (
        <EventCountdown
            nextEvent={
                featuredEvent
                    ? JSON.parse(JSON.stringify(featuredEvent))
                    : null
            }
        />
    );
}

async function HighlightsSection() {
    const highlights = await getHighlights();
    return (
        <ClubHighlights
            highlights={highlights ? JSON.parse(JSON.stringify(highlights)) : null}
        />
    );
}

function SectionSkeleton() {
    return (
        <div className="flex justify-center py-16">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-8 w-48 bg-muted rounded-lg" />
                <div className="h-4 w-72 bg-muted rounded" />
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <main className="min-h-screen">
            <HeroSection />
            <Suspense fallback={<SectionSkeleton />}>
                <StatsSection />
            </Suspense>
            <WhatWeDo />
            <Suspense fallback={<SectionSkeleton />}>
                <EventSection />
            </Suspense>
            <WhoWeAre />
            <Suspense fallback={<SectionSkeleton />}>
                <HighlightsSection />
            </Suspense>
            <ClientTestimonials />
            <Footer />
        </main>
    );
}
