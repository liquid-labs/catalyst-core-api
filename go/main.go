package main

import (
  "fmt"
  "net/http"

  "github.com/gorilla/mux"
  "github.com/Liquid-Labs/catalyst-core-api/go/restserv"
)

func pingHandler(w http.ResponseWriter, r *http.Request) {
  fmt.Fprint(w, "root alive!\n")
}

func InitAPI(r *mux.Router) {
  r.HandleFunc("/", pingHandler).Methods("PING")
}

func main() {
  restserv.RegisterResource(nil, InitAPI)
  restserv.Init()
}
