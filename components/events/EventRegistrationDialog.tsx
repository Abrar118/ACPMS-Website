"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, UserPlus, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface Event {
    id: string;
    title: string;
    description: string;
    event_date: string;
    event_time: string;
    location: string;
    max_participants?: number;
    poster_url?: string;
    event_type?: {
        event_type_name: string;
    };
}

interface EventRegistrationDialogProps {
    event: Event | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EventRegistrationDialog({
    event,
    isOpen,
    onOpenChange,
}: EventRegistrationDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        institution: "",
        requirements: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Simulate API call - replace with actual registration logic
            await new Promise((resolve) => setTimeout(resolve, 2000));

            toast.success("Registration submitted successfully!");

            // Reset form
            setFormData({
                name: "",
                email: "",
                institution: "",
                requirements: "",
            });

            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to submit registration. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (timeString: string) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }
        );
    };

    if (!event) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <DialogTitle className="text-2xl font-bold mb-2">
                                {event.title}
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                Register for this event and join us for an
                                exciting mathematical experience!
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
                    {/* Event Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Event Poster */}
                        {event.poster_url && (
                            <div className="aspect-[16/9] relative overflow-hidden rounded-lg border">
                                <Image
                                    src={event.poster_url}
                                    alt={event.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Event Type */}
                        <div>
                            <Badge variant="secondary" className="mb-4">
                                {event.event_type?.event_type_name || "Event"}
                            </Badge>
                        </div>

                        {/* Event Info */}
                        <div className="flex items-center justify-start gap-5">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                <div>
                                    <p className="font-medium">Date</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(event.event_date)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                <div>
                                    <p className="font-medium">Time</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatTime(event.event_time)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                <div>
                                    <p className="font-medium">Location</p>
                                    <p className="text-sm text-muted-foreground">
                                        {event.location}
                                    </p>
                                </div>
                            </div>

                            {event.max_participants && (
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">
                                            Max Participants
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {event.max_participants}{" "}
                                            participants
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Event Description */}
                        <div>
                            <h4 className="font-semibold mb-2">
                                About This Event
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {event.description}
                            </p>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                                <UserPlus className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                Register for the Event
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Fill out the form below to register for this
                                event
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="institution">
                                    Institution/School
                                </Label>
                                <Input
                                    id="institution"
                                    name="institution"
                                    placeholder="Enter your school or organization"
                                    value={formData.institution}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="requirements">
                                    Special Requirements or Interests
                                </Label>
                                <Textarea
                                    id="requirements"
                                    name="requirements"
                                    placeholder="e.g., dietary restrictions, topics of interest, accessibility needs"
                                    rows={4}
                                    value={formData.requirements}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        Submitting Registration...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Submit Registration
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
