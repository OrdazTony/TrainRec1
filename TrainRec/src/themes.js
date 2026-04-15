import { createContext, useState, useMemo } from "react";
import { alpha, createTheme } from "@mui/material/styles";

export const tokens = (mode) => ({
  ...(mode === 'dark'
    ? {
        // DARK THEME → CUSTOM PURPLE / BLUE / SOFT CONTRAST PALETTE
        primary: {
          100: '#ffebc6',
          200: '#c9d5b5',
          300: '#a69cac',
          400: '#7a7897',
          500: '#474973',
          600: '#383b5c',
          700: '#2b2e47',
          800: '#1f2540',
          900: '#161b33',
        },
        accent: {
          100: '#ffebc6',
          200: '#f0dcc0',
          300: '#c9d5b5',
          400: '#b6b0bf',
          500: '#a69cac',
          600: '#8c8292',
          700: '#706777',
          800: '#564f5d',
          900: '#3a3440',
        },
        neutral: {
          100: '#ffebc6',
          200: '#d8d1c4',
          300: '#a69cac',
          400: '#6d708f',
          500: '#474973',
          600: '#232845',
          700: '#1c213d',
          800: '#161b33',
          900: '#101426',
        },
      }
    : {
        // LIGHT THEME → ORANGE
        primary: {
          100: '#fff3e6',
          200: '#ffe0bf',
          300: '#ffcc99',
          400: '#ffb366',
          500: '#ff8c42', // main orange
          600: '#e6762f',
          700: '#bf5f24',
          800: '#99491a',
          900: '#663011',
        },
        accent: {
          100: '#fff7ed',
          200: '#ffedd5',
          300: '#fed7aa',
          400: '#fdba74',
          500: '#fb923c', // accent orange
          600: '#ea7b20',
          700: '#c26114',
          800: '#9a4b10',
          900: '#7c3d0f',
        },
        neutral: {
          100: '#fffaf5',
          200: '#fff1e6',
          300: '#ffe6d1',
          400: '#f5d6c0',
          500: '#fff4ec', // warm background
          600: '#b8a89a',
          700: '#8e7f73',
          800: '#63584f',
          900: '#2c251f',
        },
      }),
});

export const themesettings = (mode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? colors.primary[300] : colors.primary[600],
        light: mode === 'dark' ? colors.primary[100] : colors.primary[300],
        dark: mode === 'dark' ? colors.primary[700] : colors.primary[800],
      },
      secondary: {
        main: mode === 'dark' ? colors.accent[100] : colors.accent[500],
        light: mode === 'dark' ? colors.accent[100] : colors.accent[300],
        dark: mode === 'dark' ? colors.accent[500] : colors.accent[700],
      },
      background: {
        default: mode === 'dark' ? colors.neutral[800] : colors.neutral[500],
        paper: mode === 'dark' ? colors.neutral[700] : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? colors.neutral[100] : colors.neutral[900],
        secondary: mode === 'dark' ? colors.neutral[200] : colors.neutral[700],
      },
      divider: mode === 'dark' ? alpha(colors.primary[200], 0.28) : colors.neutral[300],
      action: {
        hover: mode === 'dark' ? alpha(colors.primary[200], 0.12) : alpha(colors.primary[600], 0.08),
        selected: mode === 'dark' ? alpha(colors.primary[200], 0.2) : alpha(colors.primary[600], 0.12),
      },
    },
    typography: {
      fontFamily: '"Google Sans", sans-serif',
      h1: { fontFamily: '"Google Sans", sans-serif' },
      h2: { fontFamily: '"Google Sans", sans-serif' },
      h3: { fontFamily: '"Google Sans", sans-serif' },
      h4: { fontFamily: '"Google Sans", sans-serif' },
      h5: { fontFamily: '"Google Sans", sans-serif' },
      h6: { fontFamily: '"Google Sans", sans-serif' },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            fontSize: '0.7rem',
            padding: '5px 10px',
            [theme.breakpoints.up('sm')]: {
              fontSize: '0.8rem',
              padding: '6px 14px',
            },
            [theme.breakpoints.up('md')]: {
              fontSize: '0.875rem',
              padding: '7px 18px',
            },
            [theme.breakpoints.up('lg')]: {
              fontSize: '0.9rem',
              padding: '8px 22px',
            },
          }),
        },
      },
    },
  };
};

//context for the color mode (light or dark)
export const colorModeContext = createContext({
  toggleColorMode: () => {},
});

export const useMode = () => {
  const [mode, setMode] = useState('dark');
    // toggle function to switch between light and dark mode
    const colorMode = useMemo(
        () => ({
            toggleColorMode: () =>
                setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
        }),
        [],
    );
    const theme = useMemo(() => createTheme(themesettings(mode)), [mode]);

    return [theme, colorMode];  

}