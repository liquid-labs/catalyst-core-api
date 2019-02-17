/**
 * Resource reducer manages the redux (sub-)store of locally cached resources
 * and resource related information (such as wether the resource is in permanent
 * error or an update is "in flight").
 */
import * as resourceActions from './actions'
import * as uiRoutes from '../uiRoutes'

import { settings } from './settings'

import moment from 'moment-timezone'
import omit from 'lodash.omit'
import reduce from 'lodash.reduce'

const INITIAL_STATE = {
  // general database
  /* { [pubId]: <modeled item> } */
  items                  : {},
  /* { [source url]: {
  *    lastChecked: <moment>,
  *    refList: [<UUID strings] || null,
  *    (permanentError: { code: <http code>, message: <message> })?,
  *    *cached* list: [<list of items] },
  *  }
  *
  * 'refList' === null =~ "We don't know. No result available (due to error or
  *    never having fetched)."
  * 'refList' === [] =~ "We got word from the server, an the results are empty."
  */
  sources                : {},
  events                 : {}, // { [pubId] : [events] }; note, not normalized
  // activity trackers
  inFlightSources        : {}, // { [source]: true }
  refreshItemListsBefore : 0
}

const modelItem = (item, resourceName) =>
  new settings.getResources()[resourceName].model(item)

const calculateFailedSources = (action, currentState) => ({
  ...currentState.sources,
  [action.source] : {
    source         : action.source,
    lastChecked    : moment(action.receivedAt),
    searchParams   : null,
    permanentError : { code : action.code, message : action.errorMessage }}
})

const processData = (itemList, action, currentState, props, handlers) => {
  // populate no-op handlers
  ['onStartItemProcess', 'onNewOrUpdatedItem', 'onItemCompletion']
    .forEach((handlerKey) => {
      if (!handlers[handlerKey]) handlers[handlerKey] = () => {}
    })

  // TODO: how efficient is this?
  const items = Object.assign({}, currentState.items)

  itemList.forEach((item) => {
    const currItem = items[item.pubId]
    handlers.onStartItemProcess(currItem, item, items, props)
    if (!currItem || item.lastUpdated > currItem.lastUpdated) {
      items[item.pubId] = item
      handlers.onNewOrUpdatedItem(item, props)
    }
    // else the items are from the same data time, but maybe the new one is more
    // complete? Note, this is as much about retaining complete items as
    // updating incomplete items.
    else if (!currItem.isComplete() && item.isComplete()) {
      items[item.pubId] = item
      handlers.onItemCompletion(item, props)
    }
  })

  return {
    ...currentState,
    items                  : items,
    sources                : handlers.calculateNewSources(props),
    inFlightSources        : omit(currentState.inFlightSources, action.source),
    refreshItemListsBefore : props.refreshItemListsBefore,
  }
}

const processFetchData = (action, currentState) => {
  let itemList
  if (Array.isArray(action.data)) {
    itemList =
      action.data.map((item) => modelItem(item, uiRoutes.extractResource(action.source)))
  }
  else {
    itemList = [modelItem(action.data, uiRoutes.extractResource(action.source))]
    if (!itemList[0].isComplete()) {
      settings.invokeErrorHandler(`Retrieved item is missing expected data: '${itemList[0]._missing.join("', '")}'.`)
      return processData([], action, currentState, {},
        { calculateNewSources : calculateFailedSources })
    }
  }

  const newRefresh = currentState.refreshItemListsBefore + 1
  const props = {
    invalidateSourcesBefore : null,
    refreshItemListsBefore  : currentState.refreshItemListsBefore,
  }

  const handlers = {
    onNewOrUpdatedItem : (item, props) => {
      const x = item.lastUpdated
      if (!props.invalidateSourcesBefore || props.invalidateSourcesBefore < x) {
        props.invalidateSourcesBefore = x
      }
      props.refreshItemListsBefore = newRefresh
    },
    onItemCompletion : (item, props) => {
      props.refreshItemListsBefore = newRefresh
    },
    calculateNewSources : (props) => {
      const beforeMoment = moment(props.invalidateSourcesBefore, 'X')
      // TODO: we can further optmiize source invalidation based on involved
      // resource types
      const newSource = {
        [action.source] : {
          source       : action.source,
          lastChecked  : moment(action.receivedAt),
          refList      : itemList.map((item) => item.pubId),
          searchParams : action.searchParams }
      }
      return props.invalidateSourcesBefore
        ? reduce(currentState.sources,
          (acc, sourceData) => {
            if (!sourceData.lastChecked.isBefore(beforeMoment)) {
              acc[sourceData.source] = sourceData
            }
            return acc
          },
          newSource)
        : { ...currentState.sources, ...newSource }
    }
  }

  return processData(itemList, action, currentState, props, handlers)
}

