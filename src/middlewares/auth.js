const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
    let token;

    // 1. Check if the token exists in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];// Extracts the token after "Bearer "
    }

    if(!token) {
        // 401 Unauthorized if no token is provided
        return res.status(401).json({
            status: 'error',
            message: 'You are not logged in! Please log in to get access.'
        })
    }

    // 2. Verify the token using the secret key
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Attach the decoded user playload to the request object for use in subsequent middleware or route handlers
        req.user = decoded;

        // 4. Call the next middleware or route handler
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token!'
        })
    }
});

module.exports = { protect };