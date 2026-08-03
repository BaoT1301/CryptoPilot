export const uploadToBunny = async (file: File): Promise<string> => {
  const storage = import.meta.env.VITE_BUNNY_STORAGE_NAME;
  const password = import.meta.env.VITE_BUNNY_STORAGE_PASSWORD;
  const pullUrl = import.meta.env.VITE_BUNNY_PULL_URL;

  const safeName = file.name.replace(/\s+/g, "-");
  const fileName = `${Date.now()}-${safeName}`;
  const uploadUrl = `https://storage.bunnycdn.com/${storage}/${fileName}`;

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      AccessKey: password,
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  return `${pullUrl}/${fileName}?v=${Date.now()}`;
};
