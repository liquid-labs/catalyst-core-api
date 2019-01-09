package entities

/**
 * Defines basic struct (Go and JSON) for entities.
 */

import (
  "github.com/Liquid-Labs/go-nullable-mysql/nulls"
)

type Entity struct {
  // Note, the ID is for internal use only and may or may not be set depending
  // in the source of the item (client or backend).
  Id          nulls.Int64  `json:"-"`
  PubId       nulls.String `json:"pubId"`
  LastUpdated nulls.Int64  `json:"lastUpdated"`
}
