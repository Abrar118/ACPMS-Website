import Footer from "@/components/home/Footer";

export default function SettingsPage() {
    return (
        <main className="min-h-screen">
            <section className="pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Settings</h1>
                    <p className="text-muted-foreground">
                        Settings page content will be implemented here. This page will allow users to 
                        manage their account preferences, notification settings, and privacy options.
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
