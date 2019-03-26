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
  Active      nulls.Bool `json:"active"`
}

func (u *User) Clone() *User {
  return &User{Entity: *u.Entity.Clone(), AuthId: u.AuthId, Active: u.Active}
}

func (u *User) SetActive(val bool) {
  u.Active = nulls.NewBool(val)
}
