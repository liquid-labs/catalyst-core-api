/**
 * FetchBuilder creates thunk-able redux action which makes a remote call to a
 * URL to create, retrieve, update, and delete resources. This is effectively an
 * isolated library used by 'resourceActions' and is not currently exported by
 * the 'resources/index' file.
 */
import * as cache from './cache'
import * as routes from '../routes'
import * as settings from './settings'

const AUTH_TOKEN_REQUIRED = 1
const AUTH_TOKEN_OPTIONAL = 2

class FetchBuilder {
  constructor(source) {
    this.source = source
    const resource = routes.extractResource(source)
    const baseURL = settings.getResourcesMap()[resource].baseURL
    this.url = baseURL + source
    this.method = 'GET' // default method if none specified
    this.isForced = false // by default we do not force the fetch
    this.authTokenRequirement = AUTH_TOKEN_OPTIONAL
  }
  forPost() {
    this.method = 'POST'
    return this
  }
  forPut() {
    this.method = 'PUT'
    return this
  }
  forDelete() {
    this.method = 'DELETE'
    return this
  }
  withJson(data) {
    this.payload = JSON.stringify(data)
    this.contentType = 'application/json'
    return this
  }
  withAuthTokenRequirement(authTokenRequirement) {
    this.authTokenRequirement = authTokenRequirement
    return this
  }
  withAuthToken(authToken) {
    this.authToken = authToken
    console.log("fetchbuldier withAuthToken: ", authToken, this.authToken)
    return this
  }
  withRequestAction(requestAction) {
    this.requestAction = requestAction
    return this
  }
  withSuccessAction(successAction) {
    this.successAction = successAction
    return this
  }
  withFailureAction(failureAction) {
    this.failureAction = failureAction
    return this
  }
  withValidator(validator) {
    this.validator = validator
    return this
  }
  withInFlightCheck() {
    this.checkInFlight = true
    return this
  }
  withPreFlightCheck(func) {
    this.preFlightCheck = func
    return this
  }
  force() {
    this.isForced = true
    return this
  }

  build() {
    if (!this.successAction) {
      throw new Error("No success handler defined.")
    }

    return (dispatch, getState) => {
      if (this.checkInFlight) {
        // Preflight checks:
        // 1) Are we already fetching?
        if (cache.isFetching(this.source)) {
          return Promise.resolve(null)
        }
        // 2) Is the source in permanent error?
        if (!this.isForced) {
          const permanentError =
            cache.sourcePermanentError(this.source)
          if (permanentError) {
            const msg = `${permanentError.message} (${this.source})`
            settings.invokeErrorHandler(msg)
            return Promise.resolve(null)
          }
        }
      }
      if (this.checkPreflight && !this.checkPreFlight()) {
        return Promise.resolve(null)
      }

      // Ready to go!
      // 1) Dispatch the 'REQUEST' action.
      if (this.requestAction) dispatch(this.requestAction.call(null, this.source))

      // 2) Prepare to issue the async call.
      // 2a) Prepare the auth header.
      const headers = {}
      if (this.authTokenRequirement == AUTH_TOKEN_REQUIRED
          || (this.authTokenRequirement == AUTH_TOKEN_OPTIONAL
              && this.authToken)) {
        if (!this.authToken) {
          const msg = `Request to '${this.url}' requires authentication.`
          settings.invokeErrorHandler(msg)
          return Promise.resolve(null)
        }
        headers['Authorization'] = `Bearer ${this.authToken}`
      }
      // 2b) Set the basic options.
      const fetchOptions = {
        method  : this.method,
        headers : headers
      }
      // 2c) Setup the cors policy based on production or dev context.
      //     Note: 'production' here just means "in the cloud", and would
      //     include cloud-based test, integration, beta, etc.
      if (process.env.NODE_ENV !== 'production') {
        fetchOptions.mode = 'cors'
      }
      else {
        fetchOptions.mode = 'same-origin'
      }
      // 2d) Set payload info.
      if (this.payload) {
        fetchOptions.body = this.payload
        headers['Content-Type'] = this.contentType
      }

      // 3) Do the fetch and return the Promise.
      return fetch(this.url, fetchOptions) // eslint-disable-line no-undef
        .then(response => {
          if(response.ok){
            return response.json().then(data => {
              let error
              if (!this.validator || !(error = this.validator(data))) {
                console.log('success with: ', data)
                return dispatch(this.successAction.call(null, data, this.source))
              }
              else {
                console.log('validation error: ', error)
                return dispatch(this.failureAction.call(null,
                  error,
                  response.status,
                  this.source))
              }
            })
          }
          else{
            // TODO: support JSON errors with fallback
            return response.text().then(errorText => {
              if (this.failureAction) {
                return dispatch(this.failureAction.call(null,
                  errorText,
                  response.status,
                  this.source))
              }
            })
          }
        })
        .catch((error) => {
          console.warn(`Error in fetch: ${error}`) // eslint-disable-line no-console
          if (this.failureAction) {
            return dispatch(this.failureAction.call(null,
              error + "",
              500,
              this.source))
          }
        })
    }
  }
}

export { FetchBuilder }
