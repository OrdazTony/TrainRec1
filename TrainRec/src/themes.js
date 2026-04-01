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
        // LIGHT THEME → AQUA
        primary: {
          100: '#e0f7f7',
          200: '#b3efef',
          300: '#80e6e6',
          400: '#4ddcdc',
          500: '#00b3b3', // main aqua
          600: '#009999',
          700: '#007f7f',
          800: '#006666',
          900: '#004d4d',
        },
        accent: {
          100: '#e6fffb',
          200: '#b3fff5',
          300: '#80ffee',
          400: '#4dffe8',
          500: '#00e6d2', // bright aqua accent
          600: '#00b3a3',
          700: '#008073',
          800: '#004d44',
          900: '#002622',
        },
        neutral: {
          100: '#f7fafa',
          200: '#eef5f5',
          300: '#e0eeee',
          400: '#cce3e3',
          500: '#f2f0f0', // background
          600: '#a1a4ab',
          700: '#727681',
          800: '#434957',
          900: '#141b2d',
        },
      }),
});

export const themesettings = (mode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode,
      primary: { main: colors.primary[500] },
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