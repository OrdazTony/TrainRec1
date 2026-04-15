import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  Chip,
  Checkbox,
  Container,
  Divider,
  Grid,
  LinearProgress,
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
const GOAL_COMPLETE_KEY  = "trainrec_completed_goals"; // array of goal IDs

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

// ── Metric card (identical to Dashboard's MetricCard) ─────────────────────────
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
          width: 42, height: 42, borderRadius: 2,
          display: "grid", placeItems: "center",
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
    <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>{value}</Typography>
    <Typography variant="body2" sx={{ color: alpha("#fff", 0.84), mt: 0.5 }}>{subtitle}</Typography>
  </Card>
);

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

// ── Mini bar chart ─────────────────────────────────────────────────────────────
const BarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => Math.max(d.workout, d.calories, d.goals)), 1);
  const colors = { workout: "#36b7d7", calories: "#ff9f43", goals: "#22c55e" };
  return (
    <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ height: 110, px: 1 }}>
      {data.map((d) => (
        <Stack key={d.day} spacing={0.5} alignItems="center" sx={{ flex: 1 }}>
          <Stack direction="row" spacing="2px" alignItems="flex-end" sx={{ height: 80 }}>
            {["workout", "calories", "goals"].map((k) => (
              <Box key={k} sx={{ width: 8, height: `${(d[k] / max) * 80}px`, bgcolor: colors[k], borderRadius: "3px 3px 0 0", minHeight: 2, transition: "height 0.4s ease" }} />
            ))}
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6rem" }}>{d.day}</Typography>
        </Stack>
      ))}
    </Stack>
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetch(`${API_BASE}/me/full_profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setGoals(d.goals || []))
      .catch(() => {});
  }, []);

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

  const weeklyData = useMemo(() => [
    { day: "Mon", workout: 34, calories: 58, goals: 50 },
    { day: "Tue", workout: 45, calories: 33, goals: 33 },
    { day: "Wed", workout: 76, calories: 51, goals: 66 },
    { day: "Thu", workout: 63, calories: 75, goals: 100 },
    { day: "Fri", workout: 34, calories: 57, goals: 50 },
    { day: "Sat", workout: 33, calories: 55, goals: 33 },
    { day: "Sun", workout: workoutProgress, calories: calorieProgress, goals: goalProgress },
  ], [calorieProgress, workoutProgress, goalProgress]);

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

              {/* Rings + progress bars */}
              <Card sx={{ ...sectionCard, p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Activity Rings</Typography>
                <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="center">

                  {/* Big SVG rings */}
                  <Box sx={{ position: "relative", width: 240, height: 240, flexShrink: 0 }}>
                    <svg width={240} height={240}>
                      {[
                        { r: 104, sw: 16, color: "#ff9f43", track: alpha("#ff9f43", 0.15), progress: calorieProgress  },
                        { r:  76, sw: 16, color: "#9b6bff", track: alpha("#9b6bff", 0.15), progress: workoutProgress  },
                        { r:  48, sw: 16, color: "#22c55e", track: alpha("#22c55e", 0.15), progress: intakeProgress    },
                      ].map(({ r, sw, color, track, progress }) => {
                        const circ   = 2 * Math.PI * r;
                        const offset = circ * (1 - Math.min(progress, 100) / 100);
                        return (
                          <g key={r}>
                            <circle cx={120} cy={120} r={r} fill="none" stroke={track} strokeWidth={sw} />
                            <circle cx={120} cy={120} r={r} fill="none" stroke={color} strokeWidth={sw}
                              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                              transform="rotate(-90 120 120)"
                              style={{ transition: "stroke-dashoffset 0.7s ease" }} />
                          </g>
                        );
                      })}
                    </svg>
                    <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1 }}>
                        {Math.round((calorieProgress + workoutProgress + intakeProgress) / 3)}%
                      </Typography>
                      <Typography variant="caption" sx={softText}>overall</Typography>
                    </Box>
                  </Box>

                  {/* Detailed bars */}
                  <Stack spacing={2.5} sx={{ flex: 1, width: "100%" }}>
                    {[
                      { color: "#ff9f43", label: "Calories burned",   value: `${caloriesBurned} / ${BURN_GOAL} kcal`,       pct: calorieProgress  },
                      { color: "#9b6bff", label: "Workouts finished", value: `${completedWorkouts.length} / ${workoutOptions.length} sessions`, pct: workoutProgress  },
                      { color: "#22c55e", label: "Calorie intake",    value: `${caloriesIngested} / ${INTAKE_GOAL} kcal`,   pct: intakeProgress   },
                    ].map(({ color, label, value, pct }) => (
                      <Box key={label}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />
                            <Typography variant="body2" sx={softText}>{label}</Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{value}</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 8, borderRadius: 4,
                            bgcolor: alpha(color, 0.15),
                            "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 },
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
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

              {/* Weekly chart */}
              <Card sx={{ ...sectionCard, p: { xs: 2, md: 2.5 } }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Weekly Summary</Typography>
                <Typography variant="body2" sx={{ ...softText, mb: 2 }}>Sunday bar reflects today&apos;s live data.</Typography>
                <BarChart data={weeklyData} />
                <Divider sx={{ my: 1.5 }} />
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
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

            </Stack>
          </Grid>

        </Grid>
      </Stack>
    </Container>
  );
};

export default Progress;
