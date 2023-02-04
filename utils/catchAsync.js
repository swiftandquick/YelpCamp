// Accepts a function as an argument, return the function that catches the error, and passes it to next error-handling middleware.  
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}