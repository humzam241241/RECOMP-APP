"use client";

import { useState } from "react";

import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlusIcon, PlayIcon, ClockIcon, FireIcon, ChartIcon, RunningIcon } from "@/components/ui/icons";
import { useJourneyToday } from "@/hooks/useTodayQueries";

interface RunSession {
  id: string;
  type: string;
  distance: number;
  duration: number;
  pace: number;
  calories: number;
  date: string;
}

export default function RunningPage() {
  const { data: journey } = useJourneyToday();
  const [showLogModal, setShowLogModal] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingTime, setTrackingTime] = useState(0);

  // Mock data - would come from API
  const weeklyGoal = 20; // km
  const weeklyDistance = 12.5;
  const recentRuns: RunSession[] = [
    { id: "1", type: "outdoor", distance: 5.2, duration: 1560, pace: 5.0, calories: 420, date: "2026-01-12" },
    { id: "2", type: "treadmill", distance: 3.8, duration: 1200, pace: 5.26, calories: 310, date: "2026-01-10" },
    { id: "3", type: "outdoor", distance: 6.5, duration: 2100, pace: 5.38, calories: 520, date: "2026-01-08" },
  ];

  const totalDistance = recentRuns.reduce((sum, run) => sum + run.distance, 0);
  const avgPace = recentRuns.reduce((sum, run) => sum + run.pace, 0) / recentRuns.length;

  const startTracking = () => {
    setIsTracking(true);
    // Would start GPS tracking here
  };

  const stopTracking = () => {
    setIsTracking(false);
    setShowLogModal(true);
  };

  return (
    <div className="animate-fadeIn">
      <Header
        title="Running"
        subtitle="Track your runs and improve your endurance"
        dayNumber={journey?.currentDay}
        phase={journey?.phase}
      />

      {/* Quick Actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--spacing-md)",
          marginBottom: "var(--spacing-xl)",
        }}
      >
        <StatCard
          icon={<RunningIcon size={24} color="var(--accent-blue)" />}
          label="This Week"
          value={weeklyDistance.toFixed(1)}
          unit="km"
          color="var(--accent-blue)"
        />
        <StatCard
          icon={<ClockIcon size={24} color="var(--accent-green)" />}
          label="Avg Pace"
          value={avgPace.toFixed(2)}
          unit="min/km"
          color="var(--accent-green)"
        />
        <StatCard
          icon={<FireIcon size={24} color="var(--accent-orange)" />}
          label="Total Distance"
          value={totalDistance.toFixed(1)}
          unit="km"
          color="var(--accent-orange)"
        />
        <StatCard
          icon={<ChartIcon size={24} color="var(--accent-purple)" />}
          label="Total Runs"
          value={recentRuns.length}
          unit="runs"
          color="var(--accent-purple)"
        />
      </div>

      {/* Weekly Goal */}
      <Card variant="glass" padding="lg" style={{ marginBottom: "var(--spacing-xl)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--spacing-md)",
          }}
        >
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>Weekly Goal</h3>
            <p style={{ fontSize: "14px", color: "var(--foreground-secondary)" }}>
              {weeklyDistance} / {weeklyGoal} km
            </p>
          </div>
          <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
            <Button variant="secondary" onClick={() => setShowLogModal(true)}>
              <PlusIcon size={18} /> Log Run
            </Button>
            {!isTracking ? (
              <Button onClick={startTracking}>
                <PlayIcon size={18} /> Start Run
              </Button>
            ) : (
              <Button variant="danger" onClick={stopTracking}>
                Stop Tracking
              </Button>
            )}
          </div>
        </div>
        <Progress
          value={(weeklyDistance / weeklyGoal) * 100}
          size="lg"
          variant="gradient"
        />
      </Card>

      {/* Active Tracking */}
      {isTracking && (
        <Card
          variant="gradient"
          gradient="var(--gradient-green)"
          padding="lg"
          style={{ marginBottom: "var(--spacing-xl)" }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "14px", opacity: 0.8, marginBottom: "8px" }}>
              Currently Tracking
            </div>
            <div style={{ fontSize: "48px", fontWeight: 700, marginBottom: "16px" }}>
              {formatDuration(trackingTime)}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "var(--spacing-xl)" }}>
              <div>
                <div style={{ fontSize: "24px", fontWeight: 600 }}>0.00</div>
                <div style={{ fontSize: "12px", opacity: 0.7 }}>km</div>
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: 600 }}>--:--</div>
                <div style={{ fontSize: "12px", opacity: 0.7 }}>pace</div>
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: 600 }}>0</div>
                <div style={{ fontSize: "12px", opacity: 0.7 }}>cal</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "var(--spacing-xl)",
        }}
      >
        {/* Recent Runs */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle size="lg">Recent Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              {recentRuns.map((run) => (
                <RunCard key={run.id} run={run} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Run Types */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle size="md">Quick Start</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
                <RunTypeButton type="outdoor" label="Outdoor Run" icon="🏃" />
                <RunTypeButton type="treadmill" label="Treadmill" icon="🏋️" />
                <RunTypeButton type="trail" label="Trail Run" icon="⛰️" />
                <RunTypeButton type="interval" label="Intervals" icon="⚡" />
              </div>
            </CardContent>
          </Card>

          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle size="md">Training Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
                <TrainingPlan name="5K Beginner" duration="8 weeks" level="Beginner" />
                <TrainingPlan name="10K Improver" duration="10 weeks" level="Intermediate" />
                <TrainingPlan name="Half Marathon" duration="12 weeks" level="Advanced" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Log Run Modal */}
      {showLogModal && (
        <LogRunModal onClose={() => setShowLogModal(false)} />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
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
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--foreground)" }}>
            {value}
            <span style={{ fontSize: "12px", color: "var(--foreground-tertiary)", marginLeft: "4px" }}>
              {unit}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function RunCard({ run }: { run: RunSession }) {
  const date = new Date(run.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--spacing-md)",
        background: "var(--background-tertiary)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "var(--radius-md)",
            background: "var(--background-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          {run.type === "outdoor" ? "🏃" : run.type === "treadmill" ? "🏋️" : "⛰️"}
        </div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--foreground)", textTransform: "capitalize" }}>
            {run.type} Run
          </div>
          <div style={{ fontSize: "13px", color: "var(--foreground-tertiary)" }}>{date}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "var(--spacing-xl)", fontSize: "14px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 600, color: "var(--foreground)" }}>{run.distance.toFixed(2)}</div>
          <div style={{ color: "var(--foreground-tertiary)" }}>km</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 600, color: "var(--foreground)" }}>{formatDuration(run.duration)}</div>
          <div style={{ color: "var(--foreground-tertiary)" }}>time</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 600, color: "var(--accent-green)" }}>{run.pace.toFixed(2)}</div>
          <div style={{ color: "var(--foreground-tertiary)" }}>pace</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 600, color: "var(--accent-orange)" }}>{run.calories}</div>
          <div style={{ color: "var(--foreground-tertiary)" }}>cal</div>
        </div>
      </div>
    </div>
  );
}

