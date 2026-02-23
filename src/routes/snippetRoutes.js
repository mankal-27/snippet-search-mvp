const express = require('express');
const router = express.Router();
const snippetController = require('../controllers/snippetController');
const { protect } = require('../middlewares/auth'); // Import the authentication middleware
const validate = require('../middlewares/validate'); // Import the validation middleware
const { createSnippetSchema, searchSnippetSchema } = require('../validations/snippetSchema'); // Import the validation schema


// Apply the authentication middleware to all routes in this router
// Apply validation middleware to specific routes // Watch how clean this reads: "Protect it, Validate it, then Create it"
// Standard RESTful routes
router.post('/snippets', protect, validate(createSnippetSchema), snippetController.createSnippet);
router.get('/snippets', protect, snippetController.getDashboardSnippets); // Get all
router.delete('/snippets/:id', protect, snippetController.deleteSnippet); // Delete one

// Custom search route
router.get('/search', protect, validate(searchSnippetSchema), snippetController.searchSnippets);

module.exports = router;

