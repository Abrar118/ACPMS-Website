
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function WhatWeDo() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 py-4">
                    What We Do
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto text-center">
                    We are a team of experienced developers who are passionate
                    about creating high-quality software solutions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
                    <Card className="bg-gray-800/80 border-gray-700/80">
                        <CardHeader>
                            <CardTitle className="text-white">Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-400">
                                We host a variety of events, from workshops to competitions, to help you learn and grow.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800/80 border-gray-700/80">
                        <CardHeader>
                            <CardTitle className="text-white">Resources</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-400">
                                We provide a curated collection of resources, including articles, tutorials, and practice problems.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800/80 border-gray-700/80">
                        <CardHeader>
                            <CardTitle className="text-white">Magazine</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-400">
                                We publish a regular magazine with articles on a variety of topics, from math history to modern research.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
