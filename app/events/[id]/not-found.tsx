import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Not Found | ACPSCM",
  description: "The requested event could not be found.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="text-9xl font-bold text-muted-foreground mb-4">404</div>
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The event you're looking for doesn't exist or may have been removed.
        </p>
        <div className="space-y-4">
          <a
            href="/events"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Back to Events
          </a>
          <br />
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
