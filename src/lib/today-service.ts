import prisma from "@/lib/prisma";
import type {
  DopamineDailyDTO,
  ExerciseDTO,
  ExerciseSetDTO,
  HabitDTO,
  HabitLogDTO,
  JourneyDTO,
  MindsetLessonDTO,
  MindsetTodayDTO,
  NutritionLogDTO,
  NutritionPlanDTO,
  WorkoutSessionDTO,
} from "@/types/dto";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const WORKOUT_ROTATION = ["push", "pull", "legs", "rest", "push", "pull", "legs"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getPhase(dayNumber: number): "foundation" | "build" | "optimize" {
  if (dayNumber <= 30) return "foundation";
  if (dayNumber <= 60) return "build";
  return "optimize";
}

function getWorkoutType(dayNumber: number): string {
  const index = (dayNumber - 1) % WORKOUT_ROTATION.length;
  return WORKOUT_ROTATION[index];
}

function calculateDayNumber(startDate: Date): number {
  const now = new Date();
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(90, diffDays + 1));
}

// ─────────────────────────────────────────────────────────────────────────────
// JOURNEY SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export async function getOrCreateActiveJourney(userId: string) {
  let journey = await prisma.journey.findFirst({
    where: { userId, isActive: true },
  });

  if (!journey) {
    journey = await prisma.journey.create({
      data: {
        userId,
        startDate: new Date(),
        currentDay: 1,
        phase: "foundation",
        isActive: true,
      },
    });
  }

  const dayNumber = calculateDayNumber(journey.startDate);
  const phase = getPhase(dayNumber);

  if (journey.currentDay !== dayNumber || journey.phase !== phase) {
    journey = await prisma.journey.update({
      where: { id: journey.id },
      data: { currentDay: dayNumber, phase },
    });
  }

  return journey;
}

