import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Container,
  Grid,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import DirectionsRunRoundedIcon from "@mui/icons-material/DirectionsRunRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import SelfImprovementRoundedIcon from "@mui/icons-material/SelfImprovementRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import HotelRoundedIcon from "@mui/icons-material/HotelRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const CHECKLIST_KEY = 'trainrec_checklist';
const INTAKE_LOG_KEY = 'trainrec_intake_log';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadChecklist() {
  try { return JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '[]'); }
  catch { return []; }
}

function loadDailyIntake() {
  try {
    const today = getTodayKey();
    const saved = JSON.parse(localStorage.getItem(INTAKE_LOG_KEY) || 'null');
    if (saved && saved.date === today) {
      return {
        calories: Number(saved.calories) || 0,
        meals: Array.isArray(saved.meals) ? saved.meals : [],
      };
    }
  } catch {
    // ignore malformed local storage
  }

  return { calories: 0, meals: [] };
}

function saveDailyIntake(calories, meals) {
  localStorage.setItem(INTAKE_LOG_KEY, JSON.stringify({
    date: getTodayKey(),
    calories,
    meals,
  }));
}

// legacy static options kept for fallback
const workoutDurations = ["8 min", "20 min", "15 min", "10 min"];
const moodOptions = [
  { label: "Calm", value: "Calm", Icon: SelfImprovementRoundedIcon },
  { label: "Strong", value: "Strong", Icon: FitnessCenterRoundedIcon },
  { label: "Tired", value: "Tired", Icon: HotelRoundedIcon },
  { label: "Focused", value: "Focused", Icon: PsychologyRoundedIcon },
  { label: "Energized", value: "Energized", Icon: BoltRoundedIcon },
];

const MetricCard = ({ title, value, subtitle, caption, Icon, gradient }) => (
  <Card
    sx={{
      p: 2.5,
      height: "100%",
      borderRadius: 4,
      color: "#fff",
      background: gradient,
      boxShadow: `0 20px 35px ${alpha("#000", 0.28)}`,
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: alpha("#fff", 0.16),
        }}
      >
        <Icon sx={{ fontSize: 22 }} />
      </Box>
      <Typography variant="caption" sx={{ color: alpha("#fff", 0.8), fontWeight: 700 }}>
        {caption}
      </Typography>
    </Stack>

    <Typography sx={{ mt: 3, fontWeight: 700 }}>{title}</Typography>
    <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
      {value}
    </Typography>
    <Typography variant="body2" sx={{ color: alpha("#fff", 0.84), mt: 0.5 }}>
      {subtitle}
    </Typography>
  </Card>
);

