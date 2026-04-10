import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Container,
  Grid,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
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

const workoutOptions = ["Warm-up", "Upper Body", "Core Session", "Cooldown Stretch"];
const workoutDurations = ["8 min", "20 min", "15 min", "10 min"];
const moodOptions = [
  { label: "Calm", value: "Calm", Icon: SelfImprovementRoundedIcon },
  { label: "Strong", value: "Strong", Icon: FitnessCenterRoundedIcon },
  { label: "Tired", value: "Tired", Icon: HotelRoundedIcon },
  { label: "Focused", value: "Focused", Icon: PsychologyRoundedIcon },
  { label: "Energized", value: "Energized", Icon: BoltRoundedIcon },
];

const activityRows = [
  { food: "Burrito Bowl", meal: "Recovery meal", calories: "310 kcal", time: "01:00 PM", carbs: "20 g" },
  { food: "Greek Yogurt", meal: "Protein snack", calories: "180 kcal", time: "04:30 PM", carbs: "12 g" },
  { food: "Salmon Rice", meal: "Dinner prep", calories: "420 kcal", time: "07:00 PM", carbs: "28 g" },
];

const MetricCard = ({ title, value, subtitle, caption, Icon, gradient }) => (
  <Card
    sx={{
      p: 2.5,
      height: "100%",
      borderRadius: 4,
      color: "#fff",
      background: gradient,
      boxShadow: `0 20px 35px ${alpha("#000", 0.12)}`,
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
  const [caloriesBurned, setCaloriesBurned] = useState(280);
  const [completedWorkouts, setCompletedWorkouts] = useState(["Warm-up"]);
  const [selectedMood, setSelectedMood] = useState("Energized");
  const [timeframe, setTimeframe] = useState("Weekly");

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
    Energized: { gradient: "linear-gradient(135deg, #7c4dff 0%, #a855f7 100%)", color: "#8b5cf6" },
  };

  const calorieProgress = Math.min((caloriesBurned / dailyGoal) * 100, 100);
  const workoutProgress = (completedWorkouts.length / workoutOptions.length) * 100;
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
        ? `0 18px 40px ${alpha("#000", 0.28)}`
        : `0 18px 40px ${alpha(theme.palette.primary.main, 0.08)}`,
    background:
      theme.palette.mode === "dark"
        ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.96)} 0%, ${alpha(theme.palette.primary.dark, 0.4)} 100%)`
        : `linear-gradient(180deg, ${alpha("#ffffff", 0.96)} 0%, ${alpha(theme.palette.secondary.light, 0.12)} 100%)`,
  };
  const calorieGradient = "linear-gradient(135deg, #ff7a18 0%, #ff9f43 100%)";

  const softText = { color: "text.secondary" };

  const toggleWorkout = (workout) => {
    setCompletedWorkouts((prev) =>
      prev.includes(workout) ? prev.filter((item) => item !== workout) : [...prev, workout]
    );
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
                background: calorieGradient,
                color: "#fff",
                boxShadow: `0 20px 35px ${alpha("#000", 0.12)}`,
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
                  {/* Quick daily summary box */}
                  <Box
                    sx={{
                      ml: { md: "auto" },
                      maxWidth: 280,
                      p: 2.5,
                      borderRadius: 4,
                      bgcolor: alpha("#fff", 0.14),
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: alpha("#fff", 0.18), width: 52, height: 52 }}>
                        <SelfImprovementRoundedIcon sx={{ color: "#fff" }} />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" sx={{ color: alpha("#fff", 0.78) }}>
                          Today&apos;s energy
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {selectedMood}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={1.1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Calories</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {caloriesBurned}/{dailyGoal}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Workouts done</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {completedWorkouts.length}/{workoutOptions.length}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Card>

            {/* Top metric boxes */}
            <Grid container spacing={3}>
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
              <Grid size={{ xs: 12, md: 4 }}>
                <MetricCard
                  title="Calories"
                  value={`${caloriesBurned} kcal`}
                  subtitle={`${Math.max(dailyGoal - caloriesBurned, 0)} kcal left today`}
                  caption="Burn tracker"
                  Icon={LocalFireDepartmentRoundedIcon}
                  gradient={calorieGradient}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <MetricCard
                  title="Mood"
                  value={selectedMood}
                  subtitle="Daily check-in"
                  caption="Check-in"
                  Icon={PsychologyRoundedIcon}
                  gradient="linear-gradient(135deg, #7c4dff 0%, #a855f7 100%)"
                />
              </Grid>
            </Grid>

            {/* Goal progress chart box */}
            <Card sx={{ ...sectionCard, p: { xs: 2, md: 3 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Goal Progress
                  </Typography>
                  <Typography variant="body2" sx={softText}>
                    Weekly overview of training, calories, and energy.
                  </Typography>
                </Box>

                <Select
                  size="small"
                  value={timeframe}
                  onChange={(event) => setTimeframe(event.target.value)}
                  sx={{ minWidth: 110, borderRadius: 3 }}
                >
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                </Select>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  gap: { xs: 1, sm: 2 },
                  alignItems: "end",
                  minHeight: 220,
                }}
              >
                {weeklyData.map((item) => (
                  <Stack key={item.day} spacing={1} alignItems="center" justifyContent="flex-end">
                    <Stack direction="row" spacing={0.7} alignItems="flex-end" sx={{ height: 170 }}>
                      <Box sx={{ width: 8, height: `${item.workout}%`, borderRadius: 999, bgcolor: "#46c6e7" }} />
                      <Box
                        sx={{
                          width: 8,
                          height: `${item.calories}%`,
                          borderRadius: 999,
                          bgcolor: theme.palette.secondary.main,
                        }}
                      />
                      <Box sx={{ width: 8, height: `${item.energy}%`, borderRadius: 999, bgcolor: "#9b6bff" }} />
                    </Stack>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                      {item.day}
                    </Typography>
                  </Stack>
                ))}
              </Box>

              <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mt: 2, rowGap: 1.2 }}>
                {[
                  { label: "Workout", color: "#46c6e7" },
                  { label: "Calories", color: theme.palette.secondary.main },
                  { label: "Mood", color: "#9b6bff" },
                ].map((legend) => (
                  <Stack key={legend.label} direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: legend.color }} />
                    <Typography variant="caption" sx={softText}>
                      {legend.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>


          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
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
                  label={`${completedWorkouts.length} done`}
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: "primary.main", fontWeight: 700 }}
                />
              </Stack>

              <Stack spacing={1.2}>
                {workoutOptions.map((workout, index) => {
                  const isComplete = completedWorkouts.includes(workout);
                  return (
                    <Box
                      key={`sidebar-${workout}`}
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
                          onChange={() => toggleWorkout(workout)}
                          sx={{
                            color: "secondary.main",
                            "&.Mui-checked": { color: "secondary.main" },
                          }}
                        />
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{workout}</Typography>
                          <Typography variant="caption" sx={softText}>
                            {workoutDurations[index]}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label={isComplete ? "Done" : "Pending"}
                        color={isComplete ? "success" : "default"}
                        variant={isComplete ? "filled" : "outlined"}
                        size="small"
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Card>

          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
