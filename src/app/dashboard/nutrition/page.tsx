"use client";

import { useState, useEffect } from "react";

import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlusIcon, XIcon, DropletIcon, CheckIcon, ClockIcon } from "@/components/ui/icons";
import { useJourneyToday, useNutritionToday } from "@/hooks/useTodayQueries";

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

interface WaterLog {
  id: string;
  amount: number;
  loggedAt: string;
}

export default function NutritionPage() {
  const { data: journey } = useJourneyToday();
  const { data: nutrition, isLoading, refetch } = useNutritionToday();
  
  const [showMealModal, setShowMealModal] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [totalWater, setTotalWater] = useState(0);
  const [currentMacros, setCurrentMacros] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Load local meals from localStorage (since we don't have a full meals API)
  useEffect(() => {
    const storedMeals = localStorage.getItem("todayMeals");
    const storedDate = localStorage.getItem("mealsDate");
    const today = new Date().toDateString();
    
    if (storedDate === today && storedMeals) {
      const parsedMeals = JSON.parse(storedMeals);
      setMeals(parsedMeals);
      calculateMacros(parsedMeals);
    }
  }, []);

  // Fetch water logs
  useEffect(() => {
    fetch("/api/me/nutrition/today/water")
      .then((res) => res.json())
      .then((data) => {
        setWaterLogs(data.logs || []);
        setTotalWater(data.totalLiters || 0);
      })
      .catch(console.error);
  }, []);

  const calculateMacros = (mealList: Meal[]) => {
    const totals = mealList.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    setCurrentMacros(totals);
  };

  const handleAddMeal = (meal: Omit<Meal, "id" | "time">) => {
    const newMeal: Meal = {
      ...meal,
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
    
    const updatedMeals = [...meals, newMeal];
    setMeals(updatedMeals);
    calculateMacros(updatedMeals);
    
    // Store in localStorage
    localStorage.setItem("todayMeals", JSON.stringify(updatedMeals));
    localStorage.setItem("mealsDate", new Date().toDateString());
    
    setShowMealModal(false);
  };

  const handleRemoveMeal = (mealId: string) => {
    const updatedMeals = meals.filter((m) => m.id !== mealId);
    setMeals(updatedMeals);
    calculateMacros(updatedMeals);
    localStorage.setItem("todayMeals", JSON.stringify(updatedMeals));
  };

  const handleAddWater = async (amount: number) => {
    try {
      const res = await fetch("/api/me/nutrition/today/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      
      if (data.success) {
        setWaterLogs((prev) => [data.log, ...prev]);
        setTotalWater(data.totalLiters);
      }
      setShowWaterModal(false);
    } catch (error) {
      console.error("Failed to log water:", error);
    }
  };

  const targetCalories = nutrition?.targetCalories || 2000;
  const targetProtein = nutrition?.targetProtein || 150;
  const targetCarbs = nutrition?.targetCarbs || 200;
  const targetFat = nutrition?.targetFat || 70;
  const targetWater = 3.0;

  if (isLoading) {
    return (
      <div>
        <Header title="Nutrition" subtitle="Loading..." />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <Header
        title="Nutrition"
        subtitle="Fuel your transformation"
        dayNumber={journey?.currentDay}
        phase={journey?.phase}
      />

      {/* Macros Overview */}
      <Card variant="glass" padding="lg" style={{ marginBottom: "var(--spacing-xl)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--spacing-xl)" }}>
          <MacroCard
            label="Calories"
            current={currentMacros.calories}
            target={targetCalories}
            unit="kcal"
            color="var(--accent-orange)"
          />
          <MacroCard
            label="Protein"
            current={currentMacros.protein}
            target={targetProtein}
            unit="g"
            color="var(--accent-red)"
          />
          <MacroCard
            label="Carbs"
            current={currentMacros.carbs}
            target={targetCarbs}
            unit="g"
            color="var(--accent-blue)"
          />
          <MacroCard
            label="Fat"
            current={currentMacros.fat}
            target={targetFat}
            unit="g"
            color="var(--accent-yellow)"
          />
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--spacing-xl)" }}>
        {/* Meals Section */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-lg)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600 }}>Today&apos;s Meals</h2>
            <Button onClick={() => setShowMealModal(true)}>
              <PlusIcon size={18} /> Add Meal
            </Button>
          </div>

          {meals.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              {meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} onRemove={() => handleRemoveMeal(meal.id)} />
              ))}
            </div>
          ) : (
            <Card variant="default" padding="lg">
              <div style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
                <div style={{ fontSize: "48px", marginBottom: "var(--spacing-md)" }}>🍽️</div>
                <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>No meals logged yet</h3>
                <p style={{ fontSize: "14px", color: "var(--foreground-tertiary)", marginBottom: "var(--spacing-lg)" }}>
                  Start tracking your nutrition by adding your first meal
                </p>
                <Button onClick={() => setShowMealModal(true)}>
                  <PlusIcon size={18} /> Add Your First Meal
                </Button>
              </div>
            </Card>
          )}

          {/* Quick Add Suggestions */}
          <div style={{ marginTop: "var(--spacing-xl)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "var(--spacing-md)" }}>Quick Add</h3>
            <div style={{ display: "flex", gap: "var(--spacing-sm)", flexWrap: "wrap" }}>
              {QUICK_ADD_MEALS.map((meal) => (
                <button
                  key={meal.name}
                  onClick={() => handleAddMeal(meal)}
                  style={{
                    padding: "10px 16px",
                    background: "var(--background-tertiary)",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    color: "var(--foreground)",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--background-quaternary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--background-tertiary)"; }}
                >
                  <span>{meal.emoji}</span>
                  <span>{meal.name}</span>
                  <span style={{ color: "var(--foreground-tertiary)", fontSize: "11px" }}>{meal.calories}cal</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Water Section */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-lg)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600 }}>Water Intake</h2>
            <Button variant="secondary" onClick={() => setShowWaterModal(true)}>
              <DropletIcon size={18} /> Add
            </Button>
          </div>

          <Card variant="gradient" gradient="linear-gradient(135deg, #0a4d8c 0%, #0891b2 100%)" padding="lg">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "56px", fontWeight: 700, color: "white", marginBottom: "8px" }}>
                {totalWater.toFixed(1)}
                <span style={{ fontSize: "24px", opacity: 0.7 }}>L</span>
              </div>
              <div style={{ fontSize: "14px", opacity: 0.8, marginBottom: "var(--spacing-md)" }}>
                of {targetWater}L goal
              </div>
              <Progress
                value={(totalWater / targetWater) * 100}
                size="lg"
                style={{ background: "rgba(255, 255, 255, 0.2)" }}
              />
              <div style={{ display: "flex", justifyContent: "center", gap: "var(--spacing-sm)", marginTop: "var(--spacing-lg)" }}>
                {[0.25, 0.5, 0.75, 1].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAddWater(amount)}
                    style={{
                      padding: "10px 16px",
                      background: "rgba(255, 255, 255, 0.15)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "var(--radius-md)",
                      color: "white",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    +{amount}L
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Water Log */}
          {waterLogs.length > 0 && (
            <Card variant="default" padding="md" style={{ marginTop: "var(--spacing-md)" }}>
              <CardHeader>
                <CardTitle size="sm">Recent</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)" }}>
                  {waterLogs.slice(0, 5).map((log) => (
                    <div key={log.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <DropletIcon size={14} color="var(--accent-blue)" />
                        <span style={{ fontSize: "13px" }}>{log.amount}L</span>
                      </div>
                      <span style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>
                        {new Date(log.loggedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Meal Modal */}
      {showMealModal && (
        <AddMealModal onClose={() => setShowMealModal(false)} onAdd={handleAddMeal} />
      )}

      {/* Add Water Modal */}
      {showWaterModal && (
        <AddWaterModal onClose={() => setShowWaterModal(false)} onAdd={handleAddWater} />
      )}
    </div>
  );
}

const QUICK_ADD_MEALS = [
  { name: "Chicken Breast", emoji: "🍗", calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: "Brown Rice Cup", emoji: "🍚", calories: 216, protein: 5, carbs: 45, fat: 2 },
  { name: "Greek Yogurt", emoji: "🥛", calories: 100, protein: 17, carbs: 6, fat: 1 },
  { name: "Banana", emoji: "🍌", calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: "Eggs (2)", emoji: "🥚", calories: 155, protein: 13, carbs: 1, fat: 11 },
  { name: "Protein Shake", emoji: "🥤", calories: 120, protein: 24, carbs: 3, fat: 1 },
  { name: "Avocado", emoji: "🥑", calories: 160, protein: 2, carbs: 9, fat: 15 },
  { name: "Salmon Fillet", emoji: "🐟", calories: 208, protein: 20, carbs: 0, fat: 13 },
];

function MacroCard({ label, current, target, unit, color }: { label: string; current: number; target: number; unit: string; color: string }) {
  const percent = Math.min((current / target) * 100, 100);
  const isOver = current > target;

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: "100px", height: "100px", margin: "0 auto var(--spacing-md)" }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percent * 2.83} 283`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: isOver ? "var(--accent-red)" : "var(--foreground)" }}>
            {current}
          </div>
          <div style={{ fontSize: "11px", color: "var(--foreground-tertiary)" }}>{unit}</div>
        </div>
      </div>
      <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>of {target}{unit}</div>
    </div>
  );
}

function MealCard({ meal, onRemove }: { meal: Meal; onRemove: () => void }) {
  return (
    <Card variant="default" padding="md">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", marginBottom: "8px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600 }}>{meal.name}</h3>
            <span style={{ fontSize: "12px", color: "var(--foreground-tertiary)", display: "flex", alignItems: "center", gap: "4px" }}>
              <ClockIcon size={12} /> {meal.time}
            </span>
          </div>
          <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
            <MacroBadge label="Cal" value={meal.calories} color="var(--accent-orange)" />
            <MacroBadge label="P" value={meal.protein} color="var(--accent-red)" />
            <MacroBadge label="C" value={meal.carbs} color="var(--accent-blue)" />
            <MacroBadge label="F" value={meal.fat} color="var(--accent-yellow)" />
          </div>
        </div>
        <button
          onClick={onRemove}
          style={{ width: "32px", height: "32px", borderRadius: "var(--radius-sm)", background: "var(--background-tertiary)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <XIcon size={16} color="var(--foreground-tertiary)" />
        </button>
      </div>
    </Card>
  );
}

function MacroBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px" }}>
      <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: color }} />
      <span style={{ color: "var(--foreground-tertiary)" }}>{label}:</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function AddMealModal({ onClose, onAdd }: { onClose: () => void; onAdd: (meal: { name: string; calories: number; protein: number; carbs: number; fat: number }) => void }) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      name,
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <Card variant="elevated" padding="lg" style={{ width: "480px" }} onClick={(e) => e?.stopPropagation()}>
        <CardHeader>
          <CardTitle size="lg">Add Meal</CardTitle>
          <CardDescription>Track what you eat</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--foreground-secondary)", marginBottom: "8px" }}>Meal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Grilled chicken salad"
                style={{ width: "100%", padding: "12px", background: "var(--background-tertiary)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", color: "var(--foreground)", fontSize: "14px" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-md)" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--foreground-secondary)", marginBottom: "8px" }}>Calories (kcal)</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="0"
                  style={{ width: "100%", padding: "12px", background: "var(--background-tertiary)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", color: "var(--foreground)", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--foreground-secondary)", marginBottom: "8px" }}>Protein (g)</label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="0"
                  style={{ width: "100%", padding: "12px", background: "var(--background-tertiary)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", color: "var(--foreground)", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--foreground-secondary)", marginBottom: "8px" }}>Carbs (g)</label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="0"
                  style={{ width: "100%", padding: "12px", background: "var(--background-tertiary)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", color: "var(--foreground)", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--foreground-secondary)", marginBottom: "8px" }}>Fat (g)</label>
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  placeholder="0"
                  style={{ width: "100%", padding: "12px", background: "var(--background-tertiary)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", color: "var(--foreground)", fontSize: "14px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "var(--spacing-md)" }}>
              <Button variant="secondary" onClick={onClose} fullWidth>Cancel</Button>
              <Button onClick={handleSubmit} fullWidth disabled={!name.trim()}>Add Meal</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AddWaterModal({ onClose, onAdd }: { onClose: () => void; onAdd: (amount: number) => void }) {
  const [amount, setAmount] = useState("0.5");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <Card variant="elevated" padding="lg" style={{ width: "400px" }} onClick={(e) => e?.stopPropagation()}>
        <CardHeader style={{ textAlign: "center" }}>
          <div style={{ width: "60px", height: "60px", margin: "0 auto var(--spacing-md)", borderRadius: "var(--radius-full)", background: "rgba(10, 132, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DropletIcon size={28} color="var(--accent-blue)" />
          </div>
          <CardTitle size="lg">Log Water</CardTitle>
          <CardDescription>How much water did you drink?</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--spacing-sm)" }}>
              {["0.25", "0.5", "0.75", "1.0"].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  style={{
                    padding: "14px",
                    background: amount === val ? "var(--accent-blue)" : "var(--background-tertiary)",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    color: amount === val ? "white" : "var(--foreground-secondary)",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {val}L
                </button>
              ))}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--foreground-secondary)", marginBottom: "8px" }}>Custom Amount (L)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.1"
                min="0.1"
                style={{ width: "100%", padding: "12px", background: "var(--background-tertiary)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", color: "var(--foreground)", fontSize: "14px", textAlign: "center" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <Button variant="secondary" onClick={onClose} fullWidth>Cancel</Button>
              <Button onClick={() => onAdd(parseFloat(amount))} fullWidth>
                <CheckIcon size={18} /> Add {amount}L
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
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
