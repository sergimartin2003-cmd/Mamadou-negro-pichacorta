import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FeedDensity = "comfortable" | "compact";

interface UiState {
  /** Feed card density, persisted across sessions. */
  feedDensity: FeedDensity;
  setFeedDensity: (density: FeedDensity) => void;
  toggleFeedDensity: () => void;
}

/**
 * Client UI preferences (Zustand + localStorage persistence). Components that
 * render server-side must gate on a mounted flag before applying the persisted
 * value to avoid hydration mismatches (see feed-client).
 */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      feedDensity: "comfortable",
      setFeedDensity: (feedDensity) => set({ feedDensity }),
      toggleFeedDensity: () =>
        set((state) => ({
          feedDensity: state.feedDensity === "compact" ? "comfortable" : "compact",
        })),
    }),
    { name: "emprendehub-ui" },
  ),
);
