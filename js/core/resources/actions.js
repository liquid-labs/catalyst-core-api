/**
 * Resource actions defines the internal redux actions dispatched to the
 * resources reducer. This includes synchronous actions which update the state
 * immediately and asynchrous which attempt to fetch (update, create, etc.)
 * resources through REST-ful API calls.
 *
 * These actions are wrapped by the public 'resoruces' API, which calls the
 * asynchronous action. The asynchronous actions have the general form of:
 *
 * 1) Synchronously dispatch the 'XXX_REQUEST' action to store that the request
 *    is "in-flight". The application can then show the appropriate "loading"
 *    feedback.
 * 2) Asynchronously make issue the REST-ful call.
 * 3) After resolution of the asynchronous call, dispatch the XXX_SUCCESS or
 *    XXX_FAILURE action to the reducer and thus update the underlying store
 *    with the results.
 */
import * as cache from './cache'
import { FetchBuilder } from './FetchBuilder'

// 1) Define the action types. These are exported for use in the reducer.
// 2) Define the synchronous actions. These are interal.
// 3) Define the asynchronous actions. These are used by the code.

export const FETCH_LIST_REQUEST = 'FETCH_LIST_REQUEST'
export const FETCH_LIST_SUCCESS = 'FETCH_LIST_SUCCESS'
export const FETCH_LIST_FAILURE = 'FETCH_LIST_FAILURE'

export const FETCH_ITEM_REQUEST = 'FETCH_ITEM_REQUEST'
export const FETCH_ITEM_SUCCESS = 'FETCH_ITEM_SUCCESS'
export const FETCH_ITEM_FAILURE = 'FETCH_ITEM_FAILURE'

export const ADD_ITEM_REQUEST = 'ADD_ITEM_REQUEST'
export const ADD_ITEM_SUCCESS = 'ADD_ITEM_SUCCESS'
export const ADD_ITEM_FAILURE = 'ADD_ITEM_FAILURE'

export const UPDATE_ITEM_REQUEST = 'UPDATE_ITEM_REQUEST'
export const UPDATE_ITEM_SUCCESS = 'UPDATE_ITEM_SUCCESS'
export const UPDATE_ITEM_FAILURE = 'UPDATE_ITEM_FAILURE'

export const DELETE_ITEM_REQUEST = 'DELETE_ITEM_REQUEST'
export const DELETE_ITEM_SUCCESS = 'DELETE_ITEM_SUCCESS'
export const DELETE_ITEM_FAILURE = 'DELETE_ITEM_FAILURE'


// TODO: with new rules, no longer necessary to special case events
export const FETCH_EVENT_LIST_REQUEST = 'FETCH_EVENT_LIST_REQUEST'
export const FETCH_EVENT_LIST_SUCCESS = 'FETCH_EVENT_LIST_SUCCESS'
export const FETCH_EVENT_LIST_FAILURE = 'FETCH_EVENT_LIST_FAILURE'

export const ADD_EVENT_REQUEST = 'ADD_EVENT_REQUEST'
export const ADD_EVENT_SUCCESS = 'ADD_EVENT_SUCCESS'
export const ADD_EVENT_FAILURE = 'ADD_EVENT_FAILURE'

export const UPDATE_LOCAL_ITEM = 'UPDATE_LOCAL_ITEM'

// Synchrounous action builders.
const buildFetchRequestAction = (type) => (source, searchParams) => ({
  type   : type,
  source : source
})

const buildFetchSuccessAction = (type, extractor, list) => (responseData, source, timestamp) => ({
  type         : type,
  data         : extractor(responseData.data),
  searchParams : responseData.searchParams,
  message      : responseData.message,
  source       : source,
  receivedAt   : timestamp || Date.now()
})

const buildUpdateRequest = (type) => () => ({type : type});

const buildUpdateSuccessAction = (type) => (responseData, source) => {
  return {
    type       : type,
    data       : responseData.data,
    message    : responseData.message,
    source     : source,
    receivedAt : Date.now()
  }
}

const buildErrorAction = (type) => (message, code, source) => ({
  type         : type,
  errorMessage : message,
  code         : code,
  source       : source,
  receivedAt   : Date.now()
})

const fetchListRequest = buildFetchRequestAction(FETCH_LIST_REQUEST)
const fetchListSuccess =
  buildFetchSuccessAction(FETCH_LIST_SUCCESS, (data) => data || [], true);
const fetchListFailed = buildErrorAction(FETCH_LIST_FAILURE)
// item fetch
const fetchItemRequest = buildFetchRequestAction(FETCH_ITEM_REQUEST)
const fetchItemSuccess =
  buildFetchSuccessAction(FETCH_ITEM_SUCCESS, (data) => data, false)
const fetchItemFailed = buildErrorAction(FETCH_ITEM_FAILURE)
// add item
const addItemRequest = buildUpdateRequest(ADD_ITEM_REQUEST)
const addItemSuccess = buildUpdateSuccessAction(ADD_ITEM_SUCCESS)
const addItemFailed = buildErrorAction(ADD_ITEM_FAILURE)
// update item
const updateItemRequest = buildUpdateRequest(UPDATE_ITEM_REQUEST)
const updateItemSuccess =
  buildUpdateSuccessAction(UPDATE_ITEM_SUCCESS)
