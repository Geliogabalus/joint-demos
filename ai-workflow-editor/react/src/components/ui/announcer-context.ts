// Context + hook for the screen-reader announcer; split from the provider for Fast Refresh.
import { createContext, useContext } from "react";

export type Announce = (message: string) => void;

export const AnnouncerContext = createContext<Announce>(() => {});

/** Returns `announce(message)` — speaks a short status to screen readers. */
export function useAnnounce(): Announce {
  return useContext(AnnouncerContext);
}
