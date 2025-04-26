import React from "react";
import { Typography, Box, useTheme } from "@mui/material";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "60%",
          maxWidth: "600px",
          backgroundColor: theme.palette.background.paper,
          borderRadius: 3,
          boxShadow: 3,
          padding: 3,
        }}
      >
        <Box
          sx={{
            width: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            padding: 3,
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom>
            Authorship Attribution
          </Typography>
          <Typography variant="body1">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sit amet interdum felis. Vivamus sit amet facilisis mi. Aliquam tristique justo ut erat bibendum, ut euismod augue cursus. Maecenas sagittis ornare augue, vel posuere enim congue at. Cras ultrices id felis eu porttitor. Vestibulum vestibulum nisl sed enim semper, id imperdiet nulla porta.
          </Typography>
        </Box>

        <Box
          sx={{
            width: "50%",
            display: "flex",
            justifyContent: "center", 
            alignItems: "center",     
            padding: 3,
          }}
        >
          {children} 
        </Box>
      </Box>
  );
};

export default AuthLayout;
