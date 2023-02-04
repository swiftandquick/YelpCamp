// Require express.  
const express = require('express');

// Set up the router.  
const router = express.Router();

// Require multer.  
const multer = require('multer');

// Require the storage (Cloudinary storage instance) from index.js, which is inside the cloudinary folder.  
const { storage } = require('../cloudinary/index');

// Set a destination for uploaded files to storage (Cloudinary storage instance).  
const upload = multer({ storage });

// Require the function from campground.js, which is in controllers folder.  
// The variable campgrounds is an array of elements (exported modules that are functions) from the campgrounds.js (in controllers).  
// If I want to use a specific function, such as index, I have to call campgrounds.index.  
const campgrounds = require('../controllers/campgrounds');

// Import the function from catchAsync.js, which is in utils folder.  
const catchAsync = require('../utils/catchAsync');

// Import validateCampground, isLoggedIn, and isAuthor middleware functions from middleware.js.  
const { validateCampground, isLoggedIn, isAuthor } = require('../middleware');

// GET request invokes the function index from campgrounds.js (in controllers).  
// Render localhost:3000/campground with index.ejs template, which is in campgrounds folder.  
// Use catchAsync wrapper function to catch the error then pass the error to next error handling middleware.  
// ---
// POST request invokes the function createCampground from campgrounds.js (in controllers).  
// When the form on localhost:3000/campgrounds/new is submitted, there will be a POST request sent to localhost:3000/campgrounds. 
// Use catchAsync wrapper function to catch the error then pass the error to next error handling middleware.   
// Add validateCampground middleware to the function to validate the form properties via JOI schema.  
// Added the isLoggedIn function as middleware that only allows authenticated users to add new campgrounds via external source like Postman.  
// Search for an array of upload files where the file input's name is 'image'.  
// Order matters, upload.array('image') middleware must be before validateCampground.  
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

// This function invokes the function renderNewForm from campgrounds.js (in controllers).  
// Render localhost:3000/campgrounds/new with new.ejs, which is in campgrounds folder.  
// Put this method before the get() method for /campgrounds/:id, or else console treats new as an id.  
// Added the isLoggedIn function as middleware that only allows authenticated users to add new campgrounds.  
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// GET request invokes the function showCampground from campgrounds.js (in controllers).  
// Render localhost:3000/campgrounds/:id with show.ejs template, which is in campgrounds folder.  
// Use catchAsync wrapper function to catch the error then pass the error to next error handling middleware.   
// ---
// PUT request invokes the function updateCampground from campgrounds.js (in controllers).  
// When a form is submitted on localhost:3000/campgrounds/:id/edit, a PUT request is submitted to /campgrounds/:id.  
// Use catchAsync wrapper function to catch the error then pass the error to next error handling middleware.   
// Added the isLoggedIn function as middleware that only allows authenticated users to edit campgrounds with external source like Postman.   
// Added the isAuthor function as middleware that only allows author of the campground to edit campgrounds. 
// Search for an array of upload files where the file input's name is 'image'.  
// Order matters, upload.array('image') middleware must be before validateCampground.  
// ---
// DELETE request invokes the function updateCampground from campgrounds.js (in controllers).  
// When a form is submitted on localhost:3000/campgrounds/:id, a DELETE request is submitted to localhost:3000/campgrounds/:id.  
// Use catchAsync wrapper function to catch the error then pass the error to next error handling middleware.   
// Added the isLoggedIn function as middleware that only allows authenticated users to delete campgrounds.   
// Added the isAuthor function as middleware that only allows author of the campground to edit campgrounds. 
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// This function invokes the function renderEditForm from campgrounds.js (in controllers).  
// Render localhost:3000/campgrounds/:id/edit with edit.ejs, which is in the campgrounds folder. 
// Use catchAsync wrapper function to catch the error then pass the error to next error handling middleware.   
// Added the isLoggedIn function as middleware that only allows authenticated users to edit campgrounds.
// Added the isAuthor function as middleware that only allows author of the campground to edit campgrounds. 
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// Export the router.  
module.exports = router;