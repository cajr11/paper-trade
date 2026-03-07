import { useEffect, useCallback, useReducer } from "react";
import { getStorageItemAsync, setStorageItemAsync } from "@/lib/secure-store";

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
  return useReducer(
    (
      _state: [boolean, T | null],
      action: T | null = null,
    ): [boolean, T | null] => [false, action],
    initialValue,
  ) as UseStateHook<T>;
}

export function useStorageState(key: string): UseStateHook<string> {
  // Public
  const [state, setState] = useAsyncState<string>();

  // Get
  useEffect(() => {
    getStorageItemAsync(key)
      .then((value: string | null) => {
        setState(value);
      })
      .catch((error) => console.error(error));
  }, [key]);

  // Set
  const setValue = useCallback(
    (value: string | null) => {
      setState(value);
      setStorageItemAsync(key, value).catch((error) => console.error(error));
    },
    [key],
  );

  return [state, setValue];
}
