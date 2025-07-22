import { CheckIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

const LeftSideLogin = () => {
    return (
        <div className="hidden lg:flex lg:w-1/2 bg-sidebar items-center justify-center p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-background to-background/5" />
            <div className="relative z-10 max-w-md">
                <h1 className="text-4xl font-bold mb-6 text-foreground">
                    ACPS Club of Mathematics
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                    Join our vibrant community dedicated to the beauty and power
                    of mathematics.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckIcon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm">Events & Workshops</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckIcon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm">Magazine Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckIcon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm">Resource Library</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckIcon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm">Community Support</span>
                    </div>
                </div>
                <div className="h-64 w-64 mx-auto relative">
                    {/* Mathematical formulas background */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl text-primary/20 font-mono">
                            ∫∑∇
                        </div>
                    </div>
                    <div className="absolute top-4 left-4 text-primary/30 font-mono text-sm rotate-12">
                        e^(iπ) + 1 = 0
                    </div>
                    <div className="absolute bottom-4 right-4 text-primary/30 font-mono text-sm -rotate-12">
                        ∇²φ = ρ/ε₀
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary text-4xl">📐</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeftSideLogin;
