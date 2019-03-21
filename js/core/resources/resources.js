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
 *   errorMessage: <string or null>,
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
 * The 'success set', `data` and `message` are joined and both togither either
 * null or non-null. If null, then `errorMessage` will be provided and should be
 * used to detect errors. If not null, then `errorMessage` (and the joined
 * `code`) will be null.
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
import * as store from '../store'
import * as routes from '../routes'

const createOrUpdateItem = async(action, item, authToken) => {
  const result = await
  store.getStore().dispatch(action(item.forApi(), authToken))
  // Internally, the actions always use lists to keep the cache consistent.
  // Let's convert that to an 'item'.
  if (result.data !== null) {
    if (result.data.length > 1) {
      return { errorMessage : 'Unexpected multiple results.', code : 500 }
    }
    result.data = result.data[0]
  }
  return result
}

export const createItem = async(item, authToken) => createOrUpdateItem(actions.addItem, item, authToken)

export const fetchItem = async(resourceName, pubId, authToken) =>
  fetchItemBySource(`/${resourceName}/${pubId}/`, authToken)

/**
 * 'fetchItemBySource' returns a result construct from a fresh cache or the
 * results of a remote fetch.  Note that if the item is in cache, authorization
 * is not checked. If the item is in cache, it's treated as accessible.
 *
 * See discussion on [result construct](#result-construct).
 */
export const fetchItemBySource = async(source, authToken) => {
  // TODO: Use 'source' consistently and get away from the special casing for
  // item using the pubId (should be pubID). It's REST, so the URL (or path, at
  // least) should be use consistently.
  const { permanentError } = cache.getFreshSourceData(source)

  if (permanentError) return { data : null, errorMessage : permanentError.message }

  const { pubId } = routes.extractItemIdentifiers(source)
  console.log(`got pubId: ${pubId}`)
  if (pubId !== null) { // then it's a standard item ID and we'll check cache for
    const item = cache.getFreshCompleteItem(pubId)
    console.log('got item: ', item)
    if (item) return { data : item, errorMessage : null }
  }

  // TODO: once we fix special casing, should handle caching for all items.
  //if we fail either if, then we fall through here
  // return await store.getStore().dispatch(actions.fetchItemBySource(source, authToken))
  return store.getStore().dispatch(actions.fetchItemBySource(source, authToken))
}

export const fetchList = async(source, authToken) => {
  const { itemList, permanentError } = cache.getFreshSourceData(source)

  if (permanentError) return { data : null, errorMessage : permanentError.message }
  else if (itemList) return { data : itemList, errorMessage : null }

  return store.getStore().dispatch(actions.fetchList(source, authToken))
}

export const updateItem = async(item, authToken) =>
  createOrUpdateItem(actions.updateItem, item, authToken)
