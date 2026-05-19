import { Twitter, Facebook, Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-white/[0.06] bg-white/[0.02]">
            <div className="max-w-7xl mx-auto py-16 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Column 1 — Branding */}
                    <div>
                        <h3 className="text-xl font-bold text-foreground">ACPSCM</h3>
                        <p className="text-sm text-muted-foreground mt-3 max-w-xs">
                            Adamjee Cantonment Public School Club of Mathematics
                        </p>
                    </div>

                    {/* Column 2 — Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                            Quick Links
                        </h4>
                        <div className="space-y-3 flex flex-col">
                            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                            <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Events</Link>
                            <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
                            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
                        </div>
                    </div>

                    {/* Column 3 — Contact */}
                    <div>
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                            Contact
                        </h4>
                        <a
                            href="mailto:contact@acpscm.com"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            contact@acpscm.com
                        </a>
                    </div>

                    {/* Column 4 — Social */}
                    <div>
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                            Follow Us
                        </h4>
                        <div className="flex gap-3">
                            <a
                                href="#"
                                aria-label="Twitter"
                                className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/[0.15] transition-all"
                            >
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                aria-label="Facebook"
                                className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/[0.15] transition-all"
                            >
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                aria-label="Instagram"
                                className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/[0.15] transition-all"
                            >
                                <Instagram className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-white/[0.06]">
                    <p className="text-sm text-muted-foreground text-center">
                        © 2026 ACPSCM. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
