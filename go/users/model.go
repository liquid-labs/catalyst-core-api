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
  Active      nulls.Bool `json:"active"`
}

func (u *User) SetActive(val bool) {
  u.Active = nulls.NewBool(val)
}
