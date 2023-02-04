if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Require express.  
const express = require('express');

// Requrie ejs-mate.  I have to put it before const app = express() or else it doesn't work.  
const ejsMate = require('ejs-mate');

const app = express();

// Require path from Node.  
const path = require('path');

// Require mongoose.  
const mongoose = require('mongoose');

// Require express-session.  
const session = require('express-session');

// Require connect-flash.  
const flash = require('connect-flash');

// Require passport.  
const passport = require('passport');

// Require passport-local.  
const LocalStrategy = require('passport-local');

// Require express-mongo-sanitize.  
const mongoSanitize = require('express-mongo-sanitize');

// Require connect-mongo, then execute it, pass in the session.  
const MongoStore = require("connect-mongo");

// Import ExpressError class from ExpressError.js, which is in utils folder.  
const ExpressError = require('./utils/ExpressError');

// Require method-override.  
const methodOverride = require('method-override');

// Require helmet.  
const helmet = require('helmet');

// Require the model exported from module in user.js.  
const User = require('./models/user');

// Require the router from users.js, which is in routes folder.  
const userRoutes = require('./routes/users');

// Require the router from campgrounds.js, which is in routes folder.  
const campgroundRoutes = require('./routes/campgrounds');

// Require the router from reviews.js, which is in routes folder.  
const reviewRoutes = require('./routes/reviews');

// Set dbUrl equals to DB_URL in .env file.  If DB_URL does not exist, connect it to local database.  
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

// mongodb://127.0.0.1:27017/yelp-camp

// Connect to the database yelp-camp via mongoose.  
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connection open!");
    })
    .catch(error => {
        console.log("Error!");
        console.log(error);
    });

// Set the ejs engine to ejsMate.  
app.engine('ejs', ejsMate);

// Set view engine to ejs and set views to the views folder that includes the absolute path.  
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use the express.urlencoded() as a middleware function to parse incoming requests with urlencoded payloads.   
app.use(express.urlencoded({ extended: true }));

// '_method' is the string we are looking for in the query string.  
app.use(methodOverride('_method'));

// Serve static files from the public folder.  
app.use(express.static(path.join(__dirname, '/public')));

// Use mongoSantize as a middleware, replace forbidden characters like . and $ with _.  
app.use(mongoSanitize({
    replaceWith: '_'
}));

// Set secret equals to SECRET from .env file, if it's not found, set it to 'thisshouldbeabettersecret!'.  
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

// Set store to the url of the database.  touchAfter is in seconds.  Here, session will be updated after 24 hours.  
const store = app.use(session({
    secret,
    store: MongoStore.create({
        mongoUrl: dbUrl,
        touchAfter: 86400
    })
}));

// Print out the error if there are any.  
store.on("error", function (e) {
    console.log("Session store error: ", e);
});

// Create an object sessionConfig with the secret as key, and value is 'thisshouldbeabettersecret'.  
// Date.now() is the current time in milliseconds, the cookie expires in a week.  
// Pass store into sessionConfig object.  
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUnitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, 
        expires: Date.now() + 604800000,
        maxAge: 604800000
    }
};

// Create a session middleware that gives us back a cookie every time I browse the web page.  
app.use(session(sessionConfig));

// Use flash as a middleware, where I can display messages after a certain actions.    
app.use(flash());

// Use helmet as middleware, enable all helmet middleware except 4.  
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
}));

// This is outdated.  
/*
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];

const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];

const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dhgnaxblw/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
*/

// Initialize the passport.   
app.use(passport.initialize());

// We need the passport.session() middleware if we want persistent login sessions.  Use this middleware after the session middleware.  
app.use(passport.session());

// Use static authenticate method of model in LocalStrategy (User).  
passport.use(new LocalStrategy(User.authenticate()));

// Serialize users into the session.  Store the user in the session.  
passport.serializeUser(User.serializeUser());

// Deserialize users out of the session.  Un-store the user out of the session.  
passport.deserializeUser(User.deserializeUser());

// On every single request, set value of success (a property of res.locals) to req.flash('success').  
// If I invoke a POST request on localhost:3000/campgrounds, then the message will be "Successfully made a new campground!".  
// If there's error, flash message can display the error.  
// Set the currentUser variable to user of the req object, for example, if the logged in user is tim, currentUser is tim.  
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

/*
// In localhost:3000/fakeUser:  
// The register() method registers a new user instance with a given password, checks if username is unique.  
// I created a User object with username 'coltttt', and set the password to be 'chicken'.  
// newUser is a user object with a hashed password, salt is added before the hashing process.  
// I have to put this method before the I import the routes, app.use('/campgrounds', campgrounds).  
app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'coltttt@gmail.com', username: 'coltttt' });
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
});
*/

// Set the pre-fix path to / (nothing), then set the routes to userRoutes (router in users.js).  
app.use('/', userRoutes);

// Set the pre-fix path to /campgrounds, then set the routes to campgroundRoutes (router in campgrounds.js).  
app.use('/campgrounds', campgroundRoutes);

// Set the pre-fix path to /campgrounds/:id/reviews, then set the routeRoutes to reviews (router in review.js).  
app.use('/campgrounds/:id/reviews', reviewRoutes);

// Set a get() method for main page localhost:3000, render home.ejs when I am on main page.  
app.get('/', (req, res) => {
    res.render("home");
});

// For every request from every path, we are going to call this callback.  If none of the request is invoked, this function will invoke.  
// Pass in the a ExpressError object (subclass of Error) with message of "Page not found!" and status of 404.  
// Use next() to invoke the next error-handling middleware.  
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found!', 404));
});

// Create an error handler middleware.  
// Set default status to 500.  If there's no error message, set message to 'Something went wrong!'.  
// Render the web page with error.ejs template if an error is caught, pass in err as argument.  
app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) {
        message = 'Something went wrong!'
    }
    res.status(status).render('error', { err });
});

// Set port equals PORT from .env file, if PORT doesn't exist, set port to 3000.  
const port = process.env.PORT || 3000;

// Listen on the port.  
app.listen(port, () => {
    console.log(`Serving on port ${port}.`);
});