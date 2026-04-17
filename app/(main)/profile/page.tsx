"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import { UserStarIcon, Settings, Mail, Shield, Phone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProfile, updateProfile } from "@/app/actions/profile-actions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoadingState } from "@/components/loading-state";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const { data: profileResult, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
  });

  const profile = profileResult?.success ? profileResult.profile : null;

  useEffect(() => {
    if (profile?.name) {
      const parts = profile.name.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }
    if (profile?.phone_number) {
      setPhoneNumber(profile.phone_number);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: ({ name, phoneNumber }: { name: string; phoneNumber: string }) =>
      updateProfile(name, phoneNumber),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  const handleSave = () => {
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    updateMutation.mutate({ name: fullName, phoneNumber });
  };

  const breadcrumbs = [{ label: "Profile" }];

  if (isLoading) {
    return <LoadingState message="Loading Profile..." />;
  }

  return (
    <div className="flex flex-col lg:gap-12 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Header
        icon={<UserStarIcon className="h-5 w-5 text-current" />}
        heading="Profile"
        description="Manage your account settings and personal information."
        breadcrumbs={breadcrumbs}
      />

      <div className="mt-4 flex justify-center max-w-7xl mx-auto w-full">
        {/* Profile Card */}
        <Card className="w-full  flex flex-col md:flex-row border-1 shadow-lg rounded-2xl overflow-hidden">
          {/* Profile Sidebar */}
          <div className="md:w-[35%] bg-muted/10 border-b md:border-b-0 md:border-r-2 p-8 flex flex-col">
            <div className="mb-10">
              <CardTitle className="text-[20px] font-medium">
                Personal Information
              </CardTitle>
              <CardDescription>
                Your identity as it appears across the platform.
              </CardDescription>
            </div>
            
            <div className="flex flex-col items-center text-center gap-4 py-8">
              <div className="h-23 w-23 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20 shadow-inner">
                <span className="text-2xl font-semibold text-primary">
                  {firstName.charAt(0)}{lastName.charAt(0) || "U"}
                </span>
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight text-foreground ">
                  {firstName} {lastName}
                </h2>
                <p className="text-sm text-muted-foreground font-medium flex items-center justify-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  {profile?.email || "user@example.com"}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <CardContent className="flex-1 p-8 md:p-12 space-y-8 bg-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <Label className="text-sm font-medium  ml-1">
                  First Name
                </Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="text-sm h-10 focus-visible:ring-ui-border-shade"
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-sm font-medium  ml-1">
                  Last Name
                </Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="text-sm h-10 focus-visible:ring-ui-border-shade"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-medium  ml-1">
                Email Address
              </Label>
              <div className="relative ">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                <Input
                  value={profile?.email || ""}
                  disabled
                  placeholder="email@example.com"
                  className="font-bold  h-10 pl-12 focus-visible:ring-ui-border-shade cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium  ml-1">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="text-sm  h-10 pl-12 focus-visible:ring-ui-border-shade"
                  type="tel"
                />
              </div>
            </div>

            {/* Save Button at Bottom */}
            <div className="pt-8 border-t-2 flex items-center justify-between">
              {profile?.updated_at && (
                <p className="text-sm text-muted-foreground font-medium">
                  Last Updated: {new Date(profile.updated_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </p>
              )}
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                // className="rounded-md px-8 h-11 font-bold shadow-lg shadow-primary/20"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
