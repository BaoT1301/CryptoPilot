import type { Profile } from "@/types/profile";
import { apiCall } from "./http";

export async function getProfile(): Promise<Profile> {
  return apiCall<Profile>("/profile/get-me", "GET");
}

export async function updateProfile(data: Partial<{
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
}>): Promise<Profile> {
  return apiCall<Profile>("/profile/update", "PUT", data);
}
