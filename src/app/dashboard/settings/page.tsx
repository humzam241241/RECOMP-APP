"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserIcon, SettingsIcon, LogOutIcon, CheckIcon } from "@/components/ui/icons";

interface UserProfile {
  displayName: string | null;
  username: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  location: string | null;
  website: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  linkedinUrl: string | null;
  height: number | null;
  weight: number | null;
  targetWeight: number | null;
  age: number | null;
  gender: string | null;
  activityLevel: string | null;
  fitnessGoal: string | null;
  experienceLevel: string | null;
  workoutDays: number;
  preferredWorkoutTime: string | null;
  dietaryRestrictions: string[];
  isPublic: boolean;
  showStats: boolean;
  showStreak: boolean;
}

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  memberSince: string | null;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "social" | "fitness" | "privacy">("profile");
  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    username: "",
    bio: "",
    dateOfBirth: "",
    location: "",
    website: "",
    instagramUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
    linkedinUrl: "",
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
    isPublic: true,
    showStats: true,
    showStreak: true,
  });

  useEffect(() => {
    fetch("/api/me/profile")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setProfile(data.profile);
        
        // Initialize form data
        setFormData({
          name: data.user?.name || "",
          displayName: data.profile?.displayName || "",
          username: data.profile?.username || "",
          bio: data.profile?.bio || "",
          dateOfBirth: data.profile?.dateOfBirth?.split("T")[0] || "",
          location: data.profile?.location || "",
          website: data.profile?.website || "",
          instagramUrl: data.profile?.instagramUrl || "",
          twitterUrl: data.profile?.twitterUrl || "",
          youtubeUrl: data.profile?.youtubeUrl || "",
          tiktokUrl: data.profile?.tiktokUrl || "",
          linkedinUrl: data.profile?.linkedinUrl || "",
          height: data.profile?.height?.toString() || "",
          weight: data.profile?.weight?.toString() || "",
          targetWeight: data.profile?.targetWeight?.toString() || "",
          age: data.profile?.age?.toString() || "",
          gender: data.profile?.gender || "",
          activityLevel: data.profile?.activityLevel || "",
          fitnessGoal: data.profile?.fitnessGoal || "",
          experienceLevel: data.profile?.experienceLevel || "",
          workoutDays: data.profile?.workoutDays?.toString() || "4",
          preferredWorkoutTime: data.profile?.preferredWorkoutTime || "",
          isPublic: data.profile?.isPublic ?? true,
          showStats: data.profile?.showStats ?? true,
          showStreak: data.profile?.showStreak ?? true,
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name || null,
          displayName: formData.displayName || null,
          username: formData.username || null,
          bio: formData.bio || null,
          dateOfBirth: formData.dateOfBirth || null,
          location: formData.location || null,
          website: formData.website || null,
          instagramUrl: formData.instagramUrl || null,
          twitterUrl: formData.twitterUrl || null,
          youtubeUrl: formData.youtubeUrl || null,
          tiktokUrl: formData.tiktokUrl || null,
          linkedinUrl: formData.linkedinUrl || null,
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : null,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          activityLevel: formData.activityLevel || null,
          fitnessGoal: formData.fitnessGoal || null,
          experienceLevel: formData.experienceLevel || null,
          workoutDays: parseInt(formData.workoutDays) || 4,
          preferredWorkoutTime: formData.preferredWorkoutTime || null,
          isPublic: formData.isPublic,
          showStats: formData.showStats,
          showStreak: formData.showStreak,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setSaveMessage("Profile saved successfully!");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage(data.error || "Failed to save profile");
      }
    } catch {
      setSaveMessage("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="animate-fadeIn">
        <Header title="Settings" subtitle="Loading..." />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <Header
        title="Settings"
        subtitle="Manage your profile and preferences"
      />

      {/* Profile Header */}
      <Card variant="glass" padding="lg" style={{ marginBottom: "var(--spacing-xl)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xl)" }}>
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "var(--radius-full)",
              background: "var(--gradient-purple)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              fontWeight: 700,
              color: "white",
            }}
          >
            {formData.displayName?.[0] || formData.name?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>
              {formData.displayName || formData.name || "Set your name"}
            </h2>
            {formData.username && (
              <p style={{ fontSize: "14px", color: "var(--accent-blue)", marginBottom: "8px" }}>
                @{formData.username}
              </p>
            )}
            <p style={{ fontSize: "14px", color: "var(--foreground-tertiary)" }}>
              {user?.email} • Member since {user?.memberSince ? new Date(user.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "N/A"}
            </p>
          </div>
          <Button onClick={handleSave} isLoading={isSaving}>
            <CheckIcon size={18} /> Save Changes
          </Button>
        </div>
        {saveMessage && (
          <div
            style={{
              marginTop: "var(--spacing-md)",
              padding: "var(--spacing-sm) var(--spacing-md)",
              background: saveMessage.includes("success") ? "rgba(48, 209, 88, 0.15)" : "rgba(255, 69, 58, 0.15)",
              borderRadius: "var(--radius-md)",
              fontSize: "14px",
              color: saveMessage.includes("success") ? "var(--accent-green)" : "var(--accent-red)",
            }}
          >
            {saveMessage}
          </div>
        )}
      </Card>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-xl)" }}>
        {[
          { id: "profile", label: "Personal Info", icon: <UserIcon size={18} /> },
          { id: "social", label: "Social Links", icon: <LinkIcon /> },
          { id: "fitness", label: "Fitness Stats", icon: <FitnessIcon /> },
          { id: "privacy", label: "Privacy", icon: <SettingsIcon size={18} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: activeTab === tab.id ? "var(--accent-blue)" : "var(--background-tertiary)",
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

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-xl)" }}>
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle size="md">Basic Information</CardTitle>
              <CardDescription>Your public profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                <FormField label="Full Name" value={formData.name} onChange={(v) => handleChange("name", v)} placeholder="John Doe" />
                <FormField label="Display Name" value={formData.displayName} onChange={(v) => handleChange("displayName", v)} placeholder="Johnny" helper="Shown on your profile" />
                <FormField label="Username" value={formData.username} onChange={(v) => handleChange("username", v)} placeholder="johndoe" helper="Unique handle for your profile URL" prefix="@" />
                <FormField label="Bio" value={formData.bio} onChange={(v) => handleChange("bio", v)} placeholder="Tell us about yourself..." multiline />
              </div>
            </CardContent>
          </Card>

          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle size="md">Personal Details</CardTitle>
              <CardDescription>Additional information</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                <FormField label="Date of Birth" value={formData.dateOfBirth} onChange={(v) => handleChange("dateOfBirth", v)} type="date" />
                <FormField label="Location" value={formData.location} onChange={(v) => handleChange("location", v)} placeholder="San Francisco, CA" />
                <FormField label="Website" value={formData.website} onChange={(v) => handleChange("website", v)} placeholder="https://yoursite.com" />
                <SelectField
                  label="Gender"
                  value={formData.gender}
                  onChange={(v) => handleChange("gender", v)}
                  options={[
                    { value: "", label: "Select..." },
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                    { value: "prefer_not_to_say", label: "Prefer not to say" },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "social" && (
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle size="md">Social Media Links</CardTitle>
            <CardDescription>Connect your social profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-lg)" }}>
              <SocialField
                label="Instagram"
                value={formData.instagramUrl}
                onChange={(v) => handleChange("instagramUrl", v)}
                placeholder="https://instagram.com/username"
                icon={<InstagramIcon />}
                color="#E4405F"
              />
              <SocialField
                label="Twitter / X"
                value={formData.twitterUrl}
                onChange={(v) => handleChange("twitterUrl", v)}
                placeholder="https://twitter.com/username"
                icon={<TwitterIcon />}
                color="#1DA1F2"
              />
              <SocialField
                label="YouTube"
                value={formData.youtubeUrl}
                onChange={(v) => handleChange("youtubeUrl", v)}
                placeholder="https://youtube.com/@channel"
                icon={<YouTubeIcon />}
                color="#FF0000"
              />
              <SocialField
                label="TikTok"
                value={formData.tiktokUrl}
                onChange={(v) => handleChange("tiktokUrl", v)}
                placeholder="https://tiktok.com/@username"
                icon={<TikTokIcon />}
                color="#000000"
              />
              <SocialField
                label="LinkedIn"
                value={formData.linkedinUrl}
                onChange={(v) => handleChange("linkedinUrl", v)}
                placeholder="https://linkedin.com/in/username"
                icon={<LinkedInIcon />}
                color="#0A66C2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "fitness" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-xl)" }}>
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle size="md">Physical Stats</CardTitle>
              <CardDescription>Your body measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                <FormField label="Height (cm)" value={formData.height} onChange={(v) => handleChange("height", v)} type="number" placeholder="175" />
                <FormField label="Current Weight (kg)" value={formData.weight} onChange={(v) => handleChange("weight", v)} type="number" placeholder="80" />
                <FormField label="Target Weight (kg)" value={formData.targetWeight} onChange={(v) => handleChange("targetWeight", v)} type="number" placeholder="75" />
                <FormField label="Age" value={formData.age} onChange={(v) => handleChange("age", v)} type="number" placeholder="28" />
              </div>
            </CardContent>
          </Card>

          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle size="md">Fitness Goals</CardTitle>
              <CardDescription>Your training preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                <SelectField
                  label="Activity Level"
                  value={formData.activityLevel}
                  onChange={(v) => handleChange("activityLevel", v)}
                  options={[
                    { value: "", label: "Select..." },
                    { value: "sedentary", label: "Sedentary (little exercise)" },
                    { value: "light", label: "Light (1-3 days/week)" },
                    { value: "moderate", label: "Moderate (3-5 days/week)" },
                    { value: "active", label: "Active (6-7 days/week)" },
                    { value: "very_active", label: "Very Active (2x/day)" },
                  ]}
                />
                <SelectField
                  label="Fitness Goal"
                  value={formData.fitnessGoal}
                  onChange={(v) => handleChange("fitnessGoal", v)}
                  options={[
                    { value: "", label: "Select..." },
                    { value: "lose_fat", label: "Lose Fat" },
                    { value: "build_muscle", label: "Build Muscle" },
                    { value: "recomposition", label: "Body Recomposition" },
                    { value: "maintain", label: "Maintain Weight" },
                    { value: "endurance", label: "Improve Endurance" },
                  ]}
                />
                <SelectField
                  label="Experience Level"
                  value={formData.experienceLevel}
                  onChange={(v) => handleChange("experienceLevel", v)}
                  options={[
                    { value: "", label: "Select..." },
                    { value: "beginner", label: "Beginner (<1 year)" },
                    { value: "intermediate", label: "Intermediate (1-3 years)" },
                    { value: "advanced", label: "Advanced (3+ years)" },
                  ]}
                />
                <SelectField
                  label="Preferred Workout Time"
                  value={formData.preferredWorkoutTime}
                  onChange={(v) => handleChange("preferredWorkoutTime", v)}
                  options={[
                    { value: "", label: "Select..." },
                    { value: "morning", label: "Morning (5-9 AM)" },
                    { value: "afternoon", label: "Afternoon (12-5 PM)" },
                    { value: "evening", label: "Evening (5-10 PM)" },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "privacy" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-xl)" }}>
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle size="md">Profile Visibility</CardTitle>
              <CardDescription>Control who can see your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                <ToggleSetting
                  label="Public Profile"
                  description="Allow other users to view your profile"
                  checked={formData.isPublic}
                  onChange={(v) => handleChange("isPublic", v)}
                />
                <ToggleSetting
                  label="Show Stats"
                  description="Display your workout and nutrition stats publicly"
                  checked={formData.showStats}
                  onChange={(v) => handleChange("showStats", v)}
                />
                <ToggleSetting
                  label="Show Streak"
                  description="Display your current streak on your profile"
                  checked={formData.showStreak}
                  onChange={(v) => handleChange("showStreak", v)}
                />
              </div>
            </CardContent>
          </Card>

          <Card variant="default" padding="lg" style={{ borderColor: "rgba(255, 69, 58, 0.3)" }}>
            <CardHeader>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(255, 69, 58, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LogOutIcon size={20} color="var(--accent-red)" />
                </div>
                <div>
                  <CardTitle size="md">Account Actions</CardTitle>
                  <CardDescription>Sign out or manage your account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                <Button variant="secondary" fullWidth onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
                  <LogOutIcon size={18} /> Sign Out
                </Button>
                <Button variant="danger" fullWidth>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  helper,
  type = "text",
  multiline,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
  type?: string;
  multiline?: boolean;
  prefix?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--foreground-secondary)", marginBottom: "8px" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {prefix && (
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--foreground-tertiary)" }}>
            {prefix}
          </span>
        )}
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              background: "var(--background-tertiary)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "var(--radius-md)",
              color: "var(--foreground)",
              fontSize: "14px",
              resize: "vertical",
            }}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%",
              padding: "12px",
              paddingLeft: prefix ? "28px" : "12px",
              background: "var(--background-tertiary)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "var(--radius-md)",
              color: "var(--foreground)",
              fontSize: "14px",
            }}
          />
        )}
      </div>
      {helper && <span style={{ fontSize: "12px", color: "var(--foreground-tertiary)", marginTop: "4px", display: "block" }}>{helper}</span>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--foreground-secondary)", marginBottom: "8px" }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          background: "var(--background-tertiary)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "var(--radius-md)",
          color: "var(--foreground)",
          fontSize: "14px",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function SocialField({
  label,
  value,
  onChange,
  placeholder,
  icon,
  color,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div>
      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 500, color: "var(--foreground-secondary)", marginBottom: "8px" }}>
        <span style={{ color }}>{icon}</span>
        {label}
      </label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--spacing-sm) 0" }}>
      <div>
        <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--foreground)" }}>{label}</div>
        <div style={{ fontSize: "13px", color: "var(--foreground-tertiary)" }}>{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          position: "relative",
          width: "48px",
          height: "28px",
          background: checked ? "var(--accent-blue)" : "var(--background-tertiary)",
          borderRadius: "var(--radius-full)",
          border: "none",
          cursor: "pointer",
          transition: "all var(--transition-fast)",
        }}
      >
        <span
          style={{
            position: "absolute",
            height: "22px",
            width: "22px",
            left: checked ? "23px" : "3px",
            top: "3px",
            background: "white",
            borderRadius: "var(--radius-full)",
            transition: "all var(--transition-fast)",
          }}
        />
      </button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px" }}>
      <div style={{ width: "48px", height: "48px", border: "3px solid var(--background-tertiary)", borderTopColor: "var(--accent-blue)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Social Media Icons
function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function FitnessIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6.5 6.5L17.5 17.5" />
      <path d="M3 10L10 3L14 7L7 14L3 10Z" />
      <path d="M14 17L17 14L21 18L18 21L14 17Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
