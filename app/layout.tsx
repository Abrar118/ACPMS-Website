import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { ConditionalNavbar } from "@/components/ConditionalNavbar";
import { getCurrentUser } from "@/lib/auth-server";
import { LoadingScreen } from "@/components/ui/loading-screen";
import AnnouncementBanner from "@/components/announcements/AnnouncementBanner";
import { getActiveAnnouncements } from "@/lib/db/announcements";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    weight: ["300", "400", "500", "600", "700", "800"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "ACPSCM",
    description: "Adamjee Cantonment Public School Club of Mathematics",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [{ user, profile }, announcements] = await Promise.all([
        getCurrentUser(),
        getActiveAnnouncements(),
    ]);
    const topAnnouncement = announcements.length > 0 ? announcements[0] : null;

    return (
        <ReactQueryClientProvider>
            <html lang="en" suppressHydrationWarning>
                <body
                    className={`${inter.variable} font-sans antialiased`}
                >
                    <LoadingScreen />
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <AnnouncementBanner
                            announcement={topAnnouncement ? JSON.parse(JSON.stringify(topAnnouncement)) : null}
                        />
                        <ConditionalNavbar user={user} profile={profile ? JSON.parse(JSON.stringify(profile)) : null} />
                        <main className="bg-background flex flex-col min-h-screen">
                            {children}
                        </main>
                        <Toaster
                            richColors
                            position="top-right"
                            toastOptions={{
                                className:
                                    "bg-background/60 backdrop-blur-xl border border-border text-foreground",
                            }}
                        />
                    </ThemeProvider>
                </body>
            </html>
        </ReactQueryClientProvider>
    );
}
