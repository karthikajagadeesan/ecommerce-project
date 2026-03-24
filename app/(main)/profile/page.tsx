"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import { UserStarIcon, Settings, Mail, Shield, Smartphone, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProfile, updateProfile } from "@/app/actions/profile-actions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

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
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (newName: string) => updateProfile(newName),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  const handleSave = () => {
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    updateMutation.mutate(fullName);
  };

  const breadcrumbs = [{ label: "Profile" }];

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Header
        icon={UserStarIcon}
        heading="User Profile"
        description="Manage your account settings and personal information."
        breadcrumbs={breadcrumbs}
        specialButtons={
          <Button 
            className="rounded-full shadow-lg shadow-primary/20"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
        {/* Profile Sidebar */}
        <Card className="md:col-span-1 border-2">
          <CardHeader className="flex flex-col items-center gap-4 pt-10 pb-8">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
              <span className="text-4xl font-black text-primary capitalize">
                {firstName.charAt(0) || profile?.email?.charAt(0) || "U"}
              </span>
            </div>
            <div className="text-center space-y-1">
              <CardTitle className="text-2xl font-black tracking-tight capitalize">
                {firstName} {lastName}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">
                {profile?.email || "user@example.com"}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0 border-t-2">
            <div className="divide-y-2">
              <div className="p-4 flex items-center gap-3 hover:bg-muted/50 cursor-pointer transition-colors">
                <Settings className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Account Settings
                </span>
              </div>
              <div className="p-4 flex items-center gap-3 hover:bg-muted/50 cursor-pointer transition-colors">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Email Notifications
                </span>
              </div>
              <div className="p-4 flex items-center gap-3 hover:bg-muted/50 cursor-pointer transition-colors text-destructive">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Security & Password
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="md:col-span-2 border-2 shadow-xl">
          <CardHeader className="bg-muted/10 border-b-2 p-6">
            <CardTitle className="text-sm font-bold uppercase tracking-widest">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  First Name
                </Label>
                <Input 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name" 
                  className="font-bold border-2 h-12" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Last Name
                </Label>
                <Input 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name" 
                  className="font-bold border-2 h-12" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  value={profile?.email || ""} 
                  disabled 
                  placeholder="email@example.com" 
                  className="font-bold border-2 h-12 pl-12 bg-muted/20" 
                />
              </div>
            </div>
            <div className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Add an extra layer of security to your account.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-2 font-bold px-6"
              >
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
