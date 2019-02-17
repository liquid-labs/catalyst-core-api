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

/**
 * Fetches an item. Cached data will be used if fresh, otherwise the item will
 * be fetched from the remote source.
 */
export const fetchItem = async (resourceName, pubId) => {
    const item = cache.getFreshCompleteItem(pubId)
    if (item) return { data: item, errorMessage: null }
    // else, we have more work to do
    return await actions.fetchItem(resourceName.pubId))
}

export const fetchList = async (source) => {
  const { itemList, searchParams, permanentError } =
    cache.getFreshSourceData(source)
  const list = cache.getFreshSourceData(source)
}
