// Import the campgroundSchema object and reviewSchema object from schemas.js.  
const { campgroundSchema, reviewSchema } = require('./schemas.js');

// Import ExpressError from utils folder.  
const ExpressError = require('./utils/ExpressError');

// Import model object of campground.js from models folder.  
const Campground = require('./models/campground');

// Import model object of review.js from models folder.  
const Review = require('./models/review');

// Some actions require the user to login, so if the user is authenticated, flash an error message and redirect to localhost:3000/login.  
// Export the function isLoggedIn to be used as a middleware.
// Set returnTo to req.originalUrl (original URL).  Return to the originalUrl once logged out.  
// I cannot put a semicolon (;) at the end of originalUrl or else the value doesn’t load.  
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must sign in first!');
        return res.redirect('/login');
    }
    next();
}

// Define a middleware function that validates the campground Schema.  
module.exports.validateCampground = (req, res, next) => {
    // Validate the Schema, if there's an error, throw an error.  
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        // details is an array of strings, I need to deconstruct the array and join the elements together with comma.   
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

// isAuthor is a middleware function that checks if the current user is equal to the author of the campground.  
module.exports.isAuthor = async (req, res, next) => {
    // Take the id from the URL.  
    const { id } = req.params;
    // Find the campground by id.  
    const campground = await Campground.findById(id);
    // If the campground's author property is not equal to user's (current user) ID, don't update and redirect to localhost:3000/campgrounds/:id.  
    // Otherwise, call the next middleware. 
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// Define a middleware function that validates review Schema.  
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// isAuthor is a middleware function that checks if the current user is equal to the author of the review.  
module.exports.isReviewAuthor = async (req, res, next) => {
    // Take the id and reviewId from the URL, remember, the route for delete, which sends a DELETE request to is localhost:3000/campgrounds/:id/reviews/reviewId.  
    const { id, reviewId } = req.params;
    // Find the review by id.  
    const review = await Review.findById(reviewId);
    // If the campground's author property is not equal to user's (current user) ID, don't update and redirect to localhost:3000/campgrounds/:id.  
    // Otherwise, call the next middleware. 
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}