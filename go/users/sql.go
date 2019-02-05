package users

import (
  "database/sql"
  "log"

  "github.com/Liquid-Labs/catalyst-core-api/go/entities"
  "github.com/Liquid-Labs/go-rest/rest"
)

// Since this is a non-concrete type, we return the (newly created) intetrnal
// ID rather than retrievin the Entity record.
func CreateUserInTxn(user *User, txn *sql.Tx) (int64, rest.RestError){
  newId, restErr := entities.CreateEntityInTxn(txn)
  if restErr != nil {
    return -1, restErr
  }

  _, err := txn.Stmt(createUserQuery).Exec(newId, user.Active)
  if err != nil {
    log.Print(err)
		return -1, rest.ServerError("Failure creating user record.", err)
	}

  return newId, nil
}

const createUserStatement = `INSERT INTO users (id, active) VALUES (?, ?)`
var createUserQuery *sql.Stmt
func SetupDB(DB *sql.DB) {
  var err error
  if createUserQuery, err = DB.Prepare(createUserStatement); err != nil {
    log.Fatalf("mysql: prepare create user stmt: %v", err)
  }
}
