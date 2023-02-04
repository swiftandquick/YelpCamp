// Require the model exported from module in campground.js.  
const Campground = require('../models/campground');

// Require the model exported from module in review.js.  
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    // Find the campground by its id, which is in the parameter.  
    const campground = await Campground.findById(req.params.id);
    console.log(req.body.review);
    // Create a new Review object base on the form submitted on localhost:3000/campgrounds/:id.  
    const review = new Review(req.body.review);
    // Replace " and ' in all campground attributes or else the map's JSON can't be parsed.  
    review.body = review.body.replaceAll(/["]/g, "`");
    review.body = review.body.replaceAll(/[']/g, "`");
    // If I submit a form to send a review, then the author is the the currently login user.  
    review.author = req.user._id;
    // Add the new Review object into the Campground object's reviews array.  
    campground.reviews.push(review);
    // Insert the Review object into the database.  
    await review.save();
    // Update the Campground object.  
    await campground.save();
    // When a new review is made, use the key 'success' and the message 'Successfully created a review!'.  
    req.flash('success', 'Successfully created a review!');
    // Redirect to localhost:3000/campgrounds/:id.  
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    // Get the id and reviewId from the parameters.  
    const { id, reviewId } = req.params;
    // Removes the review by its ID from the Campground object's reviews array using the $pull operation.   
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // Find the Review object by its ID then delete the object from the reviews collection.  
    await Review.findByIdAndDelete(reviewId);
    // When a new review is deleted, use the key 'success' and the message 'Successfully deleted a review!'.  
    req.flash('success', 'Successfully deleted a review!');
    // Redirect to localhost:3000/campgrounds/:id.  
    res.redirect(`/campgrounds/${id}`);
}