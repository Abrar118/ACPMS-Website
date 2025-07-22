import { Button } from "@/components/ui/button";

export default function WelcomeSection() {
    return (
        <section className="py-20 px-4 bg-background">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
                    Welcome to the Club!
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 max-w-3xl mx-auto">
                    Welcome to Math Explorers, a vibrant community dedicated to
                    the beauty and power of mathematics. Whether you're a
                    seasoned mathematician or just starting your journey, we
                    offer a space to learn, collaborate, and explore the
                    fascinating world of numbers and equations.
                </p>
                <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-3 text-lg"
                >
                    Learn More About Us
                </Button>
            </div>
        </section>
    );
}
