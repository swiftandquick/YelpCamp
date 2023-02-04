// Set ExpressError as a subclass of Error.  
class ExpressError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
    }
}

// Export the ExpressError class.  
module.exports = ExpressError;