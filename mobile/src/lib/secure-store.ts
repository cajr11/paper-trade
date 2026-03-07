import { deleteItemAsync, setItemAsync, getItemAsync } from "expo-secure-store";

export async function setStorageItemAsync(key: string, value: string | null) {
  if (value == null) {
    await deleteItemAsync(key);
  } else {
    await setItemAsync(key, value);
  }
}

export async function getStorageItemAsync(key: string): Promise<string | null> {
  const value = await getItemAsync(key);

  return value;
}
