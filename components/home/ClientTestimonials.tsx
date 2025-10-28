
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default function ClientTestimonials() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 py-4">
                    From Our Members
                </h2>

                <Card className="max-w-3xl mx-auto bg-gray-800/80 border-gray-700/80 mt-16">
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

                            <blockquote className="text-lg md:text-xl text-gray-400 leading-relaxed mb-6 italic">
                                "ACPSCM has been an incredible
                                experience. The community is supportive, and the
                                resources are top-notch. I've learned so much
                                and made great friends along the way!"
                            </blockquote>

                            <footer className="text-base text-primary font-medium">
                                Sarah Chen
                            </footer>
                            <p className="text-sm text-gray-500">
                                Mathematics Student
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
