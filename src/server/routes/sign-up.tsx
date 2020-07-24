import express from 'express';
var router = express.Router();
import { renderToString } from 'react-dom/server';
import React from 'react';
import { ServerStyleSheets } from '@material-ui/core/styles';
import Signup from '../../client/components/signup';

router.get('/', function (req, res) {
  const sheets = new ServerStyleSheets();
  const reactComp = renderToString(sheets.collect(<Signup />));
  res.render('default', {
    title: 'Sign Up',
    css: sheets,
    body: reactComp,
  });
});

export default router;