package locations
/*
import(
  "context"
  "database/sql"
  "errors"
  "log"
  "strings"

  "github.com/Liquid-Labs/go-nullable-mysql/nulls"
  "github.com/Liquid-Labs/go-rest/rest"
  "github.com/Liquid-Labs/terror/go/terror"
)*/

/**
 * For valid inputs, returns a Location. Currently doesn't try to find, always creates.
 */
 /*
func (loc *Location) FindOrCreate(ctx context.Context, txn *sql.Tx) (error) {
  if !loc.IsComplete() {
    return errors.New("Only complete locations may be created. Perhaps you forget to call 'CompleteLocation'?")
  }

  res, err := txn.Stmt(createQuery).Exec(loc.Address1, loc.Address2, loc.City, loc.State, loc.Zip, loc.Lat, loc.Lng)
  if err != nil {
    return err
  }

  newID, err := res.LastInsertId()
  if err != nil {
    return err
  }
  loc.LocationID = nulls.NewInt64(newID)

  return nil
}

func (addresses Addresses) CreateAddresses(entityID nulls.Int64, ctx context.Context, txn *sql.Tx) (terror.Terror) {
  for i, a := range addresses {
    if err := a.FindOrCreate(ctx, txn); err != nil {
      return rest.ServerError("Could not create loction record.", err)
    }
    _, err := txn.Stmt(insertAddressByIDQuery).Exec(entityID, a.LocationID, i, a.Label)
    if err != nil {
      return rest.ServerError("Could not insert address record.", err)
    }
  }
  return nil
}

func (addresses Addresses) Update(pubID string, ctx context.Context, txn *sql.Tx) (terror.Terror) {
  if _, err := txn.Stmt(resetAddressesQuery).Exec(pubID); err != nil {
    return rest.ServerError("Could not reset existing address records.", err)
  }

  for i, address := range addresses {
    // New incoming addresses from the API must have an integer value of some
    // sort (otherwise, they would fail to unmarshal from the JSON payload),
    // and indicate their newness by having a negative LocationID
    if !address.LocationID.Valid  || address.LocationID.Int64 < 0 {
      if err := address.FindOrCreate(ctx, txn); err != nil {
        return rest.ServerError("Could not create new location record.", err)
      }
    }
    _, err := txn.Stmt(insertAddressQuery).Exec(address.LocationID, i, address.Label, pubID)
    if err != nil {
      return rest.ServerError("Could not insert address records.", err)
    }
  }
  return nil
}

var commonFields = []string{`id`,`address1`,`address2`,`city`,`state`,`zip`,`lat`,`lng`}
func CommonFields(alias string) (string) {
  return alias + "." + strings.Join(commonFields, ", " + alias + ".") + " "
}

const createStatement = `INSERT INTO locations (address1, address2, city, state, zip, lat, lng) VALUES (?,?,?,?,?,?,?)`
const insertAddressStatement = `INSERT INTO entity_addresses (entity_id, location_id, idx, label) SELECT e.id,?,?,? FROM entities e WHERE e.pub_id=?`
const insertAddressByIDStatement = `INSERT INTO entity_addresses (entity_id, location_id, idx, label) VALUES (?,?,?,?)`
const resetAddressesStatement = `DELETE ea FROM entity_addresses ea JOIN entities e ON ea.entity_id=e.id WHERE e.pub_id=?`

var createQuery, insertAddressQuery, insertAddressByIDQuery, resetAddressesQuery *sql.Stmt
func SetupDB(DB *sql.DB) {
  var err error

  if createQuery, err = DB.Prepare(createStatement); err != nil {
    log.Fatalf("mysql: prepare create location stmt:\n%v\n%s", err, createStatement)
  }
  if insertAddressQuery, err = DB.Prepare(insertAddressStatement); err != nil {
    log.Fatalf("mysql: prepare insert address stmt:\n%v\n%s", err, insertAddressStatement)
  }
  if insertAddressByIDQuery, err = DB.Prepare(insertAddressByIDStatement); err != nil {
    log.Fatalf("mysql: prepare insert address by ID stmt:\n%v\n%s", err, insertAddressByIDStatement)
  }
  if resetAddressesQuery, err = DB.Prepare(resetAddressesStatement); err != nil {
    log.Fatalf("mysql: prepare clear addresses stmt:\n%v\n%s", err, resetAddressesStatement)
  }
}*/
