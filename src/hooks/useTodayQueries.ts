"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  DopamineDailyDTO,
  JourneyDTO,
  LogHabitRequest,
  LogNutritionRequest,
  MindsetTodayDTO,
  NutritionPlanDTO,
  UpdateWorkoutSessionRequest,
  WorkoutSessionDTO,
} from "@/types/dto";

// ─────────────────────────────────────────────────────────────────────────────
// QUERY KEYS
// ─────────────────────────────────────────────────────────────────────────────

export const queryKeys = {
  journey: {
    today: ["journey", "today"] as const,
  },
  workout: {
    today: ["workout", "today"] as const,
  },
  nutrition: {
    today: ["nutrition", "today"] as const,
  },
  dopamine: {
    today: ["dopamine", "today"] as const,
  },
  mindset: {
    today: ["mindset", "today"] as const,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FETCH FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// JOURNEY QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export function useJourneyToday() {
  return useQuery({
    queryKey: queryKeys.journey.today,
    queryFn: () => fetchJson<JourneyDTO>("/api/me/journey/today"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKOUT QUERIES & MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useWorkoutToday() {
  return useQuery({
    queryKey: queryKeys.workout.today,
    queryFn: () => fetchJson<WorkoutSessionDTO>("/api/me/workouts/today"),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: UpdateWorkoutSessionRequest;
    }) => {
      return fetchJson<WorkoutSessionDTO>(`/api/me/workouts/${sessionId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onMutate: async ({ sessionId, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.workout.today });

      const previousWorkout = queryClient.getQueryData<WorkoutSessionDTO>(
        queryKeys.workout.today
      );

      if (previousWorkout && data.sets) {
        const updatedWorkout = { ...previousWorkout };
        updatedWorkout.exercises = updatedWorkout.exercises.map((exercise) => ({
          ...exercise,
          sets: exercise.sets.map((set) => {
            const update = data.sets?.find((u) => u.setId === set.id);
            if (update) {
              return {
                ...set,
                weight: update.weight ?? set.weight,
                reps: update.reps ?? set.reps,
                rpe: update.rpe ?? set.rpe,
                isCompleted: update.isCompleted ?? set.isCompleted,
                completedAt: update.isCompleted ? new Date().toISOString() : set.completedAt,
              };
            }
            return set;
          }),
        }));

        queryClient.setQueryData(queryKeys.workout.today, updatedWorkout);
      }

      return { previousWorkout };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousWorkout) {
        queryClient.setQueryData(queryKeys.workout.today, context.previousWorkout);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workout.today });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// NUTRITION QUERIES & MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useNutritionToday() {
  return useQuery({
    queryKey: queryKeys.nutrition.today,
    queryFn: () => fetchJson<NutritionPlanDTO>("/api/me/nutrition/today"),
    staleTime: 1000 * 60 * 2,
  });
}

export function useLogNutrition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LogNutritionRequest) => {
      return fetchJson<NutritionPlanDTO>("/api/me/nutrition/today/log", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.nutrition.today, data);
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DOPAMINE QUERIES & MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useDopamineToday() {
  return useQuery({
    queryKey: queryKeys.dopamine.today,
    queryFn: () => fetchJson<DopamineDailyDTO>("/api/me/dopamine/today"),
    staleTime: 1000 * 60 * 2,
  });
}

export function useLogHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LogHabitRequest) => {
      return fetchJson<DopamineDailyDTO>("/api/me/dopamine/log", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onMutate: async (newHabit) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.dopamine.today });

      const previousDopamine = queryClient.getQueryData<DopamineDailyDTO>(
        queryKeys.dopamine.today
      );

      if (previousDopamine) {
        const habit =
          previousDopamine.availableHabits.good.find((h) => h.id === newHabit.habitId) ||
          previousDopamine.availableHabits.bad.find((h) => h.id === newHabit.habitId);

        if (habit) {
          const optimisticLog = {
            id: `temp-${Date.now()}`,
            habitId: newHabit.habitId,
            habitName: habit.name,
            type: habit.type as "good" | "bad",
            loggedAt: new Date().toISOString(),
            notes: newHabit.notes ?? null,
            swapFromLogId: newHabit.swapFromLogId ?? null,
          };

          const updatedDopamine: DopamineDailyDTO = {
            ...previousDopamine,
            logs: [optimisticLog, ...previousDopamine.logs],
            goodCount:
              habit.type === "good"
                ? previousDopamine.goodCount + 1
                : previousDopamine.goodCount,
            badCount:
              habit.type === "bad"
                ? previousDopamine.badCount + 1
                : previousDopamine.badCount,
            score:
              previousDopamine.score + (habit.type === "good" ? 10 : -5),
          };

          queryClient.setQueryData(queryKeys.dopamine.today, updatedDopamine);
        }
      }

      return { previousDopamine };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDopamine) {
        queryClient.setQueryData(queryKeys.dopamine.today, context.previousDopamine);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dopamine.today });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MINDSET QUERIES & MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useMindsetToday() {
  return useQuery({
    queryKey: queryKeys.mindset.today,
    queryFn: () => fetchJson<MindsetTodayDTO>("/api/me/mindset/today"),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCompleteMindsetLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      return fetchJson<MindsetTodayDTO>(`/api/me/mindset/${lessonId}/complete`, {
        method: "PATCH",
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.mindset.today, data);
    },
  });
}
