'use client';

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddResourceDialog from "@/components/resources/admin/addResourceForm/AddResourceDialog";
import { EResourceCategory, EResourceType } from "@/components/shared/enums";
import { type ResourceRow as TResourceRow } from "@/queries/resources";
import { ResourceActions } from "@/components/resources/admin/ResourceActions";

interface AdminResourcesClientProps {
  resources: TResourceRow[];
  error?: string;
}

function getCategoryBadge(category: EResourceCategory | undefined) {
  if (!category) return <Badge variant="outline">Uncategorized</Badge>;

  switch (category) {
    case EResourceCategory["Past Paper"]:
      return (
        <Badge variant="default" className="bg-blue-500">
          Past Paper
        </Badge>
      );
    case EResourceCategory["Problem Set"]:
      return (
        <Badge variant="default" className="bg-green-500">
          Problem Set
        </Badge>
      );
    case EResourceCategory["Reference Material"]:
      return (
        <Badge variant="default" className="bg-purple-500">
          Reference Material
        </Badge>
      );
    case EResourceCategory["Video Lecture"]:
      return (
        <Badge variant="default" className="bg-orange-500">
          Video Lecture
        </Badge>
      );
    default:
      return <Badge variant="outline">{category}</Badge>;
  }
}

function getTypeBadge(type: EResourceType | undefined) {
  if (!type) return <Badge variant="outline">Unknown</Badge>;

  switch (type) {
    case EResourceType["Document"]:
      return (
        <Badge variant="default" className="bg-indigo-500">
          Document
        </Badge>
      );
    case EResourceType["Video"]:
      return (
        <Badge variant="default" className="bg-red-500">
          Video
        </Badge>
      );
    case EResourceType["Link"]:
      return (
        <Badge variant="default" className="bg-blue-500">
          Link
        </Badge>
      );
    case EResourceType["Pdf"]:
      return (
        <Badge variant="default" className="bg-gray-700 text-white">
          PDF
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

function ResourceRow({ resource }: { resource: TResourceRow }) {
  return (
    <TableRow>
      <TableCell className="font-medium max-w-[200px]">
        <div className="flex items-center gap-2">
          <div className="max-w-[300px] text-ellipsis overflow-hidden">
            <div className="font-medium">{resource.title}</div>
            <div className="text-sm text-muted-foreground">
              {resource.description}
            </div>
          </div>
          {resource.is_featured && (
            <Badge variant="outline" className="text-xs">
              Featured
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        {getCategoryBadge(resource.category as EResourceCategory)}
      </TableCell>
      <TableCell>{getTypeBadge(resource.resource_type as EResourceType)}</TableCell>
      <TableCell>{resource.view_count || 0}</TableCell>
      <TableCell>
        <Badge
          variant={resource.status === "Published" ? "default" : "secondary"}
        >
          {resource.status}
        </Badge>
      </TableCell>
      <TableCell>
        {resource.created_at &&
          new Date(resource.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <ResourceActions resource={resource} />
      </TableCell>
    </TableRow>
  );
}

export default function AdminResourcesClient({ resources, error }: AdminResourcesClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Get unique categories, types, and statuses
  const availableCategories = useMemo(() => {
    return Array.from(new Set(resources.map(r => r.category).filter((c): c is string => Boolean(c)))).sort();
  }, [resources]);

  const availableTypes = useMemo(() => {
    return Array.from(new Set(resources.map(r => r.resource_type).filter((t): t is string => Boolean(t)))).sort();
  }, [resources]);

  const availableStatuses = useMemo(() => {
    return Array.from(new Set(resources.map(r => r.status).filter((s): s is string => Boolean(s)))).sort();
  }, [resources]);

  // Filter resources based on search term and filters
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
      const matchesType = selectedType === "all" || resource.resource_type === selectedType;
      const matchesStatus = selectedStatus === "all" || resource.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    });
  }, [resources, searchTerm, selectedCategory, selectedType, selectedStatus]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Resources</CardTitle>
          <CardDescription className="text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Failed to load resources
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please try refreshing the page or contact support if the issue
              persists.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All Resources</CardTitle>
            <CardDescription>
              Manage educational resources and materials ({filteredResources.length} of {resources.length} resources)
            </CardDescription>
          </div>
          <AddResourceDialog />
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search resources..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {availableTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {availableStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table className="overflow-x-scroll">
          <TableHeader>
            <TableRow>
              <TableHead>Resource</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      {searchTerm || selectedCategory !== "all" || selectedType !== "all" || selectedStatus !== "all"
                        ? "No resources match your filters"
                        : "No resources found"
                      }
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchTerm || selectedCategory !== "all" || selectedType !== "all" || selectedStatus !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "Get started by adding your first resource."
                      }
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredResources.map((resource) => (
                <ResourceRow key={resource.id} resource={resource} />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
