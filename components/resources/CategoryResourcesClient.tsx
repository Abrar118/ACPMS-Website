'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ViewerModal from "@/components/shared/ViewerModal";
import { 
    BookOpen, 
    ExternalLink, 
    FileText, 
    Video, 
    Calculator,
    Search,
    Eye,
    ArrowLeft,
    Filter
} from "lucide-react";
import { EResourceCategory, EResourceType, EResourceLevel } from "@/components/shared/enums";
import type { ResourceRow } from "@/queries/resources";
import { incrementViewCount } from "@/actions/resources";

interface CategoryResourcesClientProps {
    resources: ResourceRow[];
    category: string;
    categoryName: string;
}

export default function CategoryResourcesClient({ 
    resources, 
    category, 
    categoryName 
}: CategoryResourcesClientProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLevel, setSelectedLevel] = useState<string>("all");
    const [viewerModal, setViewerModal] = useState(false);
    const [currentViewUrl, setCurrentViewUrl] = useState("");

    const getIcon = (category: string) => {
        switch (category) {
            case EResourceCategory["Problem Set"]:
                return Calculator;
            case EResourceCategory["Video Lecture"]:
                return Video;
            case EResourceCategory["Reference Material"]:
                return BookOpen;
            case EResourceCategory["Past Paper"]:
                return FileText;
            default:
                return BookOpen;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case EResourceType.Pdf:
            case EResourceType.Document:
                return FileText;
            case EResourceType.Video:
                return Video;
            case EResourceType.Link:
                return ExternalLink;
            default:
                return FileText;
        }
    };

    const getCategoryDescription = (category: string) => {
        switch (category) {
            case EResourceCategory["Problem Set"]:
                return "Curated problem collections for practice and skill development";
            case EResourceCategory["Video Lecture"]:
                return "Educational videos and comprehensive tutorials";
            case EResourceCategory["Reference Material"]:
                return "Quick reference guides, formulas, and cheat sheets";
            case EResourceCategory["Past Paper"]:
                return "Previous competition and examination papers";
            default:
                return "Learning resources";
        }
    };

    const handleViewResource = (url: string, resourceId?: string) => {
        if (!url) return;
        
        // Increment view count
        if (resourceId) {
            incrementViewCount(resourceId).catch(console.error);
        }
        
        setCurrentViewUrl(url);
        setViewerModal(true);
    };

    const formatViews = (viewCount: number | null) => {
        if (!viewCount) return "0";
        if (viewCount < 1000) return viewCount.toString();
        return `${(viewCount / 1000).toFixed(1)}k`;
    };

    // Filter resources based on search term and level
    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesLevel = selectedLevel === "all" || 
            resource.levels?.some(level => level === selectedLevel);

        return matchesSearch && matchesLevel;
    });

    const CategoryIcon = getIcon(category);

    // Get unique levels from resources
    const availableLevels = Array.from(
        new Set(resources.flatMap(resource => resource.levels || []))
    ).sort();

    return (
        <>
            {/* Header Section */}
            <section className="pt-24 pb-8 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/5">
                <div className="max-w-6xl mx-auto">
                    {/* Breadcrumb */}
                    <Breadcrumb className="mb-6">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink 
                                    href="/resources"
                                    className="flex items-center gap-1"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Resources
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <span className="flex items-center gap-1">
                                    <CategoryIcon className="w-4 h-4" />
                                    {categoryName}
                                </span>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    {/* Back Button */}
                    <Button 
                        variant="ghost" 
                        className="mb-4 p-2 h-auto"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Resources
                    </Button>

                    {/* Category Header */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <CategoryIcon className="w-8 h-8 text-primary" />
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                {categoryName}
                            </h1>
                        </div>
                        <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                            {getCategoryDescription(category)}
                        </p>
                        
                        <Badge variant="secondary" className="mb-4">
                            {resources.length} resources available
                        </Badge>
                    </div>
                </div>
            </section>

            {/* Filters Section */}
            <section className="py-6 px-4 border-b">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input 
                                placeholder="Search resources..." 
                                className="pl-10 pr-4 py-2"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Level Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <Select
                                value={selectedLevel}
                                onValueChange={setSelectedLevel}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Levels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    {availableLevels.map(level => (
                                        <SelectItem key={level} value={level}>{level}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Resources Grid */}
            <section className="py-8 px-4 min-h-[60vh]">
                <div className="max-w-6xl mx-auto">
                    {filteredResources.length === 0 ? (
                        <div className="text-center py-16">
                            <CategoryIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No resources found</h3>
                            <p className="text-muted-foreground">
                                {searchTerm || selectedLevel !== "all" 
                                    ? "Try adjusting your search or filter criteria."
                                    : "No resources are available in this category yet."
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredResources.map((resource) => {
                                const TypeIcon = getTypeIcon(resource.resource_type);
                                return (
                                    <Card key={resource.id} className="hover:shadow-lg transition-shadow h-full">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <Badge variant={resource.resource_type === EResourceType.Pdf ? 'default' : 'secondary'}>
                                                    <TypeIcon className="w-3 h-3 mr-1" />
                                                    {resource.resource_type.charAt(0).toUpperCase() + resource.resource_type.slice(1)}
                                                </Badge>
                                                {resource.is_featured && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Featured
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-lg line-clamp-1">{resource.title}</CardTitle>
                                            {resource.description && (
                                                <CardDescription className="line-clamp-3">
                                                    {resource.description}
                                                </CardDescription>
                                            )}
                                        </CardHeader>
                                        <CardContent className="flex flex-col h-full">
                                            {/* Metadata */}
                                            <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-4 h-4" />
                                                    {formatViews(resource.view_count)} views
                                                </div>
                                                {resource.author && (
                                                    <div className="text-xs">
                                                        by {resource.author}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Levels */}
                                            {resource.levels && resource.levels.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {resource.levels.map((level, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                            {level}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Tags */}
                                            {resource.tags && resource.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {resource.tags.slice(0, 3).map((tag, idx) => (
                                                        <Badge key={idx} variant="secondary" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {resource.tags.length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{resource.tags.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2 mt-auto">
                                                <Button 
                                                    className="flex-1"
                                                    onClick={() => handleViewResource(resource.resource_url || "", resource.id)}
                                                    disabled={!resource.resource_url}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="icon"
                                                    onClick={() => window.open(resource.resource_url || "", '_blank')}
                                                    disabled={!resource.resource_url}
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <ViewerModal 
                state={viewerModal}
                setState={setViewerModal}
                link={currentViewUrl}
            />
        </>
    );
}
