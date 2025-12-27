import type { Profile } from "@/types/profile";

const API_BASE = "http://localhost:3000"; 

export const getProfile = async (): Promise<Profile> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No token in localStorage");

  const res = await fetch(`${API_BASE}/api/profile/get-me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to fetch profile");
  }

  const data = json.data;

  return {
    name: data.name?.trim() || "User",
    phone: data.phone?.trim() || undefined,
    country: data.country || undefined,
    joinDate: data.joinDate,
    avatar: data.avatar?.trim() || undefined, 
  };
};

export async function updateProfile(data: {
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
}) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("No access token");
  }

  const res = await fetch(`${API_BASE}/api/profile/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Failed to update profile");
  }

  return json.data as Profile;
}