import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-muted py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <h3 className="text-xl font-bold mb-4 text-primary">
                            ACPS Club of Mathematics
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            Think Logical
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4 text-foreground">
                            Quick Links
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a
                                    href="/"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Home
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/events"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Events
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/resources"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Resources
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/admin"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Admin
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4 text-foreground">
                            Contact
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>contact@mathexplorers.org</span>
                        </div>
                    </div>

                    {/* Newsletter & Social */}
                    <div>
                        <h4 className="font-semibold mb-4 text-foreground">
                            Stay Connected
                        </h4>
                        <div className="space-y-4">
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="Enter email"
                                    className="text-sm"
                                />
                                <Button size="sm">Subscribe</Button>
                            </div>
                            <div className="flex space-x-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    aria-label="Twitter"
                                >
                                    <Twitter className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />

                {/* Copyright */}
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        © 2025 ACPSCM. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
