const { z } = require('zod');

const createSnippetSchema = z.object({
    body: z.object({
        title: z.string({
            required_error: 'Title is required',
        }).min(1, 'Title cannot be empty').max(255, 'Title cannot exceed 255 characters'),

        code_content: z.string({
            required_error: 'Code content is required',
        }).min(1, 'Code content cannot be empty').max(10000, 'Code content cannot exceed 10,000 characters'),

        language: z.string().max(50, 'Language cannot exceed 50 characters').optional(),
    })
});

const searchSnippetSchema = z.object({
    query: z.object({
        q: z.string({
            required_error: 'Search query (q) is required',
        }).min(1, 'Search query cannot be empty').max(100, 'Search query cannot exceed 100 characters'),

        language: z.string().max(50, 'Language cannot exceed 50 characters').optional(),
    })
});

module.exports = {
    createSnippetSchema,
    searchSnippetSchema,
};
