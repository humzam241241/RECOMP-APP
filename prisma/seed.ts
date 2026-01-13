import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data
  await prisma.savedQuote.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.courseProgress.deleteMany();
  await prisma.courseModule.deleteMany();
  await prisma.brainCourse.deleteMany();
  await prisma.habitLog.deleteMany();
  await prisma.exerciseSet.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.nutritionLog.deleteMany();
  await prisma.waterLog.deleteMany();
  await prisma.runSession.deleteMany();
  await prisma.mindsetProgress.deleteMany();
  await prisma.dopamineDaily.deleteMany();
  await prisma.nutritionPlan.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.templateExercise.deleteMany();
  await prisma.workoutTemplate.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.mindsetLesson.deleteMany();
  await prisma.journey.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing data");

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo1234", 12);
  const demoUser = await prisma.user.create({
    data: {
      email: "demo@recomp.app",
      name: "Demo User",
      password: hashedPassword,
      emailVerified: new Date(),
      onboardingComplete: true,
    },
  });

  console.log("👤 Created demo user:", demoUser.email);

  // Create user profile
  await prisma.userProfile.create({
    data: {
      userId: demoUser.id,
      // Personal Info
      displayName: "Demo User",
      username: "demouser",
      bio: "On a 90-day body recomposition journey. Fitness enthusiast and lifelong learner. Let's crush goals together! 💪",
      dateOfBirth: new Date("1998-05-15"),
      location: "San Francisco, CA",
      website: "https://recomp.app",
      // Social Links
      instagramUrl: "https://instagram.com/recompapp",
      twitterUrl: "https://twitter.com/recompapp",
      // Physical stats
      height: 175,
      weight: 80,
      targetWeight: 75,
      age: 28,
      gender: "male",
      // Activity & Goals
      activityLevel: "moderate",
      fitnessGoal: "recomposition",
      experienceLevel: "intermediate",
      workoutDays: 4,
      preferredWorkoutTime: "morning",
      // Privacy
      isPublic: true,
      showStats: true,
      showStreak: true,
      // Calculated
      bmr: 1800,
      tdee: 2500,
    },
  });

  console.log("📊 Created user profile");

  // Create journey starting today
  const journey = await prisma.journey.create({
    data: {
      userId: demoUser.id,
      startDate: new Date(),
      currentDay: 1,
      phase: "foundation",
      isActive: true,
    },
  });

  console.log("🚀 Created journey starting today");

  // Create workout templates
  const workoutTemplates = [
    {
      name: "Push Day - Strength",
      description: "Heavy compound movements focusing on chest, shoulders, and triceps",
      workoutType: "strength",
      difficulty: "intermediate",
      duration: 60,
      calories: 400,
      equipment: ["barbell", "dumbbells", "bench"],
      muscleGroups: ["chest", "shoulders", "triceps"],
      exercises: [
        { name: "Barbell Bench Press", targetSets: 5, targetReps: "5", restSeconds: 180 },
        { name: "Overhead Press", targetSets: 4, targetReps: "6", restSeconds: 150 },
        { name: "Incline Dumbbell Press", targetSets: 3, targetReps: "8", restSeconds: 90 },
        { name: "Dips", targetSets: 3, targetReps: "8-10", restSeconds: 90 },
        { name: "Tricep Pushdowns", targetSets: 3, targetReps: "12", restSeconds: 60 },
      ],
    },
    {
      name: "Pull Day - Strength",
      description: "Heavy pulling movements for back and biceps",
      workoutType: "strength",
      difficulty: "intermediate",
      duration: 60,
      calories: 420,
      equipment: ["barbell", "cable machine", "pull-up bar"],
      muscleGroups: ["back", "biceps", "rear delts"],
      exercises: [
        { name: "Deadlift", targetSets: 5, targetReps: "5", restSeconds: 180 },
        { name: "Weighted Pull-ups", targetSets: 4, targetReps: "6", restSeconds: 150 },
        { name: "Barbell Rows", targetSets: 4, targetReps: "6", restSeconds: 120 },
        { name: "Face Pulls", targetSets: 3, targetReps: "15", restSeconds: 60 },
        { name: "Barbell Curls", targetSets: 3, targetReps: "10", restSeconds: 60 },
      ],
    },
    {
      name: "HIIT Cardio Blast",
      description: "High-intensity interval training for maximum calorie burn",
      workoutType: "hiit",
      difficulty: "advanced",
      duration: 30,
      calories: 350,
      equipment: ["none"],
      muscleGroups: ["full body"],
      exercises: [
        { name: "Burpees", targetSets: 4, targetReps: "30 sec", restSeconds: 30 },
        { name: "Mountain Climbers", targetSets: 4, targetReps: "30 sec", restSeconds: 30 },
        { name: "Jump Squats", targetSets: 4, targetReps: "30 sec", restSeconds: 30 },
        { name: "High Knees", targetSets: 4, targetReps: "30 sec", restSeconds: 30 },
        { name: "Box Jumps", targetSets: 4, targetReps: "30 sec", restSeconds: 30 },
      ],
    },
    {
      name: "Hypertrophy Chest & Triceps",
      description: "Volume-focused workout for muscle growth",
      workoutType: "hypertrophy",
      difficulty: "intermediate",
      duration: 50,
      calories: 380,
      equipment: ["dumbbells", "cables", "bench"],
      muscleGroups: ["chest", "triceps"],
      exercises: [
        { name: "Dumbbell Bench Press", targetSets: 4, targetReps: "10-12", restSeconds: 90 },
        { name: "Incline Dumbbell Flyes", targetSets: 3, targetReps: "12-15", restSeconds: 60 },
        { name: "Cable Crossovers", targetSets: 3, targetReps: "15", restSeconds: 60 },
        { name: "Tricep Dips", targetSets: 3, targetReps: "12", restSeconds: 60 },
        { name: "Overhead Tricep Extension", targetSets: 3, targetReps: "15", restSeconds: 45 },
      ],
    },
    {
      name: "Endurance Circuit",
      description: "Low-intensity, high-rep circuit for cardiovascular endurance",
      workoutType: "endurance",
      difficulty: "beginner",
      duration: 40,
      calories: 300,
      equipment: ["dumbbells", "resistance bands"],
      muscleGroups: ["full body"],
      exercises: [
        { name: "Goblet Squats", targetSets: 3, targetReps: "20", restSeconds: 45 },
        { name: "Push-ups", targetSets: 3, targetReps: "20", restSeconds: 45 },
        { name: "Lunges", targetSets: 3, targetReps: "20 each", restSeconds: 45 },
        { name: "Plank", targetSets: 3, targetReps: "60 sec", restSeconds: 30 },
        { name: "Jumping Jacks", targetSets: 3, targetReps: "50", restSeconds: 30 },
      ],
    },
    {
      name: "Leg Day - Hypertrophy",
      description: "Volume training for quadriceps, hamstrings, and glutes",
      workoutType: "hypertrophy",
      difficulty: "intermediate",
      duration: 55,
      calories: 450,
      equipment: ["barbell", "leg press", "machines"],
      muscleGroups: ["quadriceps", "hamstrings", "glutes", "calves"],
      exercises: [
        { name: "Squats", targetSets: 4, targetReps: "10", restSeconds: 120 },
        { name: "Romanian Deadlifts", targetSets: 4, targetReps: "10", restSeconds: 90 },
        { name: "Leg Press", targetSets: 3, targetReps: "12", restSeconds: 90 },
        { name: "Leg Curls", targetSets: 3, targetReps: "15", restSeconds: 60 },
        { name: "Calf Raises", targetSets: 4, targetReps: "20", restSeconds: 45 },
      ],
    },
  ];

  for (const template of workoutTemplates) {
    const { exercises, ...templateData } = template;
    const createdTemplate = await prisma.workoutTemplate.create({
      data: templateData,
    });

    for (let i = 0; i < exercises.length; i++) {
      await prisma.templateExercise.create({
        data: {
          ...exercises[i],
          templateId: createdTemplate.id,
          orderIndex: i,
        },
      });
    }
  }

  console.log("💪 Created workout templates");

  // Create default habits
  const goodHabits = [
    { name: "Morning Workout", description: "Complete your scheduled workout", type: "good", category: "exercise", dopamineType: "natural" },
    { name: "8 Hours Sleep", description: "Get quality sleep for recovery", type: "good", category: "sleep", dopamineType: "natural" },
    { name: "Hit Protein Goal", description: "Reach your daily protein target", type: "good", category: "nutrition", dopamineType: "natural" },
    { name: "10 Min Meditation", description: "Practice mindfulness", type: "good", category: "mindfulness", dopamineType: "natural" },
    { name: "10K Steps", description: "Stay active throughout the day", type: "good", category: "exercise", dopamineType: "natural" },
    { name: "Drink 3L Water", description: "Stay hydrated", type: "good", category: "nutrition", dopamineType: "natural" },
    { name: "Cold Shower", description: "Build mental resilience", type: "good", category: "mindfulness", dopamineType: "natural" },
    { name: "Read 20 Pages", description: "Learn something new", type: "good", category: "productivity", dopamineType: "natural" },
    { name: "Journal Entry", description: "Reflect on your day", type: "good", category: "mindfulness", dopamineType: "natural" },
    { name: "No Phone First Hour", description: "Start day without screens", type: "good", category: "productivity", dopamineType: "natural" },
  ];

  const badHabits = [
    { name: "Social Media Scrolling", description: "Mindless scrolling for 30+ min", type: "bad", category: "vice", dopamineType: "artificial" },
    { name: "Late Night Snacking", description: "Eating after 9pm", type: "bad", category: "nutrition", dopamineType: "artificial" },
    { name: "Skipped Workout", description: "Missed a scheduled training session", type: "bad", category: "exercise", dopamineType: "artificial" },
    { name: "Alcohol", description: "Consumed alcoholic beverages", type: "bad", category: "vice", dopamineType: "artificial" },
    { name: "Processed Food", description: "Ate junk/processed food", type: "bad", category: "nutrition", dopamineType: "artificial" },
    { name: "Less Than 6h Sleep", description: "Poor sleep duration", type: "bad", category: "sleep", dopamineType: "artificial" },
    { name: "Binge Watching", description: "3+ hours of streaming", type: "bad", category: "vice", dopamineType: "artificial" },
    { name: "Sugary Drinks", description: "Soda, energy drinks, etc.", type: "bad", category: "nutrition", dopamineType: "artificial" },
  ];

  await prisma.habit.createMany({
    data: [...goodHabits, ...badHabits].map((h) => ({ ...h, userId: demoUser.id, isPreset: true })),
  });

  console.log("✅ Created default habits");

  // Create motivational quotes
  const quotes = [
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown", category: "motivation" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", category: "discipline" },
    { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown", category: "mindset" },
    { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown", category: "motivation" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "success" },
    { text: "The prefrontal cortex is like a muscle. The more you use it, the stronger it gets.", author: "David Rock", category: "brain_science" },
    { text: "Dopamine is not about pleasure. It's about the anticipation of pleasure.", author: "Robert Sapolsky", category: "brain_science" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", category: "discipline" },
    { text: "The resistance to the unpleasant situation is the root of suffering.", author: "Ram Dass", category: "mindset" },
    { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun", category: "motivation" },
    { text: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear", category: "discipline" },
    { text: "The basal ganglia doesn't distinguish between good and bad habits.", author: "Charles Duhigg", category: "brain_science" },
    { text: "Your brain is constantly being shaped by experience.", author: "Richard Davidson", category: "brain_science" },
    { text: "Willpower is like a muscle that gets tired. Habits bypass the need for willpower.", author: "Roy Baumeister", category: "discipline" },
    { text: "The limbic system reacts 10 times faster than the prefrontal cortex.", author: "Daniel Goleman", category: "brain_science" },
    { text: "Neurons that fire together, wire together.", author: "Donald Hebb", category: "brain_science" },
    { text: "Small disciplines repeated with consistency every day lead to great achievements.", author: "John Maxwell", category: "success" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "motivation" },
    { text: "You don't have to be extreme, just consistent.", author: "Unknown", category: "fitness" },
    { text: "Comfort is the enemy of progress.", author: "P.T. Barnum", category: "mindset" },
  ];

  await prisma.quote.createMany({
    data: quotes,
  });

  console.log("💬 Created motivational quotes");

  // Create brain courses
  const brainCourses = [
    {
      title: "Understanding Dopamine",
      description: "Learn how dopamine affects motivation, habits, and decision-making",
      category: "dopamine",
      difficulty: "beginner",
      duration: 20,
      modules: [
        {
          title: "What is Dopamine?",
          content: `Dopamine is a neurotransmitter that plays a major role in motivation, reward, and pleasure. But here's what most people get wrong: dopamine isn't about pleasure itself—it's about the *anticipation* of pleasure.

When you see a notification on your phone, dopamine spikes before you even check it. That's why social media is so addictive—it hijacks your dopamine system with constant variable rewards.

**Key Insight:** Your brain releases dopamine in response to *unexpected* rewards. Predictable rewards produce less dopamine over time. This is called dopamine adaptation.

**Application:** To build good habits, vary your rewards and focus on the process rather than the outcome.`,
          duration: 5,
        },
        {
          title: "Natural vs Artificial Dopamine",
          content: `Not all dopamine is created equal. Natural dopamine sources (exercise, accomplishment, social connection) create sustainable motivation. Artificial sources (social media, junk food, gambling) create spikes followed by crashes.

**Natural Sources (Build these):**
- Physical exercise
- Completing challenging tasks
- Learning new skills
- Meaningful social interaction
- Sunlight exposure
- Cold exposure

**Artificial Sources (Minimize these):**
- Social media scrolling
- Processed foods
- Excessive video games
- Pornography
- Gambling
- Alcohol and drugs

**The Reset Protocol:**
Spend 2-4 weeks minimizing artificial dopamine sources. Your baseline will reset, and natural sources will feel rewarding again.`,
          duration: 5,
        },
        {
          title: "The Dopamine Detox Myth",
          content: `You can't actually "detox" dopamine—it's always present in your brain. What you CAN do is recalibrate your dopamine sensitivity.

**How It Works:**
1. Constant high-dopamine activities raise your baseline
2. Normal activities feel boring by comparison
3. You need bigger "hits" to feel motivated
4. The cycle continues

**The Solution:**
Instead of complete abstinence (which rarely works), focus on:
- Front-loading difficulty: Do hard things first
- Delayed gratification: Wait before rewards
- Intermittent fasting from stimulation
- Replacing rather than removing

**Practical Protocol:**
- First 2 hours of day: No phone, no social media
- Before any "treat," complete one meaningful task
- One day per week: Minimal screen time`,
          duration: 5,
        },
        {
          title: "Hacking Your Dopamine System",
          content: `Now that you understand how dopamine works, here's how to use it for your goals:

**1. Anticipation Amplification**
Build anticipation for good habits. Think about how good you'll feel AFTER your workout. Visualize the success.

**2. Reward Stacking**
Pair difficult activities with enjoyable ones:
- Listen to podcasts only while exercising
- Enjoy coffee only after morning routine is complete
- Save TV for after your habit tracker is filled

**3. Progress Tracking**
The RECOMP dopamine score isn't just gamification—it's providing your brain with regular small wins. Each point releases a tiny hit of dopamine, reinforcing the behavior.

**4. Variable Rewards**
Don't make rewards too predictable. The "bonus" system (first win, swap bonus, streak) adds variability that keeps your brain engaged.

**5. Social Accountability**
Sharing progress with others creates social dopamine—one of the most powerful natural sources.`,
          duration: 5,
        },
      ],
    },
    {
      title: "The Science of Discipline",
      description: "Master the neuroscience behind self-control and decision making",
      category: "discipline",
      difficulty: "intermediate",
      duration: 25,
      modules: [
        {
          title: "The Prefrontal Cortex: Your Control Center",
          content: `The prefrontal cortex (PFC) is the CEO of your brain. Located just behind your forehead, it's responsible for:
- Long-term planning
- Impulse control
- Decision making
- Emotional regulation
- Working memory

**The Problem:**
Your PFC is easily depleted. It runs on glucose and is the first part of your brain to suffer when you're:
- Tired
- Hungry
- Stressed
- Overwhelmed

**Why This Matters:**
Every decision depletes your PFC. This is why you make worse choices at the end of the day—your "willpower tank" is empty.

**The Solution:**
- Make important decisions early
- Reduce daily decisions through routines
- Protect your PFC with sleep, nutrition, and stress management`,
          duration: 5,
        },
        {
          title: "The Limbic System: Your Impulsive Brain",
          content: `Your limbic system is the emotional center of your brain. It evolved millions of years before the prefrontal cortex and is much faster and stronger.

**Key Structures:**
- **Amygdala:** Fear and threat detection
- **Hippocampus:** Memory formation
- **Hypothalamus:** Basic drives (hunger, thirst, sex)

**The Battle:**
When you "want" something unhealthy, that's your limbic system speaking. When you "know" you shouldn't, that's your PFC. The limbic system often wins because:
1. It processes information 5x faster
2. It has stronger connections
3. It's always "on"

**Winning Strategy:**
Don't fight your limbic system directly—you'll lose. Instead:
- Remove temptations from your environment
- Create friction for bad behaviors
- Use implementation intentions ("If X, then Y")
- Leverage the limbic system with positive emotions`,
          duration: 5,
        },
        {
          title: "Habit Formation: The Basal Ganglia",
          content: `The basal ganglia is where habits live. Once a behavior becomes habitual, it moves from the conscious PFC to the automatic basal ganglia.

**The Habit Loop:**
1. **Cue:** Trigger that initiates the behavior
2. **Routine:** The behavior itself
3. **Reward:** What your brain gets from it

**Why Habits Are Powerful:**
- They don't require willpower
- They run automatically
- They're energy-efficient
- They're hard to break (but possible)

**Building Good Habits:**
1. Start incredibly small (2-minute rule)
2. Attach to existing habits (habit stacking)
3. Make the cue obvious
4. Make the reward immediate
5. Track your progress (feeds dopamine)

**Breaking Bad Habits:**
1. Make the cue invisible
2. Make the routine difficult
3. Make the reward unsatisfying
4. Replace rather than eliminate`,
          duration: 5,
        },
        {
          title: "Decision Fatigue & Mental Energy",
          content: `Your ability to make good decisions is finite. Every choice depletes a limited resource.

**Signs of Decision Fatigue:**
- Impulsive choices
- Procrastination
- Irritability
- Simplistic thinking
- Default to easiest option

**Conservation Strategies:**

**1. Morning Priority**
Your PFC is freshest in the morning. Do your hardest work first.

**2. Routine Everything Possible**
Steve Jobs wore the same outfit daily to eliminate decisions. Consider:
- Meal prepping
- Workout scheduling
- Clothing systems
- Morning routines

**3. Reduce Information Intake**
Every piece of news, email, or notification consumes mental energy. Batch your information consumption.

**4. Strategic Recovery**
- 8+ hours of sleep (PFC restoration)
- Regular meals (glucose for the PFC)
- Exercise (increases BDNF, grows new neurons)
- Nature exposure (reduces mental fatigue)`,
          duration: 5,
        },
        {
          title: "Practical Discipline Protocols",
          content: `Here's how to apply neuroscience to build unshakeable discipline:

**The Morning Protocol:**
1. No phone for first hour (protects PFC)
2. Cold shower (activates prefrontal control)
3. Most important task before 10am
4. No decisions before coffee (if you use caffeine)

**The Environment Design:**
Your environment is stronger than your willpower.
- Remove junk food from home
- Put gym clothes by your bed
- Use website blockers
- Keep phone in another room

**The If-Then Planning:**
Pre-decide responses to temptations:
- "If I feel like scrolling, then I'll do 10 pushups"
- "If I want a snack, then I'll drink water and wait 10 minutes"
- "If I don't feel like working out, then I'll just put on gym clothes"

**The Accountability Stack:**
- Track habits publicly
- Tell someone your goals
- Use financial stakes if needed
- Join a community (like RECOMP)

**Remember:** Discipline is a skill, not a trait. Your brain literally changes structure as you practice. Every time you choose the hard thing, you're building a stronger PFC.`,
          duration: 5,
        },
      ],
    },
    {
      title: "Decision Making Under Pressure",
      description: "Learn to make better choices when it matters most",
      category: "decision_making",
      difficulty: "advanced",
      duration: 15,
      modules: [
        {
          title: "The Stress Response & Decision Quality",
          content: `When you're stressed, your brain literally changes how it processes information.

**What Stress Does:**
- Floods the brain with cortisol
- Amplifies amygdala (fear center) activity
- Suppresses prefrontal cortex function
- Narrows attention to immediate threats
- Promotes habitual over flexible responses

**The Result:**
Under stress, you're more likely to:
- Make impulsive decisions
- Fall back on bad habits
- Ignore long-term consequences
- See threats everywhere
- Miss creative solutions

**Counter-Strategies:**
1. **Pause:** Just 6 seconds can help the PFC catch up
2. **Breathe:** 4-7-8 breathing activates parasympathetic system
3. **Reframe:** "This is excitement, not anxiety"
4. **Distance:** Ask "What would I tell a friend?"`,
          duration: 5,
        },
        {
          title: "Cognitive Biases That Sabotage You",
          content: `Your brain has built-in shortcuts that often lead to poor decisions.

**Key Biases to Watch:**

**1. Present Bias**
Overvaluing immediate rewards vs. future benefits.
*Fix: Visualize your future self receiving the benefit*

**2. Confirmation Bias**
Seeking information that confirms what you believe.
*Fix: Actively seek opposing viewpoints*

**3. Sunk Cost Fallacy**
Continuing something because you've invested in it.
*Fix: Ask "Would I start this today knowing what I know?"*

**4. Availability Heuristic**
Overweighting recent/memorable events.
*Fix: Look at data, not feelings*

**5. Social Proof**
Doing what others do, regardless of correctness.
*Fix: Question "Is this actually right for ME?"*

**6. Loss Aversion**
Feeling losses more than equivalent gains.
*Fix: Reframe losses as investments*`,
          duration: 5,
        },
        {
          title: "Building Better Decision Systems",
          content: `The best decision-makers don't rely on willpower—they build systems.

**Pre-Commitment Strategies:**
- Remove options in advance
- Make public commitments
- Use financial stakes
- Schedule decisions for high-energy times

**The 10-10-10 Rule:**
Before any decision, ask:
- How will I feel about this in 10 minutes?
- How will I feel in 10 months?
- How will I feel in 10 years?

**The Regret Minimization Framework:**
Project yourself to age 80. Will you regret doing this? Or regret NOT doing it?

**Implementation Intentions:**
Don't just decide what to do—decide WHEN and WHERE.
Bad: "I'll work out more"
Good: "Every Monday, Wednesday, Friday at 6am, I go to the gym"

**Decision Journaling:**
Track your decisions and outcomes. Over time, you'll learn your patterns and improve.

**The RECOMP Application:**
Use the habit tracking as a decision support system. When tempted, check your score. That visual accountability changes the decision calculus.`,
          duration: 5,
        },
      ],
    },
  ];

  for (const course of brainCourses) {
    const { modules, ...courseData } = course;
    const createdCourse = await prisma.brainCourse.create({
      data: courseData,
    });

    for (let i = 0; i < modules.length; i++) {
      await prisma.courseModule.create({
        data: {
          ...modules[i],
          courseId: createdCourse.id,
          orderIndex: i,
        },
      });
    }
  }

  console.log("📚 Created brain science courses");

  // Create mindset lessons
  const mindsetLessons = [
    {
      title: "The 90-Day Mindset",
      description: "Understanding the science behind transformation",
      content: `Welcome to your 90-day body recomposition journey. The next 90 days will challenge you physically and mentally.

**Weeks 1-4 (Foundation):** Neural adaptations occur first.
**Weeks 5-8 (Build):** Muscle protein synthesis increases.
**Weeks 9-12 (Optimize):** Fat loss accelerates.

Trust the process.`,
      unlockDay: 1,
      orderIndex: 0,
      category: "motivation",
      brainRegion: "prefrontal_cortex",
      duration: 5,
    },
    {
      title: "Building Unbreakable Habits",
      description: "The habit loop and how to use it",
      content: `Every habit follows a neurological loop: **Cue → Routine → Reward**.

Make cues obvious, routines attractive, and rewards immediate.`,
      unlockDay: 2,
      orderIndex: 0,
      category: "habit_science",
      brainRegion: "basal_ganglia",
      duration: 5,
    },
    {
      title: "The Protein Priority",
      description: "Why protein is non-negotiable",
      content: `Protein has a thermic effect of 20-30%. It's the most filling macronutrient.

For recomposition: 1.6-2.2g per kg of body weight daily.`,
      unlockDay: 3,
      orderIndex: 0,
      category: "nutrition_mindset",
      duration: 6,
    },
    {
      title: "Progressive Overload",
      description: "The fundamental principle of strength training",
      content: `To grow, you must consistently challenge your muscles beyond their current capacity.

Add weight, reps, or sets. Track everything.`,
      unlockDay: 4,
      orderIndex: 0,
      category: "psychology",
      brainRegion: "motor_cortex",
      duration: 5,
    },
    {
      title: "Sleep: The Secret Weapon",
      description: "Why recovery is where gains are made",
      content: `Growth hormone peaks during deep sleep. Aim for 7-9 hours.

Poor sleep: -15% testosterone, increased cortisol, worse insulin sensitivity.`,
      unlockDay: 5,
      orderIndex: 0,
      category: "habit_science",
      brainRegion: "hypothalamus",
      duration: 5,
    },
    {
      title: "The Dopamine Reset",
      description: "Rewire your reward system",
      content: `Modern life offers constant low-effort dopamine hits. This raises your baseline.

Good sources: Exercise, accomplishment, cold exposure.
Minimize: Social media, processed food, constant entertainment.`,
      unlockDay: 6,
      orderIndex: 0,
      category: "brain_science",
      brainRegion: "nucleus_accumbens",
      duration: 6,
    },
    {
      title: "The Compound Effect",
      description: "How small actions create massive results",
      content: `Improving 1% daily = 37x better in a year.

Each workout votes for "athlete." Each meal votes for "healthy person." Stack the votes.`,
      unlockDay: 7,
      orderIndex: 0,
      category: "motivation",
      duration: 5,
    },
  ];

  await prisma.mindsetLesson.createMany({
    data: mindsetLessons,
  });

  console.log("🧠 Created mindset lessons");

  // Create day 1 dopamine daily
  await prisma.dopamineDaily.create({
    data: {
      userId: demoUser.id,
      journeyId: journey.id,
      dayNumber: 1,
    },
  });

  console.log("✨ Seed completed successfully!");
  console.log("");
  console.log("Demo credentials:");
  console.log("  Email: demo@recomp.app");
  console.log("  Password: demo1234");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
