import React from "react";
import { Box, useTheme } from "@mui/material";
import flowerImageLight from '../../assets/flower_light.png';
import flowerImageDark from '../../assets/flower_dark.png';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const flowerImage = theme.palette.mode === "light" ? flowerImageLight : flowerImageDark;

  return (
    <Box
      minHeight="100vh"
      width="100vw"
      sx={{
        backgroundColor: theme.palette.background.default,
        backgroundImage: `url(${flowerImage})`,
        backgroundPosition: "left center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundAttachment: "fixed",
        display: "block",
      }}
    >
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" width="100vw">
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
