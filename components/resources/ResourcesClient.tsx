"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ViewerModal from "@/components/shared/ViewerModal";
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
  Upload,
  Eye,
} from "lucide-react";
import { EResourceCategory, EResourceType } from "@/components/shared/enums";
import type { ResourceRow } from "@/queries/resources";
import { incrementViewCount } from "@/actions/resources";

interface ResourcesClientProps {
  featuredResources: ResourceRow[];
  allResources: ResourceRow[];
}

export default function ResourcesClient({
  featuredResources,
  allResources,
}: ResourcesClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewerModal, setViewerModal] = useState(false);
  const [currentViewUrl, setCurrentViewUrl] = useState("");

  // Group resources by category
  const resourcesByCategory = Object.values(EResourceCategory).reduce(
    (acc, category) => {
      acc[category] = allResources.filter(
        (resource) => resource.category === category
      );
      return acc;
    },
    {} as Record<string, ResourceRow[]>
  );

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

  const handleViewResource = (url: string, resourceId?: string) => {
    if (!url) return;

    // Increment view count
    if (resourceId) {
      incrementViewCount(resourceId).catch(console.error);
    }

    setCurrentViewUrl(url);
    setViewerModal(true);
  };

  const handleViewAllCategory = (category: string) => {
    const categoryKey = Object.keys(EResourceCategory).find(
      (key) =>
        EResourceCategory[key as keyof typeof EResourceCategory] === category
    );
    if (categoryKey) {
      router.push(`/resources/${category}`);
    }
  };

  const formatDownloads = (viewCount: number | null) => {
    if (!viewCount) return "0";
    if (viewCount < 1000) return viewCount.toString();
    return `${(viewCount / 1000).toFixed(1)}k`;
  };

  // Filter resources based on search term
  const filteredFeaturedResources = featuredResources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const categories = Object.values(EResourceCategory).map((categoryValue) => {
    const categoryKey = Object.keys(EResourceCategory).find(
      (key) =>
        EResourceCategory[key as keyof typeof EResourceCategory] ===
        categoryValue
    );
    const resources = resourcesByCategory[categoryValue] || [];
    const filteredResources = resources.filter(
      (resource) =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        resource.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return {
      name: categoryKey || categoryValue,
      value: categoryValue,
      description: getCategoryDescription(categoryValue),
      icon: getIcon(categoryValue),
      count: resources.length,
      resources: filteredResources.slice(0, 4), // Show only first 4 for preview
    };
  });

  function getCategoryDescription(category: string) {
    switch (category) {
      case EResourceCategory["Problem Set"]:
        return "Curated problem collections for practice";
      case EResourceCategory["Video Lecture"]:
        return "Educational videos and tutorials";
      case EResourceCategory["Reference Material"]:
        return "Quick reference guides and cheat sheets";
      case EResourceCategory["Past Paper"]:
        return "Previous competition and exam papers";
      default:
        return "Learning resources";
    }
  }

  return (
    <>
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
            Access our comprehensive collection of mathematical learning
            materials, problem sets, video lectures, and reference guides.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search featured resources..."
              className="pl-10 pr-4 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {filteredFeaturedResources.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No featured resources found.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeaturedResources.map((resource) => {
                const TypeIcon = getTypeIcon(resource.resource_type);
                return (
                  <Card
                    key={resource.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge
                          variant={
                            resource.resource_type === EResourceType.Pdf
                              ? "default"
                              : "secondary"
                          }
                        >
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {resource.resource_type.charAt(0).toUpperCase() +
                            resource.resource_type.slice(1)}
                        </Badge>
                        {resource.is_featured && (
                          <Badge variant="destructive" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg line-clamp-1">
                        {resource.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-4 mt-auto">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {formatDownloads(resource.view_count)}
                          </div>
                          {resource.author && (
                            <div className="text-xs">by {resource.author}</div>
                          )}
                        </div>
                      </div>
                      {resource.levels && resource.levels.length > 0 && (
                        <div className="flex gap-1 mb-4">
                          {resource.levels.map((level, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {level}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() =>
                            handleViewResource(
                              resource.resource_url || "",
                              resource.id
                            )
                          }
                          disabled={!resource.resource_url}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            window.open(resource.resource_url || "", "_blank")
                          }
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

      {/* Resource Categories */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Browse by Category
          </h2>

          <Tabs
            defaultValue={EResourceCategory["Problem Set"]}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.value}
                  value={category.value}
                  className="text-xs lg:text-sm"
                >
                  <category.icon className="w-4 h-4 mr-1" />
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent
                key={category.value}
                value={category.value}
                className="mt-6"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <category.icon className="w-5 h-5" />
                          {category.name}
                        </CardTitle>
                        <CardDescription>
                          {category.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {category.count} resources
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {category.resources.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No resources found in this category.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          {category.resources.map((resource) => {
                            const TypeIcon = getTypeIcon(
                              resource.resource_type
                            );
                            return (
                              <div
                                key={resource.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <TypeIcon className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium text-sm">
                                      {resource.title}
                                    </p>
                                    <div className="flex gap-1 mt-1">
                                      {resource.levels
                                        ?.slice(0, 2)
                                        .map((level, idx) => (
                                          <span
                                            key={idx}
                                            className="text-xs text-muted-foreground"
                                          >
                                            {level}
                                            {idx <
                                              (resource.levels?.length || 0) -
                                                1 && idx < 1
                                              ? ","
                                              : ""}
                                          </span>
                                        ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleViewResource(
                                        resource.resource_url || "",
                                        resource.id
                                      )
                                    }
                                    disabled={!resource.resource_url}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      window.open(
                                        resource.resource_url || "",
                                        "_blank"
                                      )
                                    }
                                    disabled={!resource.resource_url}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-6 text-center">
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleViewAllCategory(category.value)
                            }
                          >
                            View All {category.name}
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </>
                    )}
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
          <h2 className="text-3xl font-bold mb-6">
            Contribute to Our Resource Library
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Help grow our community by sharing your mathematical knowledge and
            resources. Whether it's a problem set, tutorial, or reference
            material, every contribution helps.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <Button size="lg">
                            <Upload className="w-4 h-4 mr-2" />
                            Submit Resource
                        </Button>
                        <Button size="lg" variant="outline">
                            Contribution Guidelines
                        </Button> */}

            <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground font-medium">
                User contribution feature coming soon!
              </span>
            </div>
          </div>
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
