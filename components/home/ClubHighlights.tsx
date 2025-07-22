"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import useSupabaseBrowser from "@/utils/supabase/supabase-browser";
import { getHighlights } from "@/queries/events";
import { Calendar, BookOpen, FileText } from "lucide-react";

export default function ClubHighlights() {
    const supabase = useSupabaseBrowser();
    
    const { data: highlights, isLoading, error } = useQuery({
        queryKey: ['highlights'],
        queryFn: () => getHighlights(supabase),
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    if (isLoading) {
        return (
            <section className="py-20 px-4 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16">
                        Club Highlights
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <Skeleton className="h-48 w-full" />
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-2/3 mb-4" />
                                    <Skeleton className="h-9 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error || !highlights) {
        return (
            <section className="py-20 px-4 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16">
                        Club Highlights
                    </h2>
                    <div className="text-center">
                        <p className="text-muted-foreground">Unable to load highlights at the moment.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 px-4 bg-muted/30">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16">
                    Club Highlights
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Latest Event */}
                    {highlights.event && (
                        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="relative h-48 w-full overflow-hidden">
                                {highlights.event.poster_url ? (
                                    <Image
                                        src={highlights.event.poster_url}
                                        alt={highlights.event.title}
                                        fill
                                        className="object-cover transition-transform duration-300 hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                                        <Calendar className="w-16 h-16 text-white opacity-50" />
                                    </div>
                                )}
                                <Badge className="absolute top-3 left-3" variant="secondary">
                                    Latest Event
                                </Badge>
                            </div>
                            <CardHeader>
                                <CardTitle className="text-xl text-foreground">
                                    {highlights.event.title}
                                </CardTitle>
                                <CardDescription className="font-medium">
                                    {highlights.event.event_date ? 
                                        formatDate(highlights.event.event_date) : 
                                        "Date TBD"
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                                    {highlights.event.description || "Join us for this exciting event!"}
                                </p>
                                <Button size="sm" className="w-full">
                                    Learn More
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Most Popular Resource */}
                    {highlights.resource && (
                        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="relative h-48 w-full overflow-hidden">
                                {highlights.resource.file_url ? (
                                    <Image
                                        src={highlights.resource.file_url}
                                        alt={highlights.resource.title}
                                        fill
                                        className="object-cover transition-transform duration-300 hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                                        <BookOpen className="w-16 h-16 text-white opacity-50" />
                                    </div>
                                )}
                                <Badge className="absolute top-3 left-3" variant="secondary">
                                    Top Resource
                                </Badge>
                            </div>
                            <CardHeader>
                                <CardTitle className="text-xl text-foreground">
                                    {highlights.resource.title}
                                </CardTitle>
                                <CardDescription className="font-medium">
                                    {highlights.resource.view_count} views
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                                    {highlights.resource.description || "Explore this valuable resource"}
                                </p>
                                <Button size="sm" className="w-full">
                                    View Resource
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Latest Magazine */}
                    {highlights.magazine && (
                        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="relative h-48 w-full overflow-hidden">
                                {highlights.magazine.cover_image ? (
                                    <Image
                                        src={highlights.magazine.cover_image}
                                        alt={highlights.magazine.title}
                                        fill
                                        className="object-cover transition-transform duration-300 hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                                        <FileText className="w-16 h-16 text-white opacity-50" />
                                    </div>
                                )}
                                <Badge className="absolute top-3 left-3" variant="secondary">
                                    Latest Edition
                                </Badge>
                            </div>
                            <CardHeader>
                                <CardTitle className="text-xl text-foreground">
                                    {highlights.magazine.title}
                                </CardTitle>
                                <CardDescription className="font-medium">
                                    {highlights.magazine.published_date ? 
                                        formatDate(highlights.magazine.published_date) : 
                                        "Recently Published"
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                                    {highlights.magazine.summary || "Read our latest magazine edition"}
                                </p>
                                <Button size="sm" className="w-full">
                                    Read Now
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </section>
    );
}
