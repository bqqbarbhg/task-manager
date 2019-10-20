import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'

const sqlite = process.env.NODE_ENV === 'production' ? sqlite3 : sqlite3.verbose()

export async function initDatabase() {
  console.log('Initializing database.')

  const databaseFile = process.env.USE_IN_MEMORY_DB === 'true'
    ? ':memory:'
    : path.resolve(__dirname, 'db.sqlite')

  console.log(`Using ${databaseFile} as database file.`)

  if (databaseFile !== ':memory:' && fs.existsSync(databaseFile)) {
    console.log('File exists, attempting to use as database.')
    return new sqlite.Database(databaseFile)
  }

  if (databaseFile !== ':memory:') {
    // Touch the database file
    console.log('Creating database file.')
    fs.closeSync(fs.openSync(databaseFile, 'w'))
  }

  const database = new sqlite.Database(databaseFile)

  console.log('Initializing database schema.')

  // Read database schema file and run it
  const schema = fs.readFileSync(path.resolve(__dirname, 'schema.sql')).toString()
  await new Promise((resolve, reject) => database.exec(schema, (err, res) => {
    if (err) {
      reject(err)
    } else {
      resolve (res)
    }
  }))

  console.log('Database schema initialized.')

  return database
}
