package users

import (
  "database/sql"
  "log"

  // "github.com/Liquid-Labs/lc-entities-model/go/entities"
  "github.com/Liquid-Labs/lc-users-model/go/users"
  // "github.com/Liquid-Labs/go-rest/rest"
  "github.com/Liquid-Labs/terror/go/terror"
)

// Since this is a non-concrete type, we return the (newly created) intetrnal
// ID rather than retrievin the Entity record.
func CreateUserInTxn(user *users.User, txn *sql.Tx) (int64, terror.Terror){
  /*newID, restErr := entities.CreateEntityInTxn(&user.Entity, txn)
  if restErr != nil {
    return -1, restErr
  }

  _, err := txn.Stmt(createUserQuery).Exec(newID, user.AuthID, user.LegalID, user.LegalIDType, user.Active)
  if err != nil {
    log.Print(err)
		return -1, terror.ServerError("Failure creating user record.", err)
	}

  return newID, nil*/
  return 0, nil
}

const createUserStatement = `INSERT INTO users (id, auth_id, legal_id, legal_id_type, active) VALUES (?,?,?,?,?)`
var createUserQuery *sql.Stmt
func SetupDB(DB *sql.DB) {
  var err error
  if createUserQuery, err = DB.Prepare(createUserStatement); err != nil {
    log.Fatalf("mysql: prepare create user stmt: %v", err)
  }
}
