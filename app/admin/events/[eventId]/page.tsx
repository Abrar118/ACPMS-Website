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
import { getEventById } from "@/lib/db/events";
import { getEventCompetitions } from "@/lib/db/competitions";
import AdminEventDetailClient from "@/components/events/admin/AdminEventDetailClient";

interface AdminEventDetailPageProps {
  params: Promise<{ eventId: string }>;
}

async function EventDetail({ eventId }: { eventId: string }) {
  // Fetch event details and competitions in parallel
  const [event, competitions] = await Promise.all([
    getEventById(eventId),
    getEventCompetitions(eventId),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <AdminEventDetailClient
      event={JSON.parse(JSON.stringify(event))}
      competitions={JSON.parse(JSON.stringify(competitions))}
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
