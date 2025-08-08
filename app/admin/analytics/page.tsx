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
    BookOpen,
    FolderOpen,
    TrendingUp,
    Activity,
    Clock,
    Download,
} from "lucide-react";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import { getAllUsers } from "@/queries/auth";

async function getAnalyticsData() {
    const supabase = await createSupabaseServer();

    const [usersResponse] = await Promise.all([getAllUsers(supabase)]);

    const users = usersResponse.success ? usersResponse.data || [] : [];

    // Calculate user statistics
    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.status === "active").length;
    const newUsersThisMonth = users.filter((user) => {
        if (!user.created_at) return false;
        const createdDate = new Date(user.created_at);
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return createdDate >= firstDayOfMonth;
    }).length;

    // User growth calculation (placeholder)
    const userGrowthPercentage =
        totalUsers > 0 ? (newUsersThisMonth / totalUsers) * 100 : 0;

    return {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        userGrowthPercentage: userGrowthPercentage.toFixed(1),
        // Placeholder data for other metrics
        totalEvents: 12,
        upcomingEvents: 5,
        totalMagazines: 8,
        totalResources: 24,
        totalDownloads: 1247,
        avgEventAttendance: 35,
    };
}

function MetricCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    trendValue,
}: {
    title: string;
    value: string | number;
    description: string;
    icon: any;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
}) {
    const getTrendColor = () => {
        switch (trend) {
            case "up":
                return "text-green-600";
            case "down":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
                {trend && trendValue && (
                    <div
                        className={`flex items-center text-xs mt-1 ${getTrendColor()}`}
                    >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>{trendValue} from last month</span>
                    </div>
                )}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
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
                    trend="up"
                    trendValue={`+${data.newUsersThisMonth}`}
                />
                <MetricCard
                    title="Active Members"
                    value={data.activeUsers}
                    description="Currently active members"
                    icon={Activity}
                    trend="neutral"
                    trendValue={`${data.userGrowthPercentage}%`}
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
                    description="Events this month"
                    icon={Clock}
                    trend="up"
                    trendValue="+2"
                />
                <MetricCard
                    title="Magazines"
                    value={data.totalMagazines}
                    description="Published magazines"
                    icon={BookOpen}
                />
                <MetricCard
                    title="Resources"
                    value={data.totalResources}
                    description="Available resources"
                    icon={FolderOpen}
                    trend="up"
                    trendValue="+5"
                />
                <MetricCard
                    title="Total Downloads"
                    value={data.totalDownloads}
                    description="All time downloads"
                    icon={Download}
                    trend="up"
                    trendValue="+147"
                />
                <MetricCard
                    title="Avg. Event Attendance"
                    value={data.avgEventAttendance}
                    description="Average per event"
                    icon={TrendingUp}
                    trend="up"
                    trendValue="+12%"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Member Growth</CardTitle>
                        <CardDescription>
                            Monthly member registration trends
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-64 text-muted-foreground">
                            <div className="text-center">
                                <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                                <p>Chart component would go here</p>
                                <p className="text-sm">
                                    Integration with charting library needed
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Event Analytics</CardTitle>
                        <CardDescription>
                            Event attendance and engagement metrics
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-64 text-muted-foreground">
                            <div className="text-center">
                                <Calendar className="h-12 w-12 mx-auto mb-2" />
                                <p>Event analytics chart</p>
                                <p className="text-sm">
                                    Integration with charting library needed
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest system activities and user interactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        New member registered
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        John Doe joined the organization
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    2 hours ago
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        Event created
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Mathematics Workshop scheduled for next
                                        week
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    5 hours ago
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        Resource uploaded
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Calculus study guide added to resources
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    1 day ago
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
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
