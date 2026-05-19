import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassCard } from "@/components/ui/glass-card";
import { SectionHeader } from "@/components/ui/section-header";
import Link from "next/link";

interface GitHubContributor {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    contributions: number;
    type: string;
}

async function getContributors(): Promise<GitHubContributor[]> {
    try {
        const response = await fetch(
            "https://api.github.com/repos/Abrar118/ACPMS-Website/contributors",
            {
                headers: {
                    Accept: "application/vnd.github.v3+json",
                },
                // Revalidate every 24 hours
                next: { revalidate: 86400 },
            }
        );

        if (!response.ok) {
            console.error("Failed to fetch contributors:", response.statusText);
            return [];
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching contributors:", error);
        return [];
    }
}

export default async function Contributors() {
    const contributors = await getContributors();

    if (contributors.length === 0) {
        return null;
    }

    return (
        <section className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <SectionHeader
                    title="Contributors"
                    subtitle="Thank you to everyone who contributed to this project"
                    className="mb-8"
                />

                <GlassCard className="p-6">
                    <div className="flex flex-wrap justify-start gap-3">
                        {contributors.map((contributor) => (
                            <Link
                                key={contributor.id}
                                href={contributor.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group"
                                title={`${contributor.login}`}
                            >
                                <Avatar className="w-12 h-12 ring-2 ring-white/[0.08] group-hover:ring-primary/90 transition-all duration-300 group-hover:scale-110">
                                    <AvatarImage
                                        src={contributor.avatar_url}
                                        alt={contributor.login}
                                    />
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                        {contributor.login.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </section>
    );
}
