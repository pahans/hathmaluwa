import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import BrightnessMediumIcon from '@material-ui/icons/BrightnessMedium';
import * as PropTypes from "prop-types";
import { InferProps } from "prop-types";
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    link: {
        textDecoration: "none",
    }
}));

export default function ButtonAppBar({
    setDarkMode
  }: InferProps<typeof ButtonAppBar.propTypes>) {
    const classes = useStyles({});
    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        News
                    </Typography>
                    <IconButton aria-label="toggle dark mode" onClick={setDarkMode}>
                        <BrightnessMediumIcon />
                    </IconButton>
                    <Link color="primary" component={RouterLink} to="/signup" className={classes.link}>
                        <Button>Sign Up</Button>
                    </Link>
                </Toolbar>
            </AppBar>
        </div>
    );
}

ButtonAppBar.propTypes = {
    darkMode: PropTypes.bool,
    setDarkMode: PropTypes.func
};
