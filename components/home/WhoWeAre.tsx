
import { Users, Target, Lightbulb } from "lucide-react";

export default function WhoWeAre() {
    return (
        <section className="py-20 px-4 bg-muted/30">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16">
                    Who We Are
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div>
                        <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <h3 className="text-xl font-semibold mb-2">Our Community</h3>
                        <p className="text-muted-foreground">
                            We are a community of students who are passionate about mathematics.
                        </p>
                    </div>
                    <div>
                        <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
                        <p className="text-muted-foreground">
                            Our mission is to promote the study of mathematics and to provide a supportive community for students.
                        </p>
                    </div>
                    <div>
                        <Lightbulb className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
                        <p className="text-muted-foreground">
                            Our vision is to be a leading center for mathematics education and to inspire the next generation of mathematicians.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