const Dashboard = () => {
  const theme = useTheme();
  const dailyGoal = 500;
  const [caloriesBurned, setCaloriesBurned] = useState(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const log = JSON.parse(localStorage.getItem('trainrec_daily_log') || 'null');
      return (log && log.date === today) ? log.totalCalories : 0;
    } catch { return 0; }
  });
  const [workoutOptions, setWorkoutOptions] = useState(() => loadChecklist());
  const [completedWorkouts, setCompletedWorkouts] = useState(
    () => loadChecklist().filter((w) => w.done).map((w) => w.name)
  );
  const [selectedMood, setSelectedMood] = useState(null);
  const THOUGHTS_KEY = 'trainrec_daily_thoughts';
  const [thoughts, setThoughts] = useState(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const saved = JSON.parse(localStorage.getItem(THOUGHTS_KEY) || 'null');
      return (saved && saved.date === today) ? saved.text : '';
    } catch { return ''; }
  });

  const saveThoughts = (text) => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(THOUGHTS_KEY, JSON.stringify({ date: today, text }));
    setThoughts(text);
  };
  const calorieIntakeGoal = 1500;
  const [caloriesIngested, setCaloriesIngested] = useState(() => loadDailyIntake().calories);
  const [mealEntries, setMealEntries] = useState(() => loadDailyIntake().meals);
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState('');

  // Re-read localStorage whenever the tab gains focus (user returns from Workouts page)
  useEffect(() => {
    const onFocus = () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const log = JSON.parse(localStorage.getItem('trainrec_daily_log') || 'null');
        if (log && log.date === today) setCaloriesBurned(log.totalCalories);
        const intake = loadDailyIntake();
        setCaloriesIngested(intake.calories);
        setMealEntries(intake.meals);
        const cl = loadChecklist();
        setWorkoutOptions(cl);
        setCompletedWorkouts(cl.filter((w) => w.done).map((w) => w.name));
      } catch { /* ignore */ }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const moodScores = {
    Calm: 66,
    Strong: 86,
    Tired: 38,
    Focused: 78,
    Energized: 92,
  };
  const moodStyles = {
    Calm: { gradient: "linear-gradient(135deg, #14b8a6 0%, #5eead4 100%)", color: "#14b8a6" },
    Strong: { gradient: "linear-gradient(135deg, #ef4444 0%, #fb923c 100%)", color: "#ef4444" },
    Tired: { gradient: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)", color: "#64748b" },
    Focused: { gradient: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)", color: "#4f46e5" },
    Energized: { gradient: "linear-gradient(135deg, #ff7a18 0%, #ff9f43 100%)", color: "#ff9f43" },
  };

  const calorieProgress = dailyGoal > 0 ? Math.min((caloriesBurned / dailyGoal) * 100, 100) : 0;
  const intakeProgress = calorieIntakeGoal > 0 ? Math.min((caloriesIngested / calorieIntakeGoal) * 100, 100) : 0;
  const workoutProgress = workoutOptions.length > 0 ? (completedWorkouts.length / workoutOptions.length) * 100 : 0;
  const energyScore = moodScores[selectedMood] ?? 70;
  const activeMoodStyle = moodStyles[selectedMood] ?? moodStyles.Energized;

  const weeklyData = useMemo(
    () => [
      { day: "Mon", workout: 34, calories: 58, energy: 76 },
      { day: "Tue", workout: 45, calories: 33, energy: 52 },
      { day: "Wed", workout: 76, calories: 51, energy: 58 },
      { day: "Thu", workout: 63, calories: 75, energy: 44 },
      { day: "Fri", workout: 34, calories: 57, energy: 63 },
      { day: "Sat", workout: 33, calories: 55, energy: 62 },
      { day: "Sun", workout: workoutProgress, calories: calorieProgress, energy: energyScore },
    ],
    [calorieProgress, energyScore, workoutProgress]
  );



  const sectionCard = {
    borderRadius: 5,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
    boxShadow:
      theme.palette.mode === "dark"
        ? `0 18px 40px ${alpha("#000", 0.45)}`
        : `0 18px 40px ${alpha(theme.palette.primary.main, 0.22)}`,
    background:
      theme.palette.mode === "dark"
        ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.96)} 0%, ${alpha(theme.palette.primary.dark, 0.4)} 100%)`
        : `linear-gradient(180deg, ${alpha("#ffffff", 0.96)} 0%, ${alpha(theme.palette.secondary.light, 0.12)} 100%)`,
  };
  const calorieGradient = "linear-gradient(135deg, #ff7a18 0%, #ff9f43 100%)";

  const softText = { color: "text.secondary" };

  const addMealEntry = () => {
    const trimmedName = mealName.trim();
    const parsedCalories = Number(mealCalories);

    if (!trimmedName || !Number.isFinite(parsedCalories) || parsedCalories <= 0) return;

    const nextMeal = {
      id: `${Date.now()}`,
      name: trimmedName,
      calories: Math.round(parsedCalories),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };

    const nextMeals = [nextMeal, ...mealEntries];
    const nextCalories = nextMeals.reduce((sum, meal) => sum + meal.calories, 0);

    setMealEntries(nextMeals);
    setCaloriesIngested(nextCalories);
    saveDailyIntake(nextCalories, nextMeals);
    setMealName('');
    setMealCalories('');
  };

  const removeMealEntry = (mealId) => {
    const nextMeals = mealEntries.filter((meal) => meal.id !== mealId);
    const nextCalories = nextMeals.reduce((sum, meal) => sum + meal.calories, 0);
    setMealEntries(nextMeals);
    setCaloriesIngested(nextCalories);
    saveDailyIntake(nextCalories, nextMeals);
  };

  const resetMealTracking = () => {
    setMealEntries([]);
    setCaloriesIngested(0);
    saveDailyIntake(0, []);
  };

  const toggleWorkout = (workoutName) => {
    setCompletedWorkouts((prev) => {
      const next = prev.includes(workoutName)
        ? prev.filter((n) => n !== workoutName)
        : [...prev, workoutName];
      const cl = loadChecklist().map((w) =>
        w.name === workoutName ? { ...w, done: next.includes(workoutName) } : w
      );
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(cl));
      return next;
    });
  };

  const removeFromChecklist = (workout) => {
    const next = workoutOptions.filter((w) => w.name !== workout.name);
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
    setWorkoutOptions(next);
    setCompletedWorkouts((prev) => prev.filter((n) => n !== workout.name));
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* Hero summary box */}
            <Card
              sx={{
                p: { xs: 2.5, md: 3.5 },
                overflow: "hidden",
                position: "relative",
                borderRadius: 4,
                background: "linear-gradient(135deg, #7c4dff 0%, #a855f7 100%)",
                color: "#fff",
                boxShadow: `0 20px 35px ${alpha("#000", 0.28)}`,
              }}
            >
              {/* Decorative background accents */}
              <Box
                sx={{
                  position: "absolute",
                  width: 220,
                  height: 220,
                  borderRadius: "50%",
                  bgcolor: alpha("#fff", 0.1),
                  top: -90,
                  right: -40,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  bgcolor: alpha("#fff", 0.1),
                  bottom: -30,
                  right: 110,
                }}
              />

              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 7 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
                    Track Your Daily Activities
                  </Typography>
                  <Typography sx={{ color: alpha("#fff", 0.88), maxWidth: 560, mb: 3 }}>
                    Keep up with your calories, workouts, and mood in one clean training dashboard.
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <Button
                      variant="contained"
                      onClick={() => setCaloriesBurned((prev) => Math.min(prev + 50, 999))}
                      sx={{
                        bgcolor: "#fff",
                        color: "#ff7a18",
                        fontWeight: 800,
                        borderRadius: 3,
                        px: 2.5,
                      }}
                    >
                      Add 50 kcal
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setCaloriesBurned(0)}
                      sx={{
                        borderColor: alpha("#fff", 0.7),
                        color: "#fff",
                        fontWeight: 700,
                        borderRadius: 3,
                      }}
                    >
                      Reset tracker
                    </Button>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                  {/* Daily thoughts box */}
                  <Box
                    sx={{
                      ml: { md: "auto" },
                      maxWidth: 280,
                      p: 2.5,
                      borderRadius: 4,
                      bgcolor: alpha("#14b8a6", 0.3),
                      backdropFilter: "blur(10px)",
                      boxShadow: `0 8px 32px ${alpha("#0f766e", 0.45)}`,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: alpha("#fff", 0.78), fontWeight: 700, display: 'block', mb: 1 }}>
                      Today&apos;s thoughts
                    </Typography>
                    <TextField
                      multiline
                      minRows={4}
                      maxRows={6}
                      fullWidth
                      placeholder="What's on your mind today..."
                      value={thoughts}
                      onChange={(e) => saveThoughts(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: alpha("#fff", 0.08),
                          color: "#fff",
                          '& fieldset': { borderColor: alpha("#fff", 0.25) },
                          '&:hover fieldset': { borderColor: alpha("#fff", 0.5) },
                          '&.Mui-focused fieldset': { borderColor: alpha("#fff", 0.7) },
                        },
                        '& .MuiInputBase-input::placeholder': { color: alpha("#fff", 0.5) },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Card>

            {/* Top metric boxes */}
            <Grid container spacing={3} sx={{ order: { xs: 3, sm: 0 } }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <MetricCard
                  title="Calories Eaten"
                  value={`${caloriesIngested} kcal`}
                  subtitle={`Goal: ${calorieIntakeGoal} kcal`}
                  caption="Intake"
                  Icon={RestaurantRoundedIcon}
                  gradient="linear-gradient(135deg, #22c55e 0%, #4ade80 100%)"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <MetricCard
                  title="Calories Burned"
                  value={`${caloriesBurned} kcal`}
                  subtitle={`${Math.max(dailyGoal - caloriesBurned, 0)} kcal left today`}
                  caption="Calories burned"
                  Icon={LocalFireDepartmentRoundedIcon}
                  gradient={calorieGradient}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <MetricCard
                  title="Workout"
                  value={`${completedWorkouts.length} / ${workoutOptions.length}`}
                  subtitle="sessions completed"
                  caption="Daily plan"
                  Icon={DirectionsRunRoundedIcon}
                  gradient="linear-gradient(135deg, #36b7d7 0%, #4cc7e8 100%)"
                />
              </Grid>
            </Grid>

            {/* Goal progress — concentric rings */}
            <Card sx={{ ...sectionCard, p: { xs: 2, md: 3 }, order: { xs: 2, sm: 0 } }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems="center" justifyContent="space-between">
                {/* Rings */}
                <Stack spacing={2} sx={{ alignItems: 'center', flexShrink: 0 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Daily Activity Rings</Typography>
                    <Typography variant="body2" sx={softText}>Burned, workouts, and intake at a glance.</Typography>
                  </Box>
                  <Box sx={{ position: 'relative', width: 220, height: 220 }}>
                    <svg width={220} height={220}>
                      {[
                        { r: 94, sw: 14, color: '#ff9f43', track: alpha('#ff9f43', 0.15), progress: calorieProgress },
                        { r: 68, sw: 14, color: '#9b6bff', track: alpha('#9b6bff', 0.15), progress: workoutProgress },
                        { r: 42, sw: 14, color: '#22c55e', track: alpha('#22c55e', 0.15), progress: intakeProgress },
                      ].map(({ r, sw, color, track, progress }) => {
                        const circ = 2 * Math.PI * r;
                        const offset = circ * (1 - Math.min(progress, 100) / 100);
                        return (
                          <g key={r}>
                            <circle cx={110} cy={110} r={r} fill="none" stroke={track} strokeWidth={sw} />
                            <circle
                              cx={110} cy={110} r={r}
                              fill="none"
                              stroke={color}
                              strokeWidth={sw}
                              strokeDasharray={circ}
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                              transform="rotate(-90 110 110)"
                              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                            />
                          </g>
                        );
                      })}
                    </svg>
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1 }}>
                        {Math.round((calorieProgress + workoutProgress + intakeProgress) / 3)}%
                      </Typography>
                      <Typography variant="caption" sx={softText}>overall</Typography>
                    </Box>
                  </Box>
                </Stack>

                {/* Legend + actions */}
                <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                  <Stack spacing={1.2}>
                    {[
                      { color: '#ff9f43', label: 'Calories burned', value: `${caloriesBurned} / ${dailyGoal} kcal` },
                      { color: '#9b6bff', label: 'Workouts', value: `${completedWorkouts.length} / ${workoutOptions.length} done` },
                      { color: '#22c55e', label: 'Calories ingested', value: `${caloriesIngested} / ${calorieIntakeGoal} kcal` },
                    ].map(({ color, label, value }) => (
                      <Stack key={label} direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ flex: 1, ...softText }}>{label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{value}</Typography>
                      </Stack>
                    ))}
                  </Stack>

                </Stack>
              </Stack>
            </Card>

            <Card sx={{ ...sectionCard, p: { xs: 2, md: 3 } }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 2.5 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Calorie Meal Tracking</Typography>
                  <Typography variant="body2" sx={softText}>Add meals with estimated calories to sync with Calories Eaten.</Typography>
                </Box>
                <Chip
                  label={`${caloriesIngested} kcal today`}
                  sx={{ bgcolor: alpha('#22c55e', 0.14), color: '#15803d', fontWeight: 700 }}
                />
              </Stack>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <TextField
                    fullWidth
                    label="Meal"
                    placeholder="Chicken sandwich, protein shake, salad..."
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField
                    fullWidth
                    label="Estimated calories"
                    type="number"
                    value={mealCalories}
                    onChange={(e) => setMealCalories(e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
                <Button variant="contained" onClick={addMealEntry} sx={{ borderRadius: 3, fontWeight: 700 }}>
                  Add meal
                </Button>
                <Button variant="outlined" color="error" onClick={resetMealTracking} sx={{ borderRadius: 3, fontWeight: 700 }}>
                  Reset meals
                </Button>
              </Stack>

              {mealEntries.length === 0 ? (
                <Typography variant="body2" sx={{ ...softText, textAlign: 'center', py: 2 }}>
                  No meals logged yet. Add your first meal to update Calories Eaten.
                </Typography>
              ) : (
                <Stack spacing={1.2}>
                  {mealEntries.map((meal) => (
                    <Box
                      key={meal.id}
                      sx={{
                        p: 1.4,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                        bgcolor: alpha('#22c55e', 0.07),
                        border: `1px solid ${alpha('#22c55e', 0.14)}`,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700 }}>{meal.name}</Typography>
                        <Typography variant="caption" sx={softText}>{meal.time}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                        <Chip label={`${meal.calories} kcal`} size="small" sx={{ fontWeight: 700 }} />
                        <Button size="small" color="error" onClick={() => removeMealEntry(meal.id)} sx={{ minWidth: 0, px: 1.2 }}>
                          Remove
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Card>


          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3} sx={{ position: { lg: 'sticky' }, top: { lg: 80 } }}>
            {/* Sidebar mood selector box */}
            <Card
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 5,
                color: "#fff",
                background: activeMoodStyle.gradient,
                boxShadow: `0 18px 35px ${alpha(activeMoodStyle.color, 0.28)}`,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                Mood Check
              </Typography>
              <Typography variant="body2" sx={{ color: alpha("#fff", 0.86), mb: 2 }}>
                Choose the energy that matches your day.
              </Typography>

              <ToggleButtonGroup
                value={selectedMood}
                exclusive
                onChange={(_, mood) => mood && setSelectedMood(mood)}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  "& .MuiToggleButton-root": {
                    borderRadius: 2.5,
                    borderColor: alpha("#fff", 0.35),
                    bgcolor: alpha("#fff", 0.1),
                    color: "#fff",
                    textTransform: "none",
                  },
                  "& .Mui-selected": {
                    bgcolor: "#fff !important",
                    color: `${activeMoodStyle.color} !important`,
                  },
                }}
              >
                {moodOptions.map(({ label, value, Icon }) => (
                  <ToggleButton key={`sidebar-mood-${value}`} value={value} sx={{ px: 1.2, py: 0.8 }}>
                    <Stack spacing={0.5} alignItems="center">
                      <Icon fontSize="small" />
                      <Typography variant="caption">{label}</Typography>
                    </Stack>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Box
                sx={{
                  mt: 2.5,
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha("#fff", 0.12),
                  backdropFilter: "blur(10px)",
                }}
              >
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>Current mood</Typography>
                  <Typography sx={{ fontWeight: 800 }}>{selectedMood}</Typography>
                </Stack>
              </Box>
            </Card>

            {/* Sidebar workout checklist box */}
            <Card sx={{ ...sectionCard, p: { xs: 2, md: 2.5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Workout Checklist
                  </Typography>
                  <Typography variant="body2" sx={softText}>
                    Mark each activity as you complete it.
                  </Typography>
                </Box>
                <Chip
                  label={`${completedWorkouts.length} / ${workoutOptions.length} done`}
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: "primary.main", fontWeight: 700 }}
                />
              </Stack>

              {workoutOptions.length === 0 ? (
                <Typography variant="body2" sx={{ ...softText, textAlign: 'center', py: 3 }}>
                  No workouts added yet. Go to Workouts and add some!
                </Typography>
              ) : (
              <Stack spacing={1.2} sx={{ maxHeight: 375, overflowY: 'auto', pr: 0.5 }}>
                {workoutOptions.map((workout) => {
                  const isComplete = completedWorkouts.includes(workout.name);
                  return (
                    <Box
                      key={`sidebar-${workout.id}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        p: 1.2,
                        borderRadius: 3,
                        bgcolor: isComplete
                          ? alpha(theme.palette.secondary.main, 0.12)
                          : alpha(theme.palette.primary.main, 0.06),
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Checkbox
                          checked={isComplete}
                          onChange={() => toggleWorkout(workout.name)}
                          sx={{
                            color: "secondary.main",
                            "&.Mui-checked": { color: "secondary.main" },
                          }}
                        />
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{workout.name}</Typography>
                          <Typography variant="caption" sx={softText}>
                            {workout.category}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Chip
                          label={isComplete ? "Done" : "Pending"}
                          color={isComplete ? "success" : "default"}
                          variant={isComplete ? "filled" : "outlined"}
                          size="small"
                        />
                        <Chip
                          icon={<CloseRoundedIcon sx={{ fontSize: 16 }} />}
                          label="Remove"
                          size="small"
                          variant="outlined"
                          onClick={() => removeFromChecklist(workout)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
              )}
            </Card>

          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
