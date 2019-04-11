package resources

import (
  "strconv"
  "strings"
  
  "github.com/Liquid-Labs/catalyst-core-api/go/resources/locations"
)

func PromoteChanges(addresses locations.Addresses, changeDescs []string) ([]string) {
  for i, address := range addresses {
    for _, changeDesc := range address.ChangeDesc {
      changeDesc = strings.TrimSuffix(changeDesc, `.`) + ` on address ` + strconv.Itoa(i + 1) + `.`
      changeDescs = append(changeDescs, changeDesc)
    }
  }

  return changeDescs
}
