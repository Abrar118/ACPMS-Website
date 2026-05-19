import { GlassCard } from "@/components/ui/glass-card";
import { MapPin, Mail, Facebook, Globe } from "lucide-react";

export default function ClubInfo() {
  return (
    <GlassCard className="p-8 h-fit">
      <h2 className="text-2xl font-bold text-foreground mb-6">Club Information</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-1">
            Club Name
          </h3>
          <p className="text-muted-foreground">
            Adamjee Cantonment Public School
            <br />
            Club of Mathematics (ACPSCM)
          </p>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Address</h3>
            <p className="text-sm text-muted-foreground">
              Adamjee Cantonment Public School
              <br />
              Dhaka Cantonment, Dhaka, Bangladesh
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Email</h3>
            <a
              href="mailto:contact@acpscm.com"
              className="text-sm text-primary hover:underline"
            >
              contact@acpscm.com
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
            Follow Us
          </h3>
          <div className="flex gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/[0.15] transition-all"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Website"
              className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/[0.15] transition-all"
            >
              <Globe className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
