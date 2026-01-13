"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckIcon, ChevronRightIcon } from "@/components/ui/icons";

interface OnboardingData {
  height: string;
  weight: string;
  targetWeight: string;
  age: string;
  gender: string;
  activityLevel: string;
  fitnessGoal: string;
  experienceLevel: string;
  workoutDays: string;
  preferredWorkoutTime: string;
}

const STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "body", title: "Body Stats" },
  { id: "goals", title: "Your Goals" },
  { id: "experience", title: "Experience" },
  { id: "schedule", title: "Schedule" },
  { id: "complete", title: "Complete" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    height: "",
    weight: "",
    targetWeight: "",
    age: "",
    gender: "",
    activityLevel: "",
    fitnessGoal: "",
    experienceLevel: "",
    workoutDays: "4",
    preferredWorkoutTime: "",
  });

  const updateData = (field: keyof OnboardingData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Update the session to reflect onboarding complete
        await update();
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--spacing-xl)",
        background: "linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "600px" }}>
        {/* Progress */}
        <div style={{ marginBottom: "var(--spacing-xl)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "var(--spacing-sm)",
            }}
          >
            <span style={{ fontSize: "13px", color: "var(--foreground-secondary)" }}>
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span style={{ fontSize: "13px", color: "var(--foreground-tertiary)" }}>
              {STEPS[currentStep].title}
            </span>
          </div>
          <Progress value={progressPercent} size="sm" variant="gradient" />
        </div>

        <Card variant="elevated" padding="lg">
          {currentStep === 0 && <WelcomeStep onNext={nextStep} />}
          {currentStep === 1 && (
            <BodyStatsStep data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />
          )}
          {currentStep === 2 && (
            <GoalsStep data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />
          )}
          {currentStep === 3 && (
            <ExperienceStep data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />
          )}
          {currentStep === 4 && (
            <ScheduleStep data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />
          )}
          {currentStep === 5 && (
            <CompleteStep data={data} onComplete={handleComplete} onBack={prevStep} isLoading={isLoading} />
          )}
        </Card>
      </div>
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <>
      <CardHeader style={{ textAlign: "center" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto var(--spacing-lg)",
            borderRadius: "var(--radius-full)",
            background: "var(--gradient-blue)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
          }}
        >
          🎯
        </div>
        <CardTitle size="lg">Let&apos;s Personalize Your Journey</CardTitle>
        <CardDescription>
          Answer a few questions so we can create your custom 90-day transformation plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-md)",
            marginBottom: "var(--spacing-xl)",
          }}
        >
          <FeatureItem icon="📊" text="Personalized workout plans based on your goals" />
          <FeatureItem icon="🍎" text="Custom nutrition targets calculated for you" />
          <FeatureItem icon="🧠" text="Habit tracking tuned to your lifestyle" />
          <FeatureItem icon="📈" text="Progress tracking across all dimensions" />
        </div>
        <Button fullWidth onClick={onNext}>
          Get Started <ChevronRightIcon size={18} />
        </Button>
      </CardContent>
    </>
  );
}

function BodyStatsStep({
  data,
  updateData,
  onNext,
  onBack,
}: {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <CardHeader>
        <CardTitle size="lg">Your Body Stats</CardTitle>
        <CardDescription>
          We&apos;ll use this to calculate your targets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
            <InputField
              label="Height (cm)"
              type="number"
              value={data.height}
              onChange={(v) => updateData("height", v)}
              placeholder="175"
            />
            <InputField
              label="Current Weight (kg)"
              type="number"
              value={data.weight}
              onChange={(v) => updateData("weight", v)}
              placeholder="80"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
            <InputField
              label="Target Weight (kg)"
              type="number"
              value={data.targetWeight}
              onChange={(v) => updateData("targetWeight", v)}
              placeholder="75"
            />
            <InputField
              label="Age"
              type="number"
              value={data.age}
              onChange={(v) => updateData("age", v)}
              placeholder="28"
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--foreground-secondary)",
                marginBottom: "8px",
              }}
            >
              Gender
            </label>
            <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
              {["Male", "Female", "Other"].map((option) => (
                <SelectButton
                  key={option}
                  selected={data.gender === option.toLowerCase()}
                  onClick={() => updateData("gender", option.toLowerCase())}
                >
                  {option}
                </SelectButton>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--spacing-md)", marginTop: "var(--spacing-xl)" }}>
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button fullWidth onClick={onNext}>
            Continue <ChevronRightIcon size={18} />
          </Button>
        </div>
      </CardContent>
    </>
  );
}

