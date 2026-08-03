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

  // Both states were bare unstyled divs rendering flush against the header
  // with no container and no way to recover.
  if (isLoading)
    return (
      <main className="mx-auto max-w-lg px-6 py-20">
        <p className="text-sm text-muted-foreground">Loading your profile</p>
      </main>
    );

  if (error || !profile)
    return (
      <main className="mx-auto max-w-lg px-6 py-20">
        <h1 className="text-xl font-normal tracking-[-0.02em] text-foreground">
          Could not load your profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The request did not come back. Check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-[1px] active:scale-[0.98]"
        >
          Retry
        </button>
      </main>
    );

  return (
    <main className="mx-auto max-w-lg space-y-8 px-6 py-14">
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
    </main>
  );
}
