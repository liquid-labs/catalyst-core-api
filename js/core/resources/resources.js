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


/**
 * Fetches an item. Cached data will be used if fresh, otherwise the item will
 * be fetched from the remote source. Note that authorization is not checked if
 * the item is in cache, it's treated as accessible.
 */
export const fetchItem = async(resourceName, pubId, authToken) => {
  const source = `/${resourceName}/${pubId}/`
  const { permanentError } = cache.getFreshSourceData(source)

  if (permanentError) return { data : null, errorMessage : permanentError.message }
  const item = cache.getFreshCompleteItem(pubId)
  if (item) return { data : item, errorMessage : null }

  return await store.getStore().dispatch(actions.fetchItem(resourceName, pubId, authToken))
}

export const fetchList = async(source, authToken) => {
  const { itemList, permanentError } = cache.getFreshSourceData(source)

  if (permanentError) return { data : null, errorMessage : permanentError.message }
  else if (itemList) return { data : itemList, errorMessage : null }

  return await store.getStore().dispatch(actions.fetchList(source, authToken))
}
