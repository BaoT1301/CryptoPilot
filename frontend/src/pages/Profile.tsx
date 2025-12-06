import ProfileCard from "../components/profile/ProfileCard";

export default function Profile() {
  const profile = {
    name: "Mai Long Vuong",
    email: "example@gmail.com",
    username: "mai.dev",
    country: "United States",
    phone: "+1 (123) 456 789",
    joinDate: "2025-11-28",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=MLV",
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-10">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <ProfileCard profile={profile} />
    </div>
  );
}
