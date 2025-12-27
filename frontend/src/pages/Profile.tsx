import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/api/profile";
import ProfileForm from "@/components/profile/ProfileForm";
import AvatarUpload from "@/components/profile/AvatarUpload";
import type { Profile } from "@/types/profile";

export default function ProfilePage() {
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  if (isLoading) return <div>Loading...</div>;
  if (error || !profile) return <div>Error loading profile</div>;

  return (
    <div className="space-y-6  max-w-lg mx-auto py-12">
      <div className="flex justify-center">
        <AvatarUpload
          value={avatar ?? profile.avatar}
          onChange={setAvatar} //
        />
      </div>

      <ProfileForm profile={{ ...profile, avatar: avatar ?? profile.avatar }} />
    </div>
  );
}
