"use client";

import Link from "next/link";

import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CircularProgress, Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DumbbellIcon,
  ForkKnifeIcon,
  SparklesIcon,
  BrainIcon,
  ChevronRightIcon,
  FireIcon,
  TrophyIcon,
  PlayIcon,
  CheckIcon,
} from "@/components/ui/icons";
import {
  useJourneyToday,
  useWorkoutToday,
  useNutritionToday,
  useDopamineToday,
  useMindsetToday,
} from "@/hooks/useTodayQueries";

export default function DashboardPage() {
  const { data: journey, isLoading: journeyLoading } = useJourneyToday();
  const { data: workout, isLoading: workoutLoading } = useWorkoutToday();
  const { data: nutrition, isLoading: nutritionLoading } = useNutritionToday();
  const { data: dopamine, isLoading: dopamineLoading } = useDopamineToday();
  const { data: mindset, isLoading: mindsetLoading } = useMindsetToday();

  const isLoading =
    journeyLoading || workoutLoading || nutritionLoading || dopamineLoading || mindsetLoading;

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="animate-fadeIn">
      <Header
        title="Today"
        subtitle="Your daily dashboard for transformation"
        dayNumber={journey?.currentDay}
        phase={journey?.phase}
      />

      {/* Journey Progress Card */}
      <Card
        variant="gradient"
        gradient="linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
        padding="lg"
        style={{ marginBottom: "var(--spacing-xl)" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 700,
                marginBottom: "8px",
                letterSpacing: "-0.02em",
              }}
            >
              Day {journey?.currentDay} of 90
            </h2>
            <p style={{ color: "var(--foreground-secondary)", marginBottom: "16px" }}>
              {journey?.daysRemaining} days remaining in your transformation
            </p>
            <div style={{ display: "flex", gap: "24px" }}>
              <Stat
                icon={<FireIcon size={18} color="var(--accent-orange)" />}
                label="Streak"
                value={`${dopamine?.streakDays || 0} days`}
              />
              <Stat
                icon={<TrophyIcon size={18} color="var(--accent-yellow)" />}
                label="Score"
                value={dopamine?.score || 0}
              />
            </div>
          </div>
          <CircularProgress
            value={journey?.progressPercent || 0}
            size={140}
            strokeWidth={10}
            variant="default"
            label="Complete"
          />
        </div>
      </Card>

      {/* Quick Actions Grid */}
      <div
        className="stagger-children"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--spacing-md)",
          marginBottom: "var(--spacing-xl)",
        }}
      >
        <QuickActionCard
          href="/dashboard/workout"
          icon={<DumbbellIcon size={24} />}
          title="Workout"
          status={workout?.status === "completed" ? "Done" : (workout?.workoutType || "rest")}
          progress={workout?.progressPercent || 0}
          color="var(--accent-blue)"
          isComplete={workout?.status === "completed"}
        />
        <QuickActionCard
          href="/dashboard/nutrition"
          icon={<ForkKnifeIcon size={24} />}
          title="Nutrition"
          status={`${nutrition?.totals.protein || 0}g protein`}
          progress={
            nutrition
              ? Math.min(100, (nutrition.totals.protein / nutrition.targetProtein) * 100)
              : 0
          }
          color="var(--accent-green)"
          isComplete={(nutrition?.totals.protein || 0) >= (nutrition?.targetProtein || 150)}
        />
        <QuickActionCard
          href="/dashboard/dopamine"
          icon={<SparklesIcon size={24} />}
          title="Dopamine"
          status={`${dopamine?.goodCount || 0} wins today`}
          progress={Math.min(100, ((dopamine?.goodCount || 0) / 5) * 100)}
          color="var(--accent-purple)"
          isComplete={(dopamine?.goodCount || 0) >= 5}
        />
        <QuickActionCard
          href="/dashboard/mindset"
          icon={<BrainIcon size={24} />}
          title="Mindset"
          status={mindset?.currentDayLesson?.title || "All caught up"}
          progress={
            mindset
              ? (mindset.completedCount / Math.max(1, mindset.totalAvailable)) * 100
              : 0
          }
          color="var(--accent-teal)"
          isComplete={mindset?.currentDayLesson?.isCompleted || false}
        />
      </div>

      {/* Main Content Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--spacing-xl)",
        }}
      >
        {/* Workout Section */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(10, 132, 255, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DumbbellIcon size={20} color="var(--accent-blue)" />
                </div>
                <div>
                  <CardTitle size="md">Today&apos;s Workout</CardTitle>
                  <CardDescription style={{ textTransform: "capitalize" }}>
                    {workout?.workoutType} Day
                  </CardDescription>
                </div>
              </div>
              <Link href="/dashboard/workout">
                <Button variant="secondary" size="sm">
                  {workout?.status === "pending" ? (
                    <>
                      <PlayIcon size={16} /> Start
                    </>
                  ) : workout?.status === "completed" ? (
                    <>
                      <CheckIcon size={16} /> Done
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ marginBottom: "16px" }}>
              <Progress
                value={workout?.progressPercent || 0}
                size="md"
                variant="gradient"
                showLabel
                label="Progress"
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "16px",
                color: "var(--foreground-secondary)",
                fontSize: "14px",
              }}
            >
              <span>{workout?.totalExercises || 0} exercises</span>
              <span>•</span>
              <span>{workout?.completedExercises || 0} completed</span>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Section */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(48, 209, 88, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ForkKnifeIcon size={20} color="var(--accent-green)" />
                </div>
                <div>
                  <CardTitle size="md">Nutrition</CardTitle>
                  <CardDescription>
                    {nutrition?.remaining.calories || 0} cal remaining
                  </CardDescription>
                </div>
              </div>
              <Link href="/dashboard/nutrition">
                <Button variant="secondary" size="sm">
                  Log Meal
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
              }}
            >
              <MacroStat
                label="Calories"
                current={nutrition?.totals.calories || 0}
                target={nutrition?.targetCalories || 2000}
                color="var(--accent-blue)"
              />
              <MacroStat
                label="Protein"
                current={nutrition?.totals.protein || 0}
                target={nutrition?.targetProtein || 150}
                unit="g"
                color="var(--accent-green)"
              />
              <MacroStat
                label="Carbs"
                current={nutrition?.totals.carbs || 0}
                target={nutrition?.targetCarbs || 200}
                unit="g"
                color="var(--accent-orange)"
              />
              <MacroStat
                label="Fat"
                current={nutrition?.totals.fat || 0}
                target={nutrition?.targetFat || 70}
                unit="g"
                color="var(--accent-purple)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dopamine Section */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(191, 90, 242, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SparklesIcon size={20} color="var(--accent-purple)" />
                </div>
                <div>
                  <CardTitle size="md">Dopamine Score</CardTitle>
                  <CardDescription>Track your wins & habits</CardDescription>
                </div>
              </div>
              <Link href="/dashboard/dopamine">
                <Button variant="secondary" size="sm">
                  Log Habit
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  background: "var(--gradient-purple)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {dopamine?.score || 0}
              </div>
              <div style={{ display: "flex", gap: "24px" }}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 600,
                      color: "var(--accent-green)",
                    }}
                  >
                    {dopamine?.goodCount || 0}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>
                    Good
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 600,
                      color: "var(--accent-red)",
                    }}
                  >
                    {dopamine?.badCount || 0}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>
                    Bad
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {dopamine?.firstWin && <Badge color="var(--accent-green)">First Win</Badge>}
              {dopamine?.swapBonus && <Badge color="var(--accent-blue)">Swap Bonus</Badge>}
              {dopamine?.streakBonus && <Badge color="var(--accent-orange)">Streak!</Badge>}
              {dopamine?.perfectDay && <Badge color="var(--accent-yellow)">Perfect Day</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* Mindset Section */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(100, 210, 255, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BrainIcon size={20} color="var(--accent-teal)" />
                </div>
                <div>
                  <CardTitle size="md">Mindset</CardTitle>
                  <CardDescription>
                    {mindset?.completedCount || 0} of {mindset?.totalAvailable || 0} completed
                  </CardDescription>
                </div>
              </div>
              <Link href="/dashboard/mindset">
                <Button variant="secondary" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {mindset?.currentDayLesson ? (
              <Link
                href="/dashboard/mindset"
                style={{
                  display: "block",
                  padding: "16px",
                  background: "var(--background-tertiary)",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  transition: "all var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--background-elevated)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--background-tertiary)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "var(--foreground)",
                        marginBottom: "4px",
                      }}
                    >
                      {mindset.currentDayLesson.title}
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--foreground-tertiary)",
                      }}
                    >
                      {mindset.currentDayLesson.duration} min read •{" "}
                      {mindset.currentDayLesson.category?.replace("_", " ")}
                    </p>
                  </div>
                  <ChevronRightIcon size={20} color="var(--foreground-tertiary)" />
                </div>
              </Link>
            ) : (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "var(--foreground-tertiary)",
                }}
              >
                All caught up! Great work.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div>
      <Header title="Today" subtitle="Loading your dashboard..." />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "400px",
        }}
      >
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
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {icon}
      <div>
        <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>{label}</div>
        <div style={{ fontSize: "16px", fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}

function QuickActionCard({
  href,
  icon,
  title,
  status,
  progress,
  color,
  isComplete,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  status: string;
  progress: number;
  color: string;
  isComplete: boolean;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Card variant="default" padding="md" hover>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "var(--radius-md)",
              background: `${color}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: color,
            }}
          >
            {icon}
          </div>
          {isComplete && (
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "var(--radius-full)",
                background: "var(--accent-green)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckIcon size={14} color="white" />
            </div>
          )}
        </div>
        <p
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--foreground)",
            marginBottom: "4px",
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: "13px",
            color: "var(--foreground-tertiary)",
            marginBottom: "12px",
            textTransform: "capitalize",
          }}
        >
          {status}
        </p>
        <Progress value={progress} size="sm" />
      </Card>
    </Link>
  );
}

function MacroStat({
  label,
  current,
  target,
  unit = "",
  color,
}: {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color: string;
}) {
  const percentage = Math.min(100, (current / target) * 100);

  return (
    <div>
      <div
        style={{
          fontSize: "12px",
          color: "var(--foreground-tertiary)",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: "var(--foreground)",
          marginBottom: "8px",
        }}
      >
        {current}
        {unit}
        <span style={{ fontSize: "12px", color: "var(--foreground-quaternary)" }}>
          {" "}
          / {target}
        </span>
      </div>
      <div
        style={{
          height: "4px",
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

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        fontSize: "12px",
        fontWeight: 600,
        color: color,
        background: `${color}20`,
        borderRadius: "var(--radius-full)",
      }}
    >
      {children}
    </span>
  );
}
