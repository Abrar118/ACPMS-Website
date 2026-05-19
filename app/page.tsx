import HeroSection from "@/components/home/HeroSection";
import StatsCounter from "@/components/home/StatsCounter";
import WhatWeDo from "@/components/home/WhatWeDo";
import EventCountdown from "@/components/home/EventCountdown";
import WhoWeAre from "@/components/home/WhoWeAre";
import ClientTestimonials from "@/components/home/ClientTestimonials";
import Footer from "@/components/home/Footer";
import ClubHighlights from "@/components/home/ClubHighlights";
import AnnouncementBanner from "@/components/announcements/AnnouncementBanner";
import { getHighlights, getClubStats, getNextOrLatestEvent } from "@/lib/db/events";
import { getActiveAnnouncements } from "@/lib/db/announcements";

export default async function Home() {
    const [highlights, stats, featuredEvent, announcements] = await Promise.all([
        getHighlights(),
        getClubStats(),
        getNextOrLatestEvent(),
        getActiveAnnouncements(),
    ]);

    const topAnnouncement = announcements.length > 0 ? announcements[0] : null;

    return (
        <main className="min-h-screen">
            <AnnouncementBanner
                announcement={
                    topAnnouncement
                        ? JSON.parse(JSON.stringify(topAnnouncement))
                        : null
                }
            />
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
