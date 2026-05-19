import { Suspense } from "react";
import { getPublishedEvents } from "@/lib/db/events";
import Footer from "@/components/home/Footer";
import EventsClient from "@/components/events/EventsClient";

export default async function EventsPage() {
    // Fetch published events server-side
    const events = await getPublishedEvents();

    return (
        <main className="min-h-screen">
            {/* Events Content */}
            <Suspense fallback={
                <div className="flex justify-center py-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            }>
                <EventsClient events={JSON.parse(JSON.stringify(events))} />
            </Suspense>

            <Footer />
        </main>
    );
}
