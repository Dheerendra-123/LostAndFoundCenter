const express = require('express');
const { signupController, loginController} = require('../Controller/authController');
const { signupValidation, loginValidation } = require('../Middlewares/validateData');

const router = express.Router();


router.post('/signup',signupValidation,signupController);

router.post('/login',loginValidation,loginController);


module.exports = router; 