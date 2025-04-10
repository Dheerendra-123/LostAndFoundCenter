
const express = require('express');
const ensureAuthentication = require('../Middlewares/auth');
const claimForm = require('../Controller/dataController');
const router = express.Router();


router.patch('/claim/:id', ensureAuthentication, claimForm);
module.exports = router; 