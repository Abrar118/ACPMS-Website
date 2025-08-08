"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { UserProfile } from "@/queries/auth";

interface ConditionalNavbarProps {
    user: SupabaseUser | null;
    profile: UserProfile | null;
}

export function ConditionalNavbar({ user, profile }: ConditionalNavbarProps) {
    const pathname = usePathname();
    const isAdminRoute = pathname.startsWith("/admin");

    if (isAdminRoute) {
        return null;
    }

    return <Navbar user={user} profile={profile} />;
}
