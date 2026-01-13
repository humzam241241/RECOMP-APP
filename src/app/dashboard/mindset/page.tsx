"use client";

import { useState, useEffect } from "react";

import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckIcon, ClockIcon, PlayIcon, BrainIcon, ChevronRightIcon, XIcon, BookIcon, QuoteIcon, HeartIcon } from "@/components/ui/icons";
import { useJourneyToday, useMindsetToday, useCompleteMindsetLesson } from "@/hooks/useTodayQueries";
import type { MindsetLessonDTO } from "@/types/dto";

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
  difficulty: string;
  duration: number;
  modulesCount: number;
  currentModule: number;
  isCompleted: boolean;
  isStarted: boolean;
  modules: { id: string; title: string; content: string; duration: number; orderIndex: number }[];
}

export default function MindsetPage() {
  const { data: journey } = useJourneyToday();
  const { data: mindset, isLoading } = useMindsetToday();
  const completeLesson = useCompleteMindsetLesson();
  const [selectedLesson, setSelectedLesson] = useState<MindsetLessonDTO | null>(null);
  const [activeTab, setActiveTab] = useState<"lessons" | "courses" | "quotes">("lessons");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<Set<string>>(new Set());

  // Fetch courses
  useEffect(() => {
    fetch("/api/me/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []))
      .catch(console.error);

    fetch("/api/me/quotes?limit=20")
      .then((res) => res.json())
      .then((data) => {
        setQuotes(data.quotes || []);
        const saved = new Set<string>(data.quotes?.filter((q: Quote) => q.isSaved).map((q: Quote) => q.id) || []);
        setSavedQuotes(saved);
      })
      .catch(console.error);
  }, []);

  const handleCompleteLesson = (lessonId: string) => {
    completeLesson.mutate(lessonId, {
      onSuccess: () => setSelectedLesson(null),
    });
  };

  const handleStartCourse = async (course: Course) => {
    // Fetch full course with content
    const res = await fetch(`/api/me/courses/${course.id}`);
    const fullCourse = await res.json();
    setSelectedCourse(fullCourse);
    setCurrentModuleIndex(fullCourse.currentModule || 0);
  };

  const handleNextModule = async () => {
    if (!selectedCourse) return;
    
    // Save progress
    await fetch(`/api/me/courses/${selectedCourse.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleIndex: currentModuleIndex }),
    });

    if (currentModuleIndex < selectedCourse.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    } else {
      // Course complete
      setSelectedCourse(null);
      // Refresh courses
      const res = await fetch("/api/me/courses");
      const data = await res.json();
      setCourses(data.courses || []);
    }
  };

  const handleSaveQuote = async (quoteId: string) => {
    const isSaved = savedQuotes.has(quoteId);
    
    await fetch("/api/me/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId, action: isSaved ? "unsave" : "save" }),
    });

    setSavedQuotes((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(quoteId);
      else next.add(quoteId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div>
        <Header title="Mindset" subtitle="Loading..." />
        <LoadingSpinner />
      </div>
    );
  }

  if (!mindset) {
    return (
      <div>
        <Header title="Mindset" subtitle="No mindset data found" />
      </div>
    );
  }

  const progressPercent = mindset.totalAvailable > 0 ? (mindset.completedCount / mindset.totalAvailable) * 100 : 0;
  const completedCourses = courses.filter((c) => c.isCompleted).length;
  const totalCourses = courses.length;

  return (
    <div className="animate-fadeIn">
      <Header
        title="Mindset"
        subtitle="Train your brain for success"
        dayNumber={journey?.currentDay}
        phase={journey?.phase}
      />

      {/* Progress Overview */}
      <Card variant="glass" padding="lg" style={{ marginBottom: "var(--spacing-xl)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "14px", color: "var(--foreground-secondary)", marginBottom: "4px" }}>Your Progress</div>
            <div style={{ display: "flex", gap: "var(--spacing-2xl)" }}>
              <div>
                <div style={{ fontSize: "32px", fontWeight: 700 }}>
                  {mindset.completedCount}<span style={{ fontSize: "16px", color: "var(--foreground-tertiary)" }}>/{mindset.totalAvailable}</span>
                </div>
                <div style={{ fontSize: "13px", color: "var(--foreground-tertiary)" }}>Lessons</div>
              </div>
              <div>
                <div style={{ fontSize: "32px", fontWeight: 700 }}>
                  {completedCourses}<span style={{ fontSize: "16px", color: "var(--foreground-tertiary)" }}>/{totalCourses}</span>
                </div>
                <div style={{ fontSize: "13px", color: "var(--foreground-tertiary)" }}>Courses</div>
              </div>
              <div>
                <div style={{ fontSize: "32px", fontWeight: 700 }}>{savedQuotes.size}</div>
                <div style={{ fontSize: "13px", color: "var(--foreground-tertiary)" }}>Saved Quotes</div>
              </div>
            </div>
          </div>

          {/* Today's Lesson */}
          {mindset.currentDayLesson && !mindset.currentDayLesson.isCompleted && (
            <Card
              variant="gradient"
              gradient="var(--gradient-blue)"
              padding="md"
              style={{ width: "320px", cursor: "pointer" }}
              hover
              onClick={() => setSelectedLesson(mindset.currentDayLesson)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-md)", background: "rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PlayIcon size={24} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "2px" }}>Today&apos;s Lesson</div>
                  <div style={{ fontSize: "15px", fontWeight: 600 }}>{mindset.currentDayLesson.title}</div>
                  <div style={{ fontSize: "12px", opacity: 0.7 }}>{mindset.currentDayLesson.duration} min</div>
                </div>
                <ChevronRightIcon size={20} />
              </div>
            </Card>
          )}
        </div>
      </Card>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-xl)" }}>
        {[
          { id: "lessons", label: "Daily Lessons", icon: <BrainIcon size={18} /> },
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
              background: activeTab === tab.id ? "var(--accent-teal)" : "var(--background-tertiary)",
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

      {activeTab === "lessons" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "var(--spacing-lg)" }}>All Lessons</h2>
          <div className="stagger-children" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-md)" }}>
            {mindset.unlockedLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onClick={() => setSelectedLesson(lesson)}
                isToday={lesson.id === mindset.currentDayLesson?.id}
              />
            ))}
          </div>

          {mindset.unlockedLessons.length === 0 && (
            <Card variant="default" padding="lg">
              <div style={{ textAlign: "center", padding: "var(--spacing-2xl)" }}>
                <BrainIcon size={48} color="var(--foreground-tertiary)" />
                <h3 style={{ marginTop: "var(--spacing-md)", fontSize: "18px", fontWeight: 600 }}>Lessons unlock daily</h3>
                <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--foreground-tertiary)" }}>Come back tomorrow</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === "courses" && (
        <div>
          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>Brain Science Courses</h2>
            <p style={{ fontSize: "14px", color: "var(--foreground-secondary)" }}>Deep-dive into neuroscience for peak performance</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-md)" }}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} onStart={() => handleStartCourse(course)} />
            ))}
          </div>

          {courses.length === 0 && (
            <Card variant="default" padding="lg">
              <div style={{ textAlign: "center", padding: "var(--spacing-2xl)" }}>
                <BookIcon size={48} color="var(--foreground-tertiary)" />
                <h3 style={{ marginTop: "var(--spacing-md)", fontSize: "18px", fontWeight: 600 }}>Courses Loading</h3>
              </div>
            </Card>
          )}

          {/* Brain Regions Info */}
          <div style={{ marginTop: "var(--spacing-xl)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "var(--spacing-md)" }}>Know Your Brain</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--spacing-md)" }}>
              <BrainRegionCard region="Prefrontal Cortex" description="Decision making, impulse control, planning" icon="🧠" color="var(--accent-blue)" />
              <BrainRegionCard region="Limbic System" description="Emotions, memory, fight-or-flight" icon="❤️" color="var(--accent-red)" />
              <BrainRegionCard region="Basal Ganglia" description="Habit formation, automatic behaviors" icon="🔄" color="var(--accent-green)" />
              <BrainRegionCard region="Nucleus Accumbens" description="Reward, pleasure, dopamine processing" icon="⭐" color="var(--accent-yellow)" />
            </div>
          </div>
        </div>
      )}

      {activeTab === "quotes" && (
        <div>
          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>Motivational Quotes</h2>
            <p style={{ fontSize: "14px", color: "var(--foreground-secondary)" }}>Wisdom for discipline, success, and mental strength</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            {quotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                isSaved={savedQuotes.has(quote.id)}
                onSave={() => handleSaveQuote(quote.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lesson Reader Modal */}
      {selectedLesson && (
        <LessonReaderModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onComplete={() => handleCompleteLesson(selectedLesson.id)}
          isLoading={completeLesson.isPending}
        />
      )}

      {/* Course Reader Modal */}
      {selectedCourse && (
        <CourseReaderModal
          course={selectedCourse}
          currentModuleIndex={currentModuleIndex}
          onClose={() => setSelectedCourse(null)}
          onNext={handleNextModule}
        />
      )}
    </div>
  );
}

function LessonCard({ lesson, onClick, isToday }: { lesson: MindsetLessonDTO; onClick: () => void; isToday: boolean }) {
  const categoryColors: Record<string, string> = {
    motivation: "var(--accent-orange)", habit_science: "var(--accent-green)",
    psychology: "var(--accent-purple)", nutrition_mindset: "var(--accent-teal)",
    brain_science: "var(--accent-blue)", discipline: "var(--accent-red)",
  };
  const color = categoryColors[lesson.category || ""] || "var(--accent-blue)";

  return (
    <Card variant={lesson.isCompleted ? "default" : isToday ? "glass" : "default"} padding="md" hover={!lesson.isCompleted} onClick={onClick} style={{ cursor: "pointer", opacity: lesson.isCompleted ? 0.7 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-md)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "var(--radius-full)", background: `${color}20`, color, textTransform: "capitalize" }}>
            {lesson.category?.replace("_", " ") || "General"}
          </span>
          {isToday && !lesson.isCompleted && (
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--accent-blue)", background: "rgba(10, 132, 255, 0.15)", padding: "4px 8px", borderRadius: "var(--radius-full)" }}>Today</span>
          )}
        </div>
        {lesson.isCompleted ? (
          <div style={{ width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "var(--accent-green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckIcon size={14} color="white" />
          </div>
        ) : (
          <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)", display: "flex", alignItems: "center", gap: "4px" }}>
            <ClockIcon size={14} /> {lesson.duration} min
          </div>
        )}
      </div>
      <div style={{ fontSize: "11px", color: "var(--foreground-quaternary)", marginBottom: "4px" }}>Day {lesson.unlockDay}</div>
      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>{lesson.title}</h3>
      {lesson.description && <p style={{ fontSize: "13px", color: "var(--foreground-tertiary)", lineHeight: 1.4 }}>{lesson.description}</p>}
    </Card>
  );
}

function CourseCard({ course, onStart }: { course: Course; onStart: () => void }) {
  const progressPercent = course.modulesCount > 0 ? (course.currentModule / course.modulesCount) * 100 : 0;
  const difficultyColors = { beginner: "var(--accent-green)", intermediate: "var(--accent-orange)", advanced: "var(--accent-red)" };

  return (
    <Card variant="default" padding="lg" hover>
      <div style={{ marginBottom: "var(--spacing-md)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "var(--radius-full)", background: "rgba(100, 210, 255, 0.15)", color: "var(--accent-teal)", textTransform: "capitalize" }}>
            {course.category}
          </span>
          <span style={{ fontSize: "11px", color: difficultyColors[course.difficulty as keyof typeof difficultyColors] || "var(--foreground-tertiary)", textTransform: "capitalize" }}>
            {course.difficulty}
          </span>
        </div>
        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>{course.title}</h3>
        <p style={{ fontSize: "14px", color: "var(--foreground-tertiary)", lineHeight: 1.5 }}>{course.description}</p>
      </div>

      <Progress value={progressPercent} size="sm" variant={course.isCompleted ? "success" : "default"} style={{ marginBottom: "var(--spacing-md)" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", color: "var(--foreground-tertiary)" }}>
          {course.currentModule}/{course.modulesCount} modules • {course.duration} min
        </span>
        <Button size="sm" variant={course.isCompleted ? "secondary" : "primary"} onClick={onStart}>
          {course.isCompleted ? "Review" : course.isStarted ? "Continue" : "Start"}
        </Button>
      </div>
    </Card>
  );
}

function BrainRegionCard({ region, description, icon, color }: { region: string; description: string; icon: string; color: string }) {
  return (
    <Card variant="default" padding="md">
      <div style={{ fontSize: "28px", marginBottom: "var(--spacing-sm)" }}>{icon}</div>
      <h4 style={{ fontSize: "14px", fontWeight: 600, color, marginBottom: "4px" }}>{region}</h4>
      <p style={{ fontSize: "12px", color: "var(--foreground-tertiary)", lineHeight: 1.4 }}>{description}</p>
    </Card>
  );
}

function QuoteCard({ quote, isSaved, onSave }: { quote: Quote; isSaved: boolean; onSave: () => void }) {
  const categoryColors: Record<string, string> = {
    motivation: "var(--accent-orange)", discipline: "var(--accent-blue)",
    mindset: "var(--accent-purple)", success: "var(--accent-green)",
    brain_science: "var(--accent-teal)", fitness: "var(--accent-red)",
  };
  const color = categoryColors[quote.category] || "var(--accent-blue)";

  return (
    <Card variant="default" padding="lg">
      <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
        <div style={{ width: "4px", borderRadius: "var(--radius-full)", background: color }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "17px", fontStyle: "italic", lineHeight: 1.7, marginBottom: "12px", color: "var(--foreground)" }}>
            &ldquo;{quote.text}&rdquo;
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "14px", color: "var(--foreground-secondary)" }}>— {quote.author}</span>
              <span style={{ marginLeft: "12px", fontSize: "11px", padding: "4px 10px", borderRadius: "var(--radius-full)", background: `${color}20`, color, textTransform: "capitalize" }}>
                {quote.category.replace("_", " ")}
              </span>
            </div>
            <button
              onClick={onSave}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "8px" }}
            >
              <HeartIcon size={20} color={isSaved ? "var(--accent-red)" : "var(--foreground-tertiary)"} />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function LessonReaderModal({ lesson, onClose, onComplete, isLoading }: { lesson: MindsetLessonDTO; onClose: () => void; onComplete: () => void; isLoading: boolean }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "var(--spacing-xl)" }}>
      <div style={{ width: "100%", maxWidth: "800px", maxHeight: "90vh", background: "var(--background-secondary)", borderRadius: "var(--radius-xl)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "var(--spacing-lg) var(--spacing-xl)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)", marginBottom: "4px" }}>Day {lesson.unlockDay} • {lesson.duration} min read</div>
            <h2 style={{ fontSize: "24px", fontWeight: 700 }}>{lesson.title}</h2>
          </div>
          <button onClick={onClose} style={{ width: "36px", height: "36px", borderRadius: "var(--radius-full)", background: "var(--background-tertiary)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <XIcon size={18} color="var(--foreground-secondary)" />
          </button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "var(--spacing-xl)" }}>
          <div
            style={{ fontSize: "16px", lineHeight: 1.8, color: "var(--foreground-secondary)", whiteSpace: "pre-wrap" }}
            dangerouslySetInnerHTML={{
              __html: lesson.content
                .replace(/\*\*(.+?)\*\*/g, '<strong style="color: var(--foreground)">$1</strong>')
                .replace(/\n\n/g, "</p><p style='margin-top: 1.5em'>")
                .replace(/^/, "<p>")
                .replace(/$/, "</p>"),
            }}
          />
        </div>
        <div style={{ padding: "var(--spacing-lg) var(--spacing-xl)", borderTop: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          {!lesson.isCompleted ? (
            <Button variant="success" onClick={onComplete} isLoading={isLoading}><CheckIcon size={18} /> Mark Complete</Button>
          ) : (
            <Button variant="secondary" disabled><CheckIcon size={18} /> Completed</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseReaderModal({ course, currentModuleIndex, onClose, onNext }: { course: Course; currentModuleIndex: number; onClose: () => void; onNext: () => void }) {
  const module = course.modules[currentModuleIndex];
  const isLastModule = currentModuleIndex >= course.modules.length - 1;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "var(--spacing-xl)" }}>
      <div style={{ width: "100%", maxWidth: "900px", maxHeight: "90vh", background: "var(--background-secondary)", borderRadius: "var(--radius-xl)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "var(--spacing-lg) var(--spacing-xl)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)", marginBottom: "4px" }}>
              {course.title} • Module {currentModuleIndex + 1}/{course.modules.length}
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 700 }}>{module.title}</h2>
          </div>
          <button onClick={onClose} style={{ width: "36px", height: "36px", borderRadius: "var(--radius-full)", background: "var(--background-tertiary)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <XIcon size={18} color="var(--foreground-secondary)" />
          </button>
        </div>

        <Progress value={((currentModuleIndex + 1) / course.modules.length) * 100} size="sm" variant="gradient" style={{ borderRadius: 0 }} />

        <div style={{ flex: 1, overflow: "auto", padding: "var(--spacing-xl)" }}>
          <div
            style={{ fontSize: "16px", lineHeight: 1.9, color: "var(--foreground-secondary)", whiteSpace: "pre-wrap" }}
            dangerouslySetInnerHTML={{
              __html: module.content
                .replace(/\*\*(.+?)\*\*/g, '<strong style="color: var(--foreground)">$1</strong>')
                .replace(/\n\n/g, "</p><p style='margin-top: 1.5em'>")
                .replace(/^/, "<p>")
                .replace(/$/, "</p>"),
            }}
          />
        </div>

        <div style={{ padding: "var(--spacing-lg) var(--spacing-xl)", borderTop: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button variant="ghost" onClick={onClose}>Exit Course</Button>
          <Button onClick={onNext}>
            {isLastModule ? "Complete Course" : "Next Module"} <ChevronRightIcon size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px" }}>
      <div style={{ width: "48px", height: "48px", border: "3px solid var(--background-tertiary)", borderTopColor: "var(--accent-teal)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
