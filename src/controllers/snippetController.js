const snippetService = require('../services/snippetService');
const catchAsync = require('../utils/catchAsync');

const createSnippet = catchAsync(async (req, res) => {
  const { title, code_content, language } = req.body;
  const user_id = req.user.id; 

  const result = await snippetService.createSnippet(user_id, title, code_content, language);
  res.status(201).json({ message: 'Snippet saved successfully', id: result.id });
});

const searchSnippets = catchAsync(async (req, res) => {
  const { q, language } = req.query;
  const user_id = req.user.id;

  const data = await snippetService.searchSnippets(user_id, q, language);
  res.json(data);
});

const getDashboardSnippets = catchAsync(async (req, res) => {
  console.log('Fetching dashboard snippets for user_id:', req.user.id);
  const user_id = req.user.id;

  const snippets = await snippetService.getAllSnippets(user_id);
  res.json({ count: snippets.length, data: snippets });
});

const deleteSnippet = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  
  console.log(`Attempting to delete snippet ${id} for user_id ${user_id}`);

  // We leave the try/catch here ONLY because the service throws a specific 404 error 
  // if the snippet doesn't belong to the user.
  try {
    await snippetService.deleteSnippet(id, user_id);
    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    if (error.message === 'Snippet not found or unauthorized') {
      res.status(404).json({ status: 'error', message: error.message });
      return;
    }
    throw error; // Let the global handler catch database crashes
  }
});

module.exports = { createSnippet, searchSnippets, getDashboardSnippets, deleteSnippet };