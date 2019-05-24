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
  ID               nulls.Int64  `json:"-"`
  PubID            nulls.String `json:"pubId"`
  OwnerID          nulls.Int64  `json:"-"`
  OwnerPubID       nulls.String `json:"ownerPubId"`
  PubliclyReadable nulls.Bool   `json:"publiclyReadable"`
  LastUpdated      nulls.Int64  `json:"lastUpdated"`
}

func NewEntity(id nulls.Int64, pubID nulls.String, ownerID nulls.Int64,
    ownerPubID nulls.String, publiclyReadable nulls.Bool, lastUpdated nulls.Int64) *Entity {
  return &Entity{id, pubID, ownerID, ownerPubID, publiclyReadable, lastUpdated}
}

func (e *Entity) Clone() *Entity {
  return &Entity{e.ID, e.PubID, e.OwnerID, e.OwnerPubID, e.PubliclyReadable, e.LastUpdated}
}

func (e *Entity) GetID() nulls.Int64 { return e.ID }

func (e *Entity) GetPubID() nulls.String { return e.PubID }

func (e *Entity) GetOwnerID() nulls.Int64 { return e.OwnerID }

func (e *Entity) GetOwnerPubID() nulls.String { return e.OwnerPubID }
func (e *Entity) SetOwnerPubID(pid nulls.String) { e.OwnerPubID = pid }

func (e *Entity) IsPubliclyReadable() nulls.Bool { return e.PubliclyReadable }
func (e *Entity) SetPubliclyReadable(r nulls.Bool) { e.PubliclyReadable = r }

func (e *Entity) GetLastUpdated() nulls.Int64 { return e.LastUpdated }

// EntityIface is provided for extension by abstract entity types. In most
// situations you will use the Entity struct directly.
type EntityIface interface {
  GetID() nulls.Int64

  GetPubID() nulls.String

  GetOwnerID() nulls.String
  // The owner ID is always set based on the OwnerPubID when storing.

  GetOwnerPubID() nulls.String
  SetOwnerPubID(nulls.String)

  IsPubliclyReadable() nulls.Bool
  SetPubliclyReadable(nulls.Bool)

  GetLastUpdated() nulls.Int64
}
