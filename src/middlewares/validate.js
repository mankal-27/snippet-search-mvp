// src/middlewares/validate.js
const catchAsync = require('../utils/catchAsync');

const validate = (schema) => catchAsync(async (req, res, next) => {
  try {
    // Zod parses the request. If it fails, it throws an error.
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    next(); // Data is perfectly valid, move to the controller!
  } catch (error) {
    // Format the Zod error into a clean, readable message
    const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
    
    // We send a 400 Bad Request right here, stopping the request from hitting the database
    res.status(400).json({
      status: 'fail',
      message: `Validation Error: ${errorMessages}`
    });
  }
});

module.exports = validate;