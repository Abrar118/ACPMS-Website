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
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
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

    const founders = [
        {
            name: "Tamzid Rahman",
            position: "Founding President",
            batch: "2018",
            image: "/avatars/tamzid.jpg",
            bio: "Pioneered the mathematics club with a vision to create a community of passionate problem solvers.",
            email: "tamzid.ahmed@example.com",
            linkedin: "#",
        },
        {
            name: "Tazrif Raim",
            position: "Founding Vice President",
            batch: "2018",
            image: "/avatars/raim.jpg",
            bio: "Co-founded ACPSCM and established the first inter-school mathematics competition.",
            email: "tazrif.raim@example.com",
            linkedin: "#",
        },
        {
            name: "Abrar Mahir Esam",
            position: "Founding General Secretary",
            batch: "2018",
            image: "/avatars/abrar.jpg",
            bio: "Instrumental in developing the club's academic framework and competition structure.",
            email: "abrar.mahir@example.com",
            linkedin: "#",
        },
    ];

    const currentExecutives = [
        {
            name: "Sarah Ahmed",
            position: "President",
            batch: "2025",
            image: "/avatars/exec1.jpg",
            bio: "Leading ACPSCM towards digital innovation and expanding our reach to more students.",
            email: "sarah.ahmed@example.com",
            linkedin: "#",
        },
        {
            name: "Omar Rahman",
            position: "Vice President",
            batch: "2025",
            image: "/avatars/exec2.jpg",
            bio: "Focusing on competitive mathematics and olympiad training programs.",
            email: "omar.rahman@example.com",
            linkedin: "#",
        },
        {
            name: "Aisha Malik",
            position: "Secretary",
            batch: "2026",
            image: "/avatars/exec3.jpg",
            bio: "Managing club operations and coordinating events and workshops.",
            email: "aisha.malik@example.com",
            linkedin: "#",
        },
        {
            name: "Hassan Raza",
            position: "Treasurer",
            batch: "2026",
            image: "/avatars/exec4.jpg",
            bio: "Overseeing financial planning and resource allocation for club activities.",
            email: "hassan.raza@example.com",
            linkedin: "#",
        },
        {
            name: "Zara Iqbal",
            position: "Event Coordinator",
            batch: "2027",
            image: "/avatars/exec5.jpg",
            bio: "Organizing workshops, competitions, and special mathematical events.",
            email: "zara.iqbal@example.com",
            linkedin: "#",
        },
        {
            name: "Ali Zaman",
            position: "Public Relations",
            batch: "2027",
            image: "/avatars/exec6.jpg",
            bio: "Building partnerships with other institutions and promoting ACPSCM's mission.",
            email: "ali.zaman@example.com",
            linkedin: "#",
        },
    ];

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/5">
                <div className="max-w-4xl mx-auto text-center">
                    <Badge variant="secondary" className="mb-4">
                        Est. 2020
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

            {/* History Section */}
            <section className="py-16 px-4">
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
            <section className="py-16 px-4 bg-muted/50">
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

                    <Tabs defaultValue="current" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="current">
                                Current Executives
                            </TabsTrigger>
                            <TabsTrigger value="founders">Founders</TabsTrigger>
                        </TabsList>

                        <TabsContent value="current" className="space-y-8">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentExecutives.map((executive, index) => (
                                    <Card
                                        key={index}
                                        className="hover:shadow-lg transition-all duration-300 group"
                                    >
                                        <CardHeader className="text-center pb-4">
                                            <Avatar className="w-20 h-20 mx-auto mb-4 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                                                <AvatarImage
                                                    src={executive.image}
                                                    alt={executive.name}
                                                />
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                                                    {executive.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <CardTitle className="text-lg">
                                                {executive.name}
                                            </CardTitle>
                                            <CardDescription className="font-medium text-primary">
                                                {executive.position}
                                            </CardDescription>
                                            <Badge
                                                variant="outline"
                                                className="w-fit mx-auto"
                                            >
                                                Batch {executive.batch}
                                            </Badge>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <p className="text-sm text-muted-foreground mb-4 text-center">
                                                {executive.bio}
                                            </p>
                                            <div className="flex justify-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Mail className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Linkedin className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

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
                                {founders.map((founder, index) => (
                                    <Card
                                        key={index}
                                        className="hover:shadow-lg transition-all duration-300 group border-2 border-primary/10"
                                    >
                                        <CardHeader className="text-center pb-4">
                                            <Avatar className="w-24 h-24 mx-auto mb-4 ring-2 ring-primary/30 group-hover:ring-primary/50 transition-all">
                                                <AvatarImage
                                                    src={founder.image}
                                                    alt={founder.name}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
                                                    {founder.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <CardTitle className="text-xl">
                                                {founder.name}
                                            </CardTitle>
                                            <CardDescription className="font-semibold text-primary text-base">
                                                {founder.position}
                                            </CardDescription>
                                            <Badge
                                                variant="default"
                                                className="w-fit mx-auto"
                                            >
                                                Batch {founder.batch}
                                            </Badge>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <p className="text-sm text-muted-foreground mb-4 text-center">
                                                {founder.bio}
                                            </p>
                                            <div className="flex justify-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Mail className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Linkedin className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            <Footer />
        </main>
    );
}
