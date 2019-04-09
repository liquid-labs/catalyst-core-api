package users_test

import (
  "reflect"
  "testing"

  . "github.com/Liquid-Labs/catalyst-core-api/go/users"
  "github.com/Liquid-Labs/catalyst-core-api/go/entities"
  "github.com/Liquid-Labs/go-nullable-mysql/nulls"
  "github.com/stretchr/testify/assert"
)

func TestUsersClone(t *testing.T) {
  orig := &User{
    entities.Entity{nulls.NewInt64(1),
      nulls.NewString(`abc`),
      nulls.NewInt64(2)},
    nulls.NewString(`my-auth-id`),
    nulls.NewString(`555-55-5555`),
    nulls.NewString(`SSN`),
    nulls.NewBool(true),
  }
  clone := orig.Clone()
  assert.Equal(t, orig, clone, "Clone does not match.")

  clone.Id = nulls.NewInt64(3)
  clone.PubId = nulls.NewString(`def`)
  clone.LastUpdated = nulls.NewInt64(4)
  clone.AuthId = nulls.NewString(`another-auth-id`)
  clone.LegalID = nulls.NewString(`56-565-5656`)
  clone.LegalIDType = nulls.NewString(`EIN`)
  clone.Active = nulls.NewBool(false)

  oReflection := reflect.ValueOf(orig).Elem()
  cReflection := reflect.ValueOf(clone).Elem()
  for i := 0; i < oReflection.NumField(); i++ {
    assert.NotEqualf(
      t,
      oReflection.Field(i).Interface(),
      cReflection.Field(i).Interface(),
      `Fields '%s' unexpectedly match.`,
      oReflection.Type().Field(i),
    )
	}
}
