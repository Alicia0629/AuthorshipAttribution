import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout.tsx";
import Login from "./pages/Login.tsx";
import Profile from "./pages/Profile.tsx";
import CreateModel from "./pages/CreateModel.tsx";
import { lightTheme, darkTheme } from './styles/styles.tsx';
import { ThemeProvider, CssBaseline } from '@mui/material';

const App: React.FC = () => {
  const [theme, setTheme] = useState(lightTheme);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDarkMode ? darkTheme : lightTheme);
  }, []);


  const handleAuthSuccess = (): void => {
    setIsAuthenticated(true);
  };

  return (
      <ThemeProvider theme={theme}>  {/* Aplica el tema globalmente */}
        <CssBaseline />
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <Layout>
                  <AuthLayout>
                    <Login onAuthSuccess={handleAuthSuccess} />
                  </AuthLayout>
                </Layout>
              }
            />
            <Route
              path="/profile"
              element={isAuthenticated ? <Layout><Profile /></Layout> : <Navigate to="/login" />}
            />
            <Route
              path="/"
              element={<Navigate to="/login" />}
            />
            <Route
              path="/create"
              element={<Layout><CreateModel /></Layout>}
            />
          </Routes>
        </Router>
      </ThemeProvider>
  );
};

export default App;