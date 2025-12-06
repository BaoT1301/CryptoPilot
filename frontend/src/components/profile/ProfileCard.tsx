import { Card, CardHeader, CardContent } from "@/components/ui/card"; 
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProfileField from "./ProfileField";


type Profile = {
  name: string;
  email: string;
  username: string;
  country: string;
  phone: string;
  joinDate: string;
  avatar: string;
};

export default function ProfileCard({ profile } : { profile: Profile}) {
  return (
    <Card className="w-full">
      <CardHeader className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.avatar} />
          <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div>
          <h2 className="text-2xl font-semibold">{profile.name}</h2>
          <p className="text-muted-foreground">@{profile.username}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ProfileField label="Email" value={profile.email} />
        <ProfileField label="Country" value={profile.country} />
        <ProfileField label="Phone" value={profile.phone} />
        <ProfileField label="Joined" value={profile.joinDate} />
      </CardContent>
    </Card>
  );
}
