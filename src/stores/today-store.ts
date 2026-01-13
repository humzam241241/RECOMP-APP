import { create } from "zustand";

import type {
  WorkoutSessionDTO,
  NutritionPlanDTO,
} from "@/types/dto";

interface TodayState {
  workout: WorkoutSessionDTO | null;
  nutrition: NutritionPlanDTO | null;
  activePanel: "workout" | "nutrition" | "dopamine" | "mindset" | null;
  isLoading: boolean;
  error: string | null;
  setWorkout: (workout: WorkoutSessionDTO | null) => void;
  setNutrition: (nutrition: NutritionPlanDTO | null) => void;
  setActivePanel: (panel: TodayState["activePanel"]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  workout: null,
  nutrition: null,
  activePanel: null as TodayState["activePanel"],
  isLoading: false,
  error: null,
};

export const useTodayStore = create<TodayState>((set) => ({
  ...initialState,
  setWorkout: (workout) => set({ workout }),
  setNutrition: (nutrition) => set({ nutrition }),
  setActivePanel: (activePanel) => set({ activePanel }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
