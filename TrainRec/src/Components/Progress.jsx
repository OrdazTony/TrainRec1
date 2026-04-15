import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  Chip,
  Checkbox,
  Container,
  Grid,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import DirectionsRunRoundedIcon from "@mui/icons-material/DirectionsRunRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import { useNavigate } from "react-router-dom";
import API_BASE from "../config";

// ── localStorage keys (same as Dashboard) ────────────────────────────────────
const CHECKLIST_KEY      = "trainrec_checklist";
const DAILY_LOG_KEY      = "trainrec_daily_log";
const INTAKE_LOG_KEY     = "trainrec_intake_log";
const WEEKLY_HISTORY_KEY = "trainrec_weekly_progress_history";
const CONFIDENCE_KEY     = "trainrec_confidence_level";

// ── Goals: daily-reset storage ────────────────────────────────────────────────
const DAILY_GOAL_KEY = "trainrec_daily_goal_progress"; // {date, ids:[]}

function loadCompletedGoals() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const saved = JSON.parse(localStorage.getItem(DAILY_GOAL_KEY) || "null");
    if (saved && saved.date === today) return saved.ids;
    return [];
  } catch { return []; }
}

function saveCompletedGoals(ids) {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(DAILY_GOAL_KEY, JSON.stringify({ date: today, ids }));
}

function loadChecklist() {
  try { return JSON.parse(localStorage.getItem(CHECKLIST_KEY) || "[]"); }
  catch { return []; }
}

function loadConfidenceLevel() {
  try {
    return clampProgress(JSON.parse(localStorage.getItem(CONFIDENCE_KEY) || "72"));
  } catch {
    return 72;
  }
}

function clampProgress(value) {
  return Math.max(0, Math.min(Math.round(value || 0), 100));
}

function loadWeeklyHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(WEEKLY_HISTORY_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveWeeklyHistory(history) {
  localStorage.setItem(WEEKLY_HISTORY_KEY, JSON.stringify(history));
}

function upsertWeeklyHistory(history, nextEntry) {
  const current = history.find((entry) => entry.date === nextEntry.date);
  if (current && JSON.stringify(current) === JSON.stringify(nextEntry)) return history;

  const next = [...history.filter((entry) => entry.date !== nextEntry.date), nextEntry]
    .sort((a, b) => a.date.localeCompare(b.date));

  return next.slice(-21);
}

function getWeekDates(referenceDate = new Date()) {
  const current = new Date(referenceDate);
  current.setHours(0, 0, 0, 0);
  const mondayOffset = (current.getDay() + 6) % 7;
  current.setDate(current.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(current);
    date.setDate(current.getDate() + index);
    return {
      dateKey: date.toISOString().slice(0, 10),
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });
}

// ── Stat pill (top banner) ─────────────────────────────────────────────────────
const StatPill = ({ Icon, label, value, color }) => (
  <Stack direction="row" alignItems="center" spacing={1.5}>
    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(color, 0.15), display: "grid", placeItems: "center" }}>
      <Icon sx={{ fontSize: 20, color }} />
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.2 }}>{value}</Typography>
    </Box>
  </Stack>
);

