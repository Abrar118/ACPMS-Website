import { Suspense } from "react";
import { notFound } from "next/navigation";
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
import createSupabaseServer from "@/utils/supabase/supabase-server";
import { getEventById } from "@/queries/events";
import { getEventCompetitions } from "@/queries/competitions";
import AdminEventDetailClient from "@/components/events/admin/AdminEventDetailClient";

interface AdminEventDetailPageProps {
  params: Promise<{ eventId: string }>;
}

async function EventDetail({ eventId }: { eventId: string }) {
  const supabase = await createSupabaseServer();
  
  // Fetch event details and competitions in parallel
  const [eventResult, competitionsResult] = await Promise.all([
    getEventById(supabase, eventId),
    getEventCompetitions(supabase, eventId),
  ]);

  if (eventResult.error || !eventResult.data) {
    notFound();
  }

  return (
    <AdminEventDetailClient
      event={eventResult.data}
      competitions={competitionsResult.data || []}
      error={competitionsResult.error || undefined}
    />
  );
}

export default async function AdminEventDetailPage({ params }: AdminEventDetailPageProps) {
  const { eventId } = await params;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin/events">Events</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Event Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<div>Loading event details...</div>}>
          <EventDetail eventId={eventId} />
        </Suspense>
      </div>
    </>
  );
}
