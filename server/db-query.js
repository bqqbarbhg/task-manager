
export const query = { }

function mustGet(obj, name) {
  const v = obj[name]
  if (v !== undefined) return v
  throw new Error(`db-query: Expected parameter ${name}`)
}

function queryRun(stmt, paramNames) {
  return (args) => {
    const argList = paramNames.map(name => mustGet(args, name))
    return new Promise((resolve, reject) => {
      stmt.run(argList, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }
}

function queryGet(stmt, paramNames) {
  return (args) => {
    const argList = paramNames.map(name => mustGet(args, name))
    return new Promise((resolve, reject) => {
      stmt.get(argList, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }
}

function queryAll(stmt, paramNames) {
  return (args) => {
    const argList = paramNames.map(name => mustGet(args, name))
    return new Promise((resolve, reject) => {
      stmt.all(argList, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }
}

function makeQuery(db, sql, queryFunc) {
  const re = /\$\w+/g
  const paramNames = (sql.match(re) || []).map(x => x.substr(1))
  sql.replace(re, '?')

  return new Promise((resolve, reject) => {
    const stmt = db.prepare(sql, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(queryFunc(stmt, paramNames))
      }
    })
  })
}

export async function initDbQuery(db) {
  const makeQueryRun = sql => makeQuery(db, sql, queryRun)
  const makeQueryGet = sql => makeQuery(db, sql, queryGet)
  const makeQueryAll = sql => makeQuery(db, sql, queryAll)

  query.task = await makeQueryGet('SELECT id, name, parent, numChildren FROM task WHERE id = $task;')
  query.taskChildren = await makeQueryAll('SELECT id, name, parent, numChildren FROM task WHERE parent = $task;')

  const addTaskSetNum = await makeQueryRun('UPDATE task SET numChildren = numChildren + 1 WHERE id = $parent;')
  const addTaskInsert = await makeQueryRun('INSERT INTO task(name, parent, numChildren) VALUES ($name, $parent, 0);')
  query.addTask = (args) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION;')
        addTaskSetNum(args)
        addTaskInsert(args)
        db.run('COMMIT;', function(err) {
          if (err) {
            reject(err)
          } else {
            resolve(this.lastID)
          }
        })
      })
    })
  }
  
}
