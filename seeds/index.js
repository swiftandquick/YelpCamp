// Require mongoose.  
const mongoose = require('mongoose');

// Import the array of objects from cities.js.  
const cities = require('./cities');

// Import places and descriptors array from seedHelpers.js.  
const { places, descriptors } = require('./seedHelpers');

// Require the model exported from module in campground.js.  
const Campground = require('../models/campground');

// Require the model exported from module in review.js.  
const Review = require('../models/review');

// Connect to the database yelp-camp via mongoose.  
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connection open!");
    })
    .catch(error => {
        console.log("Error!");
        console.log(error);
    });

// Takes an array as argument, then generate a random index for the array from 0 to array.length - 1, then return a random element on the array based on the random number generated.  
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    // Delete all existing objects in the campgrounds collection.  
    await Campground.deleteMany({});
    // Delete all existing objects in the reviews collection.  
    await Review.deleteMany({});
    // Use a for loop to create 300 objects.  
    for (let i = 0; i < 50; i++) {
        // Generate a random number between 0 to 999.  random1000 represents the index of the array exported from cities.js.  
        const random1000 = Math.floor(Math.random() * 1000);
        // Generate a random number between 10-30.   
        const price = Math.floor(Math.random() * 20) + 10;
        // Each time the for loop iterates, create a new Campground object. 
        const camp = new Campground({
            // Set the author to 'tim', set the value to tim's ID.  
            author: "63d1d6e032c66ffe65f4d63b",
            // The location property that contains city and state of a randomized object from cities.js.  
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            // Use the sample() function to return a random element from both descriptors and places array.  
            title: `Prototype:  ${sample(descriptors)} ${sample(places)}`,
            description: "Do not edit or delete this campground!",
            price: price,
            // Add the geometry property, with type of "Point", and a coordinates property contains two number variables.  
            // coordinates has the longitude and latitude of the random cities object.  
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            // The images array contain 2 images from Cloudinary.
            images: [
                {
                    url: 'https://res.cloudinary.com/dhgnaxblw/image/upload/v1674878347/YelpCamp/twe9hrnry5mooaybrbrl.bmp',
                    filename: 'YelpCamp/twe9hrnry5mooaybrbrl',
                },
                {
                    url: 'https://res.cloudinary.com/dhgnaxblw/image/upload/v1674878349/YelpCamp/pip4zix1emgcu4r7wpjr.bmp',
                    filename: 'YelpCamp/pip4zix1emgcu4r7wpjr',
                }
            ]
        })
        await camp.save();
    }
}

seedDB();