
import { Card, CardContent } from "@/components/ui/card";
import {
    IconCalculator,
    IconTrophy,
    IconBulb,
    IconHeartHandshake
} from "@tabler/icons-react";
import React from "react";

const objectives = [
    {
        icon: <IconCalculator size={48} className="mx-auto text-purple-400" />,
        title: "Problem Solving",
        description: "Develop your math skills through challenging problems and real-world applications. Build critical thinking and problem-solving abilities.",
    },
    {
        icon: <IconTrophy size={48} className="mx-auto text-yellow-400" />,
        title: "Olympiad Preparation",
        description: "Preparing for math Olympiads helps you think outside the box and tackle advanced problems with confidence.",
    },
    {
        icon: <IconBulb size={48} className="mx-auto text-green-400" />,
        title: "Creativity",
        description: "Learn how creativity fuels problem-solving. Apply mathematical thinking in innovative ways.",
    },
    {
        icon: <IconHeartHandshake size={48} className="mx-auto text-pink-400" />,
        title: "Love for Math",
        description: "Embrace your passion for mathematics and explore its beauty in a supportive environment.",
    },
];

export default function WhatWeDo() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 py-4">
                    Our Objectives
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
                    {objectives.map((objective, index) => (
                        <Card key={index} className="bg-gray-900/50 border-purple-500/50 rounded-lg shadow-lg p-6 text-center transition-all duration-300 hover:shadow-purple-500/50 hover:border-purple-500">
                            <CardContent>
                                {objective.icon}
                                <h3 className="text-xl font-bold text-white mt-4">{objective.title}</h3>
                                <hr className="my-2 border-purple-500/50 w-1/2 mx-auto" />
                                <p className="text-gray-400 mt-2">{objective.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
