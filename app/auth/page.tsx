"use client";

import type React from "react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import LeftSideLogin from "@/components/auth/left-side";
import Title from "@/components/shared/Title";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import ForgotPassword from "@/components/auth/forgot-pass";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function AuthPage() {
    const selectedTab = useSearchParams().get("tab") || "login";
    const [activeTab, setActiveTab] = useState(selectedTab);

    return (
        <div className="flex min-h-screen w-full">
            {/* Left side - Image/Illustration */}
            <LeftSideLogin />

            {/* Right side - Auth forms */}
            <div className="w-full bg-background flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex flex-col items-center justify-center text-center mb-8">
                        <Image
                            className="text-primary-foreground font-bold text-lg"
                            height={70}
                            width={70}
                            src={"/logo.png"}
                            alt="ACPSCM Logo"
                        />
                        <p className="text-muted-foreground mt-2">
                            {activeTab === "login" && "Sign in to your account"}
                            {activeTab === "register" && "Create a new account"}
                            {activeTab === "forgot-password" &&
                                "Reset your password"}
                        </p>
                    </div>

                    <Tabs
                        defaultValue="login"
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="w-full mb-8">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Sign Up</TabsTrigger>
                            <TabsTrigger value="forgot-password">
                                Reset
                            </TabsTrigger>
                        </TabsList>

                        <AnimatePresence mode="sync">
                            <LoginForm key={"login"} />
                            <RegisterForm key={"register"} />
                            <ForgotPassword
                                setActiveTab={setActiveTab}
                                key={"forgot-password"}
                            />
                        </AnimatePresence>
                    </Tabs>

                    <div className="text-center text-sm text-muted-foreground mt-6">
                        © {new Date().getFullYear()} Math Explorers. All rights
                        reserved.
                    </div>
                </div>
            </div>
        </div>
    );
}
