/**
 * resources provides a "golang style" set of asynchronous functions to create,
 * retrieve, update, and delete items (CRUD). All functions return a promise
 * which resolves into a [result struct](#resurt-struct).
 *
 * ## Usage
 * ```
 * const { data:item, errorMessage } =
 *   await resources.fetchItem('persons', 'xxxx')
 * if (error) { ... handle error ... }
 * // else or implied else
 * ... handle success ...
 * ```
 * Application-level consumers don't need to worry about the source of the data,
 * be it from the local cache or a REST-ful call.
 *
 * The functions never fail, and so need not be surrounded by 'try-catch' when
 * using `await`.
 *
 * ## Result struct
 * The result is an object of the form:
 * ```
 * { // success set
 *   data: <modeled item or null>,
 *   message: <string or null>,
 *   // error set
 *   errorMessage: <string or null>,
 *   code: <integer HTTP code or null>
 *   // meta-info
 *   source: <string>,
 *   receivedAt : <integer, epoch seconds>,
 * }
 * ```
 * For consistency, the 'actual result' is always returned on the `data` field,
 * if available. `data` will always hold either a single item or array of items
 * as appropriatae and callers should make use of renaming syntax when
 * deconstructing fields. E.g., `data:item` or `data:list`.
 *
 * One of `data` and `errorMessage` will always be null and the other non-null.
 * `message` will always be null if `data` is null. `message` should be present
 * if any remote calls where made, and otherwise may be null. This should not
 * be relied upon, however. At this level, there is no method to determine the
 * source of data by design.
 *
 * `code` will always be null if `errorMessage` is null and should be non-null
 * otherwise.
 *
 * The 'meta-info' set may be null at this time. This will be [remedied in
 * future versions](https://github.com/Liquid-Labs/catalyst-core-api/issues/2).
 *
 * `source` is the URL resource path used to invoke the remote call. So, for a
 * 'create' (POST) call, the `source` would be something like: `/foos`, and not
 * the source of the resulting item as returned in the `data` field.
 *
 * Note additional fields may be present in the result struct. These are an
 * artifact of the call-process and should be ignored by consumers and may not
 * be relied upon in future versions.
 */
import * as cache from './cache'
import * as actions from './actions'
import { extractPathInfo } from '@liquid-labs/restful-paths'
import * as store from '../store'

const nullResult = Object.freeze({
  data         : null,
  message      : null,
  errorMessage : null,
  code         : null,
  source       : null,
  receivedAt   : null,
})

/**
 * When we interact with the `reducer`, we get the success or failure action
 * struct. The `data` field at this point contains the results from the
 */
const finalizeResult = async(actionPromise) => {
  const result = await actionPromise
  delete result.type
  delete result.searchParams

  return result
}

const createOrUpdateItem = async(action, item, authToken) =>
  finalizeResult(
    store.getStore().dispatch(action(item.forApi(), authToken)))

export const createItem = async(item, authToken) => createOrUpdateItem(actions.addItem, item, authToken)

export const fetchItem = async(resourceName, pubID, authToken) =>
  fetchItemBySource(`/${resourceName}/${pubID}/`, authToken)

/**
 * 'fetchItemBySource' returns a result construct from a fresh cache or the
 * results of a remote fetch.  Note that if the item is in cache, authorization
 * is not checked. If the item is in cache, it's treated as accessible.
 *
 * See discussion on [result construct](#result-construct).
 */
export const fetchItemBySource = async(source, authToken) => {
  // TODO https://github.com/Liquid-Labs/catalyst-core-api/issues/10
  // TODO https://github.com/Liquid-Labs/catalyst-core-api/issues/12
  const { permanentError } = cache.getFreshSourceData(source)

  if (permanentError) {
    return {
      ...nullResult,
      errorMessage : permanentError.message,
      code         : permanentError.code
    }
  }

  const { pubId, isUuid } = extractPathInfo(source)
  if (pubId && isUuid) { // then it's a standard item ID and we'll check cache for
    const item = cache.getFreshCompleteItem(pubId)
    // notice, no need to finalize this
    if (item) return { ...nullResult, data : item }
  }

  return finalizeResult(
    store.getStore().dispatch(actions.fetchItemBySource(source, authToken)))
}

export const fetchList = async(source, authToken) => {
  const { itemList, permanentError } = cache.getFreshSourceData(source)

  if (permanentError) {
    return {
      ...nullResult,
      errorMessage : permanentError.message,
      code         : permanentError.code
    }
  }
  else if (itemList) return { ...nullResult, data : itemList }

  return finalizeResult(
    store.getStore().dispatch(actions.fetchList(source, authToken)))
}

export const updateItem = async(item, authToken) => {
  const result = await createOrUpdateItem(actions.updateItem, item, authToken)
  if (result.data) result.data = result.data[0]
  return result
}