export function toJourneyDTO(journey: {
  id: string;
  userId: string;
  startDate: Date;
  currentDay: number;
  phase: string;
  isActive: boolean;
  completedAt: Date | null;
}): JourneyDTO {
  const daysRemaining = Math.max(0, 90 - journey.currentDay);
  const progressPercent = Math.round((journey.currentDay / 90) * 100);

  return {
    id: journey.id,
    userId: journey.userId,
    startDate: journey.startDate.toISOString(),
    currentDay: journey.currentDay,
    phase: journey.phase as "foundation" | "build" | "optimize",
    isActive: journey.isActive,
    completedAt: journey.completedAt?.toISOString() ?? null,
    daysRemaining,
    progressPercent,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKOUT SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export async function getOrCreateTodayWorkout(userId: string, journeyId: string, dayNumber: number) {
  let workout = await prisma.workoutSession.findUnique({
    where: {
      userId_dayNumber_journeyId: { userId, dayNumber, journeyId },
    },
    include: {
      exercises: {
        include: { sets: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!workout) {
    const workoutType = getWorkoutType(dayNumber);

    workout = await prisma.workoutSession.create({
      data: {
        userId,
        journeyId,
        dayNumber,
        workoutType,
        status: "pending",
      },
      include: {
        exercises: {
          include: { sets: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (workoutType !== "rest") {
      const exercises = getDefaultExercises(workoutType);
      for (let i = 0; i < exercises.length; i++) {
        const exercise = await prisma.exercise.create({
          data: {
            workoutSessionId: workout.id,
            name: exercises[i].name,
            targetSets: exercises[i].targetSets,
            targetReps: exercises[i].targetReps,
            restSeconds: exercises[i].restSeconds,
            orderIndex: i,
          },
        });

        for (let setNum = 1; setNum <= exercises[i].targetSets; setNum++) {
          await prisma.exerciseSet.create({
            data: {
              exerciseId: exercise.id,
              setNumber: setNum,
            },
          });
        }
      }

      workout = await prisma.workoutSession.findUnique({
        where: { id: workout.id },
        include: {
          exercises: {
            include: { sets: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      });
    }
  }

  return workout!;
}

function getDefaultExercises(workoutType: string) {
  const exercises: { name: string; targetSets: number; targetReps: string; restSeconds: number }[] = [];

  switch (workoutType) {
    case "push":
      exercises.push(
        { name: "Bench Press", targetSets: 4, targetReps: "6-8", restSeconds: 120 },
        { name: "Overhead Press", targetSets: 3, targetReps: "8-10", restSeconds: 90 },
        { name: "Incline Dumbbell Press", targetSets: 3, targetReps: "10-12", restSeconds: 90 },
        { name: "Lateral Raises", targetSets: 3, targetReps: "12-15", restSeconds: 60 },
        { name: "Tricep Pushdowns", targetSets: 3, targetReps: "12-15", restSeconds: 60 }
      );
      break;
    case "pull":
      exercises.push(
        { name: "Deadlift", targetSets: 4, targetReps: "5-6", restSeconds: 180 },
        { name: "Pull-ups", targetSets: 3, targetReps: "8-10", restSeconds: 90 },
        { name: "Barbell Rows", targetSets: 3, targetReps: "8-10", restSeconds: 90 },
        { name: "Face Pulls", targetSets: 3, targetReps: "15-20", restSeconds: 60 },
        { name: "Bicep Curls", targetSets: 3, targetReps: "12-15", restSeconds: 60 }
      );
      break;
    case "legs":
      exercises.push(
        { name: "Squats", targetSets: 4, targetReps: "6-8", restSeconds: 180 },
        { name: "Romanian Deadlifts", targetSets: 3, targetReps: "8-10", restSeconds: 90 },
        { name: "Leg Press", targetSets: 3, targetReps: "10-12", restSeconds: 90 },
        { name: "Leg Curls", targetSets: 3, targetReps: "12-15", restSeconds: 60 },
        { name: "Calf Raises", targetSets: 4, targetReps: "15-20", restSeconds: 60 }
      );
      break;
    default:
      break;
  }

  return exercises;
}

export function toWorkoutSessionDTO(workout: {
  id: string;
  dayNumber: number | null;
  workoutType: string;
  status: string;
  scheduledAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  duration: number | null;
  notes: string | null;
  exercises: Array<{
    id: string;
    name: string;
    targetSets: number;
    targetReps: string;
    restSeconds: number;
    orderIndex: number;
    notes: string | null;
    sets: Array<{
      id: string;
      setNumber: number;
      weight: number | null;
      reps: number | null;
      rpe: number | null;
      isCompleted: boolean;
      completedAt: Date | null;
      notes: string | null;
    }>;
  }>;
}): WorkoutSessionDTO {
  const exercises: ExerciseDTO[] = workout.exercises.map((ex) => {
    const sets: ExerciseSetDTO[] = ex.sets.map((s) => ({
      id: s.id,
      setNumber: s.setNumber,
      weight: s.weight,
      reps: s.reps,
      rpe: s.rpe,
      isCompleted: s.isCompleted,
      completedAt: s.completedAt?.toISOString() ?? null,
      notes: s.notes,
    }));

    const completedSets = sets.filter((s) => s.isCompleted).length;

    return {
      id: ex.id,
      name: ex.name,
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
      restSeconds: ex.restSeconds,
      orderIndex: ex.orderIndex,
      notes: ex.notes,
      sets,
      completedSets,
      isComplete: completedSets >= ex.targetSets,
    };
  });

  const totalExercises = exercises.length;
  const completedExercises = exercises.filter((e) => e.isComplete).length;
  const progressPercent = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  return {
    id: workout.id,
    dayNumber: workout.dayNumber ?? 1,
    workoutType: workout.workoutType,
    status: workout.status as "pending" | "in_progress" | "completed" | "skipped",
    scheduledAt: workout.scheduledAt?.toISOString() ?? null,
    startedAt: workout.startedAt?.toISOString() ?? null,
    completedAt: workout.completedAt?.toISOString() ?? null,
    duration: workout.duration,
    notes: workout.notes,
    exercises,
    totalExercises,
    completedExercises,
    progressPercent,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// NUTRITION SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export async function getOrCreateTodayNutrition(userId: string, journeyId: string, dayNumber: number) {
  let nutrition = await prisma.nutritionPlan.findUnique({
    where: {
      userId_dayNumber_journeyId: { userId, dayNumber, journeyId },
    },
    include: {
      nutritionLogs: {
        orderBy: { loggedAt: "desc" },
      },
    },
  });

  if (!nutrition) {
    const phase = getPhase(dayNumber);
    const targets = getNutritionTargets(phase);

    nutrition = await prisma.nutritionPlan.create({
      data: {
        userId,
        journeyId,
        dayNumber,
        ...targets,
      },
      include: {
        nutritionLogs: {
          orderBy: { loggedAt: "desc" },
        },
      },
    });
  }

  return nutrition;
}

function getNutritionTargets(phase: "foundation" | "build" | "optimize") {
  switch (phase) {
    case "foundation":
      return { targetCalories: 2000, targetProtein: 150, targetCarbs: 200, targetFat: 70 };
    case "build":
      return { targetCalories: 2200, targetProtein: 170, targetCarbs: 220, targetFat: 75 };
    case "optimize":
      return { targetCalories: 2400, targetProtein: 180, targetCarbs: 250, targetFat: 80 };
  }
}

export function toNutritionPlanDTO(nutrition: {
  id: string;
  dayNumber: number | null;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  mealPlan: string | null;
  nutritionLogs: Array<{
    id: string;
    mealType: string;
    description: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    loggedAt: Date;
  }>;
}): NutritionPlanDTO {
  const logs: NutritionLogDTO[] = nutrition.nutritionLogs.map((log) => ({
    id: log.id,
    mealType: log.mealType as "breakfast" | "lunch" | "dinner" | "snack",
    description: log.description,
    calories: log.calories,
    protein: log.protein,
    carbs: log.carbs,
    fat: log.fat,
    loggedAt: log.loggedAt.toISOString(),
  }));

  const totals = logs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      carbs: acc.carbs + log.carbs,
      fat: acc.fat + log.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return {
    id: nutrition.id,
    dayNumber: nutrition.dayNumber ?? 1,
    targetCalories: nutrition.targetCalories,
    targetProtein: nutrition.targetProtein,
    targetCarbs: nutrition.targetCarbs,
    targetFat: nutrition.targetFat,
    mealPlan: nutrition.mealPlan,
    logs,
    totals,
    remaining: {
      calories: nutrition.targetCalories - totals.calories,
      protein: nutrition.targetProtein - totals.protein,
      carbs: nutrition.targetCarbs - totals.carbs,
      fat: nutrition.targetFat - totals.fat,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DOPAMINE SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export async function getOrCreateTodayDopamine(userId: string, journeyId: string, dayNumber: number) {
  let dopamine = await prisma.dopamineDaily.findUnique({
    where: {
      userId_dayNumber_journeyId: { userId, dayNumber, journeyId },
    },
    include: {
      habitLogs: {
        include: { habit: true },
        orderBy: { loggedAt: "desc" },
      },
    },
  });

  if (!dopamine) {
    await ensureDefaultHabits(userId);

    const yesterdayDopamine = await prisma.dopamineDaily.findUnique({
      where: {
        userId_dayNumber_journeyId: { userId, dayNumber: dayNumber - 1, journeyId },
      },
    });

    const streakDays = yesterdayDopamine?.goodCount && yesterdayDopamine.goodCount > 0 
      ? (yesterdayDopamine.streakDays || 0) + 1 
      : 0;

    dopamine = await prisma.dopamineDaily.create({
      data: {
        userId,
        journeyId,
        dayNumber,
        streakDays,
      },
      include: {
        habitLogs: {
          include: { habit: true },
          orderBy: { loggedAt: "desc" },
        },
      },
    });
  }

  return dopamine;
}

async function ensureDefaultHabits(userId: string) {
  const existingHabits = await prisma.habit.findMany({
    where: { userId },
  });

  if (existingHabits.length === 0) {
    const defaultHabits = [
      { name: "Morning Workout", type: "good", category: "exercise" },
      { name: "8 Hours Sleep", type: "good", category: "sleep" },
      { name: "Hit Protein Goal", type: "good", category: "nutrition" },
      { name: "10 Min Meditation", type: "good", category: "mindfulness" },
      { name: "10K Steps", type: "good", category: "exercise" },
      { name: "Social Media Scrolling", type: "bad", category: "vice" },
      { name: "Late Night Snacking", type: "bad", category: "nutrition" },
      { name: "Skipped Workout", type: "bad", category: "exercise" },
      { name: "Alcohol", type: "bad", category: "vice" },
      { name: "Processed Food", type: "bad", category: "nutrition" },
    ];

    await prisma.habit.createMany({
      data: defaultHabits.map((h) => ({ ...h, userId })),
    });
  }
}

export async function getAvailableHabits(userId: string) {
  return prisma.habit.findMany({
    where: { userId, isActive: true },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

export function toDopamineDailyDTO(
  dopamine: {
    id: string;
    dayNumber: number | null;
    score: number;
    goodCount: number;
    badCount: number;
    streakDays: number;
    firstWin: boolean;
    swapBonus: boolean;
    streakBonus: boolean;
    perfectDay: boolean;
    habitLogs: Array<{
      id: string;
      habitId: string;
      type: string;
      loggedAt: Date;
      notes: string | null;
      swapFromLogId: string | null;
      habit: {
        name: string;
      };
    }>;
  },
  availableHabits: Array<{
    id: string;
    name: string;
    description: string | null;
    type: string;
    category: string | null;
    isActive: boolean;
  }>
): DopamineDailyDTO {
  const logs: HabitLogDTO[] = dopamine.habitLogs.map((log) => ({
    id: log.id,
    habitId: log.habitId,
    habitName: log.habit.name,
    type: log.type as "good" | "bad",
    loggedAt: log.loggedAt.toISOString(),
    notes: log.notes,
    swapFromLogId: log.swapFromLogId,
  }));

  const habits: HabitDTO[] = availableHabits.map((h) => ({
    id: h.id,
    name: h.name,
    description: h.description,
    type: h.type as "good" | "bad",
    category: h.category,
    isActive: h.isActive,
  }));

  return {
    id: dopamine.id,
    dayNumber: dopamine.dayNumber ?? 1,
    score: dopamine.score,
    goodCount: dopamine.goodCount,
    badCount: dopamine.badCount,
    streakDays: dopamine.streakDays,
    firstWin: dopamine.firstWin,
    swapBonus: dopamine.swapBonus,
    streakBonus: dopamine.streakBonus,
    perfectDay: dopamine.perfectDay,
    logs,
    availableHabits: {
      good: habits.filter((h) => h.type === "good"),
      bad: habits.filter((h) => h.type === "bad"),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MINDSET SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export async function getOrCreateTodayMindset(userId: string, dayNumber: number) {
  const lessons = await prisma.mindsetLesson.findMany({
    where: {
      unlockDay: { lte: dayNumber },
    },
    orderBy: [{ unlockDay: "asc" }, { orderIndex: "asc" }],
  });

  const existingProgress = await prisma.mindsetProgress.findMany({
    where: { userId },
  });

  const progressMap = new Map(existingProgress.map((p) => [p.mindsetLessonId, p]));

  for (const lesson of lessons) {
    if (!progressMap.has(lesson.id)) {
      const progress = await prisma.mindsetProgress.create({
        data: {
          userId,
          mindsetLessonId: lesson.id,
          isUnlocked: true,
          unlockedAt: new Date(),
        },
      });
      progressMap.set(lesson.id, progress);
    }
  }

  const lessonsWithProgress = lessons.map((lesson) => {
    const progress = progressMap.get(lesson.id);
    return { lesson, progress };
  });

  return lessonsWithProgress;
}

export function toMindsetTodayDTO(
  lessonsWithProgress: Array<{
    lesson: {
      id: string;
      title: string;
      description: string | null;
      content: string;
      unlockDay: number;
      category: string | null;
      duration: number;
    };
    progress?: {
      isUnlocked: boolean;
      isCompleted: boolean;
      unlockedAt: Date | null;
      completedAt: Date | null;
    };
  }>,
  currentDayNumber: number
): MindsetTodayDTO {
  const mappedLessons: MindsetLessonDTO[] = lessonsWithProgress.map(({ lesson, progress }) => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    content: lesson.content,
    unlockDay: lesson.unlockDay,
    category: lesson.category,
    duration: lesson.duration,
    isUnlocked: progress?.isUnlocked ?? false,
    isCompleted: progress?.isCompleted ?? false,
    unlockedAt: progress?.unlockedAt?.toISOString() ?? null,
    completedAt: progress?.completedAt?.toISOString() ?? null,
  }));

  const currentDayLesson = mappedLessons.find((l) => l.unlockDay === currentDayNumber) ?? null;
  const unlockedLessons = mappedLessons.filter((l) => l.isUnlocked);
  const completedCount = mappedLessons.filter((l) => l.isCompleted).length;

  return {
    currentDayLesson,
    unlockedLessons,
    completedCount,
    totalAvailable: unlockedLessons.length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TODAY BUNDLE SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export async function getTodayBundle(userId: string) {
  const journey = await getOrCreateActiveJourney(userId);
  const dayNumber = journey.currentDay;

  const [workout, nutrition, dopamine, mindsetData, habits] = await Promise.all([
    getOrCreateTodayWorkout(userId, journey.id, dayNumber),
    getOrCreateTodayNutrition(userId, journey.id, dayNumber),
    getOrCreateTodayDopamine(userId, journey.id, dayNumber),
    getOrCreateTodayMindset(userId, dayNumber),
    getAvailableHabits(userId),
  ]);

  return {
    journey: toJourneyDTO(journey),
    workout: toWorkoutSessionDTO(workout),
    nutrition: toNutritionPlanDTO(nutrition),
    dopamine: toDopamineDailyDTO(dopamine, habits),
    mindset: toMindsetTodayDTO(mindsetData, dayNumber),
  };
}
