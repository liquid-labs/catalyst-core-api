package locations

/**
 * Defines basic struct (Go and JSON) and simple data maniplations for locations
 * resource.
 */

import (
  "bytes"
  "errors"

  "github.com/Liquid-Labs/go-nullable-mysql/nulls"
)

type Location struct {
  LocationId nulls.Int64   `json:"locationId"`
  Address1   nulls.String  `json:"address1"`
  Address2   nulls.String  `json:"address2"`
  City       nulls.String  `json:"city"`
  State      nulls.String  `json:"state"`
  Zip        nulls.String  `json:"zip,string"`
  Lat        nulls.Float64 `json:"lat"`
  Lng        nulls.Float64 `json:"lng"`
  ChangeDesc []string    `json:"changeDesc,omitempty"`
}

type Address struct {
  Location
  Idx      nulls.Int64   `json:"idx"`
  Label    nulls.String  `json:"label"`
}

type Addresses []*Address

func (loc *Location) addressComponents() ([]nulls.Nullable) {
  return []nulls.Nullable{
    &loc.Address1,
    &loc.City,
    &loc.State,
    &loc.Zip,
  }
}

func (loc *Location) latLngComponents() ([]nulls.Nullable) {
  return []nulls.Nullable{
    &loc.Lat,
    &loc.Lng,
  }
}

func (loc *Location) completionFields() ([]nulls.Nullable) {
  return []nulls.Nullable{
    &loc.Address1,
    &loc.City,
    &loc.State,
    &loc.Zip,
    &loc.Lat,
    &loc.Lng,
  }
}

func (loc *Location) AddressString() (string, error) {
  if !loc.IsAddressComplete() {
    return "", errors.New("Cannot generate address string from incomplete address components.")
  }
  var buffer bytes.Buffer

  buffer.WriteString(loc.Address1.String)
  if loc.Address2.Valid {
    buffer.WriteString("; ")
    buffer.WriteString(loc.Address2.String)
  }
  buffer.WriteString(", ")
  buffer.WriteString(loc.City.String)
  buffer.WriteString(", ")
  buffer.WriteString(loc.State.String)
  buffer.WriteString(" ")
  buffer.WriteString(loc.Zip.String)

  return buffer.String(), nil
}

func (loc *Location) IsComplete() (bool) {
  for _, nullable := range loc.completionFields() {
    if nullable == nil || nullable.IsEmpty() {
      return false
    }
  }
  return true
}

func (loc *Location) IsAddressComplete() (bool) {
  for _, nullable := range loc.addressComponents() {
    if nullable == nil || nullable.IsEmpty() {
      return false
    }
  }
  return true
}

func (loc *Location) IsAddressEmpty() (bool) {
  for _, nullable := range loc.addressComponents() {
    if nullable != nil && !nullable.IsEmpty() {
      return false
    }
  }
  return true
}

func (loc *Location) IsLatLngComplete() (bool) {
  for _, nullable := range loc.latLngComponents() {
    if nullable == nil || nullable.IsEmpty() {
      return false
    }
  }
  return true
}


func (loc *Location) IsLatLngEmpty() (bool) {
  for _, nullable := range loc.latLngComponents() {
    if nullable != nil && !nullable.IsEmpty() {
      return false
    }
  }
  return true
}
