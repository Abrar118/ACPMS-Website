
import {
    Heart,
    MousePointer,
    Expand,
    Zap,
    Wind,
    Users,
    ZoomIn,
    Bot
} from "lucide-react";

const features = [
    {
        icon: <Heart size={24} />,
        title: "Client Relations",
        description: "Long-term relationships with our clients with exceptional service and support.",
    },
    {
        icon: <MousePointer size={24} />,
        title: "Consistency",
        description: "Ensure a consistent brand identity with regular design output.",
    },
    {
        icon: <Expand size={24} />,
        title: "Scalability",
        description: "Access high-quality design services at a fraction of traditional costs.",
    },
    {
        icon: <Zap size={24} />,
        title: "Speed",
        description: "Get quicker turnarounds on design projects without sacrificing quality at a way better price on your wallet.",
    },
    {
        icon: <Wind size={24} />,
        title: "Flexibility",
        description: "Adapt the service to cover a wide range of design tasks as needed.",
    },
    {
        icon: <Users size={24} />,
        title: "Diversity",
        description: "Access to a variety of styles and expertise from a pool of creative professionals and people around the world.",
    },
    {
        icon: <Bot size={24} />,
        title: "Support",
        description: "Enjoy dedicated customer service and revisions to perfect your designs.",
    },
    {
        icon: <ZoomIn size={24} />,
        title: "Attention to detail",
        description: "We pay attention to the smallest details to ensure the highest quality.",
    },
];

export default function WhoWeAre() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 py-4">
                    Where Others Stop <br /> We Keep Going
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto text-center">
                    Our team goes the extra mile, providing unmatched attention to detail and delivering results that exceed expectations. We prioritize your needs, ensuring every project is handled with care, precision, and a forward-thinking approach.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left mt-16">
                    {features.map((feature, index) => (
                        <div key={index} className="group bg-gray-800/80 border border-gray-700/80 p-8 rounded-lg hover:border-primary transition-colors duration-300">
                            <div className="text-primary mb-4 group-hover:text-white transition-colors duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                            <p className="text-gray-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
