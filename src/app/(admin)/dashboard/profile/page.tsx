import { ProfileCard } from "@/components/profile/profile-card";

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-6 px-4 md:px-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>
      
      <div className="flex justify-center">
        <ProfileCard />
      </div>
    </div>
  );
}
