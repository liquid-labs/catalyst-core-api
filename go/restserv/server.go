package restserv

import (
  "context"
  "fmt"
  "log"
  "net/http"
  "os"
  "time"

  "github.com/gorilla/mux"
  "github.com/Liquid-Labs/catalyst-core-api/go/entities"
  "github.com/Liquid-Labs/catalyst-core-api/go/locations"
  "github.com/Liquid-Labs/catalyst-firewrap/go/firewrap"
  "github.com/Liquid-Labs/catalyst-firewrap/go/fireauth"
  "github.com/Liquid-Labs/go-api/sqldb"
  "github.com/Liquid-Labs/go-rest/rest"
  "github.com/rs/cors"
)

var envPurpose = os.Getenv(`NODE_ENV`)
func GetEnvPurpose() string {
  if envPurpose == "" {
    return `test` // TODO: justify this assumption or change to unknown
  } else {
    return envPurpose
  }
}

type fireauthKey string
const FireauthKey fireauthKey = fireauthKey("fireauth")

func addFireauthMw(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    if fireauth, restErr := fireauth.GetClient(r); restErr != nil {
      log.Print("Failed to get auth client.")
      rest.HandleError(w, restErr)
    } else {
      next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), FireauthKey, fireauth)))
    }
  })
}

type InitAPI func(r *mux.Router)
var initApiFuncs = make([]InitAPI, 0, 8)

func RegisterResource(initApi InitAPI) {
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
  firewrap.Setup()

  sqldb.RegisterSetup(entities.SetupDB, locations.SetupDB)
  sqldb.InitDB()

  r := mux.NewRouter()
  r.Use(addFireauthMw)
  apiR := r.PathPrefix("/api/").Subrouter()
  // r.Use(contextualMw)
  for _, initApi := range initApiFuncs {
    if initApi != nil {
      initApi(apiR)
    }
  }

  if envPurpose != "production" {
    // 'cors.Default().Handler(r)' is not sufficient. Don't remember why
    // exactly. I believe it didn't support our headers?
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

  // For debugging route configurations:
  // r.Walk(routerReporter)

  host := ""
  if envPurpose == "test" || envPurpose == "development" {
    host = "localhost"
    log.Printf("Binding to 'localhost' only for '%s'", envPurpose)
  }

  port := os.Getenv("PORT")
  if port == "" {
    port = "8080"
    log.Printf("Defaulting to port %s", port)
  }

  log.Printf("Listening on port %s", port)
  srv := &http.Server{
    Handler:      r,
    Addr:         fmt.Sprintf("%s:%s", host, port),
    // Good practice: enforce timeouts for servers you create!
    WriteTimeout: 10 * time.Second,
    ReadTimeout:  10 * time.Second,
  }

  log.Fatal(srv.ListenAndServe())
}
