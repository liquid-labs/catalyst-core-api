package locations_test

import (
  "reflect"
  "testing"

  . "github.com/Liquid-Labs/catalyst-core-api/go/resources/locations"
  "github.com/Liquid-Labs/go-nullable-mysql/nulls"
  "github.com/stretchr/testify/assert"
)

func TestLocationsClone(t *testing.T) {
  orig := &Location{
    nulls.NewInt64(1),
    nulls.NewString(`a`),
    nulls.NewString(`b`),
    nulls.NewString(`c`),
    nulls.NewString(`d`),
    nulls.NewString(`e`),
    nulls.NewFloat64(2.0),
    nulls.NewFloat64(3.0),
    []string{`f`, `g`},
  }
  clone := orig.Clone()
  assert.Equal(t, orig, clone, "Clone does not match.")

  clone.LocationId = nulls.NewInt64(2)
  clone.Address1 = nulls.NewString(`z`)
  clone.Address2 = nulls.NewString(`y`)
  clone.City = nulls.NewString(`x`)
  clone.State = nulls.NewString(`w`)
  clone.Zip = nulls.NewString(`u`)
  clone.Lat = nulls.NewFloat64(4.0)
  clone.Lng = nulls.NewFloat64(5.0)
  clone.ChangeDesc = []string{`t`}

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
