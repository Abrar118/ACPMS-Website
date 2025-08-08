import { Suspense } from "react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MoreHorizontal, Plus, Search, Filter, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import createSupabaseServer from "@/utils/supabase/supabase-server";

// Placeholder resource interface - adjust based on your database schema
interface Resource {
    id: string;
    title: string;
    description?: string;
    category?: string;
    file_url?: string;
    file_size?: string;
    downloads?: number;
    created_at?: string;
    created_by?: string;
}

async function getResources(): Promise<Resource[]> {
    // Placeholder implementation - replace with actual database query
    // const supabase = await createSupabaseServer();
    // const { data, error } = await supabase.from('resources').select('*');
    // return data || [];

    return [
        {
            id: "1",
            title: "Calculus Notes",
            description: "Comprehensive calculus study material",
            category: "Mathematics",
            file_size: "2.5 MB",
            downloads: 145,
            created_at: "2024-03-01",
        },
        {
            id: "2",
            title: "Physics Formulas",
            description: "Essential physics formulas reference",
            category: "Physics",
            file_size: "1.8 MB",
            downloads: 89,
            created_at: "2024-02-15",
        },
    ];
}

function getCategoryBadge(category: string | undefined) {
    if (!category) return <Badge variant="outline">Uncategorized</Badge>;

    switch (category.toLowerCase()) {
        case "mathematics":
            return (
                <Badge variant="default" className="bg-blue-500">
                    Mathematics
                </Badge>
            );
        case "physics":
            return (
                <Badge variant="default" className="bg-green-500">
                    Physics
                </Badge>
            );
        case "chemistry":
            return (
                <Badge variant="default" className="bg-purple-500">
                    Chemistry
                </Badge>
            );
        default:
            return <Badge variant="outline">{category}</Badge>;
    }
}

function ResourceRow({ resource }: { resource: Resource }) {
    return (
        <TableRow>
            <TableCell className="font-medium">
                <div className="font-medium">{resource.title}</div>
                <div className="text-sm text-muted-foreground">
                    {resource.description}
                </div>
            </TableCell>
            <TableCell>{getCategoryBadge(resource.category)}</TableCell>
            <TableCell>{resource.file_size || "Unknown"}</TableCell>
            <TableCell>{resource.downloads || 0}</TableCell>
            <TableCell>
                {resource.created_at &&
                    new Date(resource.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem>Edit resource</DropdownMenuItem>
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Change category</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            Delete resource
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

async function ResourcesTable() {
    const resources = await getResources();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>All Resources</CardTitle>
                        <CardDescription>
                            Manage educational resources and materials
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/admin/resources/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Resource
                        </Link>
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search resources..."
                            className="pl-9"
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Resource</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>File Size</TableHead>
                            <TableHead>Downloads</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resources.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    No resources found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            resources.map((resource) => (
                                <ResourceRow
                                    key={resource.id}
                                    resource={resource}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function AdminResources() {
    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/admin">
                                    Admin
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Resources</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
                    <Suspense fallback={<div>Loading resources...</div>}>
                        <ResourcesTable />
                    </Suspense>
                </div>
            </div>
        </>
    );
}
