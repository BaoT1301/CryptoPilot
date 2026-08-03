import type { Profile } from "@/types/profile";
import ProfileField from "./ProfileField";

export default function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <>
      <ProfileField label="Name" value={profile.name || "N/A"} />
      <ProfileField label="Phone" value={profile.phone || "N/A"} />
      <ProfileField label="Country" value={profile.country || "N/A"} />
      <ProfileField
        label="Joined"
        value={new Date(profile.joinDate).toLocaleDateString()}
      />
    </>
  );
}
