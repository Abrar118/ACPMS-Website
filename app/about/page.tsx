import Footer from "@/components/home/Footer";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import createSupabaseServer from "@/utils/supabase/supabase-server";
import { getMembersBySession, getUniqueSessions } from "@/queries/members";
import type { MemberRow } from "@/queries/members";

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
function MemberCard({ member }: { member: MemberRow }) {
    return (
        <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="text-center pb-4">
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
                <CardTitle className="text-lg">
                    {member.name}
                </CardTitle>
                {member.designation && (
                    <CardDescription className="font-medium text-primary">
                        {member.designation}
                    </CardDescription>
                )}
                {member.position && (
                    <CardDescription className="font-medium text-muted-foreground">
                        {member.position}
                    </CardDescription>
                )}
                {member.session && member.session !== "Moderators" && (
                    <Badge
                        variant="outline"
                        className="w-fit mx-auto"
                    >
                        {`Session ${member.session}`}
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="pt-0">
                {member.bio && (
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                        {member.bio}
                    </p>
                )}
                <div className="flex justify-center space-x-2">
                    {member.email && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            asChild
                        >
                            <a href={`mailto:${member.email}`}>
                                <Mail className="h-3 w-3" />
                            </a>
                        </Button>
                    )}
                    {member.phone && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            asChild
                        >
                            <a href={`tel:${member.phone}`}>
                                <Phone className="h-3 w-3" />
                            </a>
                        </Button>
                    )}
                    {member.linkedin_id_link && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            asChild
                        >
                            <a 
                                href={member.linkedin_id_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                <Linkedin className="h-3 w-3" />
                            </a>
                        </Button>
                    )}
                    {member.facebook_id_link && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            asChild
                        >
                            <a 
                                href={member.facebook_id_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                <Facebook className="h-3 w-3" />
                            </a>
                        </Button>
                    )}
                    {member.instagram_id_link && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            asChild
                        >
                            <a 
                                href={member.instagram_id_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                <Instagram className="h-3 w-3" />
                            </a>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Component for founder card with special styling
function FounderCard({ member }: { member: MemberRow }) {
    return (
        <Card className="hover:shadow-lg transition-all duration-300 group border-2 border-primary/10">
            <CardHeader className="text-center pb-4">
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
                <CardTitle className="text-xl">
                    {member.name}
                </CardTitle>
                {member.position && (
                    <CardDescription className="font-medium text-primary">
                        {member.position}
                    </CardDescription>
                )}
                {member.session && (
                    <Badge
                        variant="default"
                        className="w-fit mx-auto"
                    >
                        Session {member.session}
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="pt-0">
                {member.bio && (
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                        {member.bio}
                    </p>
                )}
                <div className="flex justify-center space-x-2">
                    {member.email && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            asChild
                        >
                            <a href={`mailto:${member.email}`}>
                                <Mail className="h-3 w-3" />
                            </a>
                        </Button>
                    )}
                    {member.linkedin_id_link && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            asChild
                        >
                            <a 
                                href={member.linkedin_id_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                <Linkedin className="h-3 w-3" />
                            </a>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default async function AboutPage() {
    // Fetch data from database for session-based members only
    const supabase = await createSupabaseServer();
    
    const [membersBySessionResult, sessionsResult] = await Promise.all([
        getMembersBySession(supabase),
        getUniqueSessions(supabase)
    ]);

    const membersBySession = membersBySessionResult.success ? membersBySessionResult.data || {} : {};
    const sessions = sessionsResult.success ? sessionsResult.data || [] : [];

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
            <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/5">
                <div className="max-w-4xl mx-auto text-center">
                    <Badge variant="secondary" className="mb-4">
                        Est. 2017
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        About ACPSCM
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        The official Mathematics Club of Adamjee Cantonment
                        Public School, dedicated to nurturing mathematical minds
                        and fostering a love for problem-solving.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">
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
                        <Card className="p-6">
                            <CardHeader className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Calculator className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle>Join Our Community</CardTitle>
                                <CardDescription>
                                    Be part of a dynamic group of math
                                    enthusiasts
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
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
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 px-4 bg-muted/50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            The principles that guide everything we do at ACPSCM
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <Card
                                key={index}
                                className="text-center p-6 hover:shadow-lg transition-shadow"
                            >
                                <CardHeader className="pb-4">
                                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                        <value.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">
                                        {value.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {value.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Constitution Section */}
            <section className="py-16 px-4">
                <div className="min-w-8xl mx-auto">
                    <div className="text-center mb-12">
                        <Badge variant="secondary" className="mb-4">
                            Official Document
                        </Badge>
                        <h2 className="text-3xl font-bold mb-4">
                            ACPSCM Constitution
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                            Our constitution outlines the fundamental principles, structure, 
                            and governance that guide ACPSCM in achieving its mission and objectives.
                        </p>
                    </div>

                    <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/10 hover:border-primary/20 transition-all duration-300">
                        <CardHeader className="text-center pb-6">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
                                <FileText className="h-10 w-10 text-primary" />
                            </div>
                            <CardTitle className="text-2xl mb-2">
                                Official Constitution
                            </CardTitle>
                            <CardDescription className="text-base">
                                Read our complete constitution document
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-muted-foreground mb-6">
                                This document contains our club's bylaws, membership guidelines, 
                                executive roles and responsibilities, meeting procedures, and all 
                                governing policies that ensure transparent and effective leadership.
                            </p>
                            <Button 
                                size="lg" 
                                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-gray-900 font-semibold px-8 py-3 h-auto"
                                asChild
                            >
                                <a 
                                    href="https://drive.google.com/file/d/1pgNEsjNPELy0Q9bL-PL-w9w7ifsfuxn7/view" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2"
                                >
                                    <FileText className="h-5 w-5" />
                                    View Constitution
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* History Section */}
            <section className="py-16 px-4 bg-muted/50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Our Journey
                    </h2>

                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-24 text-right">
                                <Badge variant="outline">2018</Badge>
                            </div>
                            <div className="flex-grow border-l-2 border-muted pl-6 pb-8">
                                <h3 className="font-semibold mb-2">
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
                                <Badge variant="outline">2021</Badge>
                            </div>
                            <div className="flex-grow border-l-2 border-muted pl-6 pb-8">
                                <h3 className="font-semibold mb-2">
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
                                <Badge variant="outline">2023</Badge>
                            </div>
                            <div className="flex-grow border-l-2 border-muted pl-6 pb-8">
                                <h3 className="font-semibold mb-2">
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
                                <h3 className="font-semibold mb-2">
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
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">
                            Our Leadership
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Meet the dedicated individuals who have shaped and
                            continue to lead ACPSCM
                        </p>
                    </div>

                    {tabsList.length > 0 ? (
                        <Tabs defaultValue={tabsList[0]?.value || "founders"} className="w-full">
                            <TabsList className="w-full justify-center flex-wrap h-auto p-2 mb-8">
                                {tabsList.map((tab) => (
                                    <TabsTrigger key={tab.value} value={tab.value} className="m-1">
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
                                    <Badge variant="secondary" className="mb-4">
                                        Legacy Leaders
                                    </Badge>
                                    <h3 className="text-2xl font-bold mb-2">
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
                                <h3 className="text-xl font-semibold mb-2">
                                    Leadership Information Coming Soon
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    We're currently updating our leadership information. 
                                    Please check back soon to meet our amazing team of executives and founders.
                                </p>
                                <Badge variant="outline">
                                    Update in Progress
                                </Badge>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
