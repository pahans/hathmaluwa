import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import * as PropTypes from "prop-types";
import { InferProps } from "prop-types";
import Post from './post';

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
}));

export default function Posts({
    posts
  }: InferProps<typeof Posts.propTypes>) {
    const classes = useStyles({});
    return (
        <div className={classes.root}>
            { 
                posts.map((post)=>{
                    return (<Post {...post} />);
                })
            }
        </div>
    );
}

Posts.propTypes = {
    darkMode: PropTypes.bool,
    posts: PropTypes.arrayOf(Object)
} 

Posts.defaultProps = {
    posts: []
};