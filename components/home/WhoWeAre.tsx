
import { Users, Target, Lightbulb } from "lucide-react";

export default function WhoWeAre() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 py-4">
                    Who We Are
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto text-center">
                    We are a community of students who are passionate about mathematics.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-16">
                    <div className="bg-gray-800/80 border border-gray-700/80 p-8 rounded-lg">
                        <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <h3 className="text-xl font-semibold mb-2 text-white">Our Community</h3>
                        <p className="text-gray-400">
                            We are a community of students who are passionate about mathematics.
                        </p>
                    </div>
                    <div className="bg-gray-800/80 border border-gray-700/80 p-8 rounded-lg">
                        <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <h3 className="text-xl font-semibold mb-2 text-white">Our Mission</h3>
                        <p className="text-gray-400">
                            Our mission is to promote the study of mathematics and to provide a supportive community for students.
                        </p>
                    </div>
                    <div className="bg-gray-800/80 border border-gray-700/80 p-8 rounded-lg">
                        <Lightbulb className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <h3 className="text-xl font-semibold mb-2 text-white">Our Vision</h3>
                        <p className="text-gray-400">
                            Our vision is to be a leading center for mathematics education and to inspire the next generation of mathematicians.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
