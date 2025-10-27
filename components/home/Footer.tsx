import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-background border-t border-border/50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    <div className="lg:col-span-1">
                        <h3 className="text-xl font-bold mb-4 text-primary">
                            ACPSCM
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            Exploring the Universe of Numbers.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-foreground">
                            Quick Links
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a href="/" className="hover:text-primary transition-colors">Home</a>
                            </li>
                            <li>
                                <a href="/events" className="hover:text-primary transition-colors">Events</a>
                            </li>
                            <li>
                                <a href="/resources" className="hover:text-primary transition-colors">Resources</a>
                            </li>
                            <li>
                                <a href="/about" className="hover:text-primary transition-colors">About Us</a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-foreground">
                            Contact
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>contact@acpscm.com</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-foreground">
                            Follow Us
                        </h4>
                        <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" aria-label="Twitter">
                                <Twitter className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" aria-label="Facebook">
                                <Facebook className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" aria-label="Instagram">
                                <Instagram className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                <Separator className="my-8 bg-border/50" />
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        © 2025 ACPSCM. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
