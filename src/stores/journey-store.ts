import { create } from "zustand";

import type { JourneyDTO } from "@/types/dto";

interface JourneyState {
  journey: JourneyDTO | null;
  isLoading: boolean;
  error: string | null;
  setJourney: (journey: JourneyDTO | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  journey: null,
  isLoading: false,
  error: null,
};

export const useJourneyStore = create<JourneyState>((set) => ({
  ...initialState,
  setJourney: (journey) => set({ journey, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
