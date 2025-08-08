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
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
    Users,
    Calendar,
    BookOpen,
    FolderOpen,
    UserCheck,
    UserX,
} from "lucide-react";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import { getAllUsers } from "@/queries/auth";

async function getStats() {
    const supabase = await createSupabaseServer();

    const [usersResponse] = await Promise.all([getAllUsers(supabase)]);

    const totalUsers = usersResponse.success
        ? usersResponse.data?.length || 0
        : 0;
    const activeUsers = usersResponse.success
        ? usersResponse.data?.filter((user) => user.status === "active")
              .length || 0
        : 0;
    const pendingUsers = usersResponse.success
        ? usersResponse.data?.filter((user) => user.status === "pending")
              .length || 0
        : 0;

    // For now, we'll return placeholder values for events, magazines, and resources
    // You can implement these queries based on your database structure
    return {
        totalUsers,
        activeUsers,
        pendingUsers,
        totalEvents: 0,
        totalMagazines: 0,
        totalResources: 0,
    };
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: number;
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

function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
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
    );
}

async function StatsDisplay() {
    const stats = await getStats();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
                title="Total Members"
                value={stats.totalUsers}
                description="All registered members"
                icon={Users}
            />
            <StatCard
                title="Active Members"
                value={stats.activeUsers}
                description="Currently active members"
                icon={UserCheck}
            />
            <StatCard
                title="Pending Approval"
                value={stats.pendingUsers}
                description="Members awaiting approval"
                icon={UserX}
            />
            <StatCard
                title="Total Events"
                value={stats.totalEvents}
                description="All events created"
                icon={Calendar}
            />
            <StatCard
                title="Magazines"
                value={stats.totalMagazines}
                description="Published magazines"
                icon={BookOpen}
            />
            <StatCard
                title="Resources"
                value={stats.totalResources}
                description="Available resources"
                icon={FolderOpen}
            />
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Admin Dashboard</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold">Dashboard</h1>
                            <p className="text-muted-foreground">
                                Welcome to the ACPSCM admin panel. Here's an
                                overview of your system.
                            </p>
                        </div>

                        <Suspense fallback={<StatsSkeleton />}>
                            <StatsDisplay />
                        </Suspense>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                    <CardDescription>
                                        Latest system activity
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground">
                                        No recent activity to display.
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                    <CardDescription>
                                        Common administrative tasks
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground">
                                        Use the sidebar to navigate to different
                                        management sections.
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
