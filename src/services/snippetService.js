const { pgPool, esClient } = require('../config/database');

async function createSnippet(userId, title, codeContent, language) {
  const client = await pgPool.connect();

  try {
    // 1. Save to Postgres
    const pgRes = await client.query(
      `INSERT INTO snippets (user_id, title, code_content, language)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [userId, title, codeContent, language]
    );
    
    const newSnippetId = pgRes.rows[0].id;

    // 2. Save to Elasticsearch
    try {
      await esClient.index({
        index: 'snippets_index',
        id: newSnippetId,
        body: {
          snippet_id: newSnippetId,
          user_id: userId,
          title: title,
          code_content: codeContent,
          language: language
        },
        refresh: true
      });
    } catch (esError) {
      // 3. Rollback Postgres if Elastic fails
      console.error('Elasticsearch sync failed:', esError);
      await client.query('DELETE FROM snippets WHERE id = $1', [newSnippetId]);
      throw new Error('Search engine sync failed'); 
    }

    return { id: newSnippetId };

  } finally {
    client.release();
  }
}

async function searchSnippets(userId, query, language) {
  const esQuery = {
    index: 'snippets_index',
    body: {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: query,
                fields: ['title^2', 'code_content'],
                fuzziness: 'AUTO'
              }
            }
          ],
          filter: [
            { term: { user_id: userId } }
          ]
        }
      }
    }
  };

  if (language) {
    esQuery.body.query.bool.filter.push({ term: { language: language } });
  }

  const result = await esClient.search(esQuery);

  return {
    total_found: result.body.hits.total.value,
    results: result.body.hits.hits.map(hit => ({
      score: hit._score,
      ...hit._source
    }))
  };
}


async function getAllSnippets(userId) {
  // We query Postgres for this, not Elastic. 
  // Elastic is for searching; Postgres is for displaying the exact, true list of data.
  const client = await pgPool.connect();
  try {
    const result = await client.query(
      'SELECT id, title, language, created_at FROM snippets WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

async function deleteSnippet(snippetId, userId) {
  const client = await pgPool.connect();

  try {
    // 1. Delete from Postgres first (and ensure the user actually owns it!)
    const pgRes = await client.query(
      'DELETE FROM snippets WHERE id = $1 AND user_id = $2 RETURNING id',
      [snippetId, userId]
    );

    if (pgRes.rowCount === 0) {
      throw new Error('Snippet not found or unauthorized'); // We will catch this in the controller
    }

    // 2. Delete from Elasticsearch
    try {
      await esClient.delete({
        index: 'snippets_index',
        id: snippetId,
        refresh: true
      });
    } catch (esError) {
      // In a true production app, if this fails, we would log it to a "Dead Letter Queue"
      // or a background job to retry later, because we can't "undelete" it from Postgres easily.
      console.error(`CRITICAL: Failed to delete snippet ${snippetId} from Elasticsearch`, esError);
      // We don't throw an error to the user here, because the main data IS deleted.
    }

    return { success: true };
  } finally {
    client.release();
  }
}

// Don't forget to export them!
module.exports = { createSnippet, searchSnippets, getAllSnippets, deleteSnippet };