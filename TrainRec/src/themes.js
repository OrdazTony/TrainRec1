import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

export const tokens = (mode) => ({
  ...(mode === 'dark'
    ? {
        // DARK THEME → PURPLE + ORANGE
        primary: {
          100: '#e6e1f5',
          200: '#c2b8eb',
          300: '#9e90e0',
          400: '#7a67d6',
          500: '#4b2e83', // main deep purple
          600: '#3c2569',
          700: '#2d1c4f',
          800: '#1e1234',
          900: '#0f091a',
        },
        accent: {
          100: '#ffe5d0',
          200: '#ffc299',
          300: '#ff9f66',
          400: '#ff7a33',
          500: '#ff6b00', // main orange
          600: '#cc5500',
          700: '#994000',
          800: '#662a00',
          900: '#331500',
        },
        neutral: {
          100: '#dcd6f7',
          200: '#b9adef',
          300: '#9685e6',
          400: '#735cde',
          500: '#3a3a48', // dark surface
          600: '#323240',
          700: '#2a2a36',
          800: '#23232d',
          900: '#1d1d25',
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
      primary: { main: colors.primary[600] },
      secondary: { main: colors.accent[500] },
      background: {
        default: mode === 'dark' ? colors.neutral[600] : colors.neutral[500],
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