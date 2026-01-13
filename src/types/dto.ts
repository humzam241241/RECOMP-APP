// ─────────────────────────────────────────────────────────────────────────────
// JOURNEY DTOs
// ─────────────────────────────────────────────────────────────────────────────

export interface JourneyDTO {
  id: string;
  userId: string;
  startDate: string;
  currentDay: number;
  phase: "foundation" | "build" | "optimize";
  isActive: boolean;
  completedAt: string | null;
  daysRemaining: number;
  progressPercent: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKOUT DTOs
// ─────────────────────────────────────────────────────────────────────────────

export interface ExerciseSetDTO {
  id: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  isCompleted: boolean;
  completedAt: string | null;
  notes: string | null;
}

export interface ExerciseDTO {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  orderIndex: number;
  notes: string | null;
  sets: ExerciseSetDTO[];
  completedSets: number;
  isComplete: boolean;
}

export interface WorkoutSessionDTO {
  id: string;
  dayNumber: number;
  workoutType: string;
  status: "pending" | "in_progress" | "completed" | "skipped";
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  notes: string | null;
  exercises: ExerciseDTO[];
  totalExercises: number;
  completedExercises: number;
  progressPercent: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// NUTRITION DTOs
// ─────────────────────────────────────────────────────────────────────────────

export interface NutritionLogDTO {
  id: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  description: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
}

export interface NutritionPlanDTO {
  id: string;
  dayNumber: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  mealPlan: string | null;
  logs: NutritionLogDTO[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  remaining: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HABIT & DOPAMINE DTOs
// ─────────────────────────────────────────────────────────────────────────────

export interface HabitDTO {
  id: string;
  name: string;
  description: string | null;
  type: "good" | "bad";
  category: string | null;
  isActive: boolean;
}

export interface HabitLogDTO {
  id: string;
  habitId: string;
  habitName: string;
  type: "good" | "bad";
  loggedAt: string;
  notes: string | null;
  swapFromLogId: string | null;
}

export interface DopamineDailyDTO {
  id: string;
  dayNumber: number;
  score: number;
  goodCount: number;
  badCount: number;
  streakDays: number;
  firstWin: boolean;
  swapBonus: boolean;
  streakBonus: boolean;
  perfectDay: boolean;
  logs: HabitLogDTO[];
  availableHabits: {
    good: HabitDTO[];
    bad: HabitDTO[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MINDSET DTOs
// ─────────────────────────────────────────────────────────────────────────────

export interface MindsetLessonDTO {
  id: string;
  title: string;
  description: string | null;
  content: string;
  unlockDay: number;
  category: string | null;
  duration: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  unlockedAt: string | null;
  completedAt: string | null;
}

export interface MindsetTodayDTO {
  currentDayLesson: MindsetLessonDTO | null;
  unlockedLessons: MindsetLessonDTO[];
  completedCount: number;
  totalAvailable: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// TODAY BUNDLE DTO
// ─────────────────────────────────────────────────────────────────────────────

export interface TodayBundleDTO {
  journey: JourneyDTO;
  workout: WorkoutSessionDTO;
  nutrition: NutritionPlanDTO;
  dopamine: DopamineDailyDTO;
  mindset: MindsetTodayDTO;
}

// ─────────────────────────────────────────────────────────────────────────────
// API REQUEST/RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface LogHabitRequest {
  habitId: string;
  notes?: string;
  swapFromLogId?: string;
}

export interface LogNutritionRequest {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface UpdateWorkoutSetRequest {
  setId: string;
  weight?: number;
  reps?: number;
  rpe?: number;
  isCompleted?: boolean;
  notes?: string;
}

export interface UpdateWorkoutSessionRequest {
  status?: "pending" | "in_progress" | "completed" | "skipped";
  notes?: string;
  sets?: UpdateWorkoutSetRequest[];
}
