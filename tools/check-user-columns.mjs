import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL missing');

const pool = new pg.Pool({ connectionString, ssl: false });

try {
  for (const table of ['app_users', 'users']) {
    const res = await pool.query(
      `select column_name, data_type
       from information_schema.columns
       where table_schema = 'public' and table_name = $1
       order by ordinal_position`,
      [table]
    );
    console.log(`TABLE ${table}`);
    console.log(res.rows.map((r) => `${r.column_name}:${r.data_type}`).join(','));
  }
} finally {
  await pool.end();
}
