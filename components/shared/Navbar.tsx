"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, User, LogOut, Settings, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logout } from "@/actions/auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { UserProfile } from "@/queries/auth";

interface NavbarProps {
    user: SupabaseUser | null;
    profile: UserProfile | null;
}

export default function Navbar({ user, profile }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [avatarKey, setAvatarKey] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

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
        { href: "/events", label: "Events", badge: "New" },
        { href: "/magazine", label: "Magazine" },
        { href: "/resources", label: "Resources" },
        { href: "/about", label: "About" },
        ...(profile?.role === "admin" || profile?.role === "executive"
            ? [{ href: "/admin", label: "Admin" }]
            : []),
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "bg-background/50 backdrop-blur-md border-b shadow-md"
                    : "bg-background/70 backdrop-blur-sm border-b"
                }`}
        >
            <div className="max-w-6xl mx-auto px-4">
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
                        <span className="text-xl font-bold text-foreground">
                            ACPSCM
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navigationItems.map((item) => (
                            <div key={item.href} className="relative">
                                <Link
                                    href={item.href}
                                    className="text-foreground hover:text-primary transition-colors font-medium"
                                >
                                    {item.label}
                                </Link>
                                {item.badge && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-2 -right-3 text-xs px-1"
                                    >
                                        {item.badge}
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                        <ThemeToggle />

                        {!isLoading &&
                            (user ? (
                                // Authenticated user dropdown
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="relative h-8 w-8 rounded-full"
                                        >
                                            <Avatar className="h-8 w-8">
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
                                        className="w-56"
                                        align="end"
                                        forceMount
                                    >
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">
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
                                        <DropdownMenuSeparator />
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
                                        <DropdownMenuSeparator />
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
                                <div className="hidden md:flex items-center space-x-2">
                                    <Button variant="ghost" asChild>
                                        <Link href="/auth?tab=login">
                                            Sign In
                                        </Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href="/auth?tab=register">
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Join Now
                                        </Link>
                                    </Button>
                                </div>
                            ))}

                        {/* Mobile menu */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <div className="grid gap-6 py-6 ml-5">
                                    {/* Mobile User Info */}
                                    {user && (
                                        <div className="flex items-center space-x-2 pb-4 border-b">
                                            <Avatar className="h-8 w-8">
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
                                                <p className="text-sm font-medium">
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
                                    {navigationItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="text-foreground hover:text-primary transition-colors font-medium"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}

                                    {/* Mobile Auth Actions */}
                                    {user ? (
                                        <>
                                            <Link
                                                href="/profile"
                                                className="text-foreground hover:text-primary transition-colors font-medium"
                                            >
                                                Profile
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="text-foreground hover:text-primary transition-colors font-medium"
                                            >
                                                Settings
                                            </Link>
                                            <Button
                                                variant="outline"
                                                className="w-[90%]"
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
                                                className="text-foreground hover:text-primary transition-colors font-medium"
                                            >
                                                Sign In
                                            </Link>
                                            <Button className="w-[90%]" asChild>
                                                <Link href="/auth?tab=register">
                                                    Join Now
                                                </Link>
                                            </Button>
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
