const PLACEHOLDER_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23edeae2'/%3E%3Ccircle cx='40' cy='31' r='13' fill='%23c6c0b4'/%3E%3Cpath d='M14 74c0-14.4 11.6-26 26-26s26 11.6 26 26z' fill='%23c6c0b4'/%3E%3C/svg%3E";

import { uploadToBunny } from "@/utils/bunnyUpload";

export default function AvatarUpload({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const handleUpload = async (file: File) => {
    const url = await uploadToBunny(file);
    onChange(url);
  };

  return (
    <label className="cursor-pointer">
      {/* Falls back to a local placeholder. The previous default fetched an
          avatar from ui-avatars.com on every profile view: a third-party
          request, an uncontrollable colour, and a needless privacy leak. */}
      <img
        src={value || PLACEHOLDER_AVATAR}
        className="size-20 rounded-full border border-border object-cover transition-opacity hover:opacity-80"
      />
      <input
        type="file"
        accept="image/*"
        hidden
        onChange={(e) =>
          e.target.files && handleUpload(e.target.files[0])
        }
      />
    </label>
  );
}
