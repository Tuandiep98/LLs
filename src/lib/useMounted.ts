"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True only on the client, after hydration. Use for UI that reads browser storage. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
