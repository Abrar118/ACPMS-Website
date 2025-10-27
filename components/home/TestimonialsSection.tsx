import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default function TestimonialsSection() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16">
                    From Our Members
                </h2>

                <Card className="max-w-3xl mx-auto bg-card/50 border-border/50">
                    <CardContent className="pt-8">
                        <div className="text-center">
                            <Avatar className="w-20 h-20 mx-auto mb-6 border-4 border-primary/20">
                                <AvatarImage
                                    src="/api/placeholder/80/80"
                                    alt="Sarah Chen"
                                />
                                <AvatarFallback className="text-xl font-semibold">
                                    SC
                                </AvatarFallback>
                            </Avatar>

                            <blockquote className="text-lg md:text-xl text-foreground/80 leading-relaxed mb-6 italic">
                                "ACPSCM has been an incredible
                                experience. The community is supportive, and the
                                resources are top-notch. I've learned so much
                                and made great friends along the way!"
                            </blockquote>

                            <footer className="text-base text-primary font-medium">
                                Sarah Chen
                            </footer>
                            <p className="text-sm text-muted-foreground">
                                Mathematics Student
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
