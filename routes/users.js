// Require express.  
const express = require('express');

// Set up the router.  
const router = express.Router();

// Require passport.  
const passport = require('passport');

// Import catchAsync from utils folder.  
const catchAsync = require('../utils/catchAsync');

// Import the model object from user.js.  
const User = require('../models/user');

// Require the function from users.js, which is in controllers folder.  
// The variable users is an array of elements (exported modules that are functions) from the users.js (in controllers).  
// If I want to use a specific function, such as renderRegister, I have to call users.renderRegister.  
const users = require('../controllers/users');

// GET request invokes the function renderRegister from users.js (in controllers).  
// localhost:3000/register render the register.ejs template from users folder.
// ---   
// POST request invokes the function register from users.js (in controllers).  
// If a form on localhost:3000/register is submitted, a POST request will be sent to localhost:3000/register.  
// Use catchAsync wrapper function to catch the error then pass the error to next error handling middleware.   
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

// GET request invokes the function renderLogin from users.js (in controllers).  
// localhost:3000/login render the login.ejs template from users folder.  
// ---
// POST request invokes the function login from users.js (in controllers).  
// If a form on localhost:3000/login is submitted, a POST request will be sent to localhost:3000/login.  
// Use a middleware to authenticate the user, if the login fails, redirect to localhost:3000/login and flash a message.  
// passport.authenticate() creates a new session, that's why req.session.returnTo is undefined, so I will have to set keepSessionInfo to true.  
router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), users.login);

// This function invokes the function logout from users.js (in controllers).  
// Going to localhost:3000/logout will log the user out and redirect to localhost:3000/campgrounds.  
router.get('/logout', users.logout)

// Export the router.  
module.exports = router;