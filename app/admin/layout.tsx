import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import { getUserById } from "@/queries/auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createSupabaseServer();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Redirect if not authenticated
    if (!user) {
        redirect("/auth");
    }

    // Get user profile
    const profileResponse = await getUserById(supabase, user.id);

    if (!profileResponse.success || !profileResponse.data) {
        redirect("/auth");
    }

    const profile = profileResponse.data;

    // Check if user is admin
    if (profile.role !== "admin") {
        redirect("/");
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background">
                <AdminSidebar user={user} profile={profile} />
                <SidebarInset className="flex-1">
                    <main className="flex-1">{children}</main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
