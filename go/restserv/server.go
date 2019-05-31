package restserv

import (
  "context"
  "fmt"
  "log"
  "net/http"
  "os"
  "time"

  "github.com/gorilla/mux"
  "github.com/gorilla/handlers"
  "github.com/Liquid-Labs/catalyst-firewrap/go/firewrap"
  "github.com/Liquid-Labs/catalyst-firewrap/go/fireauth"
  "github.com/Liquid-Labs/go-rest/rest"
)

var envPurpose = os.Getenv(`NODE_ENV`)
func GetEnvPurpose() string {
  if envPurpose == "" {
    return `test` // TODO: justify this assumption or change to unknown
  } else {
    return envPurpose
  }
}

type authTokenKey string
const AuthTokenKey authTokenKey = authTokenKey(`authToken`)

func setAuthorizationContext(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    if fireauth, restErr := fireauth.GetClient(r); restErr != nil {
      rest.HandleError(w, restErr)
    } else {
      authToken, restErr := fireauth.GetToken()
      if restErr != nil {
        rest.HandleError(w, restErr)
        return nil, restErr
      }

      next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), AuthTokenKey, authToken)))
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

  r := mux.NewRouter()
  r.Use(setAuthorizationContext)
  apiR := r.PathPrefix("/api/").Subrouter()
  // r.Use(contextualMw)
  for _, initApi := range initApiFuncs {
    if initApi != nil {
      initApi(apiR)
    }
  }

  var handler http.Handler = r
  if envPurpose != "production" {
    log.Print("setting up CORS support for non-production environment\n")
    handler = handlers.CORS(
      handlers.AllowedOrigins([]string{"*"}),
      // appendeds to the default allowed headers
      handlers.AllowedHeaders([]string{"Authorization", "Content-Type"}),
      // replaces the default allowed methods
      handlers.AllowedMethods([]string{"GET", "POST", "PUT", "HEAD"}),
    )(r)
  }/* else {
    http.Handle("/", r)
  }*/

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
    Handler:      handler,
    Addr:         fmt.Sprintf("%s:%s", host, port),
    // Good practice: enforce timeouts for servers you create!
    WriteTimeout: 10 * time.Second,
    ReadTimeout:  10 * time.Second,
  }

  log.Fatal(srv.ListenAndServe())
}
