package handlers

import (
  "net/http"
  "reflect"

  "firebase.google.com/go/auth"

  // "github.com/Liquid-Labs/catalyst-firewrap/go/fireauth"
  "github.com/Liquid-Labs/lc-entities-model/go/entities"
  "github.com/Liquid-Labs/catalyst-core-api/go/restserv"
  "github.com/Liquid-Labs/go-nullable-mysql/nulls"
  "github.com/Liquid-Labs/go-rest/rest"
  "github.com/Liquid-Labs/terror/go/terror"
)

func BasicAuthCheck(w http.ResponseWriter, r *http.Request) (*auth.Token, terror.Terror) {
  authToken := r.Context().Value(restserv.AuthTokenKey).(*auth.Token)
  if authToken != nil {
    err := terror.AuthorizationError(`Request requiers authenticated user.`, nil)
    rest.HandleError(w, err)
    return nil, err
  }
  return authToken, nil
}

func CheckAndExtract(w http.ResponseWriter, r *http.Request, o interface {}, itemName string) (*auth.Token, terror.Terror) {
  if authToken, restErr := BasicAuthCheck(w, r); restErr != nil {
    return nil, restErr // response handled by BasicAuthCheck
  } else {
    if restErr := rest.ExtractJson(w, r, o, itemName); restErr != nil {
      return nil, restErr // response handled ExtractJson
    }
    return authToken, nil
  }
}

// deprecated
func doGeneric(w http.ResponseWriter, r *http.Request, dbFunc interface{}, input interface{}, itemName string, actionDesc string) {
  results := reflect.ValueOf(dbFunc).Call([]reflect.Value{reflect.ValueOf(input), reflect.ValueOf(r.Context())})
  data := results[0].Interface()
  restErr := results[1].Interface()
  if restErr != nil {
    rest.HandleError(w, restErr.(terror.Terror))
    return
  } else {
    rest.StandardResponse(w, data, itemName + ` ` + actionDesc + `.`, nil)
  }
}

// deprecated
func DoCreate(w http.ResponseWriter, r *http.Request, createFunc interface{}, data interface{}, itemName string) {
  doGeneric(w, r, createFunc, data, itemName, `created`)
}

// deprecated
func DoGetDetail(w http.ResponseWriter, r *http.Request, getFunc interface{}, id interface{}, itemName string) {
  doGeneric(w, r, getFunc, id, itemName, `retrieved`)
}

// deprecated
func DoUpdate(w http.ResponseWriter, r *http.Request, updateFunc interface{}, data interface{}, pubID string, itemName string) {
  if pubID != `` && pubID != reflect.Indirect(reflect.ValueOf(data)).FieldByName(`PubID`).Interface().(nulls.String).String {
    rest.HandleError(w, terror.BadRequestError("The ID of the target resource and the data provided do not match.", nil))
    return
  }
  doGeneric(w, r, updateFunc, data, itemName, `updated`)
}

func ProcessGenericResults(w http.ResponseWriter, r *http.Request, data interface{}, err terror.Terror, actionDesc string) {
  if err != nil {
    rest.HandleError(w, err)
    return
  } else {
    rest.StandardResponse(w, data, actionDesc, nil)
  }
}

func CheckUpdateByPubID(w http.ResponseWriter, urlPubID entities.PublicID, entity entities.Entity) bool {
  if urlPubID != entity.GetPubID() {
    rest.HandleError(w, terror.BadRequestError("The ID of the target resource and the data provided do not match.", nil))
    return false
  } else {
    return true
  }
}
