import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const poppins = Poppins({
    subsets: ["latin"],
    variable: "--font-poppins",
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    title: "ACPSCM",
    description: "Adamjee Cantonment Public School Cluub of Mathematics",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ReactQueryClientProvider>
            <html lang="en">
                <body
                    className={`${poppins.variable} font-poppins antialiased`}
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <main className="bg-background flex flex-col min-h-screen">
                            {children}
                        </main>
                        <Toaster richColors position="top-right" />
                    </ThemeProvider>
                </body>
            </html>
        </ReactQueryClientProvider>
    );
}
