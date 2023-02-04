// Import the model object from user.js.  
const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res) => {
    try {
        // Get the email, username, password from the req.body object via destructuring.  
        const { email, username, password } = req.body;
        // Create a user object with email and username.  
        const user = new User({ email, username });
        // register() takes in the User object and the password, then return a hashed password with added salt.  
        const registeredUser = await User.register(user, password);
        // Log the user in after the user is registered.  
        req.login(registeredUser, error => {
            if (error) {
                next(error);
            }
            else {
                req.flash('success', 'Welcome to Yelp Camp!');
                // Redirect to localhost:3000/campgrounds.  
                res.redirect('/campgrounds');
            }
        });
    }
    catch (e) {
        // If I am get an error submitting the form, I will get redirected back to localhost:3000/register.  
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    // If the user logs in successfully, flash a message 'Welcome back!'.  
    req.flash('success', 'Welcome back!');
    // If returnTo exists, redirect the user back to the original URL, otherwise, redirect the user to localhost:3000/campgrounds.  
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // Delete the returnTo variable.  
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = async (req, res) => {
    req.logout(function (error) {
        if (error) {
            next(error);
        }
        else {
            req.flash('success', "Goodbye!");
            res.redirect('/campgrounds');
        }
    });
}