import React, { useState, useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import Avatar from '@material-ui/core/Avatar/Avatar';
import Grid from '@material-ui/core/Grid/Grid';
import CssBaseline from '@material-ui/core/CssBaseline/CssBaseline';
import TextField from '@material-ui/core/TextField/TextField';
import Button from '@material-ui/core/Button/Button';
import { Container, FormControlLabel, Checkbox, FormGroup } from '@material-ui/core';
import useSWR from 'swr';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
        },
        button: {
            marginTop: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
        avatar: {
            margin: theme.spacing(2),
            backgroundColor: theme.palette.secondary.main,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        paper: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            marginTop: theme.spacing(5),
        },
        form: {
            width: '500px',
            margin: theme.spacing(2),
        },
        textField: {
            marginTop: theme.spacing(1),
        }
    }),
);
const url = 'https://pokeapi.co/api/v2/pokemon';

function Signup() {
    const classes = useStyles();
    const [url, setUrl] = useState("");
    const [feed, setFeed] = useState("");
    const fetcher = (url: string) => fetch(url).then((res) => {
        res.text().then((text) => setFeed(text ? text : ""));
    });

    const handleBlur = (e: any) => {
        const url = e.target.value;
        // const { data, error } = useSWR('http://localhost:8080/api/getFeedUrl/url', fetcher);
        fetcher('http://localhost:8080/api/getFeedUrl?url=' + url);
    };


    return (
        <div className={classes.root}>
            <CssBaseline />
            <Container maxWidth='sm'>
                <Grid item xs={12} sm={12}>
                    <Paper className={classes.paper} elevation={5}>
                        <Avatar className={classes.avatar}>
                            <PlaylistAddIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Add Your Blog / Web Site
                        </Typography>
                        <form className={classes.form}>
                            <TextField
                                className={classes.textField}
                                autoComplete="url"
                                name="url"
                                variant="outlined"
                                required
                                fullWidth
                                value={url}
                                id="url"
                                label="Blog URL "
                                autoFocus
                                onChange={(e) => {
                                    const url = e.target.value;
                                    setUrl(url);
                                }}
                                onBlur={handleBlur}
                            />
                            <TextField
                                className={classes.textField}
                                autoComplete="feed-url"
                                name="feed-url"
                                variant="outlined"
                                required
                                fullWidth
                                value={feed}
                                id="feed-url"
                                label="Feed URL"
                                onChange={(e) => {
                                    const url = e.target.value;
                                    setFeed(url);
                                }}
                            />
                            <TextField
                                className={classes.textField}
                                autoComplete="feed-url"
                                name="feed-url"
                                variant="outlined"
                                required
                                fullWidth
                                value={url}
                                id="feed-url"
                                label="Blog name"
                                onChange={(e) => {
                                    const url = e.target.value;
                                    setUrl(url);
                                }}
                            />
                            <TextField
                                className={classes.textField}
                                autoComplete="feed-url"
                                name="feed-url"
                                variant="outlined"
                                required
                                fullWidth
                                value={url}
                                id="feed-url"
                                label="Your name"
                                onChange={(e) => {
                                    const url = e.target.value;
                                    setUrl(url);
                                }}
                            />
                            <TextField
                                className={classes.textField}
                                autoComplete="feed-url"
                                name="feed-url"
                                variant="outlined"
                                required
                                fullWidth
                                value={url}
                                id="feed-url"
                                label="Email"
                                onChange={(e) => {
                                    const url = e.target.value;
                                    setUrl(url);
                                }}
                            />
                            <FormGroup>
                                <FormControlLabel
                                    control={<Checkbox value="allowExtraEmails" color="primary" />}
                                    label="I agree with terms and conditions"
                                />
                            </FormGroup>
                            <Button
                                variant="contained"
                                color="primary"
                                className={classes.button}
                                fullWidth
                            >
                                Submit
                            </Button>
                        </form>
                    </Paper>
                </Grid>
            </Container>
        </div>
    );
}

export default Signup;