function RunTypeButton({ type, label, icon }: { type: string; label: string; icon: string }) {
  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-md)",
        width: "100%",
        padding: "var(--spacing-md)",
        background: "var(--background-tertiary)",
        border: "none",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        textAlign: "left",
        transition: "all var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--background-elevated)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--background-tertiary)";
      }}
    >
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--foreground)" }}>{label}</span>
    </button>
  );
}

function TrainingPlan({ name, duration, level }: { name: string; duration: string; level: string }) {
  return (
    <div
      style={{
        padding: "var(--spacing-md)",
        background: "var(--background-tertiary)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)", marginBottom: "4px" }}>
        {name}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--foreground-tertiary)" }}>
        <span>{duration}</span>
        <span
          style={{
            color:
              level === "Beginner"
                ? "var(--accent-green)"
                : level === "Intermediate"
                ? "var(--accent-orange)"
                : "var(--accent-red)",
          }}
        >
          {level}
        </span>
      </div>
    </div>
  );
}

function LogRunModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState("outdoor");
  const [distance, setDistance] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  const handleSubmit = () => {
    // Would submit to API
    onClose();
  };

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
      <Card
        variant="elevated"
        padding="lg"
        style={{ width: "440px" }}
        onClick={(e) => e?.stopPropagation()}
      >
        <CardHeader>
          <CardTitle size="lg">Log Run</CardTitle>
          <CardDescription>Record your run manually</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            {/* Run Type */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--foreground-secondary)", marginBottom: "8px" }}>
                Run Type
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["outdoor", "treadmill", "trail"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: type === t ? "var(--accent-blue)" : "var(--background-tertiary)",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      color: type === t ? "white" : "var(--foreground-secondary)",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--foreground-secondary)", marginBottom: "8px" }}>
                Distance (km)
              </label>
              <input
                type="number"
                step="0.01"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="5.00"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "var(--background-tertiary)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--foreground)",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* Duration */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--foreground-secondary)", marginBottom: "8px" }}>
                Duration
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="0"
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "var(--background-tertiary)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--foreground)",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                />
                <span style={{ display: "flex", alignItems: "center", color: "var(--foreground-tertiary)" }}>:</span>
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="30"
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "var(--background-tertiary)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--foreground)",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                />
                <span style={{ display: "flex", alignItems: "center", color: "var(--foreground-tertiary)" }}>:</span>
                <input
                  type="number"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  placeholder="00"
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "var(--background-tertiary)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--foreground)",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", marginTop: "4px", fontSize: "11px", color: "var(--foreground-quaternary)" }}>
                <span>hours</span>
                <span>minutes</span>
                <span>seconds</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <Button variant="secondary" onClick={onClose} fullWidth>
                Cancel
              </Button>
              <Button onClick={handleSubmit} fullWidth>
                Save Run
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