function GoalsStep({
  data,
  updateData,
  onNext,
  onBack,
}: {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const goals = [
    { id: "lose_fat", label: "Lose Fat", icon: "🔥", desc: "Shed body fat while preserving muscle" },
    { id: "build_muscle", label: "Build Muscle", icon: "💪", desc: "Gain lean muscle mass" },
    { id: "recomposition", label: "Recomposition", icon: "⚖️", desc: "Lose fat and gain muscle simultaneously" },
    { id: "maintain", label: "Maintain", icon: "✨", desc: "Keep current physique" },
    { id: "endurance", label: "Endurance", icon: "🏃", desc: "Improve cardiovascular fitness" },
  ];

  const activityLevels = [
    { id: "sedentary", label: "Sedentary", desc: "Desk job, little exercise" },
    { id: "light", label: "Lightly Active", desc: "Light exercise 1-3 days/week" },
    { id: "moderate", label: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
    { id: "active", label: "Very Active", desc: "Hard exercise 6-7 days/week" },
    { id: "very_active", label: "Extremely Active", desc: "Athlete or physical job" },
  ];

  return (
    <>
      <CardHeader>
        <CardTitle size="lg">What&apos;s Your Goal?</CardTitle>
        <CardDescription>Select your primary fitness objective</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ marginBottom: "var(--spacing-xl)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            {goals.map((goal) => (
              <GoalOption
                key={goal.id}
                {...goal}
                selected={data.fitnessGoal === goal.id}
                onClick={() => updateData("fitnessGoal", goal.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: "var(--spacing-md)",
            }}
          >
            Current Activity Level
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            {activityLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => updateData("activityLevel", level.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "var(--spacing-md)",
                  background:
                    data.activityLevel === level.id
                      ? "rgba(10, 132, 255, 0.15)"
                      : "var(--background-tertiary)",
                  border:
                    data.activityLevel === level.id
                      ? "1px solid var(--accent-blue)"
                      : "1px solid transparent",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--foreground)" }}>
                    {level.label}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>
                    {level.desc}
                  </div>
                </div>
                {data.activityLevel === level.id && (
                  <CheckIcon size={18} color="var(--accent-blue)" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--spacing-md)", marginTop: "var(--spacing-xl)" }}>
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button fullWidth onClick={onNext}>
            Continue <ChevronRightIcon size={18} />
          </Button>
        </div>
      </CardContent>
    </>
  );
}

function ExperienceStep({
  data,
  updateData,
  onNext,
  onBack,
}: {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const levels = [
    {
      id: "beginner",
      label: "Beginner",
      icon: "🌱",
      desc: "New to fitness or returning after a long break",
    },
    {
      id: "intermediate",
      label: "Intermediate",
      icon: "💪",
      desc: "1-3 years of consistent training",
    },
    {
      id: "advanced",
      label: "Advanced",
      icon: "🏆",
      desc: "3+ years of serious training",
    },
  ];

  return (
    <>
      <CardHeader>
        <CardTitle size="lg">Your Experience Level</CardTitle>
        <CardDescription>This helps us tailor your workout intensity</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => updateData("experienceLevel", level.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-md)",
                padding: "var(--spacing-lg)",
                background:
                  data.experienceLevel === level.id
                    ? "rgba(10, 132, 255, 0.15)"
                    : "var(--background-tertiary)",
                border:
                  data.experienceLevel === level.id
                    ? "1px solid var(--accent-blue)"
                    : "1px solid transparent",
                borderRadius: "var(--radius-lg)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: "32px" }}>{level.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--foreground)" }}>
                  {level.label}
                </div>
                <div style={{ fontSize: "14px", color: "var(--foreground-tertiary)" }}>
                  {level.desc}
                </div>
              </div>
              {data.experienceLevel === level.id && (
                <CheckIcon size={24} color="var(--accent-blue)" />
              )}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "var(--spacing-md)", marginTop: "var(--spacing-xl)" }}>
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button fullWidth onClick={onNext}>
            Continue <ChevronRightIcon size={18} />
          </Button>
        </div>
      </CardContent>
    </>
  );
}

function ScheduleStep({
  data,
  updateData,
  onNext,
  onBack,
}: {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const times = [
    { id: "morning", label: "Morning", icon: "🌅", desc: "5am - 11am" },
    { id: "afternoon", label: "Afternoon", icon: "☀️", desc: "11am - 5pm" },
    { id: "evening", label: "Evening", icon: "🌙", desc: "5pm - 10pm" },
  ];

  return (
    <>
      <CardHeader>
        <CardTitle size="lg">Your Schedule</CardTitle>
        <CardDescription>When can you workout?</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ marginBottom: "var(--spacing-xl)" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: "var(--spacing-md)",
            }}
          >
            Workout Days Per Week
          </label>
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            {["3", "4", "5", "6"].map((num) => (
              <button
                key={num}
                onClick={() => updateData("workoutDays", num)}
                style={{
                  flex: 1,
                  padding: "var(--spacing-md)",
                  background:
                    data.workoutDays === num
                      ? "var(--accent-blue)"
                      : "var(--background-tertiary)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  color: data.workoutDays === num ? "white" : "var(--foreground)",
                  fontSize: "18px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: "var(--spacing-md)",
            }}
          >
            Preferred Workout Time
          </label>
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            {times.map((time) => (
              <button
                key={time.id}
                onClick={() => updateData("preferredWorkoutTime", time.id)}
                style={{
                  flex: 1,
                  padding: "var(--spacing-md)",
                  background:
                    data.preferredWorkoutTime === time.id
                      ? "rgba(10, 132, 255, 0.15)"
                      : "var(--background-tertiary)",
                  border:
                    data.preferredWorkoutTime === time.id
                      ? "1px solid var(--accent-blue)"
                      : "1px solid transparent",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>{time.icon}</div>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--foreground)" }}>
                  {time.label}
                </div>
                <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>
                  {time.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--spacing-md)", marginTop: "var(--spacing-xl)" }}>
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button fullWidth onClick={onNext}>
            Continue <ChevronRightIcon size={18} />
          </Button>
        </div>
      </CardContent>
    </>
  );
}

function CompleteStep({
  data,
  onComplete,
  onBack,
  isLoading,
}: {
  data: OnboardingData;
  onComplete: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  // Calculate estimated values
  const weight = parseFloat(data.weight) || 80;
  const height = parseFloat(data.height) || 175;
  const age = parseInt(data.age) || 28;
  const isMale = data.gender !== "female";

  // BMR using Mifflin-St Jeor
  const bmr = isMale
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = Math.round(bmr * (activityMultipliers[data.activityLevel] || 1.55));

  // Protein recommendation (1.6-2.2g per kg for recomp)
  const protein = Math.round(weight * 1.8);

  return (
    <>
      <CardHeader style={{ textAlign: "center" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto var(--spacing-lg)",
            borderRadius: "var(--radius-full)",
            background: "var(--gradient-green)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
          }}
        >
          ✨
        </div>
        <CardTitle size="lg">You&apos;re All Set!</CardTitle>
        <CardDescription>Here&apos;s your personalized plan</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "var(--spacing-md)",
            marginBottom: "var(--spacing-xl)",
          }}
        >
          <StatCard label="Daily Calories" value={tdee} unit="kcal" color="var(--accent-blue)" />
          <StatCard label="Daily Protein" value={protein} unit="g" color="var(--accent-green)" />
          <StatCard
            label="Workout Days"
            value={data.workoutDays}
            unit="/week"
            color="var(--accent-orange)"
          />
          <StatCard
            label="Program"
            value="90"
            unit="days"
            color="var(--accent-purple)"
          />
        </div>

        <div
          style={{
            padding: "var(--spacing-md)",
            background: "rgba(48, 209, 88, 0.15)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--spacing-xl)",
          }}
        >
          <p style={{ fontSize: "14px", color: "var(--foreground-secondary)", textAlign: "center" }}>
            Your plan will be adjusted as you progress through the 90 days
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button fullWidth onClick={onComplete} isLoading={isLoading}>
            Start Your Journey 🚀
          </Button>
        </div>
      </CardContent>
    </>
  );
}

// Helper Components
function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <span style={{ fontSize: "14px", color: "var(--foreground-secondary)" }}>{text}</span>
    </div>
  );
}

function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--foreground-secondary)",
          marginBottom: "8px",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 16px",
          background: "var(--background-tertiary)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "var(--radius-md)",
          color: "var(--foreground)",
          fontSize: "15px",
        }}
      />
    </div>
  );
}

function SelectButton({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "12px",
        background: selected ? "var(--accent-blue)" : "var(--background-tertiary)",
        border: "none",
        borderRadius: "var(--radius-md)",
        color: selected ? "white" : "var(--foreground)",
        fontSize: "14px",
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function GoalOption({
  id,
  label,
  icon,
  desc,
  selected,
  onClick,
}: {
  id: string;
  label: string;
  icon: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-md)",
        padding: "var(--spacing-md)",
        background: selected ? "rgba(10, 132, 255, 0.15)" : "var(--background-tertiary)",
        border: selected ? "1px solid var(--accent-blue)" : "1px solid transparent",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: "24px" }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--foreground)" }}>{label}</div>
        <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>{desc}</div>
      </div>
      {selected && <CheckIcon size={18} color="var(--accent-blue)" />}
    </button>
  );
}

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string | number;
  unit: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: "var(--spacing-md)",
        background: `${color}20`,
        borderRadius: "var(--radius-md)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "13px", color: "var(--foreground-tertiary)", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "24px", fontWeight: 700, color }}>
        {value}
        <span style={{ fontSize: "14px", opacity: 0.7 }}>{unit}</span>
      </div>
    </div>
  );
}
