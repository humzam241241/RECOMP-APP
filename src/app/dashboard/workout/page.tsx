"use client";

import { useState } from "react";

import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckIcon, ClockIcon, PlayIcon, PlusIcon, DumbbellIcon, ZapIcon, TargetIcon } from "@/components/ui/icons";
import { useJourneyToday, useWorkoutToday, useUpdateWorkout } from "@/hooks/useTodayQueries";
import type { ExerciseDTO, ExerciseSetDTO } from "@/types/dto";

interface WorkoutTemplate {
  id: string;
  name: string;
  type: string;
  duration: number;
  exercises: number;
  difficulty: string;
}

export default function WorkoutPage() {
  const { data: journey } = useJourneyToday();
  const { data: workout, isLoading } = useWorkoutToday();
  const updateWorkout = useUpdateWorkout();
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Mock workout templates
  const templates: WorkoutTemplate[] = [
    { id: "1", name: "Push Day - Strength", type: "strength", duration: 60, exercises: 5, difficulty: "intermediate" },
    { id: "2", name: "Pull Day - Strength", type: "strength", duration: 60, exercises: 5, difficulty: "intermediate" },
    { id: "3", name: "HIIT Cardio Blast", type: "hiit", duration: 30, exercises: 5, difficulty: "advanced" },
    { id: "4", name: "Hypertrophy Chest", type: "hypertrophy", duration: 50, exercises: 5, difficulty: "intermediate" },
    { id: "5", name: "Endurance Circuit", type: "endurance", duration: 40, exercises: 5, difficulty: "beginner" },
    { id: "6", name: "Leg Day - Hypertrophy", type: "hypertrophy", duration: 55, exercises: 5, difficulty: "intermediate" },
  ];

  const workoutTypes = ["all", "strength", "hiit", "hypertrophy", "endurance"];

  const filteredTemplates = activeFilter === "all" 
    ? templates 
    : templates.filter(t => t.type === activeFilter);

  const handleStartWorkout = () => {
    if (!workout) return;
    updateWorkout.mutate({
      sessionId: workout.id,
      data: { status: "in_progress" },
    });
  };

  const handleCompleteWorkout = () => {
    if (!workout) return;
    updateWorkout.mutate({
      sessionId: workout.id,
      data: { status: "completed" },
    });
  };

  const handleCompleteSet = (setId: string, weight: number, reps: number) => {
    if (!workout) return;
    updateWorkout.mutate({
      sessionId: workout.id,
      data: {
        sets: [{ setId, weight, reps, isCompleted: true }],
      },
    });
  };

  if (isLoading) {
    return (
      <div>
        <Header title="Workout" subtitle="Loading..." />
        <LoadingSpinner />
      </div>
    );
  }

  const isRestDay = workout?.workoutType === "rest";

  return (
    <div className="animate-fadeIn">
      <Header
        title={isRestDay ? "Rest Day" : "Workout"}
        subtitle={isRestDay ? "Recovery is essential for growth" : "Build strength, build discipline"}
        dayNumber={journey?.currentDay}
        phase={journey?.phase}
      />

      {/* Workout Type Filters */}
      <div
        style={{
          display: "flex",
          gap: "var(--spacing-sm)",
          marginBottom: "var(--spacing-xl)",
          overflowX: "auto",
          paddingBottom: "var(--spacing-sm)",
        }}
      >
        {workoutTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            style={{
              padding: "10px 20px",
              background: activeFilter === type ? "var(--accent-blue)" : "var(--background-tertiary)",
              border: "none",
              borderRadius: "var(--radius-full)",
              color: activeFilter === type ? "white" : "var(--foreground-secondary)",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              textTransform: "capitalize",
              whiteSpace: "nowrap",
            }}
          >
            {type === "all" ? "All Types" : type}
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--spacing-md)",
          marginBottom: "var(--spacing-xl)",
        }}
      >
        <QuickActionCard
          icon={<DumbbellIcon size={24} color="var(--accent-blue)" />}
          label="Strength"
          count={templates.filter(t => t.type === "strength").length}
          color="var(--accent-blue)"
          onClick={() => setActiveFilter("strength")}
        />
        <QuickActionCard
          icon={<ZapIcon size={24} color="var(--accent-orange)" />}
          label="HIIT"
          count={templates.filter(t => t.type === "hiit").length}
          color="var(--accent-orange)"
          onClick={() => setActiveFilter("hiit")}
        />
        <QuickActionCard
          icon={<TargetIcon size={24} color="var(--accent-purple)" />}
          label="Hypertrophy"
          count={templates.filter(t => t.type === "hypertrophy").length}
          color="var(--accent-purple)"
          onClick={() => setActiveFilter("hypertrophy")}
        />
        <Card variant="gradient" gradient="var(--gradient-green)" padding="md" hover onClick={() => setShowTemplates(true)}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PlusIcon size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 600 }}>Add Workout</div>
              <div style={{ fontSize: "13px", opacity: 0.8 }}>Create custom</div>
            </div>
          </div>
        </Card>
      </div>

      {isRestDay ? (
        <Card
          variant="gradient"
          gradient="linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
          padding="lg"
        >
          <div style={{ textAlign: "center", padding: "var(--spacing-2xl)" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto var(--spacing-lg)",
                borderRadius: "var(--radius-full)",
                background: "rgba(100, 210, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ClockIcon size={40} color="var(--accent-teal)" />
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "var(--spacing-sm)" }}>
              Active Recovery Day
            </h2>
            <p style={{ fontSize: "16px", color: "var(--foreground-secondary)", maxWidth: "500px", margin: "0 auto" }}>
              Your muscles grow during rest. Take today to walk, stretch, or do light mobility work.
            </p>
          </div>
        </Card>
      ) : workout ? (
        <>
          {/* Current Workout Status */}
          <Card variant="glass" padding="md" style={{ marginBottom: "var(--spacing-xl)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)", marginBottom: "var(--spacing-sm)" }}>
                  <StatusBadge status={workout.status} />
                  {workout.duration && (
                    <span style={{ fontSize: "14px", color: "var(--foreground-secondary)" }}>
                      {workout.duration} min
                    </span>
                  )}
                </div>
                <Progress value={workout.progressPercent} size="md" variant="gradient" style={{ width: "300px" }} />
              </div>
              <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
                {workout.status === "pending" && (
                  <Button onClick={handleStartWorkout} isLoading={updateWorkout.isPending}>
                    <PlayIcon size={18} /> Start Workout
                  </Button>
                )}
                {workout.status === "in_progress" && (
                  <Button variant="success" onClick={handleCompleteWorkout} isLoading={updateWorkout.isPending}>
                    <CheckIcon size={18} /> Complete
                  </Button>
                )}
                {workout.status === "completed" && (
                  <Button variant="secondary" disabled>
                    <CheckIcon size={18} /> Completed
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Exercises List */}
          <div className="stagger-children" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            {workout.exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index + 1}
                onCompleteSet={handleCompleteSet}
                disabled={workout.status === "pending" || workout.status === "completed"}
              />
            ))}
          </div>
        </>
      ) : (
        /* Workout Templates */
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "var(--spacing-lg)" }}>
            Choose a Workout
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "var(--spacing-md)",
            }}
          >
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplates && (
        <TemplateModal templates={filteredTemplates} onClose={() => setShowTemplates(false)} />
      )}
    </div>
  );
}

