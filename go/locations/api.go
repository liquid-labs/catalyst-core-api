package locations

import (
  "log"
  "net/http"
  "os"

  "github.com/gorilla/mux"
  "googlemaps.github.io/maps"
)

const apiKeyVar string = "CATALYST_CORE_API_GOOGLE_MAPS_API_KEY"
var googleApiKey string

func InitAPI(r *mux.Router) {
   googleApiKey = os.Getenv(apiKeyVar)
   if googleApiKey == "" {
     log.Panicf("'locations' requires missing Google API key for Maps access (%s).", apiKeyVar)
   }
}

func MapsClient() (*maps.Client, error) {
  uc := &http.Client{}
  options := []maps.ClientOption {
    maps.WithHTTPClient(uc),
    maps.WithAPIKey(googleApiKey),
  }

  return  maps.NewClient(options...)
}
