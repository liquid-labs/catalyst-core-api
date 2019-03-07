/**
 * Resources settings API provides methods to define application resources,
 * the 'baseUrl' used in calls, and to set an optional error handler to provide
 * user feedback in the face of processing errors.
 */
const defaultErrorHandler = (message) => {
  if (typeof window !== 'undefined' && window.alert) window.alert(message)
  else console.error(message) // eslint-disable-line no-console
}

const settings = {
  resources    : null,
  resourcesMap : null,
  errorHandler : defaultErrorHandler
}

export const setResources = (resources) => {
  settings.resources = resources
  settings.resourcesMap = resources.reduce(
    (map, resourceConf) => {
      map[resourceConf.resourceName] = resourceConf
      return map
    }, {})
}
export const getResources = () => settings.resources
export const getResourcesMap = () => settings.resourcesMap

export const setErrorHandler = (errorHandler) =>
  settings.errorHandler = errorHandler
export const invokeErrorHandler = (msg) => settings.errorHandler(msg)
