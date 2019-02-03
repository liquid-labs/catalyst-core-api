package restserv

import (
  "log"
  
  "github.com/gorilla/mux"
)

func routerReporter(route *mux.Route, router *mux.Router, ancestors []*mux.Route) error {
  pRegEx, _ := route.GetPathRegexp()
  pTemplate, _ := route.GetPathTemplate()
  pName, _ := route.GetPathTemplate()
  log.Printf("Route: %s\n\tRegex: %s\n\tTemplate: %s", pName, pRegEx, pTemplate)

  return nil
}
