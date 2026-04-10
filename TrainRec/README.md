# TrainRec

A fitness tracking web application built with a **React + Vite frontend** and a **Flask backend API**.

## Prerequisites

Make sure you have the following installed before running the project:

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (comes with Node.js)
- [Python](https://www.python.org/downloads/) 3.10+
- `pip` for installing Python packages

## Dependencies

### Frontend Runtime Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.0 | UI library |
| `react-dom` | ^19.2.0 | React DOM renderer |
| `react-router-dom` | ^7.13.1 | Client-side routing |
| `@mui/material` | ^7.3.9 | Material UI component library |
| `@mui/icons-material` | ^7.3.9 | Material UI icons |
| `@mui/styled-engine-sc` | ^7.3.9 | MUI styled engine |
| `@emotion/react` | ^11.14.0 | CSS-in-JS runtime required by MUI |
| `@emotion/styled` | ^11.14.1 | Styled component support for Emotion |
| `styled-components` | ^6.3.12 | CSS-in-JS styling |

### Backend Runtime Dependencies

| Package | Source | Purpose |
|---|---|---|
| `Flask` | `requirements.txt` | Python API server |
| `Flask-Cors` | `requirements.txt` | Allows the React frontend to call the Flask API |

### Dev Dependencies

| Package | Purpose |
|---|---|
| `vite` | Build tool and dev server |
| `@vitejs/plugin-react` | React Fast Refresh support for Vite |
| `eslint` | Linting |
| `eslint-plugin-react-hooks` | React Hooks lint rules |
| `eslint-plugin-react-refresh` | React Refresh lint rules |

## Getting Started

1. **Go to the app folder:**

   ```bash
   cd TrainRec1/TrainRec
   ```

2. **Install frontend dependencies:**

   ```bash
   npm install
   ```

3. **Install backend dependencies:**

   From the same folder, run:

   ```bash
   pip install -r ../../requirements.txt
   ```

4. **Start the Flask backend** in one terminal:

   ```bash
   python trainrec_exercises.py
   ```

   The backend runs at `http://localhost:5000`.

5. **Start the Vite frontend** in a second terminal:

   ```bash
   npm run dev
   ```

   The frontend runs at `http://localhost:5173`.

> Both the frontend and backend need to be running for the full app experience.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with HMR |
| `npm run build` | Build the app for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |
| `python trainrec_exercises.py` | Start the Flask API locally |
