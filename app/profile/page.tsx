import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import ProfileClient from "@/components/profile/ProfileClient";
import Footer from "@/components/home/Footer";

export default async function ProfilePage() {
    const { user, profile } = await getCurrentUser();

    if (!user) {
        redirect("/auth");
    }

    return (
        <main className="min-h-screen bg-background">
            <section className="pt-24 pb-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <ProfileClient user={user} profile={profile} />
                </div>
            </section>
            <Footer />
        </main>
    );
}
