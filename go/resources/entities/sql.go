package entities

import (
  "database/sql"
  "log"

  "github.com/Liquid-Labs/go-webapp-tools/rest"

  "source.developers.google.com/p/uno-delivery-test/r/uno-api/db"
)

func CreateEntity(txn *sql.Tx) (int64, rest.RestError){
  res, err := txn.Stmt(createEntityQuery).Exec()
  if err != nil {
		return -1, rest.ServerError("Failure creating entity.", err)
	}
  newId,err := res.LastInsertId()
  if err != nil {
    return -1, rest.ServerError("Problem retrieving newly created entity ID.", err)
  } else if newId == 0 {
    return -1, rest.ServerError("Unexpected value for new ID.", nil)
  }
  return newId, nil
}

const createEntityStatement = `INSERT INTO entities VALUES ()`
var createEntityQuery *sql.Stmt
func SetupDb() {
  var err error
  if createEntityQuery, err = unoDb.Db.Conn.Prepare(createEntityStatement); err != nil {
    log.Fatalf("mysql: prepare create entity stmt: %v", err)
  }
}
