import { create } from "zustand";

import type { MindsetTodayDTO, MindsetLessonDTO } from "@/types/dto";

interface MindsetState {
  mindset: MindsetTodayDTO | null;
  activeLesson: MindsetLessonDTO | null;
  isReading: boolean;
  isLoading: boolean;
  error: string | null;
  setMindset: (mindset: MindsetTodayDTO | null) => void;
  setActiveLesson: (lesson: MindsetLessonDTO | null) => void;
  setIsReading: (isReading: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  mindset: null,
  activeLesson: null,
  isReading: false,
  isLoading: false,
  error: null,
};

export const useMindsetStore = create<MindsetState>((set) => ({
  ...initialState,
  setMindset: (mindset) => set({ mindset }),
  setActiveLesson: (activeLesson) => set({ activeLesson }),
  setIsReading: (isReading) => set({ isReading }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
