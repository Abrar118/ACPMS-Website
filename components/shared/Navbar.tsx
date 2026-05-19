"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, User, LogOut, Settings, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { logout } from "@/actions/auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/db/users";

interface NavbarProps {
    user: SupabaseUser | null;
    profile: UserProfile | null;
}

export default function Navbar({ user, profile }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [avatarKey, setAvatarKey] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Force avatar refresh when profile changes
        if (profile) {
            setAvatarKey((prev) => prev + 1);
        }
    }, [profile?.profile_image, profile?.name]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            setIsLoading(true);
            const result = await logout();

            if (result.success) {
                toast.success("Logged out successfully");
                router.push("/");
            } else {
                toast.error(result.error || "An error occurred during logout");
            }
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("An error occurred during logout");
            router.push("/");
        } finally {
            setIsLoading(false);
        }
    };

    const navigationItems = [
        { href: "/", label: "Home" },
        { href: "/events", label: "Events" },
        // { href: "/magazine", label: "Magazine" },
        { href: "/resources", label: "Resources" },
        { href: "/about", label: "About" },
        ...(profile?.role === "admin" || profile?.role === "executive"
            ? [{ href: "/admin", label: "Admin" }]
            : []),
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? "bg-black/60 backdrop-blur-xl border-b border-white/[0.08] shadow-lg shadow-black/20"
                    : "bg-transparent border-b border-transparent"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link className="flex items-center space-x-2" href={"/"}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                            <Image
                                className="text-primary-foreground font-bold text-lg"
                                height={32}
                                width={32}
                                src={"/logo.png"}
                                alt="ACPSCM Logo"
                            />
                        </div>
                        <span className="text-xl font-bold text-white">
                            ACPSCM
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navigationItems.map((item) => {
                            const isActive =
                                item.href === "/"
                                    ? pathname === "/"
                                    : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                                        isActive
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                        {!isLoading &&
                            (user ? (
                                // Authenticated user dropdown
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="relative h-9 w-9 rounded-full p-0"
                                        >
                                            <Avatar className="h-9 w-9 ring-2 ring-transparent hover:ring-primary/50 transition-all">
                                                <AvatarImage
                                                    key={avatarKey}
                                                    src={
                                                        profile?.profile_image ||
                                                        ""
                                                    }
                                                    alt={
                                                        profile?.name || "User"
                                                    }
                                                />
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {profile?.name
                                                        ? profile.name
                                                              .split(" ")
                                                              .map(
                                                                  (
                                                                      word: string
                                                                  ) =>
                                                                      word.charAt(
                                                                          0
                                                                      )
                                                              )
                                                              .join("")
                                                              .slice(0, 2)
                                                              .toUpperCase()
                                                        : user?.email
                                                              ?.charAt(0)
                                                              .toUpperCase() ||
                                                          "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-56 bg-[#0f0f10] border border-white/[0.08] rounded-xl"
                                        align="end"
                                        forceMount
                                    >
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none text-foreground">
                                                    {profile?.name ||
                                                        user?.email?.split(
                                                            "@"
                                                        )[0] ||
                                                        "User"}
                                                </p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {profile?.email ||
                                                        user?.email ||
                                                        ""}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-white/[0.08]" />
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile">
                                                <User className="mr-2 h-4 w-4" />
                                                <span>Profile</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/settings">
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>Settings</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        {profile?.role === "admin" && (
                                            <>
                                                <DropdownMenuSeparator className="bg-white/[0.08]" />
                                                <DropdownMenuItem asChild>
                                                    <Link href="/admin">
                                                        <Shield className="mr-2 h-4 w-4" />
                                                        <span>Admin Panel</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator className="bg-white/[0.08]" />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                // Non-authenticated user buttons
                                <div className="hidden md:flex items-center space-x-3">
                                    <Link
                                        href="/auth?tab=login"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/auth?tab=register"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                                    >
                                        Join Now
                                    </Link>
                                </div>
                            ))}

                        {/* Mobile menu */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden text-foreground"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="bg-[#0a0a0b] border-l border-white/[0.08]">
                                <div className="grid gap-6 py-6 ml-5">
                                    {/* Mobile User Info */}
                                    {user && (
                                        <div className="flex items-center space-x-3 pb-4 border-b border-white/[0.08]">
                                            <Avatar className="h-9 w-9 ring-2 ring-primary/30">
                                                <AvatarImage
                                                    key={`mobile-${avatarKey}`}
                                                    src={
                                                        profile?.profile_image ||
                                                        ""
                                                    }
                                                    alt={
                                                        profile?.name || "User"
                                                    }
                                                />
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {profile?.name
                                                        ? profile.name
                                                              .split(" ")
                                                              .map(
                                                                  (
                                                                      word: string
                                                                  ) =>
                                                                      word.charAt(
                                                                          0
                                                                      )
                                                              )
                                                              .join("")
                                                              .slice(0, 2)
                                                              .toUpperCase()
                                                        : user?.email
                                                              ?.charAt(0)
                                                              .toUpperCase() ||
                                                          "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {profile?.name ||
                                                        user?.email?.split(
                                                            "@"
                                                        )[0] ||
                                                        "User"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {profile?.email ||
                                                        user?.email ||
                                                        ""}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Mobile Navigation */}
                                    {navigationItems.map((item) => {
                                        const isActive =
                                            item.href === "/"
                                                ? pathname === "/"
                                                : pathname.startsWith(item.href);
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`text-sm font-medium transition-colors ${
                                                    isActive
                                                        ? "text-foreground"
                                                        : "text-muted-foreground hover:text-foreground"
                                                }`}
                                            >
                                                {item.label}
                                            </Link>
                                        );
                                    })}

                                    {/* Mobile Auth Actions */}
                                    {user ? (
                                        <>
                                            <Link
                                                href="/profile"
                                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                Profile
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                Settings
                                            </Link>
                                            <Button
                                                variant="outline"
                                                className="w-[90%] border-white/[0.08] text-foreground hover:bg-white/[0.06]"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Log out
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/auth?tab=login"
                                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                Sign In
                                            </Link>
                                            <Link
                                                href="/auth?tab=register"
                                                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors text-center w-[90%]"
                                            >
                                                Join Now
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}
