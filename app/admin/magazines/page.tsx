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
import { MoreHorizontal, Plus, Search, Filter, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import createSupabaseServer from "@/utils/supabase/supabase-server";

// Placeholder magazine interface - adjust based on your database schema
interface Magazine {
    id: string;
    title: string;
    description?: string;
    volume?: string;
    issue?: string;
    publication_date?: string;
    pdf_url?: string;
    created_at?: string;
    created_by?: string;
}

async function getMagazines(): Promise<Magazine[]> {
    // Placeholder implementation - replace with actual database query
    // const supabase = await createSupabaseServer();
    // const { data, error } = await supabase.from('magazines').select('*');
    // return data || [];

    return [
        {
            id: "1",
            title: "Math Explorations",
            description: "A deep dive into calculus",
            volume: "5",
            issue: "2",
            publication_date: "2024-03-15",
            created_at: "2024-03-01",
        },
        {
            id: "2",
            title: "Geometry Gems",
            description: "Exploring geometric shapes",
            volume: "4",
            issue: "1",
            publication_date: "2024-02-20",
            created_at: "2024-02-10",
        },
    ];
}

function MagazineRow({ magazine }: { magazine: Magazine }) {
    return (
        <TableRow>
            <TableCell className="font-medium">
                <div className="font-medium">{magazine.title}</div>
                <div className="text-sm text-muted-foreground">
                    {magazine.description}
                </div>
            </TableCell>
            <TableCell>
                Vol. {magazine.volume}, Issue {magazine.issue}
            </TableCell>
            <TableCell>
                {magazine.publication_date &&
                    new Date(magazine.publication_date).toLocaleDateString()}
            </TableCell>
            <TableCell>
                <Badge variant="outline">Published</Badge>
            </TableCell>
            <TableCell>
                {magazine.created_at &&
                    new Date(magazine.created_at).toLocaleDateString()}
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
                        <DropdownMenuItem>View PDF</DropdownMenuItem>
                        <DropdownMenuItem>Edit magazine</DropdownMenuItem>
                        <DropdownMenuItem>Download PDF</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            Delete magazine
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

async function MagazinesTable() {
    const magazines = await getMagazines();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>All Magazines</CardTitle>
                        <CardDescription>
                            Manage all published magazines and issues
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/admin/magazines/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Magazine
                        </Link>
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search magazines..."
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
                            <TableHead>Magazine</TableHead>
                            <TableHead>Volume/Issue</TableHead>
                            <TableHead>Publication Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {magazines.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    No magazines found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            magazines.map((magazine) => (
                                <MagazineRow
                                    key={magazine.id}
                                    magazine={magazine}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function AdminMagazines() {
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
                                <BreadcrumbPage>Magazines</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
                    <Suspense fallback={<div>Loading magazines...</div>}>
                        <MagazinesTable />
                    </Suspense>
                </div>
            </div>
        </>
    );
}
