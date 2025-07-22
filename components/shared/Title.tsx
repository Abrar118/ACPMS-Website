import Image from "next/image";
import Link from "next/link";
import React from "react";

const Title = () => {
    return (
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
            <span className="text-xl font-bold text-foreground">ACPSCM</span>
        </Link>
    );
};

export default Title;
