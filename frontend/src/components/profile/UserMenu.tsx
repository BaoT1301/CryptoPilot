import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import type { Profile } from "@/types/profile";

export default function UserMenu({ profile }: { profile: Profile }) {
  const nav = useNavigate();

  const initials =
    profile.name
      ?.split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("") || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={
              profile.avatar?.startsWith("http")
                ? profile.avatar
                : undefined
            }
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => nav("/profile")}>
          Profile
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
