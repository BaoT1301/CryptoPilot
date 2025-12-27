import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "@/api/profile";
import type { Profile } from "@/types/profile";

export default function ProfileForm({ profile }: { profile: Profile }) {
  const nameParts = profile.name?.trim().split(" ") ?? [];

  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(
    nameParts.slice(1).join(" ") || ""
  );
  const [phone, setPhone] = useState(profile.phone || "");

  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const handleSave = () => {
    const safeFirstName = firstName.trim();
    if (!safeFirstName) return; // prevent backend error

    const safeLastName = lastName.trim() || "_";

    const payload: {
      firstName: string;
      lastName: string;
      avatar?: string;
      phone?: string;
    } = {
      firstName: safeFirstName,
      lastName: safeLastName,
      avatar: profile.avatar,
    };

    if (phone.trim()) {
      payload.phone = phone.trim(); // only send if valid
    }

    mutation.mutate(payload);
  };

  return (
    <>
      <input
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First name"
      />
      <input
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last name"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone"
      />

      <button onClick={handleSave} disabled={mutation.isPending}>
        Save
      </button>
    </>
  );
}
