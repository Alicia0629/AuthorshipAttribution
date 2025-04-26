import {Button, useTheme} from '@mui/material';

const CustomButton = ({ children, ...props }: any) => {
    const theme = useTheme();

    return (
        <Button
          {...props}
          sx={{
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.background.paper,
            padding: '0.6em 1.2em',
            fontSize: '1em',
            fontWeight: 500,
            borderRadius: '8px',
            transition: 'background-color 0.25s',
            width: '100%',
            '&:hover': {
              backgroundColor: theme.palette.secondary.dark,
            },
            '&:focus': {
              outline: '4px solid  ${theme.palette.secondary.dark}',
            },
          }}
        >
          {children}  {}
        </Button>
    );
};

export default CustomButton;
