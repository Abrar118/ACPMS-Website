import Footer from "@/components/home/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    BookOpen, 
    Download, 
    ExternalLink, 
    FileText, 
    Video, 
    Calculator,
    Search,
    Star,
    Clock,
    Upload
} from "lucide-react";

export default function ResourcesPage() {
    const featuredResources = [
        {
            title: "Advanced Calculus Problem Set",
            description: "Comprehensive collection of calculus problems with detailed solutions",
            type: "PDF",
            category: "Problem Sets",
            downloads: "1.2k",
            rating: 4.8,
            recent: true
        },
        {
            title: "Linear Algebra Video Series",
            description: "Complete video course covering linear algebra from basics to advanced",
            type: "Video",
            category: "Video Lectures",
            downloads: "856",
            rating: 4.9,
            recent: false
        },
        {
            title: "Statistics Formula Reference",
            description: "Quick reference guide for all essential statistics formulas",
            type: "PDF",
            category: "Reference",
            downloads: "2.1k",
            rating: 4.7,
            recent: true
        }
    ];

    const categories = [
        {
            name: "Problem Sets",
            description: "Curated problem collections for practice",
            icon: Calculator,
            count: 25,
            resources: [
                { title: "Olympiad Geometry Problems", type: "PDF", level: "Advanced" },
                { title: "Number Theory Practice", type: "PDF", level: "Intermediate" },
                { title: "Algebra Fundamentals", type: "PDF", level: "Beginner" },
                { title: "Combinatorics Challenges", type: "PDF", level: "Advanced" }
            ]
        },
        {
            name: "Video Lectures",
            description: "Educational videos and tutorials",
            icon: Video,
            count: 18,
            resources: [
                { title: "Calculus Fundamentals", type: "Video", level: "Intermediate" },
                { title: "Discrete Mathematics", type: "Video", level: "Advanced" },
                { title: "Basic Probability", type: "Video", level: "Beginner" },
                { title: "Graph Theory Intro", type: "Video", level: "Intermediate" }
            ]
        },
        {
            name: "Reference Materials",
            description: "Quick reference guides and cheat sheets",
            icon: BookOpen,
            count: 12,
            resources: [
                { title: "Trigonometry Formulas", type: "PDF", level: "All Levels" },
                { title: "Derivative Rules", type: "PDF", level: "All Levels" },
                { title: "Geometric Theorems", type: "PDF", level: "All Levels" },
                { title: "Mathematical Symbols", type: "PDF", level: "All Levels" }
            ]
        },
        {
            name: "Past Papers",
            description: "Previous competition and exam papers",
            icon: FileText,
            count: 30,
            resources: [
                { title: "2024 Math Olympiad", type: "PDF", level: "Competition" },
                { title: "2023 Regional Contest", type: "PDF", level: "Competition" },
                { title: "2024 School Championship", type: "PDF", level: "Competition" },
                { title: "2023 International Round", type: "PDF", level: "Competition" }
            ]
        }
    ];

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/5">
                <div className="max-w-6xl mx-auto text-center">
                    <Badge variant="secondary" className="mb-4">
                        <BookOpen className="w-3 h-3 mr-1" />
                        Learning Resources
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Mathematical Resources
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Access our comprehensive collection of mathematical learning materials, 
                        problem sets, video lectures, and reference guides.
                    </p>
                    
                    {/* Search Bar */}
                    <div className="max-w-md mx-auto relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input 
                            placeholder="Search resources..." 
                            className="pl-10 pr-4 py-2"
                        />
                    </div>
                </div>
            </section>

            {/* Featured Resources */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold">Featured Resources</h2>
                        <Badge variant="destructive" className="animate-pulse">
                            Recently Updated
                        </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredResources.map((resource, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <Badge variant={resource.type === 'PDF' ? 'default' : 'secondary'}>
                                            {resource.type === 'PDF' ? <FileText className="w-3 h-3 mr-1" /> : <Video className="w-3 h-3 mr-1" />}
                                            {resource.type}
                                        </Badge>
                                        {resource.recent && (
                                            <Badge variant="destructive" className="text-xs">
                                                <Clock className="w-3 h-3 mr-1" />
                                                New
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                                    <CardDescription>{resource.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Download className="w-4 h-4" />
                                                {resource.downloads}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                {resource.rating}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button className="flex-1">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                        <Button variant="outline" size="icon">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Resource Categories */}
            <section className="py-16 px-4 bg-muted/50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
                    
                    <Tabs defaultValue="Problem Sets" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                            {categories.map((category) => (
                                <TabsTrigger key={category.name} value={category.name} className="text-xs lg:text-sm">
                                    <category.icon className="w-4 h-4 mr-1" />
                                    {category.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        
                        {categories.map((category) => (
                            <TabsContent key={category.name} value={category.name} className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <category.icon className="w-5 h-5" />
                                                    {category.name}
                                                </CardTitle>
                                                <CardDescription>{category.description}</CardDescription>
                                            </div>
                                            <Badge variant="secondary">{category.count} resources</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {category.resources.map((resource, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        {resource.type === 'PDF' ? (
                                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                                        ) : (
                                                            <Video className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-sm">{resource.title}</p>
                                                            <p className="text-xs text-muted-foreground">{resource.level}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant="ghost">
                                                            <Download className="w-3 h-3" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost">
                                                            <ExternalLink className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 text-center">
                                            <Button variant="outline">
                                                View All {category.name}
                                                <ExternalLink className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </section>

            {/* Contribution Section */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">Contribute to Our Resource Library</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Help grow our community by sharing your mathematical knowledge and resources. 
                        Whether it's a problem set, tutorial, or reference material, every contribution helps.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg">
                            <Upload className="w-4 h-4 mr-2" />
                            Submit Resource
                        </Button>
                        <Button size="lg" variant="outline">
                            Contribution Guidelines
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
