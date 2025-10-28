
import {
    Heart,
    Users,
    Expand,
    Zap,
    Wind,
    Bot,
    ZoomIn,
    BrainCircuit // Using a different icon for variety
} from "lucide-react";
import { cn } from "@/utils/cn";

const features = [
    {
        icon: <Heart size={24} />,
        title: "Community Passion",
        description: "Join a vibrant community of students who share a deep passion for the beauty and challenge of mathematics.",
        className: "lg:col-span-2",
    },
    {
        icon: <BrainCircuit size={24} />,
        title: "Problem Solving Workshops",
        description: "Engage in stimulating workshops that sharpen your analytical skills and collaborative problem-solving abilities.",
        className: "",
    },
    {
        icon: <Expand size={24} />,
        title: "Skill Expansion",
        description: "Broaden your mathematical horizons by exploring advanced topics and concepts beyond the standard curriculum.",
        className: "",
    },
    {
        icon: <Zap size={24} />,
        title: "Competition Training",
        description: "Prepare for local and national math competitions with dedicated training sessions and experienced mentors.",
        className: "",
    },
    {
        icon: <Wind size={24} />,
        title: "Flexible Learning",
        description: "Adapt your learning path by exploring diverse mathematical fields, from pure theory to applied sciences.",
        className: "",
    },
    {
        icon: <Users size={24} />,
        title: "Peer Support",
        description: "Benefit from a strong peer support network, offering help with challenging coursework and collaborative study.",
        className: "lg:col-span-2",
    },
    {
        icon: <Bot size={24} />,
        title: "Applied Projects",
        description: "Participate in hands-on projects that apply mathematical concepts to real-world challenges in tech and science.",
        className: "lg:col-span-2",
    },
    {
        icon: <ZoomIn size={24} />,
        title: "Attention to Detail",
        description: "Cultivate precision and logical rigor by focusing on the intricate details of mathematical proofs and arguments.",
        className: "lg:col-span-2",
    },
];

export default function WhoWeAre() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-4">
                    Who We Are
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-12">
                    Our club delves into the depths of mathematics, providing unmatched attention to detail and fostering a community that thrives on solving complex problems and pushing the boundaries of knowledge.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
                    {features.map((feature, index) => (
                        <div key={index} className={cn("p-8 rounded-lg shadow-lg", feature.className)}>
                            <div className="text-blue-500 mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-600">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
