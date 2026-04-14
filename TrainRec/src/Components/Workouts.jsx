import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
  Container,
  CircularProgress,
  Icon,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TimerIcon from '@mui/icons-material/Timer';
import PoseTrainer from './PoseTrainer';

const Workouts = () => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [activeSession, setActiveSession] = useState(null);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(60);

  const primaryBlue = '#3b82f6';

  useEffect(() => {
    fetch('/api/exercises')
      .then((res) => res.json())
      .then((data) => {
        setExercises(data);
        setFilteredExercises(data);
        setLoading(false);
      })
      .catch((err) => console.error('Fetch error:', err));
  }, []);

  useEffect(() => {
    let interval = null;

    if (isResting && restTime > 0) {
      interval = setInterval(() => {
        setRestTime((prev) => prev - 1);
      }, 1000);
    } else if (restTime === 0) {
      setIsResting(false);
      setRestTime(60);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isResting, restTime]);

  useEffect(() => {
    let result = exercises;

    if (category !== 'All') {
      result = result.filter((ex) => ex.category === category);
    }

    if (searchTerm) {
      result = result.filter((ex) =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredExercises(result);
  }, [category, searchTerm, exercises]);

  const handleStartSession = (exercise) => {
    setActiveSession(exercise);
    setIsResting(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <CircularProgress sx={{ color: primaryBlue }} />
      </Box>
    );
  }

  if (activeSession) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 6,
            p: 4,
            boxShadow: 10,
            border: `2px solid ${primaryBlue}`,
            textAlign: 'center',
          }}
        >
          {isResting ? (
            <Box>
              <TimerIcon sx={{ fontSize: 80, color: '#10b981', mb: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                Resting...
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 900, color: '#10b981', mb: 4 }}>
                {restTime}s
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(restTime / 60) * 100}
                sx={{ height: 10, borderRadius: 5, mb: 4 }}
              />
              <Button
                onClick={() => {
                  setIsResting(false);
                  setRestTime(60);
                }}
                variant="contained"
                fullWidth
                sx={{ bgcolor: '#10b981', py: 2, borderRadius: 3 }}
              >
                Skip Rest
              </Button>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h6" sx={{ color: primaryBlue, fontWeight: 900 }}>
                  SESSION ACTIVE
                </Typography>
                <Button onClick={() => setActiveSession(null)} color="error" variant="outlined">
                  Quit
                </Button>
              </Box>

              <PoseTrainer exercise={activeSession} onQuit={() => setActiveSession(null)} />

              <Box sx={{ bgcolor: 'action.hover', p: 3, borderRadius: 4, mt: 3, textAlign: 'left' }}>
                <Typography variant="overline" sx={{ fontWeight: 800, color: primaryBlue }}>
                  Instructions
                </Typography>
                {activeSession.steps?.map((step, i) => (
                  <Typography key={i} variant="body1" sx={{ mt: 1 }}>
                    <span style={{ color: primaryBlue, fontWeight: 900 }}>{i + 1}.</span> {step}
                  </Typography>
                ))}
              </Box>

              <Button
                onClick={() => setIsResting(true)}
                variant="contained"
                fullWidth
                sx={{ bgcolor: primaryBlue, py: 2, borderRadius: 3, fontWeight: 800, mt: 3 }}
              >
                Complete Set
              </Button>
            </Box>
          )}
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6, minHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          Workout <span style={{ color: primaryBlue }}>Library</span>
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            p: 2,
            bgcolor: 'action.hover',
            borderRadius: 3,
          }}
        >
          <TextField
            placeholder="Search exercises..."
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: primaryBlue, mr: 1 }} />,
            }}
            sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
          />

          <ToggleButtonGroup
            value={category}
            exclusive
            onChange={(e, val) => val && setCategory(val)}
            sx={{
              '& .Mui-selected': {
                bgcolor: `${primaryBlue} !important`,
                color: 'white !important',
              },
            }}
          >
            <ToggleButton value="All">All</ToggleButton>
            <ToggleButton value="Upper Body">Upper</ToggleButton>
            <ToggleButton value="Lower Body">Lower</ToggleButton>
            <ToggleButton value="Core">Core</ToggleButton>
            <ToggleButton value="Cardio">Cardio</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {filteredExercises.length === 0 ? (
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              pb: 10,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.secondary' }}>
              No results found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We couldn't find any exercises matching "{searchTerm}"
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setSearchTerm('')}
              sx={{
                color: primaryBlue,
                borderColor: primaryBlue,
                fontWeight: 800,
                px: 4,
                py: 1,
                borderRadius: 2,
              }}
            >
              Clear Search & View All
            </Button>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {filteredExercises.map((ex) => (
              <Grid item xs={12} sm={6} md={4} key={ex.id}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    transition: '0.2s',
                    '&:hover': {
                      borderColor: primaryBlue,
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Icon sx={{ color: primaryBlue, fontSize: 36 }}>{ex.icon}</Icon>
                      <Chip
                        label={ex.difficulty}
                        size="small"
                        variant="outlined"
                        color={ex.difficulty === 'Beginner' ? 'success' : 'error'}
                      />
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {ex.name}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: primaryBlue,
                        fontWeight: 800,
                        display: 'block',
                        mb: 2,
                      }}
                    >
                      {ex.category}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {ex.description}
                    </Typography>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleStartSession(ex)}
                      sx={{ bgcolor: primaryBlue, fontWeight: 700, borderRadius: 2 }}
                    >
                      Start Training
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Workouts;