// Require mongoose.  
const mongoose = require('mongoose');

// Require the model from review.js.  
const Review = require('./review');

// Create a Schema variable.  
const Schema = mongoose.Schema;

// Import the configured cloudinary object from index.js (in cloudinary).  
const { cloudinary } = require("../cloudinary");

// Create an ImageSchema.  
const ImageSchema = new Schema({
    url: String,
    filename: String
});

// In Cloudinary, the image https://res.cloudinary.com/demo/image/upload/docs/models.jpg has a thumbnail version that is 200 pixels wide, 
// which is https://res.cloudinary.com/demo/image/upload/w_200/docs/models.jpg, I can replace ‘/upload’ with ‘/upload/w_200’ to get the 
// thumbnail version of the image.  
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/h_125,w_200');
});

// opts will be used to make the Campground object's properties.popUpMarkup property available in the features object.   
const opts = { toJSON: { virtuals: true } };

// Create a Schema for campgrounds.
// Each Campground object has an array of Review objects called reviews.  
// Each Campground object has a referenced author.  
// images is an array of objects, each has an array of ImageSchema.  
// geometry is a property that represents the coordinates on the map.  In geometry, type is "Point", coordinates is an array of Number. 
// Pass opts in to make the virtual property (properties.popUpMarkup) a property of the Campground object.   
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts);

// Register a virtual property for the Campground object, which is properties.popUpMarkUp.  
// popUpMarkup contains an anchor tag that leads the user to the campground's show page.  
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href=/campgrounds/${this._id}>${this.title}</a></strong><h6>${this.location}</h6><p>${this.description.substring(0, 20)}...</p>`;
});

// Use a post middleware that invokes after findByIdAndDelete() is invoked.  
// doc represents the Campground object, one the Campground object is deleted, delete all Review objects that are in the Campground object's reviews array.  
// Delete all images of the campground  from cloudinary.  
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        for (const image of doc.images) {
            await cloudinary.uploader.destroy(image.filename);
        }
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});

// Create a model with CampGroundSchema, then export it via module.  
module.exports = mongoose.model('Campground', CampgroundSchema);