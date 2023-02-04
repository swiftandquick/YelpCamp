// Require cloudinary.  
const cloudinary = require('cloudinary').v2;

// Require multer-storage-cloudinary.  
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Associate our Cloudinary account with this Cloudinary instance.  
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// Instantiate an instance of Cloudinary storage.  Only allow us to upload images to the YelpCamp folder.  
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'YelpCamp',
        allowedFormats: ['jpeg', 'jpg', 'png', 'bmp', 'gif', 'svg']
    }
});

// Export the configured Cloudinary object (cloudinary) and the Cloudinary storage instance (storage).
module.exports = { cloudinary, storage };