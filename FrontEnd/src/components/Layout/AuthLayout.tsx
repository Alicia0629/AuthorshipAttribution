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
          maxWidth: "700px",
          minWidth: "500px",
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
            Atribución de Autoría
          </Typography>
          <Typography variant="body1">
Esta aplicación es un prototipo desarrollado como parte de un TFG.
Procesa textos que usted proporciona para identificar posibles autores usando procesamiento del lenguaje.
Tenga en cuenta que los modelos utilizados están alojados en un servicio externo llamado RunPod, y toda la información procesada se utiliza únicamente con fines experimentales y académicos.

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