function QuickActionCard({
  icon,
  label,
  count,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
  onClick: () => void;
}) {
  return (
    <Card variant="default" padding="md" hover onClick={onClick}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-md)",
            background: `${color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--foreground)" }}>{label}</div>
          <div style={{ fontSize: "13px", color: "var(--foreground-tertiary)" }}>{count} workouts</div>
        </div>
      </div>
    </Card>
  );
}

function TemplateCard({ template }: { template: WorkoutTemplate }) {
  const typeColors: Record<string, string> = {
    strength: "var(--accent-blue)",
    hiit: "var(--accent-orange)",
    hypertrophy: "var(--accent-purple)",
    endurance: "var(--accent-green)",
  };

  return (
    <Card variant="default" padding="md" hover>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-md)" }}>
        <div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              background: `${typeColors[template.type]}20`,
              color: typeColors[template.type],
              textTransform: "uppercase",
            }}
          >
            {template.type}
          </span>
        </div>
        <span
          style={{
            fontSize: "12px",
            color:
              template.difficulty === "beginner"
                ? "var(--accent-green)"
                : template.difficulty === "intermediate"
                ? "var(--accent-orange)"
                : "var(--accent-red)",
            textTransform: "capitalize",
          }}
        >
          {template.difficulty}
        </span>
      </div>
      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>{template.name}</h3>
      <div style={{ display: "flex", gap: "var(--spacing-lg)", fontSize: "13px", color: "var(--foreground-tertiary)" }}>
        <span>{template.duration} min</span>
        <span>{template.exercises} exercises</span>
      </div>
    </Card>
  );
}

function ExerciseCard({
  exercise,
  index,
  onCompleteSet,
  disabled,
}: {
  exercise: ExerciseDTO;
  index: number;
  onCompleteSet: (setId: string, weight: number, reps: number) => void;
  disabled: boolean;
}) {
  return (
    <Card variant="default" padding="lg">
      <CardHeader>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: exercise.isComplete ? "var(--accent-green)" : "var(--background-tertiary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              {exercise.isComplete ? <CheckIcon size={18} color="white" /> : index}
            </div>
            <div>
              <CardTitle size="md">{exercise.name}</CardTitle>
              <p style={{ fontSize: "13px", color: "var(--foreground-tertiary)" }}>
                {exercise.targetSets} sets × {exercise.targetReps} reps • {exercise.restSeconds}s rest
              </p>
            </div>
          </div>
          <div style={{ fontSize: "14px", color: "var(--foreground-secondary)" }}>
            {exercise.completedSets} / {exercise.targetSets} sets
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ display: "flex", gap: "var(--spacing-sm)", flexWrap: "wrap" }}>
          {exercise.sets.map((set) => (
            <SetButton
              key={set.id}
              set={set}
              targetReps={exercise.targetReps}
              onComplete={(weight, reps) => onCompleteSet(set.id, weight, reps)}
              disabled={disabled}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SetButton({
  set,
  targetReps,
  onComplete,
  disabled,
}: {
  set: ExerciseSetDTO;
  targetReps: string;
  onComplete: (weight: number, reps: number) => void;
  disabled: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState(set.weight?.toString() || "");
  const [reps, setReps] = useState(set.reps?.toString() || targetReps.split("-")[0] || "8");

  const handleSave = () => {
    onComplete(parseFloat(weight) || 0, parseInt(reps) || 0);
    setIsEditing(false);
  };

  if (set.isCompleted) {
    return (
      <div
        style={{
          padding: "var(--spacing-md)",
          background: "rgba(48, 209, 88, 0.15)",
          borderRadius: "var(--radius-md)",
          minWidth: "120px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "11px", color: "var(--foreground-tertiary)", marginBottom: "2px" }}>Set {set.setNumber}</div>
        <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--accent-green)" }}>{set.weight}kg × {set.reps}</div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div style={{ padding: "var(--spacing-md)", background: "var(--background-tertiary)", borderRadius: "var(--radius-md)", minWidth: "180px" }}>
        <div style={{ fontSize: "11px", color: "var(--foreground-tertiary)", marginBottom: "8px" }}>Set {set.setNumber}</div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <input
            type="number"
            placeholder="kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={{
              width: "70px",
              padding: "8px",
              background: "var(--background-elevated)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "var(--radius-sm)",
              color: "var(--foreground)",
              fontSize: "14px",
            }}
          />
          <input
            type="number"
            placeholder="reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            style={{
              width: "70px",
              padding: "8px",
              background: "var(--background-elevated)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "var(--radius-sm)",
              color: "var(--foreground)",
              fontSize: "14px",
            }}
          />
        </div>
        <Button size="sm" fullWidth onClick={handleSave}>Done</Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => !disabled && setIsEditing(true)}
      disabled={disabled}
      style={{
        padding: "var(--spacing-md)",
        background: "var(--background-tertiary)",
        border: "1px dashed rgba(255,255,255,0.2)",
        borderRadius: "var(--radius-md)",
        minWidth: "120px",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{ fontSize: "11px", color: "var(--foreground-tertiary)", marginBottom: "2px" }}>Set {set.setNumber}</div>
      <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--foreground-secondary)" }}>Tap to log</div>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; text: string }> = {
    pending: { bg: "rgba(255, 255, 255, 0.1)", color: "var(--foreground-secondary)", text: "Not Started" },
    in_progress: { bg: "rgba(10, 132, 255, 0.15)", color: "var(--accent-blue)", text: "In Progress" },
    completed: { bg: "rgba(48, 209, 88, 0.15)", color: "var(--accent-green)", text: "Completed" },
    skipped: { bg: "rgba(255, 69, 58, 0.15)", color: "var(--accent-red)", text: "Skipped" },
  };
  const style = styles[status] || styles.pending;

  return (
    <span style={{ padding: "6px 12px", fontSize: "13px", fontWeight: 600, background: style.bg, color: style.color, borderRadius: "var(--radius-full)" }}>
      {style.text}
    </span>
  );
}

function TemplateModal({ templates, onClose }: { templates: WorkoutTemplate[]; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <Card variant="elevated" padding="lg" style={{ width: "600px", maxHeight: "80vh", overflow: "auto" }} onClick={(e) => e?.stopPropagation()}>
        <CardHeader>
          <CardTitle size="lg">Select Workout</CardTitle>
          <CardDescription>Choose a template or create your own</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            {templates.map((template) => (
              <div
                key={template.id}
                style={{
                  padding: "var(--spacing-md)",
                  background: "var(--background-tertiary)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>{template.name}</div>
                    <div style={{ fontSize: "13px", color: "var(--foreground-tertiary)" }}>
                      {template.duration} min • {template.exercises} exercises • {template.difficulty}
                    </div>
                  </div>
                  <Button size="sm">Start</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px" }}>
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "3px solid var(--background-tertiary)",
          borderTopColor: "var(--accent-blue)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
