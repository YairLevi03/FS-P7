const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: './server/.env' });

async function executeSqlFile(connection, filePath) {
    const sql = fs.readFileSync(filePath, 'utf8');
    // Split the SQL file into separate statements
    const statements = sql.split(/;\s*$/m).filter(stmt => stmt.trim() !== '');
    for (let statement of statements) {
        if (statement.trim()) {
            await connection.query(statement);
        }
    }
}

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '0000',
            multipleStatements: true // This is crucial for executing large SQL files
        });

        console.log('Connected to MySQL server.');

        const schemaPath = path.join(__dirname, 'server', 'database', 'schema.sql');
        console.log('Running schema.sql...');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await connection.query(schemaSql);
        
        const seedPath = path.join(__dirname, 'server', 'database', 'seed.sql');
        console.log('Running seed.sql...');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await connection.query(seedSql);

        console.log('Database initialization successful!');
        await connection.end();
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

run();
