"use client";

import { useState, useEffect } from "react";

import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckIcon, XIcon, SparklesIcon, FireIcon, TrophyIcon, PlusIcon, BookIcon, QuoteIcon, BrainIcon, ChevronRightIcon } from "@/components/ui/icons";
import { useJourneyToday, useDopamineToday, useLogHabit } from "@/hooks/useTodayQueries";
import type { HabitDTO, HabitLogDTO } from "@/types/dto";

interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  isSaved: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  modulesCount: number;
  currentModule: number;
  isCompleted: boolean;
  isStarted: boolean;
}

export default function DopaminePage() {
  const { data: journey } = useJourneyToday();
  const { data: dopamine, isLoading, refetch } = useDopamineToday();
  const logHabit = useLogHabit();
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [recentBadLog, setRecentBadLog] = useState<HabitLogDTO | null>(null);
  const [activeTab, setActiveTab] = useState<"tracker" | "courses" | "quotes">("tracker");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [dailyQuote, setDailyQuote] = useState<Quote | null>(null);

  // Fetch quotes and courses
  useEffect(() => {
    fetch("/api/me/quotes?random=true&limit=5")
      .then((res) => res.json())
      .then((data) => {
        setQuotes(data.quotes || []);
        if (data.quotes?.length > 0) {
          setDailyQuote(data.quotes[0]);
        }
      })
      .catch(console.error);

    fetch("/api/me/courses?category=dopamine")
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []))
      .catch(console.error);
  }, []);

  const handleLogHabit = (habit: HabitDTO) => {
    logHabit.mutate(
      { habitId: habit.id },
      {
        onSuccess: (data) => {
          if (habit.type === "bad") {
            const latestLog = data.logs[0];
            if (latestLog && latestLog.type === "bad") {
              setRecentBadLog(latestLog);
              setShowSwapModal(true);
            }
          }
        },
      }
    );
  };

  const handleSwapHabit = (goodHabit: HabitDTO) => {
    if (!recentBadLog) return;
    logHabit.mutate(
      { habitId: goodHabit.id, swapFromLogId: recentBadLog.id },
      {
        onSuccess: () => {
          setShowSwapModal(false);
          setRecentBadLog(null);
        },
      }
    );
  };

  const handleAddHabit = async (name: string, type: "good" | "bad", category: string) => {
    try {
      await fetch("/api/me/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          category,
          dopamineType: type === "good" ? "natural" : "artificial",
        }),
      });
      refetch();
      setShowAddHabit(false);
    } catch (error) {
      console.error("Failed to add habit:", error);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Header title="Dopamine" subtitle="Loading..." />
        <LoadingSpinner />
      </div>
    );
  }

  if (!dopamine) {
    return (
      <div>
        <Header title="Dopamine" subtitle="No dopamine data found" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <Header
        title="Dopamine Lab"
        subtitle="Master your brain's reward system"
        dayNumber={journey?.currentDay}
        phase={journey?.phase}
      />

      {/* Daily Quote Banner */}
      {dailyQuote && (
        <Card
          variant="gradient"
          gradient="linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #16213e 100%)"
          padding="lg"
          style={{ marginBottom: "var(--spacing-xl)" }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--spacing-lg)" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-full)",
                background: "rgba(191, 90, 242, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <QuoteIcon size={24} color="var(--accent-purple)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "18px", fontStyle: "italic", lineHeight: 1.6, marginBottom: "8px" }}>
                &ldquo;{dailyQuote.text}&rdquo;
              </p>
              <p style={{ fontSize: "14px", color: "var(--foreground-secondary)" }}>
                — {dailyQuote.author}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: "var(--spacing-sm)",
          marginBottom: "var(--spacing-xl)",
        }}
      >
        {[
          { id: "tracker", label: "Habit Tracker", icon: <SparklesIcon size={18} /> },
          { id: "courses", label: "Brain Courses", icon: <BookIcon size={18} /> },
          { id: "quotes", label: "Motivation", icon: <QuoteIcon size={18} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: activeTab === tab.id ? "var(--accent-purple)" : "var(--background-tertiary)",
              border: "none",
              borderRadius: "var(--radius-full)",
              color: activeTab === tab.id ? "white" : "var(--foreground-secondary)",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "tracker" && (
        <>
          {/* Score Overview */}
          <Card
            variant="glass"
            padding="lg"
            style={{ marginBottom: "var(--spacing-xl)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "14px", color: "var(--foreground-secondary)", marginBottom: "8px" }}>
                  Today&apos;s Score
                </div>
                <div
                  style={{
                    fontSize: "64px",
                    fontWeight: 700,
                    lineHeight: 1,
                    background: "var(--gradient-purple)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {dopamine.score}
                </div>
                <div style={{ display: "flex", gap: "var(--spacing-lg)", marginTop: "var(--spacing-lg)" }}>
                  <StatBox icon={<CheckIcon size={16} color="var(--accent-green)" />} label="Good" value={dopamine.goodCount} color="var(--accent-green)" />
                  <StatBox icon={<XIcon size={16} color="var(--accent-red)" />} label="Bad" value={dopamine.badCount} color="var(--accent-red)" />
                  <StatBox icon={<FireIcon size={16} color="var(--accent-orange)" />} label="Streak" value={`${dopamine.streakDays}d`} color="var(--accent-orange)" />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)", alignItems: "flex-end" }}>
                <BonusBadge label="First Win" description="+5 pts" earned={dopamine.firstWin} />
                <BonusBadge label="Swap Bonus" description="+15 pts" earned={dopamine.swapBonus} />
                <BonusBadge label="Streak" description="+10 pts" earned={dopamine.streakBonus} />
                <BonusBadge label="Perfect Day" description="5+ good, 0 bad" earned={dopamine.perfectDay} />
              </div>
            </div>
          </Card>

          {/* Habit Tracking */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-xl)", marginBottom: "var(--spacing-xl)" }}>
            {/* Good Habits */}
            <Card variant="default" padding="lg">
              <CardHeader>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-sm)", background: "rgba(48, 209, 88, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CheckIcon size={18} color="var(--accent-green)" />
                    </div>
                    <div>
                      <CardTitle size="md">Good Habits</CardTitle>
                      <CardDescription>+10 pts each • Natural dopamine</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddHabit(true)}>
                    <PlusIcon size={16} /> Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
                  {dopamine.availableHabits.good.map((habit) => (
                    <HabitButton
                      key={habit.id}
                      habit={habit}
                      variant="good"
                      onLog={() => handleLogHabit(habit)}
                      isLoading={logHabit.isPending}
                      timesLogged={dopamine.logs.filter((l) => l.habitId === habit.id).length}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bad Habits */}
            <Card variant="default" padding="lg">
              <CardHeader>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-sm)", background: "rgba(255, 69, 58, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <XIcon size={18} color="var(--accent-red)" />
                    </div>
                    <div>
                      <CardTitle size="md">Bad Habits</CardTitle>
                      <CardDescription>-5 pts each • Artificial dopamine</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddHabit(true)}>
                    <PlusIcon size={16} /> Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
                  {dopamine.availableHabits.bad.map((habit) => (
                    <HabitButton
                      key={habit.id}
                      habit={habit}
                      variant="bad"
                      onLog={() => handleLogHabit(habit)}
                      isLoading={logHabit.isPending}
                      timesLogged={dopamine.logs.filter((l) => l.habitId === habit.id).length}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Log */}
          {dopamine.logs.length > 0 && (
            <Card variant="default" padding="lg">
              <CardHeader>
                <CardTitle size="md">Today&apos;s Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
                  {dopamine.logs.slice(0, 10).map((log) => (
                    <ActivityLogItem key={log.id} log={log} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeTab === "courses" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-lg)" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>Brain Science Courses</h2>
              <p style={{ fontSize: "14px", color: "var(--foreground-secondary)" }}>
                Learn how your brain works to build better habits
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-md)" }}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
            {courses.length === 0 && (
              <Card variant="default" padding="lg" style={{ gridColumn: "span 2" }}>
                <div style={{ textAlign: "center", padding: "var(--spacing-2xl)" }}>
                  <BrainIcon size={48} color="var(--foreground-tertiary)" />
                  <h3 style={{ marginTop: "var(--spacing-md)", fontSize: "18px", fontWeight: 600 }}>
                    Courses Coming Soon
                  </h3>
                  <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--foreground-tertiary)" }}>
                    Brain science courses are being prepared
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Dopamine Science Info */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-md)", marginTop: "var(--spacing-xl)" }}>
            <InfoCard
              title="Natural Dopamine"
              description="Sources like exercise, accomplishment, and social connection provide sustainable motivation without crashes."
              color="var(--accent-green)"
              icon="🌿"
            />
            <InfoCard
              title="Artificial Dopamine"
              description="Quick hits from social media, junk food, or gambling create spikes followed by crashes, raising your baseline."
              color="var(--accent-red)"
              icon="⚡"
            />
            <InfoCard
              title="The Reset"
              description="Minimize artificial sources for 2-4 weeks. Your baseline will reset and natural sources will feel rewarding again."
              color="var(--accent-blue)"
              icon="🔄"
            />
          </div>
        </div>
      )}

      {activeTab === "quotes" && (
        <div>
          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>Daily Motivation</h2>
            <p style={{ fontSize: "14px", color: "var(--foreground-secondary)" }}>
              Wisdom for discipline and mental strength
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            {quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
            {quotes.length === 0 && (
              <Card variant="default" padding="lg">
                <div style={{ textAlign: "center", padding: "var(--spacing-2xl)" }}>
                  <QuoteIcon size={48} color="var(--foreground-tertiary)" />
                  <h3 style={{ marginTop: "var(--spacing-md)", fontSize: "18px", fontWeight: 600 }}>
                    Quotes Loading
                  </h3>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Add Habit Modal */}
      {showAddHabit && (
        <AddHabitModal onClose={() => setShowAddHabit(false)} onAdd={handleAddHabit} />
      )}

      {/* Swap Modal */}
      {showSwapModal && recentBadLog && (
        <SwapModal
          badLog={recentBadLog}
          goodHabits={dopamine.availableHabits.good}
          onSwap={handleSwapHabit}
          onClose={() => { setShowSwapModal(false); setRecentBadLog(null); }}
          isLoading={logHabit.isPending}
        />
      )}
    </div>
  );
}

function StatBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "var(--radius-md)" }}>
      {icon}
      <div>
        <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>{label}</div>
        <div style={{ fontSize: "18px", fontWeight: 600, color }}>{value}</div>
      </div>
    </div>
  );
}

function BonusBadge({ label, description, earned }: { label: string; description: string; earned: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-sm)",
        padding: "6px 12px",
        background: earned ? "rgba(255, 214, 10, 0.15)" : "rgba(255, 255, 255, 0.05)",
        borderRadius: "var(--radius-md)",
        opacity: earned ? 1 : 0.5,
      }}
    >
      <TrophyIcon size={14} color={earned ? "var(--accent-yellow)" : "var(--foreground-tertiary)"} />
      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: earned ? "var(--accent-yellow)" : "var(--foreground-tertiary)" }}>{label}</div>
        <div style={{ fontSize: "10px", color: "var(--foreground-tertiary)" }}>{description}</div>
      </div>
      {earned && <CheckIcon size={12} color="var(--accent-yellow)" />}
    </div>
  );
}

function HabitButton({ habit, variant, onLog, isLoading, timesLogged }: { habit: HabitDTO; variant: "good" | "bad"; onLog: () => void; isLoading: boolean; timesLogged: number }) {
  const isGood = variant === "good";
  const categoryEmojis: Record<string, string> = {
    exercise: "💪", sleep: "😴", nutrition: "🥗", mindfulness: "🧘",
    vice: "⚠️", social: "👥", productivity: "📚",
  };

  return (
    <button
      onClick={onLog}
      disabled={isLoading}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "var(--spacing-md)",
        background: "var(--background-tertiary)",
        border: "none",
        borderRadius: "var(--radius-md)",
        cursor: isLoading ? "not-allowed" : "pointer",
        transition: "all var(--transition-fast)",
        opacity: isLoading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = isGood ? "rgba(48, 209, 88, 0.15)" : "rgba(255, 69, 58, 0.15)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--background-tertiary)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: isGood ? "rgba(48, 209, 88, 0.2)" : "rgba(255, 69, 58, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
          {categoryEmojis[habit.category || ""] || "✨"}
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--foreground)" }}>{habit.name}</div>
          {habit.description && <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>{habit.description}</div>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
        {timesLogged > 0 && <span style={{ fontSize: "12px", fontWeight: 600, color: isGood ? "var(--accent-green)" : "var(--accent-red)" }}>×{timesLogged}</span>}
        <div style={{ padding: "6px 12px", background: isGood ? "var(--accent-green)" : "var(--accent-red)", borderRadius: "var(--radius-sm)", fontSize: "12px", fontWeight: 600, color: "white" }}>
          {isGood ? "+10" : "-5"}
        </div>
      </div>
    </button>
  );
}

function ActivityLogItem({ log }: { log: HabitLogDTO }) {
  const time = new Date(log.loggedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const isGood = log.type === "good";

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--spacing-sm) var(--spacing-md)", background: "var(--background-tertiary)", borderRadius: "var(--radius-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
        <div style={{ width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: isGood ? "rgba(48, 209, 88, 0.2)" : "rgba(255, 69, 58, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isGood ? <CheckIcon size={12} color="var(--accent-green)" /> : <XIcon size={12} color="var(--accent-red)" />}
        </div>
        <span style={{ fontSize: "14px", color: "var(--foreground)" }}>{log.habitName}</span>
        {log.swapFromLogId && <span style={{ fontSize: "11px", background: "rgba(10, 132, 255, 0.2)", color: "var(--accent-blue)", padding: "2px 8px", borderRadius: "var(--radius-full)" }}>Swap</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: isGood ? "var(--accent-green)" : "var(--accent-red)" }}>{isGood ? "+10" : "-5"}</span>
        <span style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>{time}</span>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const progressPercent = course.modulesCount > 0 ? (course.currentModule / course.modulesCount) * 100 : 0;

  return (
    <Card variant="default" padding="md" hover>
      <div style={{ marginBottom: "var(--spacing-md)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "var(--radius-full)", background: "rgba(191, 90, 242, 0.15)", color: "var(--accent-purple)", textTransform: "capitalize" }}>
            {course.category}
          </span>
          {course.isCompleted && <CheckIcon size={18} color="var(--accent-green)" />}
        </div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>{course.title}</h3>
        <p style={{ fontSize: "13px", color: "var(--foreground-tertiary)", lineHeight: 1.4 }}>{course.description}</p>
      </div>
      <div style={{ marginBottom: "var(--spacing-sm)" }}>
        <Progress value={progressPercent} size="sm" variant={course.isCompleted ? "success" : "default"} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--foreground-tertiary)" }}>
        <span>{course.currentModule}/{course.modulesCount} modules</span>
        <span>{course.duration} min</span>
      </div>
    </Card>
  );
}

function InfoCard({ title, description, color, icon }: { title: string; description: string; color: string; icon: string }) {
  return (
    <Card variant="default" padding="md">
      <div style={{ fontSize: "32px", marginBottom: "var(--spacing-sm)" }}>{icon}</div>
      <h3 style={{ fontSize: "15px", fontWeight: 600, color, marginBottom: "8px" }}>{title}</h3>
      <p style={{ fontSize: "13px", color: "var(--foreground-tertiary)", lineHeight: 1.5 }}>{description}</p>
    </Card>
  );
}

function QuoteCard({ quote }: { quote: Quote }) {
  const categoryColors: Record<string, string> = {
    motivation: "var(--accent-orange)",
    discipline: "var(--accent-blue)",
    mindset: "var(--accent-purple)",
    success: "var(--accent-green)",
    brain_science: "var(--accent-teal)",
    fitness: "var(--accent-red)",
  };

  return (
    <Card variant="default" padding="lg">
      <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
        <div style={{ width: "4px", borderRadius: "var(--radius-full)", background: categoryColors[quote.category] || "var(--accent-blue)" }} />
        <div>
          <p style={{ fontSize: "16px", fontStyle: "italic", lineHeight: 1.6, marginBottom: "12px", color: "var(--foreground)" }}>
            &ldquo;{quote.text}&rdquo;
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "var(--foreground-secondary)" }}>— {quote.author}</span>
            <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "var(--radius-full)", background: `${categoryColors[quote.category] || "var(--accent-blue)"}20`, color: categoryColors[quote.category] || "var(--accent-blue)", textTransform: "capitalize" }}>
              {quote.category.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function AddHabitModal({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string, type: "good" | "bad", category: string) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"good" | "bad">("good");
  const [category, setCategory] = useState("productivity");

  const categories = ["exercise", "sleep", "nutrition", "mindfulness", "vice", "social", "productivity"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <Card variant="elevated" padding="lg" style={{ width: "440px" }} onClick={(e) => e?.stopPropagation()}>
        <CardHeader>
          <CardTitle size="lg">Add New Habit</CardTitle>
          <CardDescription>Track a custom habit</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--foreground-secondary)", marginBottom: "8px" }}>Habit Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning stretching"
                style={{ width: "100%", padding: "12px", background: "var(--background-tertiary)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", color: "var(--foreground)", fontSize: "14px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--foreground-secondary)", marginBottom: "8px" }}>Type</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setType("good")} style={{ flex: 1, padding: "12px", background: type === "good" ? "var(--accent-green)" : "var(--background-tertiary)", border: "none", borderRadius: "var(--radius-md)", color: type === "good" ? "white" : "var(--foreground-secondary)", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>
                  Good Habit (+10)
                </button>
                <button onClick={() => setType("bad")} style={{ flex: 1, padding: "12px", background: type === "bad" ? "var(--accent-red)" : "var(--background-tertiary)", border: "none", borderRadius: "var(--radius-md)", color: type === "bad" ? "white" : "var(--foreground-secondary)", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>
                  Bad Habit (-5)
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--foreground-secondary)", marginBottom: "8px" }}>Category</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    style={{
                      padding: "8px 12px",
                      background: category === cat ? "var(--accent-blue)" : "var(--background-tertiary)",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      color: category === cat ? "white" : "var(--foreground-secondary)",
                      fontSize: "13px",
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <Button variant="secondary" onClick={onClose} fullWidth>Cancel</Button>
              <Button onClick={() => onAdd(name, type, category)} fullWidth disabled={!name.trim()}>Add Habit</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SwapModal({ badLog, goodHabits, onSwap, onClose, isLoading }: { badLog: HabitLogDTO; goodHabits: HabitDTO[]; onSwap: (habit: HabitDTO) => void; onClose: () => void; isLoading: boolean }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <Card variant="elevated" padding="lg" style={{ width: "440px" }} onClick={(e) => e?.stopPropagation()}>
        <CardHeader style={{ textAlign: "center" }}>
          <div style={{ width: "60px", height: "60px", margin: "0 auto var(--spacing-md)", borderRadius: "var(--radius-full)", background: "rgba(10, 132, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SparklesIcon size={28} color="var(--accent-blue)" />
          </div>
          <CardTitle size="lg">Swap Opportunity!</CardTitle>
          <CardDescription>
            Replace &quot;{badLog.habitName}&quot; with a good habit to earn +15 pt Swap Bonus!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            {goodHabits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => onSwap(habit)}
                disabled={isLoading}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "var(--spacing-md)", background: "var(--background-tertiary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer" }}
              >
                <span style={{ fontSize: "14px", color: "var(--foreground)" }}>{habit.name}</span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent-green)" }}>+25 pts</span>
              </button>
            ))}
          </div>
          <Button variant="ghost" fullWidth onClick={onClose} style={{ marginTop: "var(--spacing-md)" }}>Skip</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px" }}>
      <div style={{ width: "48px", height: "48px", border: "3px solid var(--background-tertiary)", borderTopColor: "var(--accent-purple)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
