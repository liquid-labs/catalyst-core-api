package users

/**
 * Defines basic struct (Go and JSON) for Users.
 */

import (
  "github.com/Liquid-Labs/catalyst-core-api/go/entities"
  "github.com/Liquid-Labs/go-nullable-mysql/nulls"
)

type User struct {
  entities.Entity
  AuthId      nulls.String `json:"authId"`
  LegalID     nulls.String `json:"legalID"`
  LegalIDType nulls.String `json:"legalIDType"`
  Active      nulls.Bool `json:"active"`
}

func (u *User) SetLegalID(id string, idType string) {
  u.LegalID = nulls.NewString(id)
  u.LegalIDType = nulls.NewString(idType)
}

func (u *User) ClearLegalID() {
  u.LegalID = nulls.NewNullString()
  u.LegalIDType = nulls.NewNullString()
}

func (u *User) SetActive(val bool) {
  u.Active = nulls.NewBool(val)
}

func (u *User) Clone() *User {
  return &User{*u.Entity.Clone(), u.AuthId, u.LegalID, u.LegalIDType, u.Active}
}
