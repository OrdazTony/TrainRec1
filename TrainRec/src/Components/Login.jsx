import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import API_BASE from '../config';

function GradientRadioIcon({ startColor, endColor, ...props }) {
  const gradientId = React.useId();
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={startColor} />
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke={`url(#${gradientId})`} strokeWidth="2.2" />
      <circle cx="12" cy="12" r="4.5" fill={`url(#${gradientId})`} />
    </SvgIcon>
  );
}

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gradientStart = isDark ? '#7c4dff' : '#fff4e8';
  const gradientEnd   = isDark ? '#a855f7' : '#ffc78f';

  const [view, setView] = useState(location.state?.initialView || 'login');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    nickname: '',
    birthdate: '',
    weight_lb: '',
    height_in: '',
    fitness_activity: 'Sedentary',
    sex: '',
    new_password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAction = async (endpoint, payload) => {
    try {
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        if (endpoint === 'reset_password') {
          alert("Password updated successfully!");
          setView('login');
          return;
        }
        if (data.token) localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  // ─── Shared sx helpers — mirrors dashboard sectionCard ────────────────────
  const cardSx = {
    borderRadius: 5,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
    boxShadow: isDark
      ? `0 20px 45px ${alpha('#000', 0.52)}`
      : `0 20px 45px ${alpha(theme.palette.primary.main, 0.22)}`,
    background: isDark
      ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.97)} 0%, ${alpha(theme.palette.primary.dark, 0.38)} 100%)`
      : `linear-gradient(180deg, ${alpha('#fff', 0.98)} 0%, ${alpha(theme.palette.secondary.light, 0.13)} 100%)`,
    p: { xs: 3, sm: 4 },
    width: '100%',
    maxWidth: 440,
    maxHeight: '85vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    '&::-webkit-scrollbar': { width: 5 },
    '&::-webkit-scrollbar-thumb': {
      background: alpha(theme.palette.primary.main, 0.5),
      borderRadius: 10,
    },
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5,
      bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
      '& fieldset': { borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.18) },
      '&:hover fieldset': { borderColor: isDark ? alpha('#fff', 0.35) : alpha('#000', 0.35) },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
    },
    '& .MuiInputLabel-root': { color: isDark ? alpha('#fff', 0.55) : alpha('#000', 0.5) },
    '& .MuiInputBase-input': { color: theme.palette.text.primary },
    '& .MuiSelect-icon': { color: theme.palette.text.secondary },
  };

  const primaryBtnSx = {
    borderRadius: 3,
    py: 1.5,
    fontWeight: 900,
    fontSize: '1rem',
    background: 'linear-gradient(135deg, #ff7a18 0%, #ff9f43 100%)',
    color: '#fff',
    boxShadow: `0 8px 20px ${alpha('#ff7a18', 0.38)}`,
    '&:hover': {
      background: 'linear-gradient(135deg, #ff7a18 0%, #ff9f43 100%)',
      opacity: 0.92,
      boxShadow: `0 10px 28px ${alpha('#ff7a18', 0.5)}`,
    },
  };

  const outlinedBtnSx = {
    borderRadius: 3,
    py: 1.5,
    fontWeight: 700,
    color: isDark ? alpha('#fff', 0.55) : alpha('#000', 0.45),
    borderColor: isDark ? alpha('#fff', 0.18) : alpha('#000', 0.18),
    '&:hover': {
      borderColor: alpha(theme.palette.primary.main, 0.5),
      bgcolor: alpha(theme.palette.primary.main, 0.06),
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: theme.palette.background.default,
        px: 2,
        py: 4,
      }}
    >
      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <GradientRadioIcon
          startColor={gradientStart}
          endColor={gradientEnd}
          sx={{ fontSize: '4rem' }}
        />
        <Typography
          variant="h2"
          sx={{ fontWeight: 900, letterSpacing: '-2px', color: theme.palette.text.primary }}
        >
          Train
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(135deg, #7c4dff 0%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            REC
          </Box>
        </Typography>
      </Box>

      <Card sx={cardSx}>

        {/* ── LOGIN ── */}
        {view === 'login' && (
          <Stack spacing={2.5}>
            <Typography variant="h5" fontWeight={800} sx={{ color: theme.palette.text.primary }}>
              Welcome,
            </Typography>
            <TextField
              fullWidth label="Email" name="email" type="email"
              onChange={handleChange} sx={fieldSx}
            />
            <TextField
              fullWidth label="Password" name="password" type="password"
              onChange={handleChange} sx={fieldSx}
            />
            <Button
              fullWidth variant="contained" disableElevation sx={primaryBtnSx}
              onClick={() => handleAction('login', { email: formData.email, password: formData.password })}
            >
              Sign In
            </Button>
            <Button fullWidth variant="outlined" sx={outlinedBtnSx} onClick={() => setView('reset')}>
              Forgot password?
            </Button>
          </Stack>
        )}

        {/* ── REGISTER ── */}
        {view === 'register' && (
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={800} textAlign="center" sx={{ color: theme.palette.text.primary }}>
              Create Account
            </Typography>
            <TextField fullWidth label="Full Name" name="name" onChange={handleChange} sx={fieldSx} />
            <TextField fullWidth label="Profile Nickname" name="nickname" onChange={handleChange} sx={fieldSx} />
            <TextField fullWidth label="Email" name="email" type="email" onChange={handleChange} sx={fieldSx} />
            <TextField fullWidth label="Password" name="password" type="password" onChange={handleChange} sx={fieldSx} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                label="Birthday" name="birthdate" type="date"
                InputLabelProps={{ shrink: true }}
                onChange={handleChange} sx={fieldSx}
              />
              <TextField
                label="Gender" name="sex" select
                SelectProps={{ native: true }}
                onChange={handleChange} value={formData.sex} sx={fieldSx}
              >
                <option value="" disabled>Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </TextField>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                label="Weight (lb)" name="weight_lb" type="number"
                onChange={handleChange} sx={fieldSx}
              />
              <TextField
                label="Height (in)" name="height_in" type="number"
                onChange={handleChange} sx={fieldSx}
              />
            </Box>
            <TextField
              fullWidth label="Activity Level" name="fitness_activity" select
              SelectProps={{ native: true }}
              onChange={handleChange} value={formData.fitness_activity} sx={fieldSx}
            >
              <option value="Sedentary">Sedentary (Little to no exercise)</option>
              <option value="Lightly Active">Lightly Active (1-3 days/week)</option>
              <option value="Moderately Active">Moderately Active (3-5 days/week)</option>
              <option value="Very Active">Very Active (6-7 days/week)</option>
              <option value="Extra Active">Extra Active (Very physical job/training)</option>
            </TextField>
            <Button
              fullWidth variant="contained" disableElevation sx={primaryBtnSx}
              onClick={() => handleAction('register', formData)}
            >
              Submit & Join
            </Button>
            <Button fullWidth variant="outlined" sx={outlinedBtnSx} onClick={() => setView('login')}>
              Back to Login
            </Button>
          </Stack>
        )}

        {/* ── RESET ── */}
        {view === 'reset' && (
          <Stack spacing={2.5}>
            <Typography variant="h5" fontWeight={800} textAlign="center" sx={{ color: theme.palette.text.primary }}>
              Reset Password
            </Typography>
            <TextField
              fullWidth label="Email Address" name="email" type="email"
              onChange={handleChange} sx={fieldSx}
            />
            <TextField
              fullWidth label="New Password" name="new_password" type="password"
              onChange={handleChange} sx={fieldSx}
            />
            <Button
              fullWidth variant="contained" disableElevation sx={primaryBtnSx}
              onClick={() => handleAction('reset_password', { email: formData.email, new_password: formData.new_password })}
            >
              Update Password
            </Button>
            <Button fullWidth variant="outlined" sx={outlinedBtnSx} onClick={() => setView('login')}>
              Cancel
            </Button>
          </Stack>
        )}

      </Card>

      {/* Create account link shown below card on login view */}
      {view === 'login' && (
        <Button
          onClick={() => setView('register')}
          sx={{
            mt: 3,
            fontWeight: 700,
            letterSpacing: '0.5px',
            background: 'linear-gradient(135deg, #7c4dff 0%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            '&:hover': { opacity: 0.75 },
          }}
        >
          Create new Account
        </Button>
      )}

    </Box>
  );
};

export default LoginPage;