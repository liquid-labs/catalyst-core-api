const fetchItem = async (resourceName, pubId) => {
  try {
    return
      resourceCache.getFreshCompleteItem(pubId)
      || await resourceActions.fetchItem(resourceName.pubId)
  }
  catch (err) {

  }
}
