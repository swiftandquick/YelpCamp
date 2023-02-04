// Require the model exported from module in campground.js, which is in models folder.  
const Campground = require('../models/campground');

// Import the configured cloudinary object from index.js (in cloudinary).  
const { cloudinary } = require("../cloudinary");

// Require mapbox-sdk-js.    
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

// Retrieve the MAPBOX_TOKEN variable from .env file.  
const mapBoxToken = process.env.MAPBOX_TOKEN;

// Set accessToken equal to the MAPBOX_TOKEN variable from .env file.  
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

// Create and export the index function.  
module.exports.index = async (req, res) => {
    // Use the campgrounds variable to store the objects that's found in the campgrounds database.  
    const campgrounds = await Campground.find({});
    // Pass campgrounds as an argument for the render() method, so I can use the object's properties in index.ejs.  
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    // Send a forward geocode based on the Campground object's location.  
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    // Create a new Campground object based on the form submitted from new.ejs.  
    const campground = new Campground(req.body.campground);
    // Replace " and ' in all campground attributes or else the map's JSON can't be parsed.  
    campground.title = campground.title.replaceAll(/["]/g, "`");
    campground.title = campground.title.replaceAll(/[']/g, "`");
    campground.location = campground.location.replaceAll(/["]/g, "`");
    campground.location = campground.location.replaceAll(/[']/g, "`");
    campground.description = campground.description.replaceAll(/["]/g, "`");
    campground.description = campground.description.replaceAll(/[']/g, "`");
    // Set the campground's geometry property equal to the geometry property from first element of features array in geoData.body.  
    campground.geometry = geoData.body.features[0].geometry;
    // Make an array of objects using map() method, set each object's url equal to file's path value and filename to file's filename value.
    // campground's images property (array of objects) to the returned array of objects from the map() method.    
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // If I made a campground as a logged in user, I set the author equal to the user's currently logged in.  
    campground.author = req.user._id;
    // Insert the new Campground object into the collection.  
    await campground.save();
    // When a new campground is made, use the key 'success' and the message 'Successfully made a new campground!'.  
    req.flash('success', 'Successfully made a new campground!');
    // Redirect to the show page of the newly created object.  
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    // req.params.id is the ID, use the campground variable to store the object found by ID.  
    // Populate reviews and author so I can use their properties in show.ejs.  
    // Populate the reviews array property, and populate the author property inside each reviews array object.   
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // If campground is not found, use error as the key to flash a message, with the value of "Cannot find that campground!".  
    // Redirect the page to localhost:3000/campgrounds.  
    // Use the return keyword to exit out of the function so the next line of code doesn’t execute.  
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    // Pass campground as an argument for the render() method, so I can use the object's properties in show.ejs. 
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    // req.params.id is the ID, use the campground variable to store the object found by ID.   
    const campground = await Campground.findById(req.params.id);
    // Pass campground as an argument for the render() method, so I can use the object's properties in edit.ejs. 
    // If campground is not found, use error as the key to flash a message, with the value of "Cannot find that campground!".  
    // Redirect the page to localhost:3000/campgrounds.  
    // Use the return keyword to exit out of the function so the next line of code doesn’t execute.  
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    // Send a forward geocode based on the Campground object's location.  
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    // Retrieve the id from the parameters.  
    const { id } = req.params;
    // Replace " and ' in all campground attributes or else the map's JSON can't be parsed.   
    // Find the object by its ID, then update it.  
    title = req.body.campground.title.replaceAll(/["]/g, "`");
    title2 = title.replaceAll(/[']/g, "`");
    location = req.body.campground.location.replaceAll(/["]/g, "`");
    location2 = location.replaceAll(/[']/g, "`");
    price = req.body.campground.price;
    description = req.body.campground.description.replaceAll(/["]/g, "`");
    description2 = description.replaceAll(/[']/g, "`");
    const campground = await Campground.findByIdAndUpdate(id, {
        title: title2,
        location: location2,
        price: price,
        description: description2
    });
    // Replace " and ' in all campground attributes or else the map's JSON can't be parsed.   
    // Set the campground's geometry property equal to the geometry property from first element of features array in geoData.body. 
    campground.geometry = geoData.body.features[0].geometry;
    // Make an array of objects using map() method, set each object's url equal to file's path value and filename to file's filename value.
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // Spread the imgs array, pass it in the push() method as individual elements, objects in imgs array are added to the images array of the campground object.  
    campground.images.push(...imgs);
    // Update the Campground object.  
    await campground.save();
    // If the deleteImages array is not empty, which means I selected some images, delete those images.  
    if (req.body.deleteImages) {
        // Delete all selected images in the form from Cloudinary.  
        // Each deleteImages element has filename as the value, I can loop over the deleteImages array, 
        // pass in their value (filename) to destroy() method, and each image in the deleteImages array.  
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        console.log(campground);
    }
    // When a new campground is updated, use the key 'success' and the message 'Successfully updated a campground!'.  
    req.flash('success', 'Successfully updated a campground!');
    // Redirect to the show page of the edited object.  
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    // Retrieve the id from the parameters.  
    const { id } = req.params;
    // Find the object by its ID then remove it from the collection.   
    await Campground.findByIdAndDelete(id);
    // When a new campground is deleted, use the key 'success' and the message 'Successfully deleted a campground!'.  
    req.flash('success', 'Successfully deleted a campground!');
    // Redirect to localhost:3000/campgrounds.  
    res.redirect('/campgrounds');
}