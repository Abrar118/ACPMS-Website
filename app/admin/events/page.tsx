import { Suspense } from "react";
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
import { getAllEventsAdmin } from "@/queries/events";
import AdminEventsClient from "@/components/events/admin/AdminEventsClient";

async function EventsTable() {
  const supabase = await createSupabaseServer();
  const result = await getAllEventsAdmin(supabase);

  return (
    <AdminEventsClient 
      events={result.data || []} 
      error={result.error || undefined}
    />
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
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
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
