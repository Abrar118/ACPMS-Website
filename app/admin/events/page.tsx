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
import { MoreHorizontal, Plus, Search, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import { getAllEventsQuery } from "@/queries/events";
import type { Event } from "@/queries/events";

async function getEvents() {
    const supabase = await createSupabaseServer();
    const query = getAllEventsQuery(supabase);
    const { data, error } = await query;

    if (error || !data) {
        return [];
    }

    return data;
}

function getStatusBadge(isPublished: number) {
    if (isPublished === 1) {
        return (
            <Badge variant="default" className="bg-green-500">
                Published
            </Badge>
        );
    } else {
        return <Badge variant="secondary">Draft</Badge>;
    }
}

function EventRow({ event }: { event: Event }) {
    return (
        <TableRow>
            <TableCell className="font-medium">
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-muted-foreground">
                    {event.description}
                </div>
            </TableCell>
            <TableCell>
                {event.event_date &&
                    new Date(event.event_date).toLocaleDateString()}
            </TableCell>
            <TableCell>{event.location || "TBD"}</TableCell>
            <TableCell>{getStatusBadge(event.is_published)}</TableCell>
            <TableCell>
                {event.is_online === 1 ? "Online" : "In-person"}
            </TableCell>
            <TableCell>
                {event.created_at &&
                    new Date(event.created_at).toLocaleDateString()}
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
                        <DropdownMenuItem>Edit event</DropdownMenuItem>
                        <DropdownMenuItem>View registrations</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Change status</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            Delete event
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

async function EventsTable() {
    const events = await getEvents();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>All Events</CardTitle>
                        <CardDescription>
                            Manage all events and their details
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/admin/events/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Event
                        </Link>
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search events..."
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
                            <TableHead>Event</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    No events found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            events.map((event) => (
                                <EventRow key={event.id} event={event} />
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function AdminEvents() {
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
                                <BreadcrumbPage>Events</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
                    <Suspense fallback={<div>Loading events...</div>}>
                        <EventsTable />
                    </Suspense>
                </div>
            </div>
        </>
    );
}
