// Require Joi.  
const BaseJoi = require('joi');

// Require sanitize-html.  
const sanitizeHtml = require('sanitize-html');

// Create an escapeHTML() method that sanitize HTML.  
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

// Set up an extension for BaseJoi.  
const Joi = BaseJoi.extend(extension);

// Add .escapeHTML() to title, price, description (for campground), and body (for review), so I can sanitize HTML for all text inputs.  

// Require campground object.  
// Require title, image, location, and description that are strings.  
// Require price that is a number and has a non-negative price.  
// Campground object has a deleteImages property, which is not required as I don't have to delete any images when I submjit the form.   
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

// Require review object.  
// Require rating that is a number.  
// Require body that is a string.  
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})