import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { ConditionalNavbar } from "@/components/ConditionalNavbar";
import { getCurrentUser } from "@/lib/auth-server";
import { LoadingScreen } from "@/components/ui/loading-screen";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
    title: "ACPSCM",
    description: "Adamjee Cantonment Public School Club of Mathematics",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Get current user data server-side
    const { user, profile } = await getCurrentUser();

    return (
        <ReactQueryClientProvider>
            <html lang="en" className="dark">
                <body
                    className={`${inter.variable} font-sans antialiased`}
                >
                    <LoadingScreen />
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        forcedTheme="dark"
                        disableTransitionOnChange
                    >
                        <ConditionalNavbar user={user} profile={profile ? JSON.parse(JSON.stringify(profile)) : null} />
                        <main className="bg-background flex flex-col min-h-screen">
                            {children}
                        </main>
                        <Toaster
                            richColors
                            position="top-right"
                            toastOptions={{
                                style: {
                                    background: "rgba(255, 255, 255, 0.03)",
                                    backdropFilter: "blur(24px)",
                                    border: "1px solid rgba(255, 255, 255, 0.08)",
                                    color: "#f5f5f5",
                                },
                            }}
                        />
                    </ThemeProvider>
                </body>
            </html>
        </ReactQueryClientProvider>
    );
}