const updateItemFailed = buildErrorAction(UPDATE_ITEM_FAILURE)
// delete item
/*const deleteItemRequest = buildUpdateRequest(DELETE_ITEM_REQUEST)
const deleteItemSuccess =
  buildUpdateSuccessAction(DELETE_ITEM_SUCCESS)
const deleteItemFailed = buildErrorAction(DELETE_ITEM_FAILURE)*/
// item events fetch
const fetchItemEventListRequest =
  buildFetchRequestAction(FETCH_EVENT_LIST_REQUEST)
const fetchItemEventListSuccess =
  buildFetchSuccessAction(FETCH_EVENT_LIST_SUCCESS, (data) => data || [], true)
const fetchItemEventListFailed = buildErrorAction(FETCH_EVENT_LIST_FAILURE)
// add item event
const addItemEventRequest = buildUpdateRequest(ADD_EVENT_REQUEST)
const addItemEventSuccess =
  buildUpdateSuccessAction(ADD_EVENT_SUCCESS)
const addItemEventFailed = buildErrorAction(ADD_EVENT_FAILURE)

// Public asynchrous actions
// First, a helper.
const singleValidator = (responseData) =>
  responseData.data === undefined
    ? "Results were undefined."
    : responseData.data === null || responseData.data.length === 0
      ? "No results found where one expected."
      : responseData.data.length > 1
        ? "Multiple results found where one expected."
        : null

export const fetchList = (source) => new FetchBuilder(source)
  .withRequestAction(fetchListRequest)
  .withSuccessAction(fetchListSuccess)
  .withFailureAction(fetchListFailed)
  .withInFlightCheck()
  .build()

export const forceFetchList = (source) => new FetchBuilder(source)
  .withRequestAction(fetchListRequest)
  .withSuccessAction(fetchListSuccess)
  .withFailureAction(fetchListFailed)
  .withInFlightCheck()
  .force()
  .build();

export const fetchSingleFromList = (source) => new FetchBuilder(source)
  .withRequestAction(fetchListRequest)
  .withSuccessAction(fetchListSuccess)
  .withFailureAction(fetchListFailed)
  .withValidator(singleValidator)
  .withInFlightCheck()
  .build()

export const forceFetchSingleFromList = (source) => new FetchBuilder(source)
  .withRequestAction(fetchListRequest)
  .withSuccessAction(fetchListSuccess)
  .withFailureAction(fetchListFailed)
  .withValidator(singleValidator)
  .withInFlightCheck()
  .force()
  .build()

export const fetchItem = (resourceName, pubId) => new FetchBuilder(`/${resourceName}/${pubId}`)
  .withRequestAction(fetchItemRequest)
  .withSuccessAction(fetchItemSuccess)
  .withFailureAction(fetchItemFailed)
  .withInFlightCheck()
  .build()

export const completeItem = (resourceName, pubId) => new FetchBuilder(`/${resourceName}/${pubId}`)
  .withRequestAction(fetchItemRequest)
  .withSuccessAction(fetchItemSuccess)
  .withFailureAction(fetchItemFailed)
  .withInFlightCheck()
  .withPreFlightCheck(() => !cache.getFreshCompleteItem(pubId))
  .build()

export const forceFetchItem = (resourceName, pubId) => new FetchBuilder(`/${resourceName}/${pubId}`)
  .withRequestAction(fetchItemRequest)
  .withSuccessAction(fetchItemSuccess)
  .withFailureAction(fetchItemFailed)
  .withInFlightCheck()
  .force()
  .build()

export const addItem = (item) => new FetchBuilder(`/${item.resourceName}`)
  .forPost()
  .withJson(item)
  .withRequestAction(addItemRequest)
  .withSuccessAction(addItemSuccess)
  .withFailureAction(addItemFailed)
  .build()

export const updateItem = (item) => new FetchBuilder(`/${item.resourceName}/${item.pubId}`)
  .forPut()
  .withJson(item)
  .withRequestAction(updateItemRequest)
  .withSuccessAction(updateItemSuccess)
  .withFailureAction(updateItemFailed)
  .build()

// Somewhere in the API chain, it's rejecting with '"DELETE" requests
// may not contain bodies'. While this seems totally bogus and is an
// extra-spec constraint, no time to fight it.
export const deleteItem = (resourceName, pubId, reason) => new FetchBuilder(`/${resourceName}/${pubId}?reason=${encodeURIComponent(reason)}`)
  .forDelete()
  .withRequestAction(updateItemRequest)
  .withSuccessAction(updateItemSuccess)
  .withFailureAction(updateItemFailed)
  // .withJson({reason: reason})
  .build()

export const fetchItemEventList = (resourceName, pubId) => new FetchBuilder(`/${resourceName}/${pubId}/events`)
  .withRequestAction(fetchItemEventListRequest)
  .withSuccessAction(fetchItemEventListSuccess)
  .withFailureAction(fetchItemEventListFailed)
  .withInFlightCheck()
  // Note: event fetch is always forced
  .force()
  .build()

export const addItemEvent = (resourceName, ev) => new FetchBuilder(`/${resourceName}/${ev.pubId}/events`)
  .forPost()
  .withJson(ev)
  .withRequestAction(addItemEventRequest)
  .withSuccessAction(addItemEventSuccess)
  .withFailureAction(addItemEventFailed)
  .withInFlightCheck()
  .build()

// Sometimes the app needs update the redux item.
export const updateLocalItem = (item) => ({
  type : UPDATE_LOCAL_ITEM,
  item : item
})
