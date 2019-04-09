package entities_test

import (
  "testing"

  . "github.com/Liquid-Labs/catalyst-core-api/go/entities"
  "github.com/Liquid-Labs/go-nullable-mysql/nulls"
  "github.com/stretchr/testify/assert"
)

func TestEntitiesClone(t *testing.T) {
  orig := &Entity{nulls.NewInt64(1), nulls.NewString(`abc`), nulls.NewInt64(2)}
  clone := orig.Clone()
  assert.Equal(t, orig, clone, "Clone does not match.")
  clone.Id = nulls.NewInt64(3)
  clone.PubId = nulls.NewString(`def`)
  clone.LastUpdated = nulls.NewInt64(4)
  assert.Equal(t, int64(1), orig.Id.Int64, `Unexpected orig ID.`)
  assert.Equal(t, `abc`, orig.PubId.String, `Unexpected orig PubID.`)
  assert.Equal(t, int64(2), orig.LastUpdated.Int64, `Unexpected orig LastUpdated.`)
  assert.Equal(t, int64(3), clone.Id.Int64, `Unexpected clone ID.`)
  assert.Equal(t, `def`, clone.PubId.String, `Unexpected clone PubID.`)
  assert.Equal(t, int64(4), clone.LastUpdated.Int64, `Unexpected clone LastUpdated.`)
}
