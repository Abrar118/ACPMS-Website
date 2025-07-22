import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from "@tanstack/react-query";
import { prefetchQuery } from "@supabase-cache-helpers/postgrest-react-query";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import {
    getUpcomingEventsQuery,
    getPastEventsQuery,
    getEventTypesQuery,
} from "@/queries/events";
import Footer from "@/components/home/Footer";
import EventsClient from "@/components/events/EventsClient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default async function EventsPage() {
    const queryClient = new QueryClient();
    const supabase = await createSupabaseServer();

    // Prefetch events data for SSR
    await Promise.all([
        prefetchQuery(queryClient, getUpcomingEventsQuery(supabase)),
        prefetchQuery(queryClient, getPastEventsQuery(supabase)),
        prefetchQuery(queryClient, getEventTypesQuery(supabase)),
    ]);

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/5">
                <div className="max-w-6xl mx-auto text-center">
                    <Badge variant="secondary" className="mb-4">
                        <Calendar className="w-3 h-3 mr-1" />
                        Events & Activities
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        ACPSCM Events
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Join our exciting mathematics competitions, workshops,
                        and educational events designed to challenge and inspire
                        young mathematical minds.
                    </p>
                </div>
            </section>

            {/* Events Content with React Query */}
            <HydrationBoundary state={dehydrate(queryClient)}>
                <EventsClient />
            </HydrationBoundary>

            {/* Event Categories Info */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Event Categories
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="font-semibold mb-2">
                                    Workshops
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Interactive learning sessions
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="font-semibold mb-2">Sessions</h3>
                                <p className="text-sm text-muted-foreground">
                                    Deep-dive topic discussions
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="font-semibold mb-2">
                                    Competitions
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Mathematical challenges
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <h3 className="font-semibold mb-2">Explore</h3>
                                <p className="text-sm text-muted-foreground">
                                    Hands-on discovery sessions
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
