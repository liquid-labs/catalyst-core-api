package locations

import (
  "context"
  "errors"
  "fmt"

  "github.com/Liquid-Labs/go-nullable-mysql/nulls"

  "googlemaps.github.io/maps"
)

func checkType(component maps.AddressComponent, tests ...string) (bool) {
  for _, t := range component.Types {
    found := false
    for _, test := range tests {
      if t == test {
        found = true
        break
      }
    }
    if !found {
      return false
    }
  }
  return true
}

func (loc *Location) checkFieldMatch(fieldName string, field *nulls.String, canonicalValue string) {
  if (field.String != canonicalValue) {
    origValue := field.String
    field.String = canonicalValue
    field.Valid = true // already true under typical usage

    loc.ChangeDesc = append(loc.ChangeDesc,
      fmt.Sprintf("Changed '%s' from '%s' to '%s'.", fieldName, origValue, canonicalValue))
  }
}

/**
 * Given a complete set of "address componens" and incomplete "lat/lng"
 */ // TODO: return a RestError so we can distinguish between server error (getting the maps.Client) and unprocessible entity (invalid address)
func (loc *Location) CompleteLocation(ctx context.Context) (bool, error) {
  if loc.IsComplete() { // nothing to do
    return false, nil
  } else if loc.IsAddressComplete() && loc.IsLatLngEmpty() {
    mapsClient, err := MapsClient()
    if err != nil {
      return false, err
    }
    addressString, _ := loc.AddressString() // we've already checked address is complete, so will never get error
    req := maps.GeocodingRequest{Address: addressString}

    if results, err := mapsClient.Geocode(ctx, &req); err != nil {
      return false, err
    } else if len(results) > 1 {
      return false, errors.New("Geocoding results ambiguous for given address.")
    } else if len(results) == 0 {
      return false, errors.New("No results nor error returned for geocoding request. (Very unexpected.)")
    } else {
      result := results[0]
      // First, set the lat/lang
      latLng := result.Geometry.Location
      loc.Lat = nulls.NewFloat64(latLng.Lat)
      loc.Lng = nulls.NewFloat64(latLng.Lng)


      var strNo, strName string
      for _, component := range result.AddressComponents {
        if checkType(component, "street_number") {
          strNo = component.ShortName
        } else if checkType(component, "route") {
          strName = component.ShortName
        } else if checkType(component, "locality", "political") {
          loc.checkFieldMatch(`city`, &loc.City, component.ShortName)
        } else if checkType(component, "administrative_area_level_1", "political") {
          loc.checkFieldMatch(`state`, &loc.State, component.ShortName)
        } else if checkType(component, "postal_code") {
          loc.checkFieldMatch(`zip`, &loc.Zip, component.LongName)
        }
      }

      if strNo != "" && strName != "" {
        loc.checkFieldMatch(`address 1`, &loc.Address1, strNo + " " + strName)
      }

      if !loc.IsAddressComplete() {
        return false, errors.New("Was not able to determine full addres based on lat/lng coordinates.")
      } else {
        return true, nil
      }
    }
  } else if loc.IsLatLngComplete() && loc.IsAddressEmpty() {
    return false, errors.New("Reverse-geocoding not currently supported.")
  } else {
    return false, errors.New("Location must fully define address or lat+lng components in order to complete the other, which must be entirely undefined.")
  }
}

func (addresses Addresses) CompleteAddresses(ctx context.Context) (bool, error) {
  var someCompleted bool = false
  for _, add := range addresses {
    completed, err := add.CompleteLocation(ctx)
    someCompleted = someCompleted || completed
    if err != nil {
      return someCompleted, err
    }
  }

  return someCompleted, nil
}
