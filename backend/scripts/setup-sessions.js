const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pcc_portal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
});

async function setupSessionTable() {
  try {
    console.log('Setting up session table...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Session table created successfully');
    
    const addConstraintQuery = `
      ALTER TABLE "session" 
      ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") 
      NOT DEFERRABLE INITIALLY IMMEDIATE;
    `;
    
    try {
      await pool.query(addConstraintQuery);
      console.log('✅ Primary key constraint added');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ️ Primary key constraint already exists');
      } else {
        throw err;
      }
    }
    
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `;
    
    await pool.query(createIndexQuery);
    console.log('✅ Index created successfully');
    
    console.log('🎉 Session table setup completed!');
    
  } catch (error) {
    console.error('❌ Error setting up session table:', error);
  } finally {
    await pool.end();
  }
}

setupSessionTable();