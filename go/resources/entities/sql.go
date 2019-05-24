package entities

import (
  "database/sql"
  "log"

  "github.com/Liquid-Labs/go-rest/rest"
)

func CreateEntityInTxn(e *Entity, txn *sql.Tx) (int64, rest.RestError){
  res, err := txn.Stmt(createEntityQuery).Exec(e.PubliclyReadable, e.OwnerPubID)
  if err != nil {
		return -1, rest.ServerError("Failure creating entity.", err)
	}
  newID,err := res.LastInsertId()
  if err != nil {
    return -1, rest.ServerError("Problem retrieving newly created entity ID.", err)
  } else if newID == 0 {
    return -1, rest.ServerError("Unexpected value for new ID.", nil)
  }
  return newID, nil
}

const createEntityStatement = `INSERT INTO entities (owner, publicly_readable) SELECT id, ? FROM entities e WHERE e.pub_id=?`
var createEntityQuery *sql.Stmt
func SetupDB(DB *sql.DB) {
  var err error
  if createEntityQuery, err = DB.Prepare(createEntityStatement); err != nil {
    log.Fatalf("mysql: prepare create entity stmt: %v", err)
  }
}
