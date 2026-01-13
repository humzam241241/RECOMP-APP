import { create } from "zustand";

import type { DopamineDailyDTO, HabitLogDTO } from "@/types/dto";

interface DopamineState {
  dopamine: DopamineDailyDTO | null;
  pendingSwap: HabitLogDTO | null;
  showSwapPrompt: boolean;
  isLoading: boolean;
  error: string | null;
  setDopamine: (dopamine: DopamineDailyDTO | null) => void;
  setPendingSwap: (log: HabitLogDTO | null) => void;
  setShowSwapPrompt: (show: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  dopamine: null,
  pendingSwap: null,
  showSwapPrompt: false,
  isLoading: false,
  error: null,
};

export const useDopamineStore = create<DopamineState>((set) => ({
  ...initialState,
  setDopamine: (dopamine) => set({ dopamine }),
  setPendingSwap: (pendingSwap) => set({ pendingSwap }),
  setShowSwapPrompt: (showSwapPrompt) => set({ showSwapPrompt }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
