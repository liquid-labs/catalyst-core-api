package entities_test

import (
  "reflect"
  "testing"

  . "github.com/Liquid-Labs/catalyst-core-api/go/resources/entities"
  "github.com/Liquid-Labs/go-nullable-mysql/nulls"
  "github.com/stretchr/testify/assert"
)

func TestEntitiesClone(t *testing.T) {
  orig := &Entity{nulls.NewInt64(1), nulls.NewString(`abc`), nulls.NewInt64(10),
    nulls.NewString(`xyz`), nulls.NewBool(true), nulls.NewInt64(2)}
  clone := orig.Clone()

  assert.Equal(t, orig, clone, "Clone does not match.")

  clone.ID = nulls.NewInt64(3)
  clone.PubID = nulls.NewString(`def`)
  clone.OwnerID = nulls.NewInt64(11)
  clone.OwnerPubID = nulls.NewString(`pqr`)
  clone.PubliclyReadable = nulls.NewBool(false)
  clone.LastUpdated = nulls.NewInt64(4)
  // TODO: abstract this
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