const processUpdatedData = (action, currentState) => {
  const itemList = [modelItem(action.data, uiRoutes.extractResource(action.source))]

  const props = {
    validatedRefs          : {},
    refreshItemListsBefore : currentState.refreshItemListsBefore + 1
  }

  const handlers = {
    onStartItemProcess : (currItem, item, items, props) => {
      // currItem is null when creating and item is null when deleting
      const itemId = (item && item.pubId) || currItem.pubId
      props.validatedRefs[itemId] = true; // necessary ;
      [currItem, item].forEach((i) => {
        if (i) {
          i._references.forEach((ref) => {
            if (!props.validatedRefs[ref]) {
              delete items[ref]
            }
          })
        }
      })
    },
    // On update, the only valid source is for the item just updated.
    calculateNewSources : () => ({
      [action.source] : {
        source       : action.source,
        lastChecked  : moment(action.receivedAt),
        refList      : [action.data.pubId],
        searchParams : action.searchParams }
    })
  }

  return processData(itemList, action, currentState, props, handlers)
}

const startApiCall = (action, currentState) => ({
  ...currentState,
  inFlightSources : {...currentState.inFlightSources, [action.source] : true}
})

const completeApiCall = (action, currentState) => ({
  ...currentState,
  inFlightSources : omit(currentState.inFlightSources, action.source)
})

const failApiCall = (action, currentState) => ({
  ...currentState,
  inFlightSources : omit(currentState.inFlightSources, action.source),
  sources         : calculateFailedSources(action, currentState)
})

const resourceReducer = (currentState = INITIAL_STATE, action) => {
  // retrieve list handlers
  switch (action.type) {
  case resourceActions.FETCH_LIST_REQUEST:
  case resourceActions.FETCH_ITEM_REQUEST:
    return startApiCall(action, currentState)
  case resourceActions.FETCH_LIST_SUCCESS:
  case resourceActions.FETCH_ITEM_SUCCESS:
    return processFetchData(action, currentState)
    // TODO: consider retaining any existing data on 'no connection failures', for offline mode?
  case resourceActions.FETCH_LIST_FAILURE:
  case resourceActions.FETCH_ITEM_FAILURE:
    return failApiCall(action, currentState)
  case resourceActions.ADD_ITEM_REQUEST:
  case resourceActions.UPDATE_ITEM_REQUEST:
  case resourceActions.DELETE_ITEM_REQUEST:
    return startApiCall(action, currentState)
  case resourceActions.ADD_ITEM_SUCCESS:
  case resourceActions.UPDATE_ITEM_SUCCESS:
    return processUpdatedData(action, currentState)
  case resourceActions.DELETE_ITEM_SUCCESS:
    return {
      ...currentState,
      items                  : omit(currentState.items, action.data),
      sources                : {},
      inFlightSources        : omit(currentState.inFlightSources, action.source + '/events'),
      refreshItemListsBefore : currentState.refreshItemListsBefore + 1
    }
  case resourceActions.ADD_ITEM_FAILURE:
  case resourceActions.UPDATE_ITEM_FAILURE:
  case resourceActions.DELETE_ITEM_FAILURE:
    return completeApiCall(action, currentState)
    // item event handlers
  case resourceActions.FETCH_EVENT_LIST_REQUEST:
    return {
      ...currentState,
      inFlightSources : {...currentState.inFlightSources, ...{[action.source + '/events'] : true}}
    }
  case resourceActions.FETCH_EVENT_LIST_SUCCESS:
    return {
      ...currentState,
      items : { ...currentState.items,
        [action.source] : action.data },
      inFlightSources : omit(currentState.inFlightSources, action.source + '/events'),
    }
  case resourceActions.FETCH_EVENT_LIST_FAILURE:
    return {
      ...currentState,
      inFlightSources : omit(currentState.inFlightSources, action.source + '/events'),
      // Note, we don't update sources on success because this data is
      // normalized, but we do need to remember permanant error conditions.
      sources         : { ...currentState.sources,
        ...{[action.source + '/events'] : {
          lastChecked    : moment(action.receivedAt),
          refList        : null,
          permanentError : { code : action.code, message : action.errorMessage }}
        }
      }
    }
  case resourceActions.ADD_EVENT_REQUEST:
    return startApiCall(action, currentState)
  case resourceActions.ADD_EVENT_SUCCESS:
    // Note: 'events' is not updated as we expect events to be refetched
    // every time. But we do need to invalidate the associated item, which
    // may change based on the event.
    // 'item' is the event object.
    return {
      ...currentState,
      items : omit(currentState.items, action.data.pubId)
    }
  case resourceActions.ADD_EVENT_FAILURE:
    return completeApiCall(action, currentState)
  case resourceActions.UPDATE_LOCAL_ITEM: {
    const { item } = action
    return {
      ...currentState,
      items : {
        ...currentState.items,
        [item.pubId] : item
      },
      refreshItemListsBefore : currentState.refreshItemListsBefore + 1
    }
  }
  case ('RESET'):
    return INITIAL_STATE;
  default:
    return currentState;
  }
}

export { resourceReducer }
