const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: 'locahost',
    database: 'db_sesi13',
    password: 'root',
    port: 5432
})

console.log('> Connected...'.bgGreen)

module.exports = pool