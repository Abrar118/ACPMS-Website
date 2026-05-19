import { Suspense } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
    Users,
    Calendar,
    FolderOpen,
    Clock,
    Trophy,
    FileText,
    UserCheck,
    Mail,
} from "lucide-react";
import { getAllUsers } from "@/lib/db/users";
import prisma from "@/lib/prisma";

async function getAnalyticsData() {
    const [
        users,
        eventCount,
        upcomingEventCount,
        competitionCount,
        resourceCount,
        magazineCount,
        blogPostCount,
        contactCount,
    ] = await Promise.all([
        getAllUsers(),
        prisma.event.count(),
        prisma.event.count({ where: { event_date: { gte: new Date() } } }),
        prisma.competition.count(),
        prisma.resource.count({ where: { is_archived: false } }),
        prisma.magazine.count({ where: { is_archived: { not: true } } }),
        prisma.blogPost.count({ where: { is_published: true } }),
        prisma.contactSubmission.count({ where: { status: "new" } }),
    ]);

    const totalUsers = users.length;
    const approvedUsers = users.filter((u) => u.status === "approved").length;
    const pendingUsers = users.filter((u) => u.status === "pending").length;

    return {
        totalUsers,
        approvedUsers,
        pendingUsers,
        totalEvents: eventCount,
        upcomingEvents: upcomingEventCount,
        totalCompetitions: competitionCount,
        totalResources: resourceCount,
        totalMagazines: magazineCount,
        totalBlogPosts: blogPostCount,
        newContactSubmissions: contactCount,
    };
}

function MetricCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: string | number;
    description: string;
    icon: any;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

function AnalyticsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-1" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card className="max-w-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-32" />
                </CardContent>
            </Card>
        </div>
    );
}

async function AnalyticsDisplay() {
    const data = await getAnalyticsData();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Members"
                    value={data.totalUsers}
                    description="All registered members"
                    icon={Users}
                />
                <MetricCard
                    title="Approved Members"
                    value={data.approvedUsers}
                    description="Members with approved status"
                    icon={UserCheck}
                />
                <MetricCard
                    title="Pending Approval"
                    value={data.pendingUsers}
                    description="Awaiting approval"
                    icon={Clock}
                />
                <MetricCard
                    title="Total Events"
                    value={data.totalEvents}
                    description="All time events"
                    icon={Calendar}
                />
                <MetricCard
                    title="Upcoming Events"
                    value={data.upcomingEvents}
                    description="Events from today onward"
                    icon={Calendar}
                />
                <MetricCard
                    title="Competitions"
                    value={data.totalCompetitions}
                    description="Total competitions"
                    icon={Trophy}
                />
                <MetricCard
                    title="Resources"
                    value={data.totalResources}
                    description="Active (non-archived) resources"
                    icon={FolderOpen}
                />
                <MetricCard
                    title="Blog Posts"
                    value={data.totalBlogPosts}
                    description="Published blog posts"
                    icon={FileText}
                />
            </div>

            <Card className="max-w-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        New Contact Submissions
                    </CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {data.newContactSubmissions}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Unread contact form submissions
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdminAnalytics() {
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
                                <BreadcrumbPage>Analytics</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold">Analytics</h1>
                            <p className="text-muted-foreground">
                                Comprehensive insights into your organization's
                                performance and growth.
                            </p>
                        </div>

                        <Suspense fallback={<AnalyticsSkeleton />}>
                            <AnalyticsDisplay />
                        </Suspense>
                    </div>
                </div>
            </div>
        </>
    );
}
