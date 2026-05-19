"use client";

import { useState, useTransition } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateProfile } from "@/actions/profile";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/db/users";

interface PersonalInformationProps {
    user: User;
    profile: UserProfile;
}

export default function PersonalInformation({
    user,
    profile,
}: PersonalInformationProps) {
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState({
        name: profile.name || "",
        ssc_batch: profile.ssc_batch || "",
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                const result = await updateProfile(user.id, {
                    name: formData.name,
                    ssc_batch: formData.ssc_batch,
                });

                if (result.success) {
                    toast.success("Profile updated successfully!");
                    setIsEditing(false);
                } else {
                    toast.error(result.error || "Failed to update profile");
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to update profile");
            }
        });
    };

    const handleCancel = () => {
        setFormData({
            name: profile.name || "",
            ssc_batch: profile.ssc_batch || "",
        });
        setIsEditing(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                        Personal Information
                    </CardTitle>
                    <CardDescription>
                        Update your personal details below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    value={profile.email}
                                    disabled
                                    className="bg-muted"
                                    placeholder="Your email address"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ssc_batch">SSC Batch</Label>
                                <Input
                                    id="ssc_batch"
                                    name="ssc_batch"
                                    value={formData.ssc_batch}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="e.g., 2024"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Input
                                    id="role"
                                    name="role"
                                    value={profile.role || "Member"}
                                    disabled
                                    className="bg-muted"
                                    placeholder="Your role"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Input
                                    id="status"
                                    name="status"
                                    value={profile.status || "Pending"}
                                    disabled
                                    className="bg-muted"
                                    placeholder="Account status"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="position">
                                    Executive Position
                                </Label>
                                <Input
                                    id="position"
                                    name="position"
                                    value={profile.executive_position || "None"}
                                    disabled
                                    className="bg-muted"
                                    placeholder="Executive position"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            {isEditing ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={
                                            isPending
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={
                                            isPending
                                        }
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isPending
                                            ? "Updating..."
                                            : "Update Information"}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Update Information
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
