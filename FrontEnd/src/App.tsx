import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";
import Login from "./components/Login";
import Profile from "./components/Profile";


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleAuthSuccess = (): void => {
    setIsAuthenticated(true);
  };

  return (
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
      </Routes>
    </Router>
  );
};

export default App;