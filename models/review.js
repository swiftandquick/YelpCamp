// Require mongoose.  
const mongoose = require('mongoose');

// Retrieve the Schema variable from mongoose.  
const Schema = mongoose.Schema;

// Create a schema for review.  
// The Review model has an author property which refers to the User object.  
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Export the model.  
module.exports = mongoose.model("Review", reviewSchema);