import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/Layout/GeneralLayout.tsx";
import AuthLayout from "./components/Layout/AuthLayout.tsx";
import Login from "./pages/Login.tsx";
import Profile from "./pages/Profile.tsx";
import CreateModel from "./pages/CreateModel.tsx";
import TopBarMenu from "./components/TopBar";
import { lightTheme, darkTheme } from './styles/styles.tsx';
import { ThemeProvider, CssBaseline } from '@mui/material';
import MultiStepModel from "./pages/MultiStepModel.tsx";

const App: React.FC = () => {
  const [theme, setTheme] = useState(lightTheme);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDarkMode ? darkTheme : lightTheme);

    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);


  const handleAuthSuccess = (): void => {
    setIsAuthenticated(true);
  };

  const handleLogOut = (): void => {
    setIsAuthenticated(false);
  };

  return (
      <ThemeProvider theme={theme}>  {/* Aplica el tema globalmente */}
        <CssBaseline />
        <Router>
          <Routes>
            <Route
              path="/login"
              element={!isAuthenticated ? 
                <Layout>
                  <AuthLayout>
                    <Login onAuthSuccess={handleAuthSuccess} />
                  </AuthLayout>
                </Layout>
                 : <Navigate to="/home" />
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
              path="/home"
              element={isAuthenticated ? <Layout><TopBarMenu onLogOutSuccess={handleLogOut} /><MultiStepModel /></Layout> : <Navigate to="/login" />}
            />
          </Routes>
        </Router>
      </ThemeProvider>
  );
};

export default App;