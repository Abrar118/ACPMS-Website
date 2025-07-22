"use client";

import Footer from "@/components/home/Footer";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    BookOpen,
    Download,
    ExternalLink,
    Calendar,
    Eye,
    FileText,
    Star,
    Search,
    Filter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";

export default function MagazinePage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedYear, setSelectedYear] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    
    const ITEMS_PER_PAGE = 6;

    const magazines = [
        {
            id: 1,
            title: "The Math Explorer",
            subtitle: "Journey Through Mathematical Concepts",
            description:
                "A journey through fascinating mathematical concepts and challenging puzzles.",
            volume: "Volume 1",
            issue: "Issue 1",
            year: "2024",
            coverImage:
                "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=600&fit=crop&crop=center&auto=format",
            pages: 24,
            downloads: "1.2k",
            rating: 4.8,
            featured: true,
            topics: ["Calculus", "Geometry", "Number Theory"],
        },
        {
            id: 2,
            title: "Numerical Insights",
            subtitle: "Exploring Numbers and Their Applications",
            description:
                "Exploring the vast and intricate world of numbers and their practical applications.",
            volume: "Volume 1",
            issue: "Issue 2",
            year: "2024",
            coverImage:
                "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400&h=600&fit=crop&crop=center&auto=format",
            pages: 28,
            downloads: "956",
            rating: 4.7,
            featured: false,
            topics: ["Statistics", "Probability", "Data Analysis"],
        },
        {
            id: 3,
            title: "Geometry Gems",
            subtitle: "Hidden Beauty of Shapes",
            description:
                "Unveiling the hidden beauty of shapes, from classic theorems to modern geometry.",
            volume: "Volume 2",
            issue: "Issue 1",
            year: "2024",
            coverImage:
                "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=600&fit=crop&crop=center&auto=format",
            pages: 32,
            downloads: "1.5k",
            rating: 4.9,
            featured: true,
            topics: [
                "Euclidean Geometry",
                "Trigonometry",
                "Coordinate Geometry",
            ],
        },
        {
            id: 4,
            title: "Algebraic Adventures",
            subtitle: "Adventures in Abstract Thinking",
            description:
                "Embark on exciting adventures in algebraic thinking and problem solving.",
            volume: "Volume 2",
            issue: "Issue 2",
            year: "2024",
            coverImage:
                "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=600&fit=crop&crop=center&auto=format",
            pages: 30,
            downloads: "823",
            rating: 4.6,
            featured: false,
            topics: ["Linear Algebra", "Abstract Algebra", "Equations"],
        },
        {
            id: 5,
            title: "Calculus Chronicles",
            subtitle: "From Origins to Modern Applications",
            description:
                "Detailed chronicles of calculus, from its origins to modern applications.",
            volume: "Volume 3",
            issue: "Issue 1",
            year: "2023",
            coverImage:
                "https://images.unsplash.com/photo-1518932945647-7a1c969f8be2?w=400&h=600&fit=crop&crop=center&auto=format",
            pages: 36,
            downloads: "2.1k",
            rating: 5.0,
            featured: true,
            topics: [
                "Differential Calculus",
                "Integral Calculus",
                "Applications",
            ],
        },
        {
            id: 6,
            title: "Discrete Discoveries",
            subtitle: "New Frontiers in Discrete Mathematics",
            description:
                "Make new discoveries in the field of discrete mathematics.",
            volume: "Volume 3",
            issue: "Issue 2",
            year: "2023",
            coverImage:
                "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=600&fit=crop&crop=center&auto=format",
            pages: 26,
            downloads: "674",
            rating: 4.5,
            featured: false,
            topics: ["Graph Theory", "Combinatorics", "Logic"],
        },
    ];

    const years = ["all", "2024", "2023", "2022", "2021"];

    // Filter magazines based on search, year, and tab
    const filteredMagazines = useMemo(() => {
        let filtered = magazines;

        // Filter by tab (all or featured)
        if (activeTab === "featured") {
            filtered = filtered.filter((mag) => mag.featured);
        }

        // Filter by year
        if (selectedYear !== "all") {
            filtered = filtered.filter((mag) => mag.year === selectedYear);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((mag) =>
                mag.title.toLowerCase().includes(query) ||
                mag.subtitle.toLowerCase().includes(query) ||
                mag.description.toLowerCase().includes(query) ||
                mag.topics.some(topic => topic.toLowerCase().includes(query))
            );
        }

        return filtered;
    }, [magazines, activeTab, selectedYear, searchQuery]);

    // Pagination logic
    const totalPages = Math.ceil(filteredMagazines.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedMagazines = filteredMagazines.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Reset to first page when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [activeTab, selectedYear, searchQuery]);

    const featuredMagazines = magazines.filter((mag) => mag.featured);

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/5">
                <div className="max-w-6xl mx-auto text-center">
                    <Badge variant="secondary" className="mb-4">
                        <BookOpen className="w-3 h-3 mr-1" />
                        Digital Publications
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Math Club Magazine
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Explore our collection of magazines, each filled with
                        fascinating mathematical insights, puzzles, and
                        articles. Dive into the world of numbers and discover
                        the beauty of mathematics.
                    </p>
                    
                    {/* Search Bar */}
                    <div className="max-w-md mx-auto relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input 
                            placeholder="Search magazines, topics, or descriptions..." 
                            className="pl-10 pr-4 py-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* Filter Section */}
            <section className="py-8 px-4 border-b bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">
                                Filter by Year:
                            </span>
                        </div>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="All Years" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Years</SelectItem>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2023">2023</SelectItem>
                                <SelectItem value="2022">2022</SelectItem>
                                <SelectItem value="2021">2021</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        {(searchQuery || selectedYear !== "all") && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedYear("all");
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}
                        
                        <div className="text-sm text-muted-foreground">
                            {filteredMagazines.length} magazine{filteredMagazines.length !== 1 ? 's' : ''} found
                        </div>
                    </div>
                </div>
            </section>

            {/* Magazine Collection */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex items-center justify-between mb-8">
                            <TabsList className="grid w-fit grid-cols-2">
                                <TabsTrigger value="all">
                                    All Issues
                                </TabsTrigger>
                                <TabsTrigger value="featured">
                                    Featured
                                </TabsTrigger>
                            </TabsList>
                            <Badge
                                variant="destructive"
                                className="animate-pulse"
                            >
                                Latest Issue Available
                            </Badge>
                        </div>

                        <TabsContent value="all" className="space-y-8">
                            {paginatedMagazines.length > 0 ? (
                                <>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                        {paginatedMagazines.map((magazine: any) => (
                                            <Card
                                                key={magazine.id}
                                                className="overflow-hidden hover:shadow-xl transition-all duration-300 group"
                                            >
                                                <div className="relative">
                                                    <div className="aspect-[3/4] relative overflow-hidden">
                                                        <Image
                                                            src={magazine.coverImage}
                                                            alt={magazine.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                        <div className="absolute top-4 right-4">
                                                            {magazine.featured && (
                                                                <Badge
                                                                    variant="default"
                                                                    className="bg-yellow-500 text-yellow-50"
                                                                >
                                                                    <Star className="w-3 h-3 mr-1" />
                                                                    Featured
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="absolute bottom-4 left-4 right-4">
                                                            <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                                                                {magazine.title}
                                                            </h3>
                                                            <p className="text-white/90 text-sm line-clamp-1">
                                                                {magazine.subtitle}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <CardHeader className="pb-4">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="outline">
                                                            {magazine.volume},{" "}
                                                            {magazine.issue}
                                                        </Badge>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-sm font-medium">
                                                                {magazine.rating}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <CardDescription className="text-sm leading-relaxed line-clamp-3">
                                                        {magazine.description}
                                                    </CardDescription>
                                                </CardHeader>

                                                <CardContent className="pt-0">
                                                    <div className="flex flex-wrap gap-1 mb-4 max-h-16 overflow-hidden">
                                                        {magazine.topics.map(
                                                            (topic: string, index: number) => (
                                                                <Badge
                                                                    key={index}
                                                                    variant="secondary"
                                                                    className="text-xs whitespace-nowrap"
                                                                >
                                                                    {topic}
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-1">
                                                                <FileText className="w-4 h-4" />
                                                                <span>
                                                                    {magazine.pages}{" "}
                                                                    pages
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Download className="w-4 h-4" />
                                                                <span>
                                                                    {magazine.downloads}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{magazine.year}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="flex-1"
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Read Online
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            <Download className="w-4 h-4 mr-2" />
                                                            PDF
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    
                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center mt-8">
                                            <Pagination>
                                                <PaginationContent>
                                                    <PaginationItem>
                                                        <PaginationPrevious 
                                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                        />
                                                    </PaginationItem>
                                                    
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                        <PaginationItem key={page}>
                                                            <PaginationLink 
                                                                onClick={() => setCurrentPage(page)}
                                                                isActive={currentPage === page}
                                                                className="cursor-pointer"
                                                            >
                                                                {page}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    ))}
                                                    
                                                    <PaginationItem>
                                                        <PaginationNext 
                                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                        />
                                                    </PaginationItem>
                                                </PaginationContent>
                                            </Pagination>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No magazines found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Try adjusting your search or filter criteria
                                    </p>
                                    <Button 
                                        variant="outline"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSelectedYear("all");
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="featured" className="space-y-8">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold mb-2">
                                    Featured Publications
                                </h3>
                                <p className="text-muted-foreground">
                                    Our most popular and highly-rated magazine
                                    issues
                                </p>
                            </div>

                            {featuredMagazines.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {featuredMagazines.map((magazine: any) => (
                                        <Card
                                            key={magazine.id}
                                            className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 border-primary/20"
                                        >
                                            <div className="relative">
                                                <div className="aspect-[3/4] relative overflow-hidden">
                                                    <Image
                                                        src={magazine.coverImage}
                                                        alt={magazine.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                    <div className="absolute top-4 right-4">
                                                        <Badge
                                                            variant="default"
                                                            className="bg-yellow-500 text-yellow-50"
                                                        >
                                                            <Star className="w-3 h-3 mr-1" />
                                                            Featured
                                                        </Badge>
                                                    </div>
                                                    <div className="absolute bottom-4 left-4 right-4">
                                                        <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                                                            {magazine.title}
                                                        </h3>
                                                        <p className="text-white/90 text-sm line-clamp-1">
                                                            {magazine.subtitle}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <CardHeader className="pb-4">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="default">
                                                        {magazine.volume},{" "}
                                                        {magazine.issue}
                                                    </Badge>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="text-sm font-medium">
                                                            {magazine.rating}
                                                        </span>
                                                    </div>
                                                </div>
                                                <CardDescription className="text-sm leading-relaxed line-clamp-3">
                                                    {magazine.description}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent className="pt-0">
                                                <div className="flex flex-wrap gap-1 mb-4 max-h-16 overflow-hidden">
                                                    {magazine.topics.map(
                                                        (topic: string, index: number) => (
                                                            <Badge
                                                                key={index}
                                                                variant="secondary"
                                                                className="text-xs whitespace-nowrap"
                                                            >
                                                                {topic}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1">
                                                            <FileText className="w-4 h-4" />
                                                            <span>
                                                                {magazine.pages}{" "}
                                                                pages
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Download className="w-4 h-4" />
                                                            <span>
                                                                {magazine.downloads}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{magazine.year}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="flex-1"
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Read Online
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <Download className="w-4 h-4 mr-2" />
                                                        PDF
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No featured magazines found</h3>
                                    <p className="text-muted-foreground">
                                        Check back later for featured content
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 px-4 bg-muted/50">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Want to Contribute?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        We're always looking for talented writers and
                        mathematicians to contribute to our magazine. Share your
                        mathematical insights, research, or creative
                        problem-solving approaches with our community.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" asChild>
                            <Link href="/contact">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Submit Article
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/resources">
                                <BookOpen className="w-4 h-4 mr-2" />
                                Browse Resources
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
