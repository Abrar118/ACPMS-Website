
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
        icon: <IconCalculator size={48} className="mx-auto text-blue-500" />,
        title: "Problem Solving",
        description: "Develop your math skills through challenging problems and real-world applications. Build critical thinking and problem-solving abilities.",
    },
    {
        icon: <IconTrophy size={48} className="mx-auto text-yellow-500" />,
        title: "Olympiad Preparation",
        description: "Preparing for math Olympiads helps you think outside the box and tackle advanced problems with confidence.",
    },
    {
        icon: <IconBulb size={48} className="mx-auto text-green-500" />,
        title: "Creativity",
        description: "Learn how creativity fuels problem-solving. Apply mathematical thinking in innovative ways.",
    },
    {
        icon: <IconHeartHandshake size={48} className="mx-auto text-red-500" />,
        title: "Love for Math",
        description: "Embrace your passion for mathematics and explore its beauty in a supportive environment.",
    },
];

export default function WhatWeDo() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12">
                    What We Do
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {objectives.map((objective, index) => (
                        <Card key={index} className="rounded-lg shadow-lg p-6 text-center">
                            <CardContent>
                                {objective.icon}
                                <h3 className="text-xl font-bold mt-4">{objective.title}</h3>
                                <p className="text-gray-600 mt-2">{objective.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
