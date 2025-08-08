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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { MoreHorizontal, UserPlus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import { getAllUsers } from "@/queries/auth";
import type { UserProfile } from "@/queries/auth";

async function getMembers() {
    const supabase = await createSupabaseServer();
    const response = await getAllUsers(supabase);

    if (!response.success || !response.data) {
        return [];
    }

    return response.data;
}

function getStatusBadge(status: string | null) {
    switch (status) {
        case "active":
            return (
                <Badge variant="default" className="bg-green-500">
                    Active
                </Badge>
            );
        case "pending":
            return <Badge variant="secondary">Pending</Badge>;
        case "inactive":
            return <Badge variant="destructive">Inactive</Badge>;
        default:
            return <Badge variant="outline">Unknown</Badge>;
    }
}

function getRoleBadge(role: string | null) {
    switch (role) {
        case "admin":
            return <Badge variant="destructive">Admin</Badge>;
        case "member":
            return <Badge variant="default">Member</Badge>;
        case "executive":
            return <Badge variant="secondary">Executive</Badge>;
        default:
            return <Badge variant="outline">No Role</Badge>;
    }
}

function MemberRow({ member }: { member: UserProfile }) {
    return (
        <TableRow>
            <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={member.profile_image || ""} />
                        <AvatarFallback>
                            {member.name
                                ?.split(" ")
                                .map((word) => word.charAt(0))
                                .join("")
                                .slice(0, 2)
                                .toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                            {member.email}
                        </div>
                    </div>
                </div>
            </TableCell>
            <TableCell>{member.ssc_batch}</TableCell>
            <TableCell>{getStatusBadge(member.status)}</TableCell>
            <TableCell>{getRoleBadge(member.role)}</TableCell>
            <TableCell>
                {member.executive_position && (
                    <Badge variant="outline">{member.executive_position}</Badge>
                )}
            </TableCell>
            <TableCell>
                {member.created_at &&
                    new Date(member.created_at).toLocaleDateString()}
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
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Edit member</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Change status</DropdownMenuItem>
                        <DropdownMenuItem>Change role</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            Delete member
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

async function MembersTable() {
    const members = await getMembers();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>All Members</CardTitle>
                        <CardDescription>
                            Manage all registered members of the organization
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/admin/members/add">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Member
                        </Link>
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search members..."
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
                            <TableHead>Member</TableHead>
                            <TableHead>SSC Batch</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    No members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => (
                                <MemberRow key={member.id} member={member} />
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function AdminMembers() {
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
                                <BreadcrumbPage>Members</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
                    <Suspense fallback={<div>Loading members...</div>}>
                        <MembersTable />
                    </Suspense>
                </div>
            </div>
        </>
    );
}
