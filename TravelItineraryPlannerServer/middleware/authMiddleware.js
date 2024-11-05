const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { error: "Too many login attempts. Please try again later." }
});

module.exports = {
    loginLimiter
};