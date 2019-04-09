package handlers

import (
  "net/http"
  "reflect"

  "firebase.google.com/go/auth"

  "github.com/Liquid-Labs/catalyst-firewrap/go/fireauth"
  "github.com/Liquid-Labs/catalyst-core-api/go/restserv"
  "github.com/Liquid-Labs/go-nullable-mysql/nulls"
  "github.com/Liquid-Labs/go-rest/rest"
)

func BasicAuthCheck(w http.ResponseWriter, r *http.Request) (*auth.Token, rest.RestError) {
  authClient := r.Context().Value(restserv.FireauthKey).(*fireauth.ScopedClient)
  authToken, restErr := authClient.GetToken() // effectively checks if user authorized
  if restErr != nil {
    rest.HandleError(w, restErr)
    return nil, restErr
  }
  return authToken, nil
}

func CheckAndExtract(w http.ResponseWriter, r *http.Request, o interface {}, itemName string) (*auth.Token, rest.RestError) {
  if authToken, restErr := BasicAuthCheck(w, r); restErr != nil {
    return nil, restErr // response handled by BasicAuthCheck
  } else {
    if restErr := rest.ExtractJson(w, r, o, itemName); restErr != nil {
      return nil, restErr // response handled ExtractJson
    }
    return authToken, nil
  }
}

func doGeneric(w http.ResponseWriter, r *http.Request, dbFunc interface{}, input interface{}, itemName string, actionDesc string) {
  results := reflect.ValueOf(dbFunc).Call([]reflect.Value{reflect.ValueOf(input), reflect.ValueOf(r.Context())})
  data := results[0].Interface()
  restErr := results[1].Interface()
  if restErr != nil {
    rest.HandleError(w, restErr.(rest.RestError))
    return
  } else {
    rest.StandardResponse(w, data, itemName + ` ` + actionDesc + `.`, nil)
  }
}

func DoCreate(w http.ResponseWriter, r *http.Request, createFunc interface{}, data interface{}, itemName string) {
  doGeneric(w, r, createFunc, data, itemName, `created`)
}

func DoGetDetail(w http.ResponseWriter, r *http.Request, getFunc interface{}, id interface{}, itemName string) {
  doGeneric(w, r, getFunc, id, itemName, `retrieved`)
}

func DoUpdate(w http.ResponseWriter, r *http.Request, updateFunc interface{}, data interface{}, pubID string, itemName string) {
  if pubID != reflect.Indirect(reflect.ValueOf(data)).FieldByName(`PubId`).Interface().(nulls.String).String {
    rest.HandleError(w, rest.BadRequestError("The ID of the target resource and the data provided do not match.", nil))
    return
  }
  doGeneric(w, r, updateFunc, data, itemName, `updated`)
}
