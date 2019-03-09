/**
 * resources provides a "golang style" set of asynchronous functions which each
 * return a plain object to be called like:
 *
 *     const { data:item, error, status } = await resources.fetchItem('persons', 'xxxx')
 *     if (error) setError(error)
 *     else setItem(item)
 *
 * Thus, the application-level consumers don't need to worry about the source of
 * the data, be it from the local cache or a REST-ful call. Also, usage is
 * unified with data manipulation functions (create, update, and delete).
 */
import * as cache from './cache'
import * as actions from './actions'
import * as store from '../store'
import * as routes from '../routes'

export const createItem = async(item, authToken) =>
  await store.getStore().dispatch(actions.addItem(item.forApi(), authToken))

/**
 * Fetches an item. Cached data will be used if fresh, otherwise the item will
 * be fetched from the remote source. Note that authorization is not checked if
 * the item is in cache, it's treated as accessible.
 */
export const fetchItem = async(resourceName, pubId, authToken) => {
  const source = `/${resourceName}/${pubId}/`
  return await fetchItemBySource(source)
}

export const fetchItemBySource = async(source, authToken) => {
  // TODO: Use 'source' consistently and get away from the special casing for
  // item using the pubId (should be pubID). It's REST, so the URL (or path, at
  // least) should be use consistently.
  const { permanentError } = cache.getFreshSourceData(source)

  if (permanentError) return { data : null, errorMessage : permanentError.message }

  const { pubId } = routes.extractItemIdentifiers(source)
  if (pubId !== null) { // then it's a standard item ID and we'll check cache for
    const item = cache.getFreshCompleteItem(pubId)
    if (item) return { data : item, errorMessage : null }
  }

  // TODO: once we fix special casing, should handle caching for all items.
  //if we fail either if, then we fall through here
  return await store.getStore().dispatch(actions.fetchItemBySource(source, authToken))
}

export const fetchList = async(source, authToken) => {
  const { itemList, permanentError } = cache.getFreshSourceData(source)

  if (permanentError) return { data : null, errorMessage : permanentError.message }
  else if (itemList) return { data : itemList, errorMessage : null }

  return await store.getStore().dispatch(actions.fetchList(source, authToken))
}
