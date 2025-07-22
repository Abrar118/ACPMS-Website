import Footer from "@/components/home/Footer";

export default function ProfilePage() {
    return (
        <main className="min-h-screen">
            <section className="pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">User Profile</h1>
                    <p className="text-muted-foreground">
                        Profile page content will be implemented here. This page will show user details, 
                        achievements, participation history, and account settings.
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
