const { Pool } = require('pg');

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

async function query(text, params) {
  const p = getPool();
  if (!p) {
    if (/^\s*select/i.test(text)) {
      return { rows: [] };
    }
    const err = new Error('DATABASE_URL is required for this operation');
    err.status = 503;
    throw err;
  }
  return p.query(text, params);
}

module.exports = { getPool, query };
