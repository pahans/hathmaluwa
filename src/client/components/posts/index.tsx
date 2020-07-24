import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import * as PropTypes from "prop-types";
import { InferProps } from "prop-types";
import Post from './post';
import { Paper, Container, Grid } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        marginTop: theme.spacing(5),
    },
}));

export default function Posts({
    posts
}: InferProps<typeof Posts.propTypes>) {
    const classes = useStyles({});
    return (
        <Container maxWidth="md">
            <Grid container>
                <Grid item xs={12}>
                    <Paper className={classes.root} elevation={5}>
                        {
                            posts.map((post) => {
                                return (<Post {...post} />);
                            })
                        }
                    </Paper>
                </Grid>
            </Grid>
        </Container >
    );
}

Posts.propTypes = {
    darkMode: PropTypes.bool,
    posts: PropTypes.arrayOf(Object)
}

Posts.defaultProps = {
    posts: []
};