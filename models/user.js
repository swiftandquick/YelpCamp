// Require mongoose.  
const mongoose = require('mongoose');

// Require passport-local-mongoose.  
const passportLocalMongoose = require('passport-local-mongoose');

// Get the Schema variable from the mongoose object.  
const Schema = mongoose.Schema;

// Create a Schema for user, only contains email property, email has to be unique.  
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// Add onto the schema a username and a password.  
userSchema.plugin(passportLocalMongoose);

// Export the model that was created using userSchema.  
module.exports = mongoose.model('User', userSchema);