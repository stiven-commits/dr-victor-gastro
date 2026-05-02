import pg from 'file:///E:/Dev/Digiorgio/digiorgioapp/node_modules/pg/lib/index.js';

const { Pool } = pg;

const connections = {
  digiorgio: process.env.DIGIORGIO_DATABASE_URL,
  victor: process.env.VICTOR_DATABASE_URL,
};

for (const [name, connectionString] of Object.entries(connections)) {
  if (!connectionString) {
    console.error(`${name}: missing connection string`);
    process.exitCode = 1;
    continue;
  }

  const pool = new Pool({ connectionString, ssl: false });
  try {
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log(`${name}: ${tables.rows.map((row) => row.table_name).join(', ')}`);
  } finally {
    await pool.end();
  }
}
