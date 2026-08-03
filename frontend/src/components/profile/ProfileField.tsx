import { Separator } from "@/components/ui/separator";

export default function ProfileField({ label, value } : { label: string; value: string}) {
  return (
    <div>
      <div className="flex justify-between py-2">
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground">{value}</p>
      </div>
      <Separator />
    </div>
  );
}
