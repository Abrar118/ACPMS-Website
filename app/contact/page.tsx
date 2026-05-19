import { SectionHeader } from "@/components/ui/section-header";
import Footer from "@/components/home/Footer";
import ContactForm from "@/components/contact/ContactForm";
import ClubInfo from "@/components/contact/ClubInfo";

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Get In Touch"
            subtitle="Have a question or want to get involved? We'd love to hear from you."
            align="center"
          />
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 mt-10">
            <ContactForm />
            <ClubInfo />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
