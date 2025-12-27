import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateProfile } from "@/api/profile";
import type { Profile } from "@/types/profile";

import { LoaderCircle, RotateCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

/* =====================
   Schema
===================== */
const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm({ profile }: { profile: Profile }) {
  const qc = useQueryClient();

  const buildDefaultValues = () => {
    const nameParts = profile.name?.trim().split(" ") ?? [];

    return {
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" "),
      phone: profile.phone || "",
    };
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
    },
    mode: "onBlur",
  });

  const { control, handleSubmit, reset } = form;

  useEffect(() => {
    reset(buildDefaultValues());
  }, [profile, reset]);

  /* =====================
     Sync profile → form
  ===================== */
  useEffect(() => {
    const nameParts = profile.name?.trim().split(" ") ?? [];

    reset({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" "),
      phone: profile.phone || "",
    });
  }, [profile, reset]);

  /* =====================
     Mutation
  ===================== */
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    mutation.mutate({
      firstName: values.firstName.trim(),
      lastName: values.lastName?.trim() || "_",
      phone: values.phone?.trim() || undefined,
      avatar: profile.avatar,
    });
  };

  /* =====================
     UI
  ===================== */
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* First name */}
        <FormField
          control={control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Last name */}
        <FormField
          control={control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Read-only fields */}
        <FormItem>
          <FormLabel>Country</FormLabel>
          <FormControl>
            <Input value={profile.country || ""} disabled />
          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel>Joined at</FormLabel>
          <FormControl>
            <Input
              value={new Date(profile.joinDate).toLocaleDateString()}
              disabled
            />
          </FormControl>
        </FormItem>

        <div className="flex gap-2 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset(buildDefaultValues())}
            disabled={mutation.isPending}
          >
            <RotateCw size={16} className="mr-1" aria-hidden />
            Reset
          </Button>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <LoaderCircle
                  size={16}
                  className="mr-1 animate-spin"
                  aria-hidden
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-1" aria-hidden />
                Save
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
