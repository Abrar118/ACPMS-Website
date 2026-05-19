"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import type { Resource } from "@/lib/db/resources";
import { incrementViewCount } from "@/actions/resources";
import { GlassCard } from "@/components/ui/glass-card";
import { SectionHeader } from "@/components/ui/section-header";
import { AmbientGlow } from "@/components/ui/ambient-glow";

interface ResourcesClientProps {
  featuredResources: Resource[];
  allResources: Resource[];
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
    {} as Record<string, Resource[]>
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
      <section className="py-24 px-4 relative">
        <AmbientGlow position="top-right" size="md" />
        <div className="max-w-7xl mx-auto text-center relative">
          <Badge variant="secondary" className="mb-4 border-white/[0.08] bg-white/[0.04] text-muted-foreground">
            <BookOpen className="w-3 h-3 mr-1" />
            Learning Resources
          </Badge>
          <SectionHeader
            title="Mathematical Resources"
            subtitle="Access our comprehensive collection of mathematical learning materials, problem sets, video lectures, and reference guides."
          />

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative mt-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search featured resources..."
              className="pl-10 pr-4 py-2 bg-white/[0.03] border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:border-white/[0.15]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Featured Resources</h2>
            <Badge className="animate-pulse bg-primary/20 text-primary border-primary/30">
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
                  <GlassCard
                    key={resource.id}
                    className={`p-0 ${resource.is_featured ? 'border-primary/30' : ''}`}
                  >
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between">
                        <Badge
                          variant={
                            resource.resource_type === EResourceType.Pdf
                              ? "default"
                              : "secondary"
                          }
                          className="bg-white/[0.04] border border-white/[0.08] text-muted-foreground"
                        >
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {resource.resource_type.charAt(0).toUpperCase() +
                            resource.resource_type.slice(1)}
                        </Badge>
                        {resource.is_featured && (
                          <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground line-clamp-1 mt-3">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mt-1">
                        {resource.description}
                      </p>
                    </div>
                    <div className="px-6 pb-6 flex flex-col flex-1">
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
                              className="text-xs border-white/[0.08] text-muted-foreground"
                            >
                              {level}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
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
                          className="border-white/[0.08] bg-white/[0.03] text-foreground hover:bg-white/[0.06] hover:border-white/[0.15]"
                          onClick={() =>
                            window.open(resource.resource_url || "", "_blank")
                          }
                          disabled={!resource.resource_url}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Browse by Category"
            className="mb-12"
          />

          <Tabs
            defaultValue={EResourceCategory["Problem Set"]}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2 lg:grid-cols-4 bg-transparent border-0 gap-2 h-auto p-0">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.value}
                  value={category.value}
                  className="text-xs lg:text-sm bg-white/[0.04] border border-white/[0.08] text-muted-foreground rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary py-2"
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
                <GlassCard className="p-0">
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <category.icon className="w-5 h-5 text-primary" />
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-white/[0.04] border border-white/[0.08] text-muted-foreground">
                        {category.count} resources
                      </Badge>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
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
                                className="flex items-center justify-between p-3 border border-white/[0.08] rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <TypeIcon className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium text-sm text-foreground">
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
                                    className="text-muted-foreground hover:text-primary"
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
                                    className="text-muted-foreground hover:text-primary"
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
                            className="border-white/[0.08] bg-white/[0.03] text-foreground hover:bg-white/[0.06] hover:border-white/[0.15]"
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
                  </div>
                </GlassCard>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Contribution Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <GlassCard className="p-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Contribute to Our Resource Library
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Help grow our community by sharing your mathematical knowledge and
              resources. Whether it&apos;s a problem set, tutorial, or reference
              material, every contribution helps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-white/[0.15] bg-white/[0.02]">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground font-medium">
                  User contribution feature coming soon!
                </span>
              </div>
            </div>
          </GlassCard>
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
