import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/api/profile";
import ProfileForm from "@/components/profile/ProfileForm";
import AvatarUpload from "@/components/profile/AvatarUpload";
import type { Profile } from "@/types/profile";
import { useAuth } from "@/lib/AuthContext";
import { updateProfile } from "@/api/profile";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
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
          onChange={async (url) => {
            setAvatar(url);
            localStorage.setItem("user_avatar", url);
            await updateProfile({ avatar: url });
            if (user) setUser({ ...user, avatar: url });
          }}
        />
      </div>

      <ProfileForm profile={{ ...profile, avatar: avatar ?? profile.avatar }} />
    </div>
  );
}
