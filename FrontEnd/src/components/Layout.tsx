import React from "react";
import { Box } from "@mui/material";
import backgroundImage from '../assets/background.jpg';
import { Typography } from "@mui/material";


const Layout = ({ children }: { children: React.ReactNode }) => {
  console.log("AuthLayout prepare");
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh" 
      width="100vw" 
      sx={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
        {children} 
          
    </Box>
  );
};

export default Layout;
