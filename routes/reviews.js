// Require express.  
const express = require('express');

// Set up the router.  All the parameters in the pre-fix '/campgrounds/:id/reviews' will be merge with routes on this file.   
const router = express.Router({ mergeParams: true });

// Require the function from reviews.js, which is in controllers folder.  
// The variable reviews is an array of elements (exported modules that are functions) from the reviews.js (in controllers).  
// If I want to use a specific function, such as createReview, I have to call reviews.createReview.  
const reviews = require('../controllers/reviews');

// Import validateReview, isLoggedIn, isReviewAuthor middleware functions from middleware.js.  
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// Import the function from catchAsync.js, which is in utils folder.  
const catchAsync = require('../utils/catchAsync');

// This function invokes the function createReview from reviews.js (in controllers).  
// If a form from localhost:3000/campgrounds/:id is submitted, a POST request will be sent to localhost:3000/campgrounds/:id/reviews.  
// Use catchAsync wrapper function to catch the error then pass the error to next error handling middleware.   
// Set the validateReview function as the middleware.  
// isLoggedIn function ensures that ony users can post if they are logged in.  
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// This function invokes the function deleteReview from reviews.js (in controllers).  
// When a form is submitted on localhost:3000/campgrounds/:id is submitted, a DELETE request will be sent to localhost:3000/campgrounds/:id/reviews/:reviewId.  
// Use catchAsync wrapper function to catch the error then pass the error to next error handling middleware.   
// isLoggedIn function ensures that only users can delete if they are logged in.  
// isReviewAuthor function ensures that only the user that posted the review can delete the review, and no one can delete the review from external source like Postman.  
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

// Export the router.  
module.exports = router;