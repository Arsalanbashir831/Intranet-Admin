"use client";

import { useProfile } from "@/hooks/queries/use-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileCard() {
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load profile</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No profile data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.profile_picture_url} alt={profile.full_name} />
            <AvatarFallback>
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{profile.full_name}</h3>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Email</span>
            <span className="text-sm">{profile.email}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Role</span>
            <Badge variant="secondary">{profile.role}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge 
              variant={profile.status === 'ACTIVE' ? 'default' : 'destructive'}
            >
              {profile.status}
            </Badge>
          </div>
          
          {profile.phone_number && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Phone</span>
              <span className="text-sm">{profile.phone_number}</span>
            </div>
          )}
          
          {profile.city && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Location</span>
              <span className="text-sm">{profile.city}, {profile.country}</span>
            </div>
          )}
        </div>
        
        {profile.about && (
          <div>
            <span className="text-sm font-medium">About</span>
            <p className="text-sm text-muted-foreground mt-1">{profile.about}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