const RingGroup = ({ values, size = 104, stroke = 8, centerLabel, centerCaption }) => {
  const rings = [
    { key: "calories", color: "#ff9f43", track: alpha("#ff9f43", 0.14), progress: values.calories, radius: size / 2 - stroke / 2 },
    { key: "workout", color: "#36b7d7", track: alpha("#36b7d7", 0.14), progress: values.workout, radius: size / 2 - stroke * 1.8 },
    { key: "goals", color: "#22c55e", track: alpha("#22c55e", 0.14), progress: values.goals, radius: size / 2 - stroke * 3.1 },
  ];

  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        {rings.map(({ key, color, track, progress, radius }) => {
          const circumference = 2 * Math.PI * radius;
          const offset = circumference * (1 - clampProgress(progress) / 100);
          return (
            <g key={key}>
              <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </g>
          );
        })}
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontWeight: 900, fontSize: size > 100 ? "1.6rem" : "0.95rem", lineHeight: 1 }}>
          {centerLabel}
        </Typography>
        {centerCaption ? <Typography variant="caption" sx={{ color: "text.secondary" }}>{centerCaption}</Typography> : null}
      </Box>
    </Box>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const Progress = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";

  const [caloriesBurned, setCaloriesBurned] = useState(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const log   = JSON.parse(localStorage.getItem(DAILY_LOG_KEY) || "null");
      return (log && log.date === today) ? log.totalCalories : 0;
    } catch { return 0; }
  });

  const [caloriesIngested, setCaloriesIngested] = useState(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const log   = JSON.parse(localStorage.getItem(INTAKE_LOG_KEY) || "null");
      return (log && log.date === today) ? log.calories : 0;
    } catch { return 0; }
  });

  const [workoutOptions, setWorkoutOptions]       = useState(() => loadChecklist());
  const [completedWorkouts, setCompletedWorkouts] = useState(
    () => loadChecklist().filter((w) => w.done).map((w) => w.name)
  );

  const [goals, setGoals]                         = useState([]);
  const [completedGoalIds, setCompletedGoalIds]   = useState(() => loadCompletedGoals());
  const [weeklyHistory, setWeeklyHistory]         = useState(() => loadWeeklyHistory());
  const [confidenceLevel, setConfidenceLevel]     = useState(() => loadConfidenceLevel());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetch(`${API_BASE}/me/full_profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setGoals(d.goals || []);
        if (typeof d.confidence_level === "number") {
          setConfidenceLevel(clampProgress(d.confidence_level));
        }
      })
      .catch(() => {});
  }, [navigate]);

  useEffect(() => {
    const onFocus = () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const dl    = JSON.parse(localStorage.getItem(DAILY_LOG_KEY) || "null");
        const il    = JSON.parse(localStorage.getItem(INTAKE_LOG_KEY) || "null");
        if (dl && dl.date === today) setCaloriesBurned(dl.totalCalories);
        if (il && il.date === today) setCaloriesIngested(il.calories);
        const cl = loadChecklist();
        setWorkoutOptions(cl);
        setCompletedWorkouts(cl.filter((w) => w.done).map((w) => w.name));
        setCompletedGoalIds(loadCompletedGoals());
      } catch { /* ignore */ }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const toggleGoal = (id) => {
    setCompletedGoalIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveCompletedGoals(next);
      return next;
    });
  };

  const BURN_GOAL   = 500;
  const INTAKE_GOAL = 1500;

  const calorieProgress = BURN_GOAL   > 0 ? Math.min((caloriesBurned   / BURN_GOAL)   * 100, 100) : 0;
  const intakeProgress  = INTAKE_GOAL > 0 ? Math.min((caloriesIngested / INTAKE_GOAL) * 100, 100) : 0;
  const workoutProgress = workoutOptions.length > 0 ? (completedWorkouts.length / workoutOptions.length) * 100 : 0;
  const goalProgress    = goals.length > 0 ? (completedGoalIds.length / goals.length) * 100 : 0;
  const overall         = Math.round((calorieProgress + workoutProgress + intakeProgress + goalProgress) / 4);

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const todaySnapshot = useMemo(() => ({
    date: todayKey,
    calories: clampProgress(calorieProgress),
    workout: clampProgress(workoutProgress),
    goals: clampProgress(goalProgress),
    score: clampProgress((calorieProgress + workoutProgress + goalProgress) / 3),
    caloriesBurned: +caloriesBurned.toFixed(1),
    caloriesIngested: +caloriesIngested.toFixed(1),
    completedWorkouts: completedWorkouts.length,
    workoutTarget: workoutOptions.length,
    completedGoals: completedGoalIds.length,
    goalTarget: goals.length,
  }), [todayKey, calorieProgress, workoutProgress, goalProgress, caloriesBurned, caloriesIngested, completedWorkouts.length, workoutOptions.length, completedGoalIds.length, goals.length]);

  useEffect(() => {
    setWeeklyHistory((prev) => {
      const next = upsertWeeklyHistory(prev, todaySnapshot);
      if (next !== prev) saveWeeklyHistory(next);
      return next;
    });
  }, [todaySnapshot]);

  useEffect(() => {
    localStorage.setItem(CONFIDENCE_KEY, JSON.stringify(clampProgress(confidenceLevel)));
  }, [confidenceLevel]);

  const saveConfidenceLevel = async (nextLevel) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_BASE}/me/confidence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confidence_level: clampProgress(nextLevel) }),
      });
    } catch {
      // Local storage still preserves the latest slider state if the request fails.
    }
  };

  const weeklyData = useMemo(() => {
    const historyMap = new Map(weeklyHistory.map((entry) => [entry.date, entry]));
    return getWeekDates().map(({ dateKey, day, label }) => {
      const entry = historyMap.get(dateKey);
      return {
        date: dateKey,
        day,
        label,
        calories: entry?.calories ?? 0,
        workout: entry?.workout ?? 0,
        goals: entry?.goals ?? 0,
        score: entry?.score ?? 0,
        hasData: Boolean(entry),
      };
    });
  }, [weeklyHistory]);

  const recordedDays = useMemo(
    () => weeklyData.filter((entry) => entry.hasData),
    [weeklyData]
  );

  const weeklyAverage = useMemo(() => {
    if (recordedDays.length === 0) return 0;
    return Math.round(recordedDays.reduce((sum, entry) => sum + entry.score, 0) / recordedDays.length);
  }, [recordedDays]);

  const bestDay = useMemo(() => {
    if (recordedDays.length === 0) return null;
    return recordedDays.reduce((best, entry) => (entry.score > best.score ? entry : best), recordedDays[0]);
  }, [recordedDays]);

  const confidenceTone = useMemo(() => {
    if (confidenceLevel >= 80) return { label: "Locked in", color: "#22c55e" };
    if (confidenceLevel >= 55) return { label: "Building momentum", color: "#36b7d7" };
    return { label: "Take it steady", color: "#ff9f43" };
  }, [confidenceLevel]);

  const sectionCard = {
    borderRadius: 5,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
    boxShadow: isDark
      ? `0 18px 40px ${alpha("#000", 0.45)}`
      : `0 18px 40px ${alpha(theme.palette.primary.main, 0.22)}`,
    background: isDark
      ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.96)} 0%, ${alpha(theme.palette.primary.dark, 0.4)} 100%)`
      : `linear-gradient(180deg, ${alpha("#ffffff", 0.96)} 0%, ${alpha(theme.palette.secondary.light, 0.12)} 100%)`,
  };
  const softText = { color: "text.secondary" };

  // category icon mapping
  const catIcon = (cat) => {
    const c = (cat || "").toLowerCase();
    if (c.includes("run") || c.includes("cardio")) return "🏃";
    if (c.includes("strength") || c.includes("weight")) return "🏋️";
    if (c.includes("yoga") || c.includes("stretch")) return "🧘";
    if (c.includes("cycle") || c.includes("bike")) return "🚴";
    if (c.includes("swim")) return "🏊";
    return "⚡";
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
      <Stack spacing={3}>

        {/* ── TOP BANNER ──────────────────────────────────────────────────────── */}
        <Card sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 4,
          background: isDark
            ? alpha(theme.palette.background.paper, 0.9)
            : alpha("#ffffff", 0.95),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: `0 8px 24px ${alpha("#000", 0.12)}`,
        }}>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={2}>
            {/* Page title */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1 }}>
                Today&apos;s{" "}
                <Box component="span" sx={{ background: "linear-gradient(135deg, #7c4dff, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Progress
                </Box>
              </Typography>
              <Typography variant="body2" sx={softText}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</Typography>
            </Box>

            {/* Quick stats row */}
            <Stack direction="row" spacing={{ xs: 2, md: 4 }} flexWrap="wrap" useFlexGap>
              <StatPill Icon={LocalFireDepartmentRoundedIcon} label="Burned"   value={`${caloriesBurned} kcal`}   color="#ff9f43" />
              <StatPill Icon={RestaurantRoundedIcon}          label="Eaten"    value={`${caloriesIngested} kcal`} color="#22c55e" />
              <StatPill Icon={DirectionsRunRoundedIcon}       label="Workouts" value={`${completedWorkouts.length} / ${workoutOptions.length}`} color="#36b7d7" />
              <StatPill Icon={EmojiEventsRoundedIcon}         label="Goals"    value={`${completedGoalIds.length} / ${goals.length}`} color="#9b6bff" />
            </Stack>

            {/* Overall score pill */}
            <Box sx={{ textAlign: "center", flexShrink: 0 }}>
              <Box sx={{
                width: 72, height: 72, borderRadius: "50%", mx: "auto",
                background: "linear-gradient(135deg, #7c4dff 0%, #a855f7 100%)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                boxShadow: `0 8px 20px ${alpha("#7c4dff", 0.4)}`,
              }}>
                <Typography sx={{ fontWeight: 900, fontSize: "1.35rem", color: "#fff", lineHeight: 1 }}>{overall}%</Typography>
              </Box>
              <Typography variant="caption" sx={softText}>daily score</Typography>
            </Box>
          </Stack>
        </Card>

        {/* ── MAIN GRID ───────────────────────────────────────────────────────── */}
        <Grid container spacing={3}>

          {/* LEFT — rings + workouts ─────────────────────────────────────────── */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>

              {/* Weekly activity rings */}
              <Card sx={{ ...sectionCard, p: { xs: 2, md: 3 } }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Weekly Activity Rings</Typography>
                    <Typography variant="body2" sx={softText}>
                      {recordedDays.length} recorded days this week. Average score {weeklyAverage}%{bestDay ? `, best day ${bestDay.day}` : ""}.
                    </Typography>
                  </Box>
                  <Chip
                    label={`Today ${todaySnapshot.score}%`}
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: "primary.main", fontWeight: 700 }}
                  />
                </Stack>
                <Grid container spacing={1.5}>
                  {weeklyData.map((entry) => (
                    <Grid key={entry.date} size={{ xs: 6, sm: 4, md: 3, lg: 3 }}>
                      <Box sx={{
                        p: 1.5,
                        borderRadius: 3,
                        height: "100%",
                        border: `1px solid ${alpha(theme.palette.primary.main, entry.hasData ? 0.18 : 0.08)}`,
                        bgcolor: alpha(theme.palette.background.paper, entry.hasData ? 0.68 : 0.45),
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography sx={{ fontWeight: 800 }}>{entry.day}</Typography>
                          <Typography variant="caption" sx={softText}>{entry.label}</Typography>
                        </Box>
                        <RingGroup
                          size={94}
                          stroke={7}
                          values={entry}
                          centerLabel={`${entry.score}%`}
                          centerCaption={entry.hasData ? "score" : "none"}
                        />
                        <Stack spacing={0.35} sx={{ width: "100%" }}>
                          {[
                            { label: "Burn", value: entry.calories, color: "#ff9f43" },
                            { label: "Work", value: entry.workout, color: "#36b7d7" },
                            { label: "Goals", value: entry.goals, color: "#22c55e" },
                          ].map(({ label, value, color }) => (
                            <Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
                              <Stack direction="row" spacing={0.6} alignItems="center">
                                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: color }} />
                                <Typography variant="caption" sx={softText}>{label}</Typography>
                              </Stack>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>{value}%</Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                  {[
                    { color: "#36b7d7", label: "Workouts" },
                    { color: "#ff9f43", label: "Calories" },
                    { color: "#22c55e", label: "Goals" },
                  ].map(({ color, label }) => (
                    <Stack key={label} direction="row" spacing={0.5} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }} />
                      <Typography variant="caption" sx={softText}>{label}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Card>

              {/* Workout completion grid */}
              <Card sx={{ ...sectionCard, p: { xs: 2, md: 3 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Today&apos;s Workouts</Typography>
                    <Typography variant="body2" sx={softText}>
                      {completedWorkouts.length} of {workoutOptions.length} completed
                    </Typography>
                  </Box>
                  <Chip
                    icon={<FitnessCenterRoundedIcon sx={{ fontSize: 16 }} />}
                    label={`${Math.round(workoutProgress)}%`}
                    sx={{
                      background: "linear-gradient(135deg, #9b6bff 0%, #c084fc 100%)",
                      color: "#fff", fontWeight: 800,
                      "& .MuiChip-icon": { color: "#fff" },
                    }}
                  />
                </Stack>

                {workoutOptions.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography sx={softText}>No workouts added yet. Head to the Workouts tab!</Typography>
                  </Box>
                ) : (
                  <Grid container spacing={1.5}>
                    {workoutOptions.map((workout) => {
                      const done = completedWorkouts.includes(workout.name);
                      return (
                        <Grid key={workout.name} size={{ xs: 12, sm: 6, md: 4 }}>
                          <Box sx={{
                            p: 2, borderRadius: 3, display: "flex", alignItems: "center", gap: 1.5,
                            border: `1.5px solid ${done ? alpha("#9b6bff", 0.4) : alpha(theme.palette.divider, 0.6)}`,
                            background: done
                              ? `linear-gradient(135deg, ${alpha("#9b6bff", 0.12)} 0%, ${alpha("#c084fc", 0.08)} 100%)`
                              : alpha(theme.palette.background.paper, 0.6),
                            transition: "all 0.25s ease",
                          }}>
                            {/* Emoji category icon */}
                            <Box sx={{
                              width: 38, height: 38, borderRadius: 2, flexShrink: 0,
                              display: "grid", placeItems: "center", fontSize: "1.2rem",
                              bgcolor: done ? alpha("#9b6bff", 0.15) : alpha(theme.palette.action.hover, 0.5),
                            }}>
                              {catIcon(workout.category)}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{
                                fontWeight: 700,
                                textDecoration: done ? "line-through" : "none",
                                color: done ? "text.secondary" : "text.primary",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                              }}>
                                {workout.name}
                              </Typography>
                              {workout.category && (
                                <Typography variant="caption" sx={{ ...softText, fontSize: "0.68rem" }}>
                                  {workout.category}
                                </Typography>
                              )}
                            </Box>
                            {done
                              ? <CheckCircleRoundedIcon sx={{ color: "#9b6bff", fontSize: 22, flexShrink: 0 }} />
                              : <RadioButtonUncheckedRoundedIcon sx={{ color: "text.disabled", fontSize: 22, flexShrink: 0 }} />
                            }
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Card>

            </Stack>
          </Grid>

          {/* RIGHT — goals + weekly chart ────────────────────────────────────── */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3} sx={{ position: { lg: "sticky" }, top: { lg: 80 } }}>

              {/* Goals checklist */}
              <Card sx={{ ...sectionCard, p: { xs: 2, md: 2.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Goals</Typography>
                    <Typography variant="body2" sx={softText}>Check off today&apos;s milestones.</Typography>
                  </Box>
                  <Chip
                    label={`${completedGoalIds.length} / ${goals.length}`}
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: "primary.main", fontWeight: 700 }}
                  />
                </Stack>

                {goals.length === 0 ? (
                  <Typography variant="body2" sx={{ ...softText, textAlign: "center", py: 3 }}>
                    No goals set yet. Add them from your Profile page!
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {goals.map((goal) => {
                      const done = completedGoalIds.includes(goal.id);
                      return (
                        <Box key={goal.id} sx={{
                          display: "flex", alignItems: "center", gap: 1,
                          p: 1.2, borderRadius: 3,
                          bgcolor: done ? alpha("#22c55e", 0.1) : alpha(theme.palette.primary.main, 0.06),
                        }}>
                          <Checkbox
                            checked={done}
                            onChange={() => toggleGoal(goal.id)}
                            sx={{ color: "#22c55e", "&.Mui-checked": { color: "#22c55e" }, p: 0.5 }}
                          />
                          <Typography variant="body2" sx={{
                            flex: 1, fontWeight: 600,
                            textDecoration: done ? "line-through" : "none",
                            color: done ? "text.secondary" : "text.primary",
                          }}>
                            {goal.text}
                          </Typography>
                          <Chip label={done ? "✓" : "–"} color={done ? "success" : "default"} size="small" variant={done ? "filled" : "outlined"} />
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Card>

              <Card sx={{ ...sectionCard, p: { xs: 2, md: 2.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Confidence Level</Typography>
                    <Typography variant="body2" sx={softText}>Adjust how ready you feel today.</Typography>
                  </Box>
                  <Chip
                    label={`${confidenceLevel}%`}
                    sx={{ bgcolor: alpha(confidenceTone.color, 0.14), color: confidenceTone.color, fontWeight: 700 }}
                  />
                </Stack>

                <Box sx={{ px: 0.5 }}>
                  <Slider
                    value={confidenceLevel}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(_, value) => setConfidenceLevel(Array.isArray(value) ? value[0] : value)}
                    onChangeCommitted={(_, value) => saveConfidenceLevel(Array.isArray(value) ? value[0] : value)}
                    aria-label="Confidence level"
                    sx={{
                      color: confidenceTone.color,
                      height: 7,
                      "& .MuiSlider-thumb": {
                        width: 18,
                        height: 18,
                        boxShadow: `0 0 0 6px ${alpha(confidenceTone.color, 0.14)}`,
                      },
                      "& .MuiSlider-track": {
                        border: "none",
                      },
                      "& .MuiSlider-rail": {
                        opacity: 1,
                        bgcolor: alpha(confidenceTone.color, 0.16),
                      },
                    }}
                  />
                </Box>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
                  <Typography variant="caption" sx={softText}>Low</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: confidenceTone.color }}>{confidenceTone.label}</Typography>
                  <Typography variant="caption" sx={softText}>High</Typography>
                </Stack>
              </Card>

            </Stack>
          </Grid>

        </Grid>
      </Stack>
    </Container>
  );
};

export default Progress;
