"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import createSupabaseBrowser from "@/utils/supabase/supabase-browser";
// import {
//     getUserRegisteredEventsQuery,
//     getUserPastEventsQuery,
// } from "@/queries/profile";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/queries/auth";
import RegisteredEvents from "./RegisteredEvents";
import PastEvents from "./PastEvents";
import PersonalInformation from "./PersonalInformation";

interface ProfileClientProps {
    user: User;
    profile: UserProfile | null;
}

export default function ProfileClient({ user, profile }: ProfileClientProps) {
    const supabase = createSupabaseBrowser();
    const [activeTab, setActiveTab] = useState("registered");

    // Fetch user's registered events
    // const {
    //     data: registeredEvents,
    //     isLoading: loadingRegistered,
    //     error: registeredError,
    // } = useQuery({
    //     queryKey: ["user-registered-events", user.id],
    //     queryFn: async () => {
    //         const { data, error } = await getUserRegisteredEventsQuery(
    //             supabase,
    //             user.id
    //         );
    //         if (error) throw error;
    //         return data;
    //     },
    //     enabled: !!user.id,
    // });

    // // Fetch user's past events
    // const {
    //     data: pastEvents,
    //     isLoading: loadingPast,
    //     error: pastError,
    // } = useQuery({
    //     queryKey: ["user-past-events", user.id],
    //     queryFn: async () => {
    //         const { data, error } = await getUserPastEventsQuery(
    //             supabase,
    //             user.id
    //         );
    //         if (error) throw error;
    //         return data;
    //     },
    //     enabled: !!user.id,
    // });

    if (!profile) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">
                    Unable to load profile data.
                </p>
            </div>
        );
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatMemberSince = (date: string) => {
        return new Date(date).getFullYear();
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="text-center mb-12">
                <div className="relative inline-block mb-6">
                    <Avatar className="w-32 h-32 mx-auto border-4 border-background shadow-xl">
                        <AvatarImage
                            src={profile.profile_image || ""}
                            alt={profile.name}
                            className="object-cover"
                        />
                        <AvatarFallback className="text-2xl font-semibold bg-orange-100 text-orange-600">
                            {getInitials(profile.name)}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <h1 className="text-4xl font-bold text-foreground mb-3">
                    {profile.name}
                </h1>

                <p className="text-lg text-muted-foreground mb-3">
                    {profile.email}
                </p>

                <div className="text-muted-foreground">
                    <span>
                        Member since{" "}
                        {formatMemberSince(profile.created_at || "")}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="grid grid-cols-3 w-full max-w-lg mx-auto mb-8 h-12">
                    <TabsTrigger
                        value="registered"
                        className="text-sm font-medium"
                    >
                        Registered Events
                    </TabsTrigger>
                    <TabsTrigger value="past" className="text-sm font-medium">
                        Past Events
                    </TabsTrigger>
                    <TabsTrigger
                        value="information"
                        className="text-sm font-medium"
                    >
                        Information
                    </TabsTrigger>
                </TabsList>

                {/* <TabsContent value="registered" className="mt-0">
                    <RegisteredEvents
                        events={registeredEvents || []}
                        isLoading={loadingRegistered}
                        error={registeredError}
                    />
                </TabsContent>

                <TabsContent value="past" className="mt-0">
                    <PastEvents
                        events={pastEvents || []}
                        isLoading={loadingPast}
                        error={pastError}
                    />
                </TabsContent> */}

                <TabsContent value="information" className="mt-0">
                    <PersonalInformation user={user} profile={profile} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
