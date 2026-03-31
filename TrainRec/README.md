# TrainRec

A fitness tracking web application built with React and Vite.

## Prerequisites

Make sure you have the following installed before running the project:

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (comes with Node.js) or [yarn](https://yarnpkg.com/)

## Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.0 | UI library |
| `react-dom` | ^19.2.0 | React DOM renderer |
| `react-router-dom` | ^7.13.1 | Client-side routing |
| `@mui/material` | ^7.3.9 | Material UI component library |
| `@mui/icons-material` | ^7.3.9 | Material UI icons |
| `@mui/styled-engine-sc` | ^7.3.9 | MUI styled engine |
| `@emotion/react` | ^11.14.0 | CSS-in-JS runtime (required by MUI) |
| `@emotion/styled` | ^11.14.1 | Styled component support for Emotion |
| `styled-components` | ^6.3.12 | CSS-in-JS styling |

### Dev Dependencies

| Package | Purpose |
|---|---|
| `vite` | Build tool and dev server |
| `@vitejs/plugin-react` | React Fast Refresh support for Vite |
| `eslint` | Linting |

## Getting Started

1. **Clone the repository** and navigate to the project directory:

   ```bash
   cd TrainRec1/TrainRec
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173` by default. 

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with HMR |
| `npm run build` | Build the app for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |
