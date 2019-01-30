package restserv

import (
  "database/sql"
  "fmt"
  "log"
  "net/http"
  "os"

  "github.com/gorilla/mux"
  _ "github.com/go-sql-driver/mysql"
  "github.com/Liquid-Labs/catalyst-core-api/go/entities"
  "github.com/Liquid-Labs/catalyst-core-api/go/locations"
  "github.com/Liquid-Labs/catalyst-firewrap/go/firewrap"
  "github.com/Liquid-Labs/catalyst-firewrap/go/fireauth"
  "github.com/Liquid-Labs/go-rest/rest"
  "github.com/rs/cors"
)

func mustGetenv(k string) string {
  v := os.Getenv(k)
  if v == "" {
    log.Panicf("%s environment variable not set.", k)
  }
  return v
}

var envPurpose = os.Getenv(`NODE_ENV`)
func GetEnvPurpose() string {
  if envPurpose == "" {
    return `test` // TODO: justify this assumption or change to unknown
  } else {
    return envPurpose
  }
}


func CommonHandler(handler func(*fireauth.ScopedClient, http.ResponseWriter, *http.Request)) (func(http.ResponseWriter, *http.Request)) {
  return func(w http.ResponseWriter, r *http.Request) {
    if fireauth, restErr := fireauth.GetClient(r); restErr != nil {
      rest.HandleError(w, restErr)
    } else {
      handler(fireauth, w, r)
      // TODO: it would be cool to verify that auth has been checked
    }
  }
}

var firebaseDbUrl = mustGetenv("FIREBASE_DB_URL")

var DB *sql.DB

func initDb() {
  var (
    connectionName = mustGetenv("CAT_SCRIPT_CORE_API_CLOUDSQL_CONNECTION_NAME")
    connectionProt = mustGetenv("CAT_SCRIPT_CORE_API_CLOUDSQL_CONNECTION_PROT")
    user           = mustGetenv("CAT_SCRIPT_CORE_API_CLOUDSQL_USER")
    password       = mustGetenv("CAT_SCRIPT_CORE_API_CLOUDSQL_PASSWORD") // NOTE: password may NOT be empty
    dbName         = mustGetenv("CAT_SCRIPT_CORE_API_CLOUDSQL_DB")
  )
  var dsn string = fmt.Sprintf("%s:%s@%s(%s)/%s", user, password, connectionProt, connectionName, dbName)

  var err error
  DB, err = sql.Open("mysql", dsn)
  if err != nil {
    log.Panicf("Could not open db: %v", err)
  }
}

type InitDB func(db *sql.DB)
type InitAPI func(r *mux.Router)
var initDbFuncs = make([]InitDB, 0, 8)
var initApiFuncs = make([]InitAPI, 0, 8)

func RegisterResource(initDb InitDB, initApi InitAPI) {
  initDbFuncs = append(initDbFuncs, initDb)
  initApiFuncs = append(initApiFuncs, initApi)
}

/*
// TODO: wish I had a note for why this is here; is it still necessary now that appengine uses standard Go?
// I believe it's no longer necessary.
func contextualMw(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    // It's important to copy in the existing context data. E.g., mux uses it
    // for 'mux.Vars'.
    ctx := appengine.WithContext(r.Context(), r)
    next.ServeHTTP(w, r.WithContext(ctx))
  })
}*/

func Init() {
  firewrap.Setup(firebaseDbUrl)

  initDb()
  entities.SetupDb(DB)
  locations.SetupDb(DB)
  for _, initDb := range initDbFuncs {
    initDb(DB)
  }

  r := mux.NewRouter()
  // r.Use(contextualMw)
  for _, initApi := range initApiFuncs {
    initApi(r)
  }

  if GetEnvPurpose() != "production" {
    // 'cors.Default().Handler(r)' is not sufficient. Don't remember why
    // exactly.
    handler := cors.New(cors.Options{
      AllowedOrigins: []string{"*"},
      // Notice we don't use delete
      AllowedMethods: []string{"GET", "POST", "PUT", "OPTIONS"},
      AllowedHeaders: []string{"Authorization","Content-Type"},
      }).Handler(r)
    http.Handle("/", handler)
  } else {
    http.Handle("/", r)
  }
}
