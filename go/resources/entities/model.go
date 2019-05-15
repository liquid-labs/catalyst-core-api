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
  Id          nulls.Int64  `json:"-"` // TODO: Id -> ID
  PubId       nulls.String `json:"pubId"` // TODO: PubId -> PubID
  LastUpdated nulls.Int64  `json:"lastUpdated"`
}

func NewEntity(id nulls.Int64, pubID nulls.String, lastUpdated nulls.Int64) *Entity {
  return &Entity{id, pubID, lastUpdated}
}

func CloneEntity(e *Entity) *Entity {
  return &Entity{e.Id, e.PubId, e.LastUpdated}
}

func (e *Entity) GetID() nulls.Int64 { return e.Id }
func (e *Entity) SetID(id nulls.Int64) { e.Id = id }

func (e *Entity) GetPubID() nulls.String { return e.PubId }
func (e *Entity) SetPubID(p nulls.String) { e.PubId = p }

func (e *Entity) GetLastUpdated() nulls.Int64 { return e.LastUpdated }
func (e *Entity) SetLastUpdated(t nulls.Int64) { e.LastUpdated = t }

// deprecated
func (e *Entity) Clone() *Entity {
  return &Entity{e.Id, e.PubId, e.LastUpdated}
}

// EntityIface is provided for extension by abstract entity types. In most
// situations you will use the Entity struct directly.
type EntityIface interface {
  GetID() nulls.Int64
  SetID(nulls.Int64)

  GetPubID() nulls.String
  SetPubID(nulls.String)

  GetLastUpdated() nulls.Int64
  SetLastUpdated(nulls.Int64)
}
