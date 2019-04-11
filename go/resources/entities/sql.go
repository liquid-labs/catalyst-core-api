package entities

import (
  "database/sql"
  "log"

  "github.com/Liquid-Labs/go-rest/rest"
)

// Since this is a non-concrete type, we return the (newly created) intetrnal
// ID rather than retrievin the Entity record.
func CreateEntityInTxn(txn *sql.Tx) (int64, rest.RestError){
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
func SetupDB(DB *sql.DB) {
  var err error
  if createEntityQuery, err = DB.Prepare(createEntityStatement); err != nil {
    log.Fatalf("mysql: prepare create entity stmt: %v", err)
  }
}
