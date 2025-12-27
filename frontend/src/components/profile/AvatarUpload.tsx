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
      <img
        src={value || "https://ui-avatars.com/api/?name=User"}
        className="w-20 h-20 rounded-full object-cover"
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
