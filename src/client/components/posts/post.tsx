import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import * as PropTypes from "prop-types";
import { InferProps } from "prop-types";
import { Container, Grid, CardContent, Typography, Card } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
        flexGrow: 1,
    },
}));

export default function Posts({
    title, summary
}: InferProps<typeof Posts.propTypes>) {
    const classes = useStyles({});
    return (
        <div className={classes.root}>
     
                    <Card className={classes.root} square variant={'outlined'}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Word of the Day
                            </Typography>
                            <Typography variant="h5" component="h2">
                                Word of the Day
                            </Typography>
                            <Typography color="textSecondary">
                                adjective
                            </Typography>
                            <Typography variant="body2" component="p">
                                well meaning and kindly.
                                {'"a benevolent smile"'}
                            </Typography>
                        </CardContent>
                    </Card>
        </div>
    );
}

Posts.propTypes = {
    title: PropTypes.string.isRequired,
    summary: PropTypes.string.isRequired,
};
