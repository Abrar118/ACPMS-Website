import Footer from "@/components/home/Footer";
import Contributors from "@/components/about/Contributors";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    BookOpen,
    Users,
    Trophy,
    Calculator,
    Mail,
    Linkedin,
    Phone,
    Facebook,
    Instagram,
    FileText,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMembersBySession, getUniqueSessions } from "@/lib/db/members";
import type { Member } from "@/lib/generated/prisma";
import { GlassCard } from "@/components/ui/glass-card";
import { SectionHeader } from "@/components/ui/section-header";
import { AmbientGlow } from "@/components/ui/ambient-glow";

// Serialized member type for use in components (dates as strings after JSON serialization)
type SerializedMember = Omit<Member, 'created_at' | 'updated_at'> & {
    created_at: string | Date;
    updated_at: string | Date;
};

// Helper function to get social media icon
function getSocialIcon(platform: string) {
    switch (platform.toLowerCase()) {
        case 'email':
            return Mail;
        case 'linkedin':
            return Linkedin;
        case 'phone':
            return Phone;
        case 'facebook':
            return Facebook;
        case 'instagram':
            return Instagram;
        default:
            return Mail;
    }
}

// Component for rendering member card
function MemberCard({ member }: { member: SerializedMember }) {
    return (
        <GlassCard className="p-6">
            <div className="text-center pb-4">
                <Avatar className="w-20 h-20 mx-auto mb-4 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                    <AvatarImage
                        src={member.image_url || ""}
                        alt={member.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                    </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold text-foreground">
                    {member.name}
                </h3>
                {member.designation && (
                    <p className="font-medium text-primary text-sm mt-1">
                        {member.designation}
                    </p>
                )}
                {member.position && (
                    <p className="font-medium text-muted-foreground text-sm mt-1">
                        {member.position}
                    </p>
                )}
                {member.session && member.session !== "Moderators" && (
                    <Badge
                        variant="outline"
                        className="w-fit mx-auto mt-2 border-white/[0.08] text-muted-foreground"
                    >
                        {`Session ${member.session}`}
                    </Badge>
                )}
            </div>
            <div className="pt-0">
                {member.bio && (
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                        {member.bio}
                    </p>
                )}
                <div className="flex justify-center space-x-2">
                    {member.email && (
                        <a
                            href={`mailto:${member.email}`}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:text-primary hover:border-white/[0.15] transition-all"
                        >
                            <Mail className="h-3 w-3" />
                        </a>
                    )}
                    {member.phone && (
                        <a
                            href={`tel:${member.phone}`}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:text-primary hover:border-white/[0.15] transition-all"
                        >
                            <Phone className="h-3 w-3" />
                        </a>
                    )}
                    {member.linkedin_id_link && (
                        <a
                            href={member.linkedin_id_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:text-primary hover:border-white/[0.15] transition-all"
                        >
                            <Linkedin className="h-3 w-3" />
                        </a>
                    )}
                    {member.facebook_id_link && (
                        <a
                            href={member.facebook_id_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:text-primary hover:border-white/[0.15] transition-all"
                        >
                            <Facebook className="h-3 w-3" />
                        </a>
                    )}
                    {member.instagram_id_link && (
                        <a
                            href={member.instagram_id_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:text-primary hover:border-white/[0.15] transition-all"
                        >
                            <Instagram className="h-3 w-3" />
                        </a>
                    )}
                </div>
            </div>
        </GlassCard>
    );
}

// Component for founder card with special styling
function FounderCard({ member }: { member: SerializedMember }) {
    return (
        <GlassCard glow className="p-6">
            <div className="text-center pb-4">
                <Avatar className="w-24 h-24 mx-auto mb-4 ring-2 ring-primary/30 group-hover:ring-primary/50 transition-all">
                    <AvatarImage
                        src={member.image_url || ""}
                        alt={member.name}
                        className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
                        {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                    </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold text-foreground">
                    {member.name}
                </h3>
                {member.position && (
                    <p className="font-medium text-primary text-sm mt-1">
                        {member.position}
                    </p>
                )}
                {member.session && (
                    <Badge
                        variant="default"
                        className="w-fit mx-auto mt-2"
                    >
                        Session {member.session}
                    </Badge>
                )}
            </div>
            <div className="pt-0">
                {member.bio && (
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                        {member.bio}
                    </p>
                )}
                <div className="flex justify-center space-x-2">
                    {member.email && (
                        <a
                            href={`mailto:${member.email}`}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:text-primary hover:border-white/[0.15] transition-all"
                        >
                            <Mail className="h-3 w-3" />
                        </a>
                    )}
                    {member.linkedin_id_link && (
                        <a
                            href={member.linkedin_id_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:text-primary hover:border-white/[0.15] transition-all"
                        >
                            <Linkedin className="h-3 w-3" />
                        </a>
                    )}
                </div>
            </div>
        </GlassCard>
    );
}

export default async function AboutPage() {
    // Fetch data from database for session-based members only
    const [membersBySession, sessions] = await Promise.all([
        getMembersBySession(),
        getUniqueSessions()
    ]);

    // Hardcoded founders data (as requested)
    const founders = [
        {
            id: "founder-1",
            name: "Tamzid Rahman",
            position: "Founder President",
            session: "2017-18",
            image_url: "/avatars/tamzid.jpg",
            bio: "",
            email: "tamzid.ahmed@example.com",
            linkedin_id_link: "#",
            designation: "Founder",
            created_at: "2018-01-01T00:00:00.000Z",
            updated_at: "2018-01-01T00:00:00.000Z",
            facebook_id_link: null,
            instagram_id_link: null,
            phone: null,
            user_id: null,
        },
        {
            id: "founder-2",
            name: "Tazrif Raim",
            position: "Founder Vice President",
            session: "2017-18",
            image_url: "/avatars/raim.jpg",
            bio: "",
            email: "tazrif.raim@example.com",
            linkedin_id_link: "#",
            designation: "Founder",
            created_at: "2018-01-01T00:00:00.000Z",
            updated_at: "2018-01-01T00:00:00.000Z",
            facebook_id_link: null,
            instagram_id_link: null,
            phone: null,
            user_id: null,
        },
        {
            id: "founder-3",
            name: "Abrar Mahir Esam",
            position: "Founder General Secretary",
            session: "2017-18",
            image_url: "/avatars/abrar.jpg",
            bio: "",
            email: "abrar.mahir@example.com",
            linkedin_id_link: "#",
            designation: "Founder",
            created_at: "2018-01-01T00:00:00.000Z",
            updated_at: "2018-01-01T00:00:00.000Z",
            facebook_id_link: null,
            instagram_id_link: null,
            phone: null,
            user_id: null,
        },
        {
            id: "founder-4",
            name: "Sultan Mehedi Masud",
            position: "Founder Organising Secretary",
            session: "2017-18",
            image_url: "",
            bio: "",
            email: "sultan.mehedi@example.com",
            linkedin_id_link: "#",
            designation: "Founder",
            created_at: "2018-01-01T00:00:00.000Z",
            updated_at: "2018-01-01T00:00:00.000Z",
            facebook_id_link: null,
            instagram_id_link: null,
            phone: null,
            user_id: null,
        },
        {
            id: "founder-5",
            name: "Md Ashrarul Haque Sifat",
            position: "Founder Organising Secretary",
            session: "2017-18",
            image_url: "",
            bio: "",
            email: "sifat.ashrarul@example.com",
            linkedin_id_link: "#",
            designation: "Founder",
            created_at: "2018-01-01T00:00:00.000Z",
            updated_at: "2018-01-01T00:00:00.000Z",
            facebook_id_link: null,
            instagram_id_link: null,
            phone: null,
            user_id: null,
        }
    ];

    // Create tabs list dynamically - sessions + founders
    const tabsList = [];
    if (sessions.length > 0) {
        sessions.forEach(session => {
            tabsList.push({ value: session, label: `${session}` });
        });
    }
    // Always add founders tab
    tabsList.push({ value: "founders", label: "Founders" });
    const values = [
        {
            icon: BookOpen,
            title: "Mathematical Excellence",
            description:
                "Fostering deep understanding and appreciation of mathematical concepts through engaging activities and competitions.",
        },
        {
            icon: Users,
            title: "Collaborative Learning",
            description:
                "Building a supportive community where students learn from each other and grow together.",
        },
        {
            icon: Trophy,
            title: "Academic Achievement",
            description:
                "Preparing students for mathematical olympiads, competitions, and higher education success.",
        },
        {
            icon: Calculator,
            title: "Practical Application",
            description:
                "Connecting mathematical theory to real-world problems and innovative solutions.",
        },
    ];

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <Badge variant="secondary" className="mb-4 border-white/[0.08] bg-white/[0.04] text-muted-foreground">
                        Est. 2017
                    </Badge>
                    <SectionHeader
                        title="About ACPSCM"
                        subtitle="The official Mathematics Club of Adamjee Cantonment Public School, dedicated to nurturing mathematical minds and fostering a love for problem-solving."
                    />
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-foreground">
                                Our Mission
                            </h2>
                            <p className="text-lg text-muted-foreground mb-6">
                                ACPSCM is committed to creating an environment
                                where students can explore the beauty of
                                mathematics beyond the classroom. We believe
                                that mathematics is not just about numbers, but
                                about logical thinking, problem-solving, and
                                creative reasoning.
                            </p>
                            <p className="text-lg text-muted-foreground">
                                Through workshops, competitions, and
                                collaborative projects, we aim to build
                                confident mathematicians who can tackle complex
                                challenges and contribute to their academic and
                                professional success.
                            </p>
                        </div>
                        <GlassCard className="p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Calculator className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">Join Our Community</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Be part of a dynamic group of math
                                    enthusiasts
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div>
                                        <div className="text-2xl font-bold text-primary">
                                            150+
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Members
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-primary">
                                            25+
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Events
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-primary">
                                            5
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Years
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <SectionHeader
                        title="Our Core Values"
                        subtitle="The principles that guide everything we do at ACPSCM"
                        className="mb-12"
                    />

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <GlassCard
                                key={index}
                                className="text-center p-6"
                            >
                                <div className="pb-4">
                                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                        <value.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {value.title}
                                    </h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {value.description}
                                </p>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Constitution Section */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <Badge variant="secondary" className="mb-4 border-white/[0.08] bg-white/[0.04] text-muted-foreground">
                            Official Document
                        </Badge>
                        <SectionHeader
                            title="ACPSCM Constitution"
                            subtitle="Our constitution outlines the fundamental principles, structure, and governance that guide ACPSCM in achieving its mission and objectives."
                        />
                    </div>

                    <GlassCard glow className="max-w-2xl mx-auto p-8">
                        <div className="text-center pb-6">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
                                <FileText className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-semibold text-foreground mb-2">
                                Official Constitution
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Read our complete constitution document
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-muted-foreground mb-6">
                                This document contains our club&apos;s bylaws, membership guidelines,
                                executive roles and responsibilities, meeting procedures, and all
                                governing policies that ensure transparent and effective leadership.
                            </p>
                            <Button
                                size="lg"
                                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 h-auto"
                                asChild
                            >
                                <a
                                    href="https://vwkhuivnxctstkhzrext.supabase.co/storage/v1/object/public/public_bucket/The%20Constitution%20of%20ACPSCM%20Vol%200_1.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2"
                                >
                                    <FileText className="h-5 w-5" />
                                    View Constitution
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </GlassCard>
                </div>
            </section>

            {/* History Section */}
            <section className="py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <SectionHeader
                        title="Our Journey"
                        className="mb-12"
                    />

                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-24 text-right">
                                <Badge variant="outline" className="border-white/[0.08] text-muted-foreground">2018</Badge>
                            </div>
                            <div className="flex-grow border-l-2 border-white/[0.08] pl-6 pb-8">
                                <h3 className="font-semibold text-foreground mb-2">
                                    Foundation
                                </h3>
                                <p className="text-muted-foreground">
                                    ACPSCM was founded by a group of passionate
                                    mathematics enthusiasts at Adamjee
                                    Cantonment Public School.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-24 text-right">
                                <Badge variant="outline" className="border-white/[0.08] text-muted-foreground">2021</Badge>
                            </div>
                            <div className="flex-grow border-l-2 border-white/[0.08] pl-6 pb-8">
                                <h3 className="font-semibold text-foreground mb-2">
                                    First Competition
                                </h3>
                                <p className="text-muted-foreground">
                                    Organized our first inter-school mathematics
                                    competition, attracting participants from
                                    across the region.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-24 text-right">
                                <Badge variant="outline" className="border-white/[0.08] text-muted-foreground">2023</Badge>
                            </div>
                            <div className="flex-grow border-l-2 border-white/[0.08] pl-6 pb-8">
                                <h3 className="font-semibold text-foreground mb-2">
                                    National Recognition
                                </h3>
                                <p className="text-muted-foreground">
                                    Our members won top positions in national
                                    mathematics olympiads and competitions.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-24 text-right">
                                <Badge variant="default">2025</Badge>
                            </div>
                            <div className="flex-grow pl-6">
                                <h3 className="font-semibold text-foreground mb-2">
                                    Digital Platform Launch
                                </h3>
                                <p className="text-muted-foreground">
                                    Launched our comprehensive digital platform
                                    to better serve our growing community of
                                    mathematics enthusiasts.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Executives Section */}
            <section className="py-24 px-4 relative">
                <AmbientGlow position="top-right" size="lg" />
                <div className="max-w-7xl mx-auto relative">
                    <SectionHeader
                        title="Our Leadership"
                        subtitle="Meet the dedicated individuals who have shaped and continue to lead ACPSCM"
                        className="mb-12"
                    />

                    {tabsList.length > 0 ? (
                        <Tabs defaultValue={tabsList[0]?.value || "founders"} className="w-full">
                            <TabsList className="w-full justify-center flex-wrap h-auto p-2 mb-8 bg-transparent border-0">
                                {tabsList.map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="m-1 bg-white/[0.04] border border-white/[0.08] text-muted-foreground rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary"
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {/* Session-based Tabs */}
                            {sessions.map((session) => (
                                <TabsContent key={session} value={session} className="space-y-8">
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {(membersBySession[session] || []).map((member) => (
                                            <MemberCard key={member.id} member={member} />
                                        ))}
                                    </div>
                                    {(membersBySession[session] || []).length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground">
                                                No members found for Session {session}.
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>
                            ))}

                            {/* Founders Tab */}
                            <TabsContent value="founders" className="space-y-8">
                                <div className="text-center mb-8">
                                    <Badge variant="secondary" className="mb-4 border-white/[0.08] bg-white/[0.04] text-muted-foreground">
                                        Legacy Leaders
                                    </Badge>
                                    <h3 className="text-2xl font-bold text-foreground mb-2">
                                        The Visionaries
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Honoring those who laid the foundation of
                                        ACPSCM
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                                    {founders.map((founder) => (
                                        <FounderCard key={founder.id} member={founder} />
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="text-center py-16">
                            <div className="max-w-md mx-auto">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    Leadership Information Coming Soon
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    We&apos;re currently updating our leadership information.
                                    Please check back soon to meet our amazing team of executives and founders.
                                </p>
                                <Badge variant="outline" className="border-white/[0.08] text-muted-foreground">
                                    Update in Progress
                                </Badge>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <Contributors />

            <Footer />
        </main>
    );
}
