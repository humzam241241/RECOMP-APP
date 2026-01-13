"use client";

import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CircularProgress, Progress } from "@/components/ui/progress";
import { useJourneyToday, useWorkoutToday, useNutritionToday, useDopamineToday } from "@/hooks/useTodayQueries";
import { FireIcon, TrophyIcon, ChartIcon, CalendarIcon } from "@/components/ui/icons";

export default function ProgressPage() {
  const { data: journey } = useJourneyToday();
  const { data: workout } = useWorkoutToday();
  const { data: nutrition } = useNutritionToday();
  const { data: dopamine } = useDopamineToday();

  const weeksCompleted = Math.floor((journey?.currentDay || 1) / 7);
  const phaseProgress = journey?.phase === "foundation" 
    ? ((journey?.currentDay || 1) / 30) * 100
    : journey?.phase === "build"
    ? (((journey?.currentDay || 31) - 30) / 30) * 100
    : (((journey?.currentDay || 61) - 60) / 30) * 100;

  return (
    <div className="animate-fadeIn">
      <Header
        title="Progress"
        subtitle="Track your transformation journey"
        dayNumber={journey?.currentDay}
        phase={journey?.phase}
      />

      {/* Journey Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--spacing-md)",
          marginBottom: "var(--spacing-xl)",
        }}
      >
        <StatCard
          icon={<CalendarIcon size={24} color="var(--accent-blue)" />}
          label="Days Completed"
          value={journey?.currentDay || 0}
          subtext="of 90 days"
          color="var(--accent-blue)"
        />
        <StatCard
          icon={<FireIcon size={24} color="var(--accent-orange)" />}
          label="Current Streak"
          value={dopamine?.streakDays || 0}
          subtext="days"
          color="var(--accent-orange)"
        />
        <StatCard
          icon={<TrophyIcon size={24} color="var(--accent-yellow)" />}
          label="Total Score"
          value={dopamine?.score || 0}
          subtext="dopamine pts"
          color="var(--accent-yellow)"
        />
        <StatCard
          icon={<ChartIcon size={24} color="var(--accent-green)" />}
          label="Weeks Done"
          value={weeksCompleted}
          subtext="of 13 weeks"
          color="var(--accent-green)"
        />
      </div>

      {/* Phase Progress */}
      <Card variant="glass" padding="lg" style={{ marginBottom: "var(--spacing-xl)" }}>
        <CardHeader>
          <CardTitle size="lg">Phase Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", gap: "var(--spacing-xl)", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--spacing-lg)" }}>
                <PhaseIndicator
                  label="Foundation"
                  days="1-30"
                  isActive={journey?.phase === "foundation"}
                  isComplete={(journey?.currentDay || 0) > 30}
                />
                <PhaseIndicator
                  label="Build"
                  days="31-60"
                  isActive={journey?.phase === "build"}
                  isComplete={(journey?.currentDay || 0) > 60}
                />
                <PhaseIndicator
                  label="Optimize"
                  days="61-90"
                  isActive={journey?.phase === "optimize"}
                  isComplete={(journey?.currentDay || 0) > 90}
                />
              </div>
              <Progress
                value={journey?.progressPercent || 0}
                size="lg"
                variant="gradient"
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                <span style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>Day 1</span>
                <span style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>Day 30</span>
                <span style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>Day 60</span>
                <span style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>Day 90</span>
              </div>
            </div>
            <CircularProgress
              value={journey?.progressPercent || 0}
              size={160}
              strokeWidth={12}
              label="Overall"
            />
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "var(--spacing-md)",
        }}
      >
        {/* Workout Summary */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle size="md">Today&apos;s Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ textAlign: "center", marginBottom: "var(--spacing-md)" }}>
              <CircularProgress
                value={workout?.progressPercent || 0}
                size={100}
                strokeWidth={8}
                variant={workout?.status === "completed" ? "success" : "default"}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--foreground)",
                  textTransform: "capitalize",
                  marginBottom: "4px",
                }}
              >
                {workout?.workoutType} Day
              </div>
              <div style={{ fontSize: "13px", color: "var(--foreground-tertiary)" }}>
                {workout?.completedExercises || 0} / {workout?.totalExercises || 0} exercises
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Summary */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle size="md">Nutrition</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              <MacroBar
                label="Calories"
                current={nutrition?.totals.calories || 0}
                target={nutrition?.targetCalories || 2000}
                color="var(--accent-blue)"
              />
              <MacroBar
                label="Protein"
                current={nutrition?.totals.protein || 0}
                target={nutrition?.targetProtein || 150}
                color="var(--accent-green)"
                highlight
              />
              <MacroBar
                label="Carbs"
                current={nutrition?.totals.carbs || 0}
                target={nutrition?.targetCarbs || 200}
                color="var(--accent-orange)"
              />
              <MacroBar
                label="Fat"
                current={nutrition?.totals.fat || 0}
                target={nutrition?.targetFat || 70}
                color="var(--accent-purple)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dopamine Summary */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle size="md">Dopamine</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{
                fontSize: "48px",
                fontWeight: 700,
                textAlign: "center",
                marginBottom: "var(--spacing-md)",
                background: "var(--gradient-purple)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {dopamine?.score || 0}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "var(--spacing-xl)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--accent-green)",
                  }}
                >
                  {dopamine?.goodCount || 0}
                </div>
                <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>Good</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--accent-red)",
                  }}
                >
                  {dopamine?.badCount || 0}
                </div>
                <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>Bad</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtext: string;
  color: string;
}) {
  return (
    <Card variant="default" padding="md">
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
          <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>{label}</div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "var(--foreground)",
              lineHeight: 1,
            }}
          >
            {value}
          </div>
          <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>{subtext}</div>
        </div>
      </div>
    </Card>
  );
}

function PhaseIndicator({
  label,
  days,
  isActive,
  isComplete,
}: {
  label: string;
  days: string;
  isActive: boolean;
  isComplete: boolean;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "var(--radius-full)",
          background: isComplete
            ? "var(--accent-green)"
            : isActive
            ? "var(--accent-blue)"
            : "var(--background-tertiary)",
          margin: "0 auto var(--spacing-sm)",
          boxShadow: isActive ? "var(--shadow-glow-blue)" : "none",
        }}
      />
      <div
        style={{
          fontSize: "14px",
          fontWeight: isActive ? 600 : 400,
          color: isActive ? "var(--foreground)" : "var(--foreground-tertiary)",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "12px", color: "var(--foreground-quaternary)" }}>{days}</div>
    </div>
  );
}

function MacroBar({
  label,
  current,
  target,
  color,
  highlight,
}: {
  label: string;
  current: number;
  target: number;
  color: string;
  highlight?: boolean;
}) {
  const percentage = Math.min(100, (current / target) * 100);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: highlight ? 600 : 400,
            color: highlight ? "var(--foreground)" : "var(--foreground-secondary)",
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: "13px", color: "var(--foreground-tertiary)" }}>
          {current} / {target}
        </span>
      </div>
      <div
        style={{
          height: "6px",
          background: "var(--background-tertiary)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            background: color,
            borderRadius: "var(--radius-full)",
            transition: "width 0.5s ease-out",
          }}
        />
      </div>
    </div>
  );
}